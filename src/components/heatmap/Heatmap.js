/* eslint-disable */
import React, { useRef, useState, useCallback, useMemo, useEffect, useReducer } from 'react';
import uuidv4 from 'uuid/v4';
import DeckGL from 'deck.gl';
import { COORDINATE_SYSTEM, OrthographicView } from '@deck.gl/core';
import { TextLayer } from '@deck.gl/layers';
import HeatmapBitmapLayer, { TILE_SIZE, MAX_ROW_AGG, MIN_ROW_AGG } from '../../layers/HeatmapBitmapLayer';
import PixelatedBitmapLayer from '../../layers/PixelatedBitmapLayer';
import HeatmapControls from './HeatmapControls';
import range from 'lodash/range';
import clamp from 'lodash/clamp';
import isEqual from 'lodash/isEqual';
import { max } from 'd3-array';
import { DEFAULT_GL_OPTIONS } from '../utils';
import HeatmapWorker from './heatmap.worker.js';

const COLOR_BAR_SIZE = 20;
const LOADING_TEXT_SIZE = 13;
const AXIS_LABEL_TEXT_SIZE = 8;
const AXIS_TITLE_TEXT_SIZE = 14;
const AXIS_MIN_SIZE = 10;
const AXIS_MAX_SIZE = 80;

const themeToTextColor = {
  "dark": [224, 224, 224],
  "light": [64, 64, 64],
};

function layerFilter({ layer, viewport }) {
  if(viewport.id === 'axisLeft') {
    return layer.id.startsWith('axisLeft');
  } else if(viewport.id === 'axisTop') {
    return layer.id.startsWith('axisTop');
  } else if(viewport.id === 'heatmap') {
    return layer.id.startsWith('heatmap');
  } else if(viewport.id === 'colorsLeft') {
    return layer.id.startsWith('colorsLeft');
  } else if(viewport.id === 'colorsTop') {
    return layer.id.startsWith('colorsTop');
  }
  return false;
}

/**
 * A heatmap component for cell x gene (and gene x cell) matrices.
 * @param {*} props 
 */
