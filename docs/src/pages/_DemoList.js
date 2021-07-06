import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './styles.module.css';

const publicConfigs = [
    'codeluppi-2018',
    'eng-2019',
    'wang-2018',
    'spraggins-2020',
    'neumann-2020',
    'satija-2020',
    'sn-atac-seq-hubmap-2020'
];

function DemoList(props) {
    const {
        configs,
    } = props;

    const baseUrl = useBaseUrl('/index.html?dataset=');

    const demos = publicConfigs.map(key => ([key, configs[key]]));
    return (
        <>
            <p className={styles.demoDescription}>
                The demos compiled here showcase the core features of Vitessce.
            </p>
            <div className={styles.demoGridContainer}>
                {demos.map(([key, d]) => (
                <div key={key} className={styles.demoGridItem}>
                    <a href={baseUrl + key}  className={styles.demoGridItemLink}>{d.name}</a>
                    <p className={styles.demoGridItemDescription}>{d.description}</p>
                </div>
                ))}
            </div>
        </>
    );
}

export default DemoList;
