/* eslint-disable no-underscore-dangle */
import { openArray, slice } from 'zarr';
import range from 'lodash/range';
import AbstractZarrLoader from '../AbstractZarrLoader';
import { parseVlenUtf8, normalize, concatenateColumnVectors } from './utils';
import {
  treeInitialize,
  nodeAppendChild,
  initializeCellSetColor,
} from '../../components/sets/cell-set-utils';
import { SETS_DATATYPE_CELL } from '../../components/sets/constants';
import LoaderResult from '../LoaderResult';
import { LoaderValidationError } from '../errors';
/**
 * A base AnnData loader which has all shared methods for more comlpex laoders,
 * like loading cell names and ids. It inherits from AbstractLoader.
 */
export default class AnnDataLoader extends AbstractZarrLoader {
  /**
   * Class method for loading cell set ids.
   * Takes the location as an argument because this is shared across objects,
   * which have different ways of specifying location.
   * @param {Array} cellSetZarrLocation An array of strings like obs.leiden or obs.bulk_labels.
   * @returns {Promise} A promise for an array of ids with one per cell.
   */
  loadCellSetIds(cellSetZarrLocation) {
    const { store } = this;
    if (!this.cellSets) {
      this.cellSets = {};
    } if (cellSetZarrLocation.every(setName => this.cellSets[setName])) {
      return Promise.all(cellSetZarrLocation.map(setName => this.cellSets[setName]));
    }
    cellSetZarrLocation.forEach((setName) => {
      this.cellSets[setName] = (async () => {
        const { categories } = await this.getJson(`${setName}/.zattrs`);
        let categoriesValues;
        if (categories) {
          const { dtype } = await this.getJson(`/obs/${categories}/.zarray`);
          if (dtype === '|O') {
            categoriesValues = await this.getFlatArrDecompressed(`/obs/${categories}`);
          }
        }
        const cellSetsArr = await openArray({
          store,
          path: setName,
          mode: 'r',
        });
        const cellSetsValues = await cellSetsArr.get();
        const { data } = cellSetsValues;
        const mappedCellSetValues = Array.from(data).map(
          i => (!categoriesValues ? String(i) : categoriesValues[i]),
        );
        return mappedCellSetValues;
      })();
    });
    return Promise.all(cellSetZarrLocation.map(setName => this.cellSets[setName]));
  }

  /**
   * Class method for loading general numeric arrays.
   * @param {string} path A string like obsm.X_pca.
   * @returns {Promise} A promise for a zarr array containing the data.
   */
  loadNumeric(path) {
    const { store } = this;
    return openArray({
      store,
      path,
      mode: 'r',
    }).then(arr => arr.get());
  }

  getFlatArrDecompressed(path) {
    const { store } = this;
    return openArray({
      store,
      path,
      mode: 'r',
    }).then(async (z) => {
      let data;
      const parseAndMergeTextBytes = (dbytes) => {
        const text = parseVlenUtf8(dbytes);
        if (!data) {
          data = text;
        } else {
          data = data.concat(text);
        }
      };
      const mergeBytes = (dbytes) => {
        if (!data) {
          data = dbytes;
        } else {
          const tmp = new Uint8Array(
            dbytes.buffer.byteLength + data.buffer.byteLength,
          );
          tmp.set(new Uint8Array(data.buffer), 0);
          tmp.set(dbytes, data.buffer.byteLength);
          data = tmp;
        }
      };
      const numRequests = Math.ceil(z.meta.shape[0] / z.meta.chunks[0]);
      const requests = range(numRequests).map(async item => store
        .getItem(`${z.keyPrefix}${String(item)}`)
        .then(buf => z.compressor.then(compressor => compressor.decode(buf))));
      const dbytesArr = await Promise.all(requests);
      dbytesArr.forEach((dbytes) => {
        // Use vlenutf-8 decoding if necessary and merge `data` as a normal array.
        if (
          Array.isArray(z.meta.filters)
          && z.meta.filters[0].id === 'vlen-utf8'
        ) {
          parseAndMergeTextBytes(dbytes);
          // Otherwise just merge the bytes as a typed array.
        } else {
          mergeBytes(dbytes);
        }
      });
      const {
        meta: {
          shape: [length],
        },
      } = z;
      // truncate the filled in values
      return data.slice(0, length);
    });
  }

