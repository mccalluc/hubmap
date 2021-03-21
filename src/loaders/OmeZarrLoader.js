import { loadOmeZarr } from '@hms-dbmi/viv';
import AbstractZarrLoader from './AbstractZarrLoader';
import { AbstractLoaderError } from './errors';
import LoaderResult from './LoaderResult';

import { initializeRasterLayersAndChannels } from '../components/spatial/utils';

function hexToRgb(hex) {
  const result = /^#?([A-F\d]{2})([A-F\d]{2})([A-F\d]{2})$/i.exec(hex);
  return [
    parseInt(result[1].toLowerCase(), 16),
    parseInt(result[2].toLowerCase(), 16),
    parseInt(result[3].toLowerCase(), 16),
  ];
}

export default class OmeZarrLoader extends AbstractZarrLoader {
  async load() {
    const payload = await this.getJson('.zattrs').catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }

    const loader = loadOmeZarr(this.url, this.requestInit);
    const { metadata } = loader;

    const { omero } = metadata;

    if (!omero) {
      console.error('Path for image not valid');
      return Promise.reject(payload);
    }

    const { rdefs, channels } = omero;

    const time = rdefs.defaultT ?? 0;
    const z = rdefs.defaultZ ?? 0;

    const imagesWithLoaderCreators = [
      {
        channels: channels.map((channel, i) => ({
          selection: { z, time, channel: i },
          slider: [channel.window.start, channel.window.end],
          color: hexToRgb(channel.color),
        })),
        loaderCreator: async () => loader,
      },
    ];

    // TODO: use options for initial selection of channels
    // which omit domain/slider ranges.
    const [
      autoImageLayers, imageLayerLoaders, imageLayerMeta,
    ] = await initializeRasterLayersAndChannels(
      imagesWithLoaderCreators, undefined,
    );

    const coordinationValues = {
      spatialRasterLayers: autoImageLayers,
    };
    return Promise.resolve(new LoaderResult(
      { loaders: imageLayerLoaders, meta: imageLayerMeta },
      [],
      coordinationValues,
    ));
  }
}
