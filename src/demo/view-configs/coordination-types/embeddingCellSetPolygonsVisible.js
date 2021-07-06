import { vapi } from '../../utils';
import { getEngViewConfig } from '../eng';

function getConfig() {
  const [vc, dataset] = getEngViewConfig(`Coordination Type: ${vapi.ct.EMBEDDING_CELL_SET_POLYGONS_VISIBLE}`, 'Visibility of polygon overlays is coordinated in the top two scatterplots, and independent in the bottom two. Try clicking the gear above each plot and toggling the "Cell Set Polygons Visible" checkboxes.');
  const v1 = vc.addView(dataset, vapi.cm.SCATTERPLOT, {
    mapping: 't-SNE', x: 0, y: 0, w: 5, h: 6,
  });
  const v2 = vc.addView(dataset, vapi.cm.SCATTERPLOT, {
    mapping: 't-SNE', x: 5, y: 0, w: 5, h: 6,
  });
  vc.addView(dataset, vapi.cm.SCATTERPLOT, {
    mapping: 't-SNE', x: 0, y: 6, w: 5, h: 6,
  });
  const v4 = vc.addView(dataset, vapi.cm.SCATTERPLOT, {
    mapping: 't-SNE', x: 5, y: 6, w: 5, h: 6,
  });
  vc.addView(dataset, vapi.cm.CELL_SETS, {
    x: 10, y: 0, w: 2, h: 12,
  });
  vc.linkViews([v1, v2], [vapi.ct.EMBEDDING_CELL_SET_POLYGONS_VISIBLE], [true]);
  vc.linkViews([v4], [vapi.ct.EMBEDDING_CELL_SET_POLYGONS_VISIBLE], [true]);

  return vc.toJSON();
}

export const embeddingCellSetPolygonsVisibleConfig = getConfig();