  /**
   * Class method for loading the cell names from obs.
   * @returns {Promise} An promise for a zarr array containing the names.
   */
  loadCellNames() {
    if (this.cellNames) {
      return this.cellNames;
    }
    this.cellNames = this.getJson('obs/.zattrs').then(({ _index }) => this.getFlatArrDecompressed(`/obs/${_index}`));
    return this.cellNames;
  }

  /**
   * Class method for loading spatial cell centroids.
   * @returns {Promise} A promise for an array of tuples/triples for cell centroids.
   */
  loadXy() {
    const { xy } = this.options || {};
    if (this.xy) {
      return this.xy;
    }
    if (!this.xy && xy) {
      this.xy = this.loadNumeric(xy);
      return this.xy;
    }
    this.xy = Promise.resolve(null);
    return this.xy;
  }

  /**
   * Class method for loading spatial cell polygons.
   * @returns {Promise} A promise for an array of arrays for cell polygons.
   */
  loadPoly() {
    const { poly } = this.options || {};
    if (this.poly) {
      return this.poly;
    }
    if (!this.poly && poly) {
      this.poly = this.loadNumeric(poly);
      return this.poly;
    }
    this.poly = Promise.resolve(null);
    return this.poly;
  }

  /**
   * Class method for loading various mappings, like UMAP or tSNE cooridnates.
   * @returns {Promise} A promise for an array of tuples of coordinates.
   */
  loadMappings() {
    const { mappings } = this.options || {};
    if (this.mappings) {
      return this.mappings;
    }
    if (!this.mappings && mappings) {
      this.mappings = Promise.all(
        Object.keys(mappings).map(async (coordinationName) => {
          const { key } = mappings[coordinationName];
          return { coordinationName, arr: await this.loadNumeric(key) };
        }),
      );
      return this.mappings;
    }
    this.mappings = Promise.resolve(null);
    return this.mappings;
  }

  /**
   * Class method for loading factors, which are cell set ids.
   * @returns {Promise} A promise for an array of an array of strings of ids,
   * where subarray is a clustering/factor.
   */
  loadFactors() {
    const { factors } = this.options || {};
    if (factors) {
      return this.loadCellSetIds(factors);
    }
    return Promise.resolve(null);
  }

  /**
   * Class method for loading the genes list from AnnData.var.
   * @returns {Promise} A promise for the zarr array contianing the gene names.
   */
  async loadGeneNames() {
    if (this.geneNames) {
      return this.geneNames;
    }
    const { geneFilter: geneFilterZarr } = this.options;
    let geneFilter;
    if (geneFilterZarr) {
      geneFilter = await this.getFlatArrDecompressed(geneFilterZarr);
    }
    const { _index } = await this.getJson('var/.zattrs');
    if (this.geneNames) {
      return this.geneNames;
    }
    this.geneNames = this.getFlatArrDecompressed(`var/${_index}`).then(data => data.filter((_, j) => !geneFilter || geneFilter[j]));
    return this.geneNames;
  }

  /**
   * Class method for loading a filtered subset of the genes list
   * @param {String} filterZarr A location in the zarr store to fetch a boolean array from.
   * @returns {Array} A list of filtered genes.
   */
  async _getFilteredGenes(filterZarr) {
    const filter = await this.getFlatArrDecompressed(filterZarr);
    const geneNames = await this.loadGeneNames();
    const genes = geneNames.filter((_, i) => filter[i]);
    return genes;
  }

  /**
   * Class method for getting the integer indices of a selection of genes within a list.
   * @param {Array} selection A list of gene names.
   * @returns {Array} A list of integer indices.
   */
  async _getGeneIndices(selection) {
    const geneNames = await this.loadGeneNames();
    return selection.map(gene => geneNames.indexOf(gene));
  }

  /**
   * Class method for getting the number of cells i.e entries in `obs`.
   * @returns {Number} The number of cells.
   */
  async _getNumCells() {
    const cells = await this.loadCellNames();
    return cells.length;
  }

  /**
   * Class method for getting the number of genes i.e entries in `var`,
   * potentially filtered by `genesFilter`.
   * @returns {Number} The number of genes.
   */
  async _getNumGenes() {
    const cells = await this.loadGeneNames();
    return cells.length;
  }

  /**
   * Class method for opening the sparse matrix arrays in zarr.
   * @returns {Array} A list of promises pointing to the indptr, indices, and data of the matrix.
   */
  async _openSparseArrays() {
    const {
      options: { matrix },
      store,
    } = this;
    if (this.sparseArrays) {
      return this.sparseArrays;
    }
    this.sparseArrays = Promise.all(
      ['indptr', 'indices', 'data'].map(name => openArray({ store, path: `${matrix}/${name}`, mode: 'r' })),
    );
    return this.sparseArrays;
  }

