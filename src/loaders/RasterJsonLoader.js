import { ZarrPixelSource, loadOmeTiff } from '@hms-dbmi/viv';
import { openArray } from 'zarr';
import rasterSchema from '../schemas/raster.schema.json';
import JsonLoader from './JsonLoader';
import { AbstractLoaderError } from './errors';
import LoaderResult from './LoaderResult';

import { initializeRasterLayersAndChannels } from '../components/spatial/utils';

async function initLoader(imageData) {
  const {
    type, url, metadata, requestInit,
  } = imageData;
  switch (type) {
    case ('zarr'): {
      const {
        dimensions, isPyramid, transform,
      } = metadata || {};
      const labels = dimensions.map(d => d.field);
      let source;
      if (isPyramid) {
        const metadataUrl = `${url}${
          url.slice(-1) === '/' ? '' : '/'
        }.zmetadata`;
        const response = await fetch(metadataUrl);
        const { metadata: zarrMetadata } = await response.json();
        const paths = Object.keys(zarrMetadata)
          .filter(metaKey => metaKey.includes('.zarray'))
          .map(arrMetaKeys => arrMetaKeys.slice(0, -7));
        const data = await Promise.all(
          paths.map(path => openArray({ store: url, path })),
        );
        const [yChunk, xChunk] = data[0].chunks.slice(-2);
        const size = Math.min(yChunk, xChunk);
        // deck.gl requirement for power-of-two tile size.
        const tileSize = 2 ** Math.floor(Math.log2(size));
        source = data.map(d => new ZarrPixelSource(d, labels, tileSize));
      } else {
        const data = await openArray({ store: url });
        source = new ZarrPixelSource(data, labels);
      }
      return { data: source, metadata: { dimensions, transform }, channels: (dimensions.find(d => d.field === 'channel') || dimensions[0]).values };
    }
    case ('ome-tiff'): {
      let loader;
      // Fetch offsets for ome-tiff if needed.
      if (metadata && 'omeTiffOffsetsUrl' in metadata) {
        const { omeTiffOffsetsUrl } = metadata;
        const res = await fetch(omeTiffOffsetsUrl, (requestInit || {}));
        if (res.ok) {
          const offsets = await res.json();
          loader = await loadOmeTiff(
            url,
            {
              offsets,
              headers: requestInit?.headers,
            },
          );
        } else {
          throw new Error(`Offsets not found but provided: ${res.status} from ${res.url}`);
        }
      } else {
        loader = await loadOmeTiff(url, { headers: requestInit?.headers });
      }
      const { Pixels: { Channels } } = loader.metadata;
      const channels = Array.isArray(Channels)
        ? Channels.map((channel, i) => channel.Name || `Channel ${i}`)
        : [Channels.Name || `Channel ${0}`];
      return { ...loader, channels };
    }
    default: {
      throw Error(`Image type (${type}) is not supported`);
    }
  }
}

export default class RasterLoader extends JsonLoader {
  constructor(params) {
    super(params);
    const { url, options } = params;
    if (!url && options) {
      this.url = URL.createObjectURL(new Blob([JSON.stringify(options)]));
      this.options = undefined;
    }
    this.schema = rasterSchema;
  }

  async load() {
    const payload = await super.load().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }
    const { data: raster } = payload;
    const { images, renderLayers, usePhysicalSizeScaling = false } = raster;

    // Get image name and URL tuples.
    const urls = images
      .filter(image => !image.url.includes('zarr'))
      .map(image => ([image.url, image.name]));

    // Add a loaderCreator function for each image layer.
    const imagesWithLoaderCreators = images.map(image => ({
      ...image,
      loaderCreator: async () => initLoader(image),
    }));

    // TODO: use options for initial selection of channels
    // which omit domain/slider ranges.
    if (!this.autoImageCache) {
      this.autoImageCache = initializeRasterLayersAndChannels(
        imagesWithLoaderCreators,
        renderLayers,
        usePhysicalSizeScaling,
      );
    }

    return this.autoImageCache.then((autoImages) => {
      const [autoImageLayers, imageLayerLoaders, imageLayerMeta] = autoImages;

      const coordinationValues = {
        spatialRasterLayers: autoImageLayers,
      };
      return new LoaderResult(
        { loaders: imageLayerLoaders, meta: imageLayerMeta },
        urls,
        coordinationValues,
      );
    });
  }
}
