import { urlPrefix } from '../utils';

const vanderbiltDescription = 'High bit depth (uint16) multiplex immunofluorescence images of the kidney by the BIOmolecular Multimodal Imaging Center (BIOMIC) at Vanderbilt University';
const vanderbiltBase = {
  description: vanderbiltDescription,
  layers: [
    {
      name: 'raster',
      type: 'RASTER',
      fileType: 'raster.json',
      url: `${urlPrefix}/spraggins/spraggins.raster.json`,
    },
  ],
};

export const spraggins2020 = {
  ...vanderbiltBase,
  version: '0.1.0',
  name: 'Spraggins',
  public: true,
  staticLayout: [
    {
      component: 'spatial',
      props: {
        view: {
          zoom: -6.5,
          target: [20000, 20000, 0],
        },
      },
      x: 0,
      y: 0,
      w: 9,
      h: 2,
    },
    {
      component: 'layerController',
      x: 9,
      y: 0,
      w: 3,
      h: 2,
    },
  ],
};

export const neumann2020 = {
  version: '1.0.1',
  name: 'Neumann et al., 2020',
  description: 'Four registered imaging modalities (PAS, IMS, AF) from HuBMAP collection HBM876.XNRH.336',
  datasets: [
    {
      uid: 'A',
      name: 'Spraggins',
      files: [
        {
          type: 'raster',
          fileType: 'raster.json',
          options: {
            schemaVersion: '0.0.2',
            images: [
              {
                name: 'PAS',
                type: 'ome-tiff',
                url: 'https://assets.hubmapconsortium.org/f4188a148e4c759092d19369d310883b/ometiff-pyramids/processedMicroscopy/VAN0006-LK-2-85-PAS_images/VAN0006-LK-2-85-PAS_registered.ome.tif?token=',
              },
              {
                name: 'AF',
                type: 'ome-tiff',
                url: 'https://assets.hubmapconsortium.org/2130d5f91ce61d7157a42c0497b06de8/ometiff-pyramids/processedMicroscopy/VAN0006-LK-2-85-AF_preIMS_images/VAN0006-LK-2-85-AF_preIMS_registered.ome.tif?token=',
              },
              {
                name: 'IMS PosMode',
                type: 'ome-tiff',
                url: 'https://assets.hubmapconsortium.org/be503a021ed910c0918842e318e6efa2/ometiff-pyramids/ometiffs/VAN0006-LK-2-85-IMS_PosMode_multilayer.ome.tif?token=',
              },
              {
                name: 'IMS NegMode',
                type: 'ome-tiff',
                url: 'https://assets.hubmapconsortium.org/ca886a630b2038997a4cfbbf4abfd283/ometiff-pyramids/ometiffs/VAN0006-LK-2-85-IMS_NegMode_multilayer.ome.tif?token=',
              },
            ],
            usePhysicalSizeScaling: true,
            renderLayers: [
              'PAS',
              'AF',
              'IMS PosMode',
              'IMS NegMode',
            ],
          },
        },
      ],
    },
  ],
  coordinationSpace: {},
  layout: [
    {
      component: 'spatial',
      coordinationScopes: {},
      x: 0,
      y: 0,
      w: 9,
      h: 12,
    },
    {
      component: 'layerController',
      coordinationScopes: {},
      x: 9,
      y: 0,
      w: 3,
      h: 12,
    },
  ],
  initStrategy: 'auto',
};