  /**
   * Class method for loading a gene selection from a CSC matrix.
   * @param {Array} selection A list of gene names whose data should be fetched.
   * @returns {Promise} A Promise.all array of promises containing Uint8Arrays, one per selection.
   */
  async _loadCSCGeneSelection(selection) {
    const indices = await this._getGeneIndices(selection);
    const [indptrArr, indexArr, cellXGeneArr] = await this._openSparseArrays();
    const numCells = await this._getNumCells();
    const { data: cols } = await indptrArr.getRaw(null);
    // If there is not change in the column indexer, then the data is all zeros
    return Promise.all(
      indices.map(async (index) => {
        const startRowIndex = cols[index];
        const endRowIndex = cols[index + 1];
        const isColumnAllZeros = startRowIndex === endRowIndex;
        const geneData = new Float32Array(numCells).fill(0);
        if (isColumnAllZeros) {
          return geneData;
        }
        const { data: rowIndices } = await indexArr.get([
          slice(startRowIndex, endRowIndex),
        ]);
        const { data: cellXGeneData } = await cellXGeneArr.get([
          slice(startRowIndex, endRowIndex),
        ]);
        for (let rowIndex = 0; rowIndex < rowIndices.length; rowIndex += 1) {
          geneData[rowIndices[rowIndex]] = cellXGeneData[rowIndex];
        }
        return geneData;
      }),
    );
  }

  /**
   * Class method for loading a gene selection from a CSR matrix.
   * @param {Array} selection A list of gene names whose data should be fetched.
   * @returns {Promise} A Promise.all array of promises containing Uint8Arrays, one per selection.
   */
  async _loadCSRGeneSelection(selection) {
    const indices = await this._getGeneIndices(selection);
    const numGenes = await this._getNumGenes();
    const numCells = await this._getNumCells();
    const cellXGene = await this._loadCSRSparseCellXGene();
    return indices.map((index) => {
      const geneData = new Float32Array(numCells).fill(0);
      for (let i = 0; i < numCells; i += 1) {
        geneData[i] = cellXGene[i * numGenes + index];
      }
      return geneData;
    });
  }

  /**
   * Class method for loading row oriented (CSR) sparse data from zarr.
   * @returns {Object} A { data: Float32Array } contianing the CellXGene matrix.
   */
  async _loadCSRSparseCellXGene() {
    if (this._sparseMatrix) {
      return this._sparseMatrix;
    }
    this._sparseMatrix = this._openSparseArrays().then(async (sparseArrays) => {
      const {
        options: { matrix },
      } = this;
      const { shape } = await this.getJson(`${matrix}/.zattrs`);
      const [rows, cols, cellXGene] = await Promise.all(
        sparseArrays.map(async (arr) => {
          const { data } = await arr.getRaw(null);
          return data;
        }),
      );
      const cellXGeneMatrix = new Float32Array(shape[0] * shape[1]).fill(0);
      let row = 0;
      rows.forEach((_, index) => {
        const rowStart = rows[index];
        const rowEnd = rows[index + 1];
        for (let i = rowStart; i < rowEnd; i += 1) {
          const val = cellXGene[i];
          const col = cols[i];
          cellXGeneMatrix[row * shape[1] + col] = val;
        }
        row += 1;
      });
      return cellXGeneMatrix;
    });
    return this._sparseMatrix;
  }

  /**
   * Class method for loading column oriented (CSC) sparse data from zarr.
   * @returns {Object} A { data: Float32Array } contianing the CellXGene matrix.
   */
  async _loadCSCSparseCellXGene() {
    if (this._sparseMatrix) {
      return this._sparseMatrix;
    }
    this._sparseMatrix = this._openSparseArrays().then(async (sparseArrays) => {
      const {
        options: { matrix },
      } = this;
      const { shape } = await this.getJson(`${matrix}/.zattrs`);
      const [cols, rows, cellXGene] = await Promise.all(
        sparseArrays.map(async (arr) => {
          const { data } = await arr.getRaw(null);
          return data;
        }),
      );
      const cellXGeneMatrix = new Float32Array(shape[0] * shape[1]).fill(0);
      let col = 0;
      cols.forEach((_, index) => {
        const colStart = cols[index];
        const colEnd = cols[index + 1];
        for (let i = colStart; i < colEnd; i += 1) {
          const val = cellXGene[i];
          const row = rows[i];
          cellXGeneMatrix[row * shape[1] + col] = val;
        }
        col += 1;
      });
      return cellXGeneMatrix;
    });
    return this._sparseMatrix;
  }

