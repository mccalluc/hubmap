import { Component } from './constants';

import DescriptionSubscriber from '../components/description/DescriptionSubscriber';
import StatusSubscriber from '../components/status/StatusSubscriber';
import GenesSubscriber from '../components/genes/GenesSubscriber';
import CellSetsManagerSubscriber from '../components/sets/CellSetsManagerSubscriber';
import ScatterplotSubscriber from '../components/scatterplot/ScatterplotSubscriber';
import SpatialSubscriber from '../components/spatial/SpatialSubscriber';
import HeatmapSubscriber from '../components/heatmap/HeatmapSubscriber';
import LayerControllerSubscriber from '../components/layer-controller/LayerControllerSubscriber';
import HiGlassSubscriber from '../components/higlass/HiGlassSubscriber';
import CellSetSizesPlotSubscriber from '../components/sets/CellSetSizesPlotSubscriber';
import GenomicProfilesSubscriber from '../components/higlass/GenomicProfilesSubscriber';
import ExpressionHistogramSubscriber from '../components/genes/ExpressionHistogramSubscriber';
import CellSetExpressionPlotSubscriber from '../components/sets/CellSetExpressionPlotSubscriber';


const registry = {
  [Component.DESCRIPTION]: DescriptionSubscriber,
  [Component.STATUS]: StatusSubscriber,
  [Component.GENES]: GenesSubscriber,
  [Component.CELL_SETS]: CellSetsManagerSubscriber,
  [Component.SCATTERPLOT]: ScatterplotSubscriber,
  [Component.SPATIAL]: SpatialSubscriber,
  [Component.HEATMAP]: HeatmapSubscriber,
  [Component.LAYER_CONTROLLER]: LayerControllerSubscriber,
  [Component.CELL_SET_SIZES]: CellSetSizesPlotSubscriber,
  [Component.GENOMIC_PROFILES]: GenomicProfilesSubscriber,
  [Component.EXPRESSION_HISTOGRAM]: ExpressionHistogramSubscriber,
  [Component.CELL_SET_EXPRESSION]: CellSetExpressionPlotSubscriber,
  // The plain higlass component does not abstract away the HiGlass view config,
  // so we probably want to avoid documenting it, only use it for development purposes.
  higlass: HiGlassSubscriber,
};

export function getComponent(name) {
  const component = registry[name];
  if (component === undefined) {
    throw new Error(`Could not find definition for "${name}" in registry.`);
  }
  return registry[name];
}
