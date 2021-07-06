import { vapi } from '../../utils';
import { getCodeluppiViewConfig } from '../codeluppi';

function getConfig() {
  const [vc, dataset] = getCodeluppiViewConfig(`Coordination Type: ${vapi.ct.EMBEDDING_TARGET_X}`, 'Panning along the x-axis of the scatterplots is coordinated.');
  const v1 = vc.addView(dataset, vapi.cm.SCATTERPLOT, { mapping: 't-SNE' });
  const v2 = vc.addView(dataset, vapi.cm.SCATTERPLOT, { mapping: 't-SNE' });
  vc.linkViews([v1, v2], [vapi.ct.EMBEDDING_TARGET_X], [0]);

  vc.layout(vapi.hconcat(v1, v2));
  return vc.toJSON();
}

export const embeddingTargetXConfig = getConfig();