export default function Heatmap(props) {
  const {
    uuid,
    theme,
    initialViewState = {
      minZoom: 0,
      zoom: 0,
      target: [0, 0, 0]
    },
    width: viewWidth,
    height: viewHeight,
    clusters,
    cellColors,
    clearPleaseWait,
    updateCellsHover = (hoverInfo) => {
      console.warn(`Heatmap updateCellsHover: ${hoverInfo.cellId}`);
    },
    updateGenesHover = (hoverInfo) => {
      console.warn(`Heatmap updateGenesHover: ${hoverInfo.geneId}`);
    },
    updateStatus = (message) => {
      console.warn(`Heatmap updateStatus: ${message}`);
    },
    updateViewInfo = (message) => {
      //console.warn(`Heatmap updateViewInfo: ${message}`);
    },
    transpose = false,
    axisLeftTitle = (transpose ? "Genes" : "Cells"),
    axisTopTitle = (transpose ? "Cells" : "Genes"),
  } = props;

  useEffect(() => {
    if (clearPleaseWait && clusters) {
      clearPleaseWait('expression-matrix');
    }
  }, [clearPleaseWait, clusters]);

  const workerRef = useRef(new HeatmapWorker());
  const tilesRef = useRef();
  const dataRef = useRef();
  const [viewState, setViewState] = useState(initialViewState);
  const [axisLeftLabels, setAxisLeftLabels] = useState([]);
  const [axisTopLabels, setAxisTopLabels] = useState([]);
  const [colorScaleLo, setColorScaleLo] = useState(0.0);
  const [colorScaleHi, setColorScaleHi] = useState(1.0);

  // Callback function for the color scale slider change event.
  const onColorScaleChange = useCallback((event, newValue) => {
    setColorScaleLo(newValue[0]);
    setColorScaleHi(newValue[1]);
  }, []);

  // Since we are storing the tile data in a ref,
  // and updating it asynchronously when the worker finishes,
  // we need to tie it to a piece of state through this iteration value.
  const [tileIteration, incTileIteration] = useReducer(i => i+1, 0);

  // We need to keep a backlog of the tasks for the worker thread,
  // since the array buffer can only be held by one thread at a time.
  const [backlog, setBacklog] = useState([]);

  // Use an effect to listen for the worker to send the array of tiles.
  useEffect(() => {
    workerRef.current.addEventListener('message', (event) => {
      // The tiles have been generated.
      tilesRef.current = event.data.tiles;
      // The buffer has been transferred back to the main thread.
      dataRef.current = new Uint8Array(event.data.buffer);
      // Increment the counter to notify the downstream useEffects and useMemos.
      incTileIteration();
      // Remove this task and everything prior from the backlog.
      const curr = event.data.curr;
      setBacklog(prev => {
        const currIndex = prev.indexOf(curr);
        return prev.slice(currIndex+1, prev.length);
      })
    });
  }, [workerRef, tilesRef]);

  // Store a reference to the matrix Uint8Array in the dataRef,
  // since we need to access its array buffer to transfer
  // it back and forth from the worker thread.
  useEffect(() => {
    // Store the clusters Uint8Array in the dataRef.
    if(clusters && clusters.matrix) {
      dataRef.current = clusters.matrix.data;
    } 
  }, [dataRef, clusters]);

  // Emit the viewInfo event on viewState updates
  // (used by external tooltips / crosshair elements).
  useEffect(() => {
    if(viewState) {
      updateViewInfo({
        uuid,
        width: viewState.width,
        height: viewState.height,
        viewport: viewState.viewport,
      });
    }
  }, [uuid, viewState, updateViewInfo]);

  // Check if the ordering of axis labels needs to be changed,
  // for example if the cells "selected" (technically just colored)
  // have changed.
  useEffect(() => {
    if(!clusters) {
      return;
    }
    // TODO: need to use Map rather than Object.keys since ordering may not be stable/correct when IDs are numbers.
    const newCellOrdering = (!cellColors || Object.keys(cellColors).length === 0 ? clusters.rows : Object.keys(cellColors));
    const oldCellOrdering = (transpose ? axisTopLabels : axisLeftLabels);

    if(!isEqual(oldCellOrdering, newCellOrdering)) {
      if(transpose) {
        setAxisTopLabels(newCellOrdering);
      } else {
        setAxisLeftLabels(newCellOrdering);
      }
    }
  }, [clusters, cellColors, axisTopLabels, axisLeftLabels]);

  // Set the genes ordering.
  useEffect(() => {
    if(!clusters) {
      return;
    }
    if(transpose) {
      setAxisLeftLabels(clusters.cols);
    } else {
      setAxisTopLabels(clusters.cols);
    }
  }, [clusters]);

  const [cellLabelMaxLength, geneLabelMaxLength] = useMemo(() => {
    if(!clusters) {
      return [0, 0];
    }
    return [
      max(clusters.rows.map(cellId => cellId.length)),
      max(clusters.cols.map(geneId => geneId.length))
    ];
  }, [clusters]);

  const width = axisTopLabels.length;
  const height = axisLeftLabels.length;

  const axisOffsetLeft = clamp((transpose ? geneLabelMaxLength : cellLabelMaxLength) * AXIS_LABEL_TEXT_SIZE, AXIS_MIN_SIZE, AXIS_MAX_SIZE);
  const axisOffsetTop = clamp((transpose ? cellLabelMaxLength : geneLabelMaxLength) * AXIS_LABEL_TEXT_SIZE, AXIS_MIN_SIZE, AXIS_MAX_SIZE);

  const colorOffsetLeft = COLOR_BAR_SIZE;
  const colorOffsetTop = COLOR_BAR_SIZE;

  const offsetTop = axisOffsetTop + colorOffsetTop;
  const offsetLeft = axisOffsetLeft + colorOffsetLeft;

  const matrixWidth = viewWidth - offsetLeft;
  const matrixHeight = viewHeight - offsetTop;

  const matrixLeft = -matrixWidth/2;
  const matrixRight = matrixWidth/2;
  const matrixTop = -matrixHeight/2;
  const matrixBottom = matrixHeight/2;

  const xTiles = Math.ceil(width / TILE_SIZE);
  const yTiles = Math.ceil(height / TILE_SIZE);

  const widthRatio = (xTiles*TILE_SIZE - (TILE_SIZE - (width % TILE_SIZE))) / (xTiles*TILE_SIZE);
  const heightRatio = (yTiles*TILE_SIZE - (TILE_SIZE - (height % TILE_SIZE))) / (yTiles*TILE_SIZE);

  const tileWidth = (matrixWidth / widthRatio) / (xTiles);
  const tileHeight = (matrixHeight / heightRatio) / (yTiles);

  const scaleFactor = Math.pow(2, viewState.zoom);
  const cellHeight = (matrixHeight * scaleFactor) / height;
  const cellWidth = (matrixWidth * scaleFactor) / width;

  // Get power of 2 between 1 and 16, for number of cells to aggregate together in each direction.
  const aggSizeX = clamp(Math.pow(2, Math.ceil(Math.log2(1/cellWidth))), MIN_ROW_AGG, MAX_ROW_AGG);
  const aggSizeY = clamp(Math.pow(2, Math.ceil(Math.log2(1/cellHeight))), MIN_ROW_AGG, MAX_ROW_AGG);

  // Listen for viewState changes.
  // Do not allow the user to zoom and pan outside of the initial window.
  const onViewStateChange = useCallback(({ viewState }) => {
    const { zoom } = viewState;
    const scaleFactor = Math.pow(2, zoom);

    const minTargetX = zoom === 0 ? 0 : -(matrixRight - (matrixRight / scaleFactor));
    const maxTargetX = -1 * minTargetX;

    const minTargetY = zoom === 0 ? 0 : -(matrixBottom - (matrixBottom / scaleFactor));
    const maxTargetY = -1 * minTargetY;

    // Manipulate view state if necessary to keep the user in the window.
    viewState.target[0] = clamp(viewState.target[0], minTargetX, maxTargetX);
    viewState.target[1] = clamp(viewState.target[1], minTargetY, maxTargetY);

    setViewState(viewState);
  }, [matrixRight, matrixBottom]);

  // If `clusters` or `cellOrdering` have changed,
  // then new tiles need to be generated,
  // so add a new task to the backlog.
  useEffect(() => {
    if(!clusters) {
      return;
    }
    // Use a uuid to give the task a unique ID,
    // to help identify where in the list it is located
    // after the worker thread asynchronously sends the data back
    // to this thread.
    setBacklog(prev => ([...prev, uuidv4()]));
  }, [dataRef, clusters, axisTopLabels, axisLeftLabels, xTiles, yTiles]);

  // When the backlog has updated, a new worker job can be submitted if:
  // - the backlog has length >= 1 (at least one job is waiting), and
  // - buffer.byteLength is not zero, so the worker does not currently "own" the buffer.
  useEffect(() => {
    if(backlog.length < 1) {
      return;
    }
    const curr = backlog[backlog.length - 1];
    if(dataRef.current && dataRef.current.buffer.byteLength) {
      workerRef.current.postMessage(['getTiles', {
        curr,
        xTiles,
        yTiles,
        tileSize: TILE_SIZE,
        cellOrdering: (transpose ? axisTopLabels : axisLeftLabels),
        rows: clusters.rows,
        cols: clusters.cols,
        transpose,
        data: dataRef.current.buffer,
      }], [dataRef.current.buffer]);
    }
  }, [backlog]);

  // Update the heatmap tiles if:
  // - new tiles are available (`tileIteration` has changed), or
  // - the matrix bounds have changed, or
  // - the `aggSizeX` or `aggSizeY` have changed, or
  // - the cell ordering has changed.
  const heatmapLayers = useMemo(() => {
    if(!tilesRef.current || backlog.length) {
      return [];
    }
    
    function getLayer(i, j, tile) {
      return new HeatmapBitmapLayer({
        id: `heatmapLayer-${tileIteration}-${i}-${j}`,
        image: tile,
        bounds: [matrixLeft + j*tileWidth, matrixTop + i*tileHeight, matrixLeft + (j+1)*tileWidth, matrixTop + (i+1)*tileHeight],
        aggSizeX,
        aggSizeY,
        colorScaleLo,
        colorScaleHi,
        updateTriggers: {
          image: [axisLeftLabels, axisTopLabels],
          bounds: [tileHeight, tileWidth],
        }
      });
    }
    return tilesRef.current.flatMap((tileRow, i) => tileRow.map((tile, j) => getLayer(i, j, tile)));
  }, [tilesRef, tileIteration, tileWidth, tileHeight,
    aggSizeX, aggSizeY, axisLeftLabels, axisTopLabels, xTiles, yTiles, colorScaleLo, colorScaleHi,
    backlog]);


  // Map cell and gene names to arrays with indices,
  // to prepare to render the names in TextLayers.
  const axisTopLabelData = useMemo(() => {
    return axisTopLabels.map((d, i) => [i, d]);
  }, [axisTopLabels]);

  const axisLeftLabelData = useMemo(() => {
    return axisLeftLabels.map((d, i) => [i, d]);
  }, [axisLeftLabels]);

  // Set up the constants for the axis layers.
  const showAxisLeftLabels = cellHeight >= AXIS_LABEL_TEXT_SIZE;
  const showAxisTopLabels = cellWidth >= AXIS_LABEL_TEXT_SIZE;

  const axisMargin = 3;
  const axisLabelLeft = viewState.target[0] + (axisOffsetLeft - axisMargin)/2/scaleFactor;
  const axisLabelTop = viewState.target[1] + (axisOffsetTop - axisMargin)/2/scaleFactor;

  const axisTitleLeft = viewState.target[0];
  const axisTitleTop = viewState.target[1];
  
  // Generate the axis label and title TextLayer objects.
  const axisLayers = (clusters && clusters.rows && clusters.cols ? [
    new TextLayer({
      id: 'axisLeftLabels',
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: axisLeftLabelData,
      getText: d => d[1],
      getPosition: d => [axisLabelLeft, matrixTop + ((d[0] + 0.5) / height) * matrixHeight],
      getTextAnchor: 'end',
      getColor: themeToTextColor[theme],
      getSize: (showAxisLeftLabels ? AXIS_LABEL_TEXT_SIZE : 0),
      getAngle: 0,
      updateTriggers: {
        getPosition: [axisLabelLeft, matrixTop, matrixHeight, viewHeight],
        getSize: [showAxisLeftLabels],
        getColor: [theme],
      }
    }),
    new TextLayer({
      id: 'axisTopLabels',
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: axisTopLabelData,
      getText: d => d[1],
      getPosition: d => [matrixLeft + ((d[0] + 0.5) / width) * matrixWidth, axisLabelTop],
      getTextAnchor: 'start',
      getColor: themeToTextColor[theme],
      getSize: (showAxisTopLabels ? AXIS_LABEL_TEXT_SIZE : 0),
      getAngle: 75,
      updateTriggers: {
        getPosition: [axisLabelTop, matrixLeft, matrixWidth, viewWidth],
        getSize: [showAxisTopLabels],
        getColor: [theme],
      }
    }),
    new TextLayer({
      id: 'axisLeftTitle',
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: [{
        title: axisLeftTitle
      }],
      getText: d => d.title,
      getPosition: d => [axisTitleLeft, axisTitleTop],
      getTextAnchor: 'middle',
      getColor: themeToTextColor[theme],
      getSize: (!showAxisLeftLabels ? AXIS_TITLE_TEXT_SIZE : 0),
      getAngle: 90,
      updateTriggers: {
        getPosition: [axisTitleLeft, axisTitleTop],
        getSize: [showAxisLeftLabels],
        getColor: [theme],
      }
    }),
    new TextLayer({
      id: 'axisTopTitle',
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: [{
        title: axisTopTitle
      }],
      getText: d => d.title,
      getPosition: d => [axisTitleLeft, axisTitleTop],
      getTextAnchor: 'middle',
      getColor: themeToTextColor[theme],
      getSize: (!showAxisTopLabels ? AXIS_TITLE_TEXT_SIZE : 0),
      getAngle: 0,
      updateTriggers: {
        getPosition: [axisTitleLeft, axisTitleTop],
        getSize: [showAxisTopLabels],
        getColor: [theme],
      }
    }),
  ] : []);

  // Create a TextLayer for the "Loading..." indicator.
  const loadingLayers = (backlog.length ? [
    new TextLayer({
      id: 'heatmapLoading',
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: [{
        title: "Loading..."
      }],
      getText: d => d.title,
      getPosition: d => [viewState.target[0], viewState.target[1]],
      getTextAnchor: 'middle',
      getColor: themeToTextColor[theme],
      getSize: LOADING_TEXT_SIZE,
      getAngle: 0,
      updateTriggers: {
        getColor: [theme],
      }
    }),
  ] : []);

  // Create the left color bar with a BitmapLayer.
  // TODO: identify left and top color bars with colorsLeft and colorsTop, rather than "cellColors".
  const cellColorsTiles = useMemo(() => {
    if(!cellColors) {
      return null;
    }

    let cellId;
    let offset;
    let color;
    let rowI;

    const cellOrdering = (transpose ? axisTopLabels : axisLeftLabels);
    const colorBarTileWidthPx = (transpose ? TILE_SIZE : 1);
    const colorBarTileHeightPx = (transpose ? 1 : TILE_SIZE);

    const result = range(yTiles).map(i => {
      const tileData = new Uint8ClampedArray(TILE_SIZE * 1 * 4);

      range(TILE_SIZE).forEach(tileY => {
        rowI = (i * TILE_SIZE) + tileY; // the row / cell index
        if(rowI < height) {
          cellId = cellOrdering[rowI];
          color = cellColors[cellId];
          offset = (TILE_SIZE - tileY - 1) * 4;
          if(color) {
            tileData[offset + 0] = color[0];
            tileData[offset + 1] = color[1];
            tileData[offset + 2] = color[2];
            tileData[offset + 3] = 255;
          }
        }
      });

      return new ImageData(tileData, colorBarTileWidthPx, colorBarTileHeightPx);
    });

    return result;
  }, [cellColors, axisTopLabels, axisLeftLabels, transpose]);

  const cellColorsLayers = useMemo(() => {
    return cellColorsTiles ? cellColorsTiles.map((tile, i) => {
      return new PixelatedBitmapLayer({
        id: `colorsLeftLayer-${i}-${uuidv4()}`,
        image: tile,
        bounds: [-matrixWidth/2, matrixTop + i*tileHeight, matrixWidth/2, matrixTop + (i+1)*tileHeight],
      });
    }) : [];
  }, [cellColorsTiles, matrixTop, tileHeight]);

  const layers = heatmapLayers.concat(axisLayers).concat(loadingLayers).concat(cellColorsLayers);

  // Set up the onHover function.
  function onHover(info, event) {
    if(!clusters) {
      return;
    }
    const viewMouseX = event.offsetCenter.x - offsetLeft;
    const viewMouseY = event.offsetCenter.y - offsetTop;

    if(viewMouseX < 0 || viewMouseY < 0) {
      // The mouse is outside the heatmap.
      return;
    }

    // Determine the rowI and colI values based on the current viewState.
    const bboxTargetX = viewState.target[0]*scaleFactor + matrixWidth*scaleFactor/2;
    const bboxTargetY = viewState.target[1]*scaleFactor + matrixHeight*scaleFactor/2;
    
    const bboxLeft = bboxTargetX - matrixWidth/2;
    const bboxTop = bboxTargetY - matrixHeight/2;
    
    const zoomedOffsetLeft = bboxLeft / (matrixWidth*scaleFactor);
    const zoomedOffsetTop = bboxTop / (matrixHeight*scaleFactor);

    const zoomedViewMouseX = viewMouseX / (matrixWidth*scaleFactor);
    const zoomedViewMouseY = viewMouseY / (matrixHeight*scaleFactor);

    const zoomedMouseX = zoomedOffsetLeft + zoomedViewMouseX;
    const zoomedMouseY = zoomedOffsetTop + zoomedViewMouseY;

    const rowI = Math.floor(zoomedMouseY * height);
    const colI = Math.floor(zoomedMouseX * width);

    const obsI = clusters.rows.indexOf(transpose ? axisTopLabels[colI] : axisLeftLabels[rowI]);
    const varI = clusters.cols.indexOf(transpose ? axisLeftLabels[rowI] : axisTopLabels[colI]);
    
    const obsId = clusters.rows[obsI];
    const varId = clusters.cols[varI];
    console.log(obsId, varId);
  }

  return (
    <>
      <DeckGL
        views={[
          new OrthographicView({ id: 'heatmap', controller: true, x: offsetLeft, y: offsetTop, width: matrixWidth, height: matrixHeight }),
          new OrthographicView({ id: 'axisLeft', controller: false, x: 0, y: offsetTop, width: axisOffsetLeft, height: matrixHeight }),
          new OrthographicView({ id: 'axisTop', controller: false, x: offsetLeft, y: 0, width: matrixWidth, height: offsetTop }),
          new OrthographicView({ id: 'colorsLeft', controller: false, x: axisOffsetLeft, y: offsetTop, width: colorOffsetLeft - 3, height: matrixHeight }),
          new OrthographicView({ id: 'colorsTop', controller: false, x: offsetLeft, y: axisOffsetTop, width: matrixWidth, height: colorOffsetTop - 3 }),
        ]}
        layers={layers}
        layerFilter={layerFilter}
        getCursor={interactionState => (interactionState.isDragging ? 'grabbing' : 'default')}
        glOptions={DEFAULT_GL_OPTIONS}
        onViewStateChange={onViewStateChange}
        viewState={viewState}
        onHover={onHover}
      />
      <HeatmapControls
        colorScaleLo={colorScaleLo}
        colorScaleHi={colorScaleHi}
        onColorScaleChange={onColorScaleChange}
      />
    </>
  );
}