  /**
   * Class method for loading the cell x gene matrix.
   * @returns {Promise} A promise for the zarr array contianing the cell x gene data.
   */
  async loadCellXGene() {
    const { store } = this;
    if (this.cellXGene) {
      return this.cellXGene;
    }
    const {
      options: { matrix, matrixGeneFilter },
    } = this;
    if (!this._matrixZattrs) {
      this._matrixZattrs = await this.getJson(`${matrix}/.zattrs`);
    }
    const encodingType = this._matrixZattrs['encoding-type'];
    if (!matrixGeneFilter) {
      if (encodingType === 'csr_matrix') {
        this.cellXGene = this._loadCSRSparseCellXGene().then(data => normalize(data));
      } else if (encodingType === 'csc_matrix') {
        this.cellXGene = this._loadCSCSparseCellXGene().then(data => normalize(data));
      } else {
        if (!this.arr) {
          this.arr = openArray({ store, path: matrix, mode: 'r' });
        }
        this.cellXGene = this.arr.then(z => z.getRaw(null).then(({ data }) => normalize(data)));
      }
    } else if (encodingType === 'csr_matrix') {
      this.cellXGene = this._loadCSRSparseCellXGene().then(
        async (cellXGene) => {
          const filteredGenes = await this._getFilteredGenes(matrixGeneFilter);
          const numGenesFiltered = filteredGenes.length;
          const geneNames = await this.loadGeneNames();
          const numGenes = geneNames.length;
          const numCells = await this._getNumCells();
          const cellXGeneMatrixFiltered = new Float32Array(
            numCells * numGenesFiltered,
          ).fill(0);
          for (let i = 0; i < numGenesFiltered; i += 1) {
            const index = geneNames.indexOf(filteredGenes[i]);
            for (let j = 0; j < numCells; j += 1) {
              cellXGeneMatrixFiltered[j * numGenesFiltered + i] = cellXGene[j * numGenes + index];
            }
          }
          return normalize(cellXGeneMatrixFiltered);
        },
      );
    } else {
      const genes = await this._getFilteredGenes(matrixGeneFilter);
      this.cellXGene = this.loadGeneSelection({
        selection: genes,
        shouldNormalize: false,
      }).then(({ data }) => normalize(concatenateColumnVectors(data)));
    }
    return this.cellXGene;
  }

  /**
   * Class method for loading a gene selection.
   * @param {Object} args
   * @param {Array} args.selection A list of gene names whose data should be fetched.
   * @param {Boolean} args.shouldNormalize A list of gene names whose data should be fetched.
   * @returns {Object} { data } containing an array of gene expression data.
   */
  async loadGeneSelection({ selection, shouldNormalize = true }) {
    const {
      options: { matrix },
      store,
    } = this;
    if (!this._matrixZattrs) {
      this._matrixZattrs = await this.getJson(`${matrix}/.zattrs`);
    }
    const encodingType = this._matrixZattrs['encoding-type'];
    let genes;
    if (encodingType === 'csc_matrix') {
      genes = await this._loadCSCGeneSelection(selection);
    } else if (encodingType === 'csr_matrix') {
      genes = await this._loadCSRGeneSelection(selection);
    } else {
      if (!this.arr) {
        this.arr = openArray({ store, path: matrix, mode: 'r' });
      }
      const indices = await this._getGeneIndices(selection);
      // We can index directly into a normal dense array zarr store via `get`.
      genes = await Promise.all(
        indices.map(index => this.arr.then(z => z.get([null, index])).then(({ data }) => data)),
      );
    }
    return {
      data: genes.map(i => (shouldNormalize ? normalize(i).data : i)),
      url: null,
    };
  }

  /**
   * Class method for loading only attributes i.e rows and columns
   * @param {Array} selection A list of gene names whose data should be fetched.
   * @returns {Object} { data: { rows, cols }, url } containing row and col labels for the matrix.
   */
  loadAttrs() {
    return Promise.all([this.loadCellNames(), this.loadGeneNames()]).then(
      (d) => {
        const [cellNames, geneNames] = d;
        const attrs = { rows: cellNames, cols: geneNames };
        return {
          data: attrs,
          url: null,
        };
      },
    );
  }

