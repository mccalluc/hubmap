import { makeDatasetNameToJsonFiles } from '../utils';

const wangName = 'Wang et al., Scientific Reports 2018';
const wangDescription = 'Multiplexed imaging of high-density libraries of RNAs with MERFISH and expansion microscopy';

export const wang2018 = {
  name: wangName,
  version: '1.0.0',
  description: wangDescription,
  public: true,
  datasets: [
    {
      uid: 'wang-2018',
      name: 'Wang 2018',
      files: [
        ...[
          'cells', 'molecules',
        ].map(makeDatasetNameToJsonFiles('wang')),
        {
          ...makeDatasetNameToJsonFiles('wang')('genes'),
          type: 'expression-matrix',
        },
      ],
    },
  ],
  initStrategy: 'auto',
  coordinationSpace: {
    spatialZoom: {
      A: -1,
    },
    spatialLayers: {
      A: [
        {
          type: 'molecules', radius: 2, opacity: 1, visible: true,
        },
        {
          type: 'cells', opacity: 1, radius: 50, visible: true, stroked: false,
        },
      ],
    },
  },
  layout: [
    {
      component: 'spatial',
      coordinationScopes: {
        spatialZoom: 'A',
        spatialLayers: 'A',
      },
      x: 0,
      y: 0,
      w: 10,
      h: 2,
    },
    {
      component: 'genes',
      x: 10,
      y: 0,
      w: 2,
      h: 2,
    },
  ],
};
