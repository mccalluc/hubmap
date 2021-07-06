import {
  VitessceConfig, hconcat, vconcat,
} from '../api/index';
import {
  Component as cm,
  DataType as dt,
  FileType as ft,
  CoordinationType as ct,
} from '../app/constants';

// Exported because used by the cypress tests: They route API requests to the fixtures instead.
export const urlPrefix = 'https://s3.amazonaws.com/vitessce-data/0.0.31/master_release';

export function makeDatasetNameToJsonFiles(datasetPrefix) {
  return name => ({
    type: name,
    fileType: `${name}.json`,
    url: `${urlPrefix}/${datasetPrefix}/${datasetPrefix}.${name}.json`,
  });
}

export function getS3Url(datasetPrefix, name) {
  return `${urlPrefix}/${datasetPrefix}/${datasetPrefix}.${name}.json`;
}

export function notPublic(config) {
  return {
    ...config,
    public: undefined,
  };
}

export const vapi = {
  VitessceConfig,
  hconcat,
  vconcat,
  cm,
  dt,
  ft,
  ct,
};
