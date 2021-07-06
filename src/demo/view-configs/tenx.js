

export const scAtacSeq10xPbmc = {
  version: '1.0.0',
  name: 'HiGlass serverless demo with 10x Genomics scATAC-seq 5k PBMC dataset',
  datasets: [
    {
      uid: '10x-genomics-pbmc',
      name: '10x Genomics PBMC',
      files: [
        {
          type: 'genomic-profiles',
          fileType: 'genomic-profiles.zarr',
          url: 'http://higlass-serverless.s3.amazonaws.com/multivec/pbmc_10x_peaks_by_cluster.zarr',
        },
      ],
    },
  ],
  layout: [
    {
      component: 'genomicProfiles',
      props: {
        profileTrackUidKey: 'file',
      },
      x: 0,
      y: 0,
      w: 8,
      h: 2,
    },
    {
      component: 'description',
      props: {
        description: '10x Genomics scATAC-seq of 5k PBMCs. Note: the Zarr HiGlass Plugin Datafetcher is not yet optimized. Please be patient while the HiGlass tracks load.',
      },
      x: 8,
      y: 0,
      w: 4,
      h: 2,
    },
  ],
  initStrategy: 'auto',
};
