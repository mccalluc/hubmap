import React from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ScreenshotImage from './_ScreenshotImage';
import styles from './styles.module.css';
import useThemeContext from '@theme/hooks/useThemeContext';

const features = [
  {
    title: 'Interactive',
    description: (
      <>
        Vitessce consists of reusable interactive components including a scatterplot, spatial+imaging plot, genome browser tracks, statistical plots, and controller components, built on web technologies such as WebGL.
      </>
    ),
  },
  {
    title: 'Integrative',
    description: (
      <>
        Vitessce enables visual analysis of multi-modal assay types which probe biological systems through techniques such as microscopy, genomics, and transcriptomics.
      </>
    ),
  },
  {
    title: 'Serverless',
    description: (
      <>
        Visualize large datasets stored in static cloud object stores such as AWS S3. No need to manage or pay for expensive compute infrastructure for visualization purposes.
      </>
    ),
  },
];

function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  const { isDarkTheme } = useThemeContext();

  const introUrl = useBaseUrl("/docs/index.html");
  const logoUrl = useBaseUrl(`/img/logo-vitessce-${(isDarkTheme ? 'dark' : 'light')}.png`);

  return (
    <>
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className={clsx("container", styles.heroContainer)}>
          <img className="hero__title" src={logoUrl} title="Vitessce" alt="Vitessce logo" />
          <p className="hero__subtitle">{siteConfig.tagline}</p>
        </div>
      </header>
      <main>
        <section className={styles.homeScreenshots}>
          <a href={`${introUrl}#web-application`}><ScreenshotImage filename="web.png" alt="Vitessce as a web application" /></a>
          <a href={`${introUrl}#embedded-component`}><ScreenshotImage filename="hubmap.png" alt="Vitessce as an embedded web component (HuBMAP Portal)" /></a>
          <a href={`${introUrl}#python-jupyter-widget`}><ScreenshotImage filename="jupyterlab.png" alt="Vitessce as an ipywidget in JupyterLab" /></a>
          <a href={`${introUrl}#r-htmlwidget`}><ScreenshotImage filename="rstudio.png" alt="Vitessce as an htmlwidget in RStudio" /></a>
        </section>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
