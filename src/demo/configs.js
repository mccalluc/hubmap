import { notPublic, vapi } from './utils';
import {
  justScatter, justScatterExpression, justSpatial, codeluppi2018,
} from './view-configs/codeluppi';
import { eng2019 } from './view-configs/eng';
import { wang2018 } from './view-configs/wang';
import { spraggins2020, neumann2020 } from './view-configs/spraggins';
import { satija2020 } from './view-configs/satija';
import { justHiglass } from './view-configs/rao';
import { scAtacSeq10xPbmc } from './view-configs/tenx';
import { hubmapIntestineSnAtacSeq } from './view-configs/hubmap';
import {
  embeddingZoomConfig,
  embeddingTargetXConfig,
  embeddingTargetYConfig,
  embeddingCellSetPolygonsVisibleConfig,
} from './view-configs/coordination-types/index';


export const coordinationTypeConfigs = {
  [vapi.ct.EMBEDDING_ZOOM]: embeddingZoomConfig,
  [vapi.ct.EMBEDDING_TARGET_X]: embeddingTargetXConfig,
  [vapi.ct.EMBEDDING_TARGET_Y]: embeddingTargetYConfig,
  [vapi.ct.EMBEDDING_CELL_SET_POLYGONS_VISIBLE]: embeddingCellSetPolygonsVisibleConfig,
};

// Note that the ordering of the components in the layout
// can affect the z-index of plot tooltips due to the
// resulting ordering of elements in the DOM.

export const configs = {
  'just-scatter': justScatter,
  'just-scatter-expression': justScatterExpression,
  'just-spatial': justSpatial,
  'just-higlass': justHiglass,
  'codeluppi-2018': codeluppi2018,
  'eng-2019': eng2019,
  'wang-2018': wang2018,
  'spraggins-2020': spraggins2020,
  'neumann-2020': neumann2020,
  'satija-2020': satija2020,
  'sn-atac-seq-hubmap-2020': hubmapIntestineSnAtacSeq,
  'sc-atac-seq-10x-genomics-pbmc': scAtacSeq10xPbmc,
  // Keys which enable backwards compatibility with old links.
  'linnarsson-2018': notPublic(codeluppi2018),
  vanderbilt: notPublic(spraggins2020),
  'dries-2019': notPublic(eng2019),
  ...coordinationTypeConfigs,
};
