import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

export default function DataTypesTable(props) {
    return (
        <table className={styles.dataTypesTable}>
            <thead>
                <tr><th>Data Type</th><th>File Types</th><th>Convert from...</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>cells</code> <br/> Cells, their positions (spatially and for dimensionality-reduction scatterplots), their segmentations as polygons, and other per-cell attributes.</td>
                    <td><ul>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#cellsjson')}><code>cells.json</code></a></li>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#anndata-cellszarr')}><code>anndata-cells.zarr</code></a></li>
                    </ul></td>
                    <td><ul>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#anndata-as-h5ad')}>AnnData</a></li>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#loom')}>Loom</a></li>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#seurat')}>Seurat</a></li>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#snapatac')}>SnapATAC</a></li>
                    </ul></td>
                </tr>
                <tr>
                    <td><code>molecules</code> <br/> Spatially-resolved molecules such as individual RNA molecules measured by FISH assays.</td>
                    <td><ul>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#moleculesjson')}><code>molecules.json</code></a></li>
                    </ul></td>
                    <td></td>
                </tr>
                <tr>
                    <td><code>cell-sets</code> <br/> Lists or hierarchies of cell sets, used to store cell type assignments or automated clustering results.</td>
                    <td><ul>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#cell-setsjson')}><code>cell-sets.json</code></a></li>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#anndata-cell-setszarr')}><code>anndata-cell-sets.zarr</code></a></li>
                    </ul></td>
                    <td><ul>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#anndata-as-h5ad')}>AnnData</a></li>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#loom')}>Loom</a></li>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#seurat')}>Seurat</a></li>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#snapatac')}>SnapATAC</a></li>
                    </ul></td>
                </tr>
                <tr>
                    <td><code>raster</code><br/> Multi-scale multiplexed imaging data, including pointers to OME-TIFF files and Zarr stores.</td>
                    <td><ul>
                        <li>
                            <a href={useBaseUrl('/docs/data-file-types/index.html#rasterjson')}><code>raster.json</code></a>
                            <ul>
                                <li>OME-TIFF</li>
                                <li>Zarr</li>
                            </ul>
                        </li>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#rasterome-zarr')}><code>raster.ome-zarr</code></a></li>
                    </ul></td>
                    <td></td>
                </tr>
                <tr>
                    <td><code>expression-matrix</code><br/> Gene expression matrices.</td>
                    <td><ul>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#expression-matrixzarr')}><code>expression-matrix.zarr</code></a></li>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#anndata-expression-matrixzarr')}><code>anndata-expression-matrix.zarr</code></a></li>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#clustersjson')}><code>clusters.json</code></a></li>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#genesjson')}><code>genes.json</code></a></li></ul></td>
                    <td><ul>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#anndata-as-h5ad')}>AnnData</a></li>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#loom')}>Loom</a></li>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#seurat')}>Seurat</a></li>
                    </ul></td>
                </tr>
                <tr>
                    <td><code>neighborhoods</code><br/> </td>
                    <td><ul><li><a href={useBaseUrl('/docs/data-file-types/index.html#neighborhoodsjson')}><code>neighborhoods.json</code></a></li></ul></td>
                    <td></td>
                </tr>
                <tr>
                    <td><code>genomic-profiles</code><br/> Genomic profiles, such as ATAC-seq profiles.</td>
                    <td><ul><li><a href={useBaseUrl('/docs/data-file-types/index.html#genomic-profileszarr')}><code>genomic-profiles.zarr</code></a></li></ul></td>
                    <td><ul>
                        <li><a href={useBaseUrl('/docs/data-file-types/index.html#snapatac')}>SnapATAC</a></li>
                    </ul></td>
                </tr>
            </tbody>
        </table>
    );
}