import { FileType } from '../app/constants';

import JsonLoader from './JsonLoader';
import MatrixZarrLoader from './MatrixZarrLoader';
import GenesJsonAsMatrixZarrLoader from './GenesJsonAsMatrixZarrLoader';
import ClustersJsonAsMatrixZarrLoader from './ClustersJsonAsMatrixZarrLoader';
import RasterJsonLoader from './RasterJsonLoader';
import OmeZarrLoader from './OmeZarrLoader';
import CellSetsJsonLoader from './CellSetsJsonLoader';
import AnnDataLoaders from './anndata-loaders';
import GenomicProfilesZarrLoader from './GenomicProfilesZarrLoader';

export const fileTypeToLoader = {
  [FileType.EXPRESSION_MATRIX_ZARR]: MatrixZarrLoader,
  [FileType.CLUSTERS_JSON]: ClustersJsonAsMatrixZarrLoader,
  [FileType.GENES_JSON]: GenesJsonAsMatrixZarrLoader,
  [FileType.CELLS_JSON]: JsonLoader,
  [FileType.MOLECULES_JSON]: JsonLoader,
  [FileType.NEIGHBORHOODS_JSON]: JsonLoader,
  [FileType.RASTER_JSON]: RasterJsonLoader,
  [FileType.RASTER_OME_ZARR]: OmeZarrLoader,
  [FileType.CELL_SETS_JSON]: CellSetsJsonLoader,
  [FileType.ANNDATA_CELL_SETS_ZARR]: AnnDataLoaders.CellSetsZarrLoader,
  [FileType.ANNDATA_CELLS_ZARR]: AnnDataLoaders.CellsZarrLoader,
  [FileType.ANNDATA_EXPRESSION_MATRIX_ZARR]: AnnDataLoaders.MatrixZarrLoader,
  [FileType.GENOMIC_PROFILES_ZARR]: GenomicProfilesZarrLoader,
};