  loadExpressionMatrix() {
    return Promise.all([this.loadAttrs(), this.loadCellXGene()]).then(
      async (d) => {
        const [{ data: attrs }, cellXGene] = d;
        const {
          options: { matrixGeneFilter: matrixGeneFilterZarr },
        } = this;
        // In order to return the correct gene list with the heatmap data,
        // we need to filter the columns of attrs so it matches the cellXGene data.
        if (matrixGeneFilterZarr) {
          const matrixGeneFilter = await this.getFlatArrDecompressed(
            matrixGeneFilterZarr,
          );
          attrs.cols = attrs.cols.filter((_, i) => matrixGeneFilter[i]);
        }
        return Promise.resolve(new LoaderResult([attrs, cellXGene], null));
      },
    );
  }

  async loadCellSets() {
    if (!this.cellSetsTree) {
      const { options } = this;
      // eslint-disable-next-line camelcase
      const cellSetZarrLocation = options.cellSets.map(({ setName }) => setName);
      this.cellSetsTree = Promise.all([
        this.loadCellNames(),
        this.loadCellSetIds(cellSetZarrLocation),
      ]).then((data) => {
        const [cellNames, cellSets] = data;
        const cellSetsTree = treeInitialize(SETS_DATATYPE_CELL);
        cellSets.forEach((cellSetIds, j) => {
          const name = options.cellSets[j].groupName;
          let levelZeroNode = {
            name,
            children: [],
          };
          const uniqueCellSetIds = Array(...new Set(cellSetIds)).sort();
          const clusters = {};
          // eslint-disable-next-line no-return-assign
          uniqueCellSetIds.forEach(id => (clusters[id] = { name: id, set: [] }));
          cellSetIds.forEach((id, i) => clusters[id].set.push([cellNames[i], null]));
          Object.values(clusters).forEach(
            // eslint-disable-next-line no-return-assign
            cluster => (levelZeroNode = nodeAppendChild(levelZeroNode, cluster)),
          );
          cellSetsTree.tree.push(levelZeroNode);
        });
        return cellSetsTree;
      });
    }
    const cellSetsTree = await this.cellSetsTree;
    const coordinationValues = {};
    const { tree } = cellSetsTree;
    const newAutoSetSelectionParentName = tree[0].name;
    // Create a list of set paths to initally select.
    const newAutoSetSelections = tree[0].children.map(node => [
      newAutoSetSelectionParentName,
      node.name,
    ]);
    // Create a list of cell set objects with color mappings.
    const newAutoSetColors = initializeCellSetColor(cellSetsTree, []);
    coordinationValues.cellSetSelection = newAutoSetSelections;
    coordinationValues.cellSetColor = newAutoSetColors;
    return Promise.resolve(
      new LoaderResult(cellSetsTree, null, coordinationValues),
    );
  }

  async loadCells() {
    if (!this.cells) {
      this.cells = Promise.all([
        this.loadMappings(),
        this.loadXy(),
        this.loadPoly(),
        this.loadCellNames(),
        this.loadFactors(),
      ]).then(([mappings, xy, poly, cellNames, factors]) => {
        const cells = {};
        cellNames.forEach((name, i) => {
          cells[name] = {};
          if (mappings) {
            mappings.forEach(({ coordinationName, arr }) => {
              if (!cells[name].mappings) {
                cells[name].mappings = {};
              }
              const { dims } = this.options.mappings[coordinationName];
              cells[name].mappings[coordinationName] = dims.map(
                dim => arr.data[i][dim],
              );
            });
          }
          if (xy) {
            cells[name].xy = xy.data[i];
          }
          if (poly) {
            cells[name].poly = poly.data[i];
          }
          if (factors) {
            const factorsObj = {};
            factors.forEach(
              // eslint-disable-next-line no-return-assign
              (factor, j) => (factorsObj[this.options.factors[j].split('/').slice(-1)] = factor[i]),
            );
            cells[name].factors = factorsObj;
          }
        });
        return cells;
      });
    }
    return Promise.resolve(new LoaderResult(await this.cells, null));
  }

  load(type) {
    if (type === 'expression-matrix') {
      return this.loadExpressionMatrix();
    } if (type === 'cell-sets') {
      return this.loadCellSets();
    } if (type === 'cells') {
      return this.loadCells();
    }
    throw new LoaderValidationError(`AnnData loader does not support type ${type}`);
  }
}
