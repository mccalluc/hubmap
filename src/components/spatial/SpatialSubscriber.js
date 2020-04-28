import React, {
  useState, useCallback, useEffect,
} from 'react';
import PubSub from 'pubsub-js';
import shortNumber from 'short-number';

import TitleInfo from '../TitleInfo';
import {
  MOLECULES_ADD,
  NEIGHBORHOODS_ADD,
  CELLS_ADD,
  CELLS_COLOR,
  STATUS_INFO,
  CELLS_SELECTION,
  CELLS_HOVER,
  CLEAR_PLEASE_WAIT,
  VIEW_INFO,
  CELL_SETS_VIEW,
  LAYER_ADD,
  LAYER_REMOVE,
  LAYER_CHANGE,
} from '../../events';
import Spatial from './Spatial';

export default function SpatialSubscriber({
  children,
  onReady,
  removeGridComponent,
  moleculeRadius,
  view,
  cellRadius,
  uuid = null,
}) {
  const [cells, setCells] = useState({});
  const [molecules, setMolecules] = useState(null);
  const [selectedCellIds, setSelectedCellIds] = useState(new Set());
  const [neighborhoods, setNeighborhoods] = useState({});
  const [cellColors, setCellColors] = useState(null);
  const [imageLayerProps, setImageLayerProps] = useState({});
  const [imageLayerLoaders, setImageLayerLoaders] = useState({});

  const onReadyCallback = useCallback(onReady, []);

  useEffect(() => {
    const moleculesAddSubscriber = (msg, newMolecules) => setMolecules(newMolecules);
    const nbhdsAddSubscriber = (msg, newNeighborhoods) => setNeighborhoods(newNeighborhoods);
    const cellsAddSubscriber = (msg, newCells) => setCells(newCells);
    const cellsSelectionSubscriber = (msg, newCellIds) => setSelectedCellIds(newCellIds);
    const cellsColorSubscriber = (msg, newColors) => setCellColors(newColors);
    function layerAddSubscriber(msg, { layerId, loader, layerProps }) {
      setImageLayerLoaders(prevLayerLoaders => ({ ...prevLayerLoaders, [layerId]: loader }));
      setImageLayerProps(prevLayerProps => ({ ...prevLayerProps, [layerId]: layerProps }));
    }
    function layerChangeSubscriber(msg, { layerId, layerProps }) {
      setImageLayerProps(prevLayerProps => ({
        ...prevLayerProps,
        [layerId]: { ...prevLayerProps[layerId], ...layerProps },
      }));
    }
    function layerRemoveSubscriber(msg, layerId) {
      setImageLayerLoaders((prevLoaders) => {
        const { [layerId]: _, ...nextLoaders } = prevLoaders;
        return nextLoaders;
      });
      setImageLayerProps((prevLayerProps) => {
        const { [layerId]: _, ...nextLayerProps } = prevLayerProps;
        return nextLayerProps;
      });
    }

    const moleculesAddToken = PubSub.subscribe(MOLECULES_ADD, moleculesAddSubscriber);
    const nbhdsAddToken = PubSub.subscribe(NEIGHBORHOODS_ADD, nbhdsAddSubscriber);
    const cellsAddToken = PubSub.subscribe(CELLS_ADD, cellsAddSubscriber);
    const cellsSelectionToken = PubSub.subscribe(CELLS_SELECTION, cellsSelectionSubscriber);
    const cellSetsViewToken = PubSub.subscribe(CELL_SETS_VIEW, cellsSelectionSubscriber);
    const cellsColorToken = PubSub.subscribe(CELLS_COLOR, cellsColorSubscriber);
    const layerAddToken = PubSub.subscribe(LAYER_ADD, layerAddSubscriber);
    const layerChangeToken = PubSub.subscribe(LAYER_CHANGE, layerChangeSubscriber);
    const layerRemoveToken = PubSub.subscribe(LAYER_REMOVE, layerRemoveSubscriber);
    onReadyCallback();
    return () => {
      PubSub.unsubscribe(moleculesAddToken);
      PubSub.unsubscribe(nbhdsAddToken);
      PubSub.unsubscribe(cellsAddToken);
      PubSub.unsubscribe(cellsSelectionToken);
      PubSub.unsubscribe(cellSetsViewToken);
      PubSub.unsubscribe(cellsColorToken);
      PubSub.unsubscribe(layerAddToken);
      PubSub.unsubscribe(layerChangeToken);
      PubSub.unsubscribe(layerRemoveToken);
    };
  }, [onReadyCallback]);

  const cellsCount = cells ? Object.keys(cells).length : 0;
  const moleculesCount = molecules ? Object.keys(molecules).length : 0;
  const locationsCount = molecules ? Object.values(molecules)
    .map(l => l.length)
    .reduce((a, b) => a + b, 0) : 0;

  return (
    <TitleInfo
      title="Spatial"
      info={
        `${cellsCount} cells, ${moleculesCount} molecules at ${shortNumber(locationsCount)} locations`
      }
      removeGridComponent={removeGridComponent}
    >
      {children}
      <Spatial
        cells={cells}
        selectedCellIds={selectedCellIds}
        neighborhoods={neighborhoods}
        molecules={molecules}
        cellColors={cellColors}
        imageLayerProps={imageLayerProps}
        imageLayerLoaders={imageLayerLoaders}
        view={view}
        moleculeRadius={moleculeRadius}
        cellRadius={cellRadius}
        uuid={uuid}
        updateStatus={
            message => PubSub.publish(STATUS_INFO, message)
          }
        updateCellsSelection={
            selectedIds => PubSub.publish(CELLS_SELECTION, selectedIds)
          }
        updateCellsHover={
            hoverInfo => PubSub.publish(CELLS_HOVER, hoverInfo)
          }
        updateViewInfo={
            viewInfo => PubSub.publish(VIEW_INFO, viewInfo)
          }
        clearPleaseWait={
            layerName => PubSub.publish(CLEAR_PLEASE_WAIT, layerName)
          }
      />
    </TitleInfo>
  );
}

SpatialSubscriber.defaultProps = {
  cellRadius: 50,
  moleculeRadius: 10,
};
