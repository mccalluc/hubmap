import React from 'react';

import version from '../version.json';

function DatasetList(props) {
  const { configs, theme } = props;
  const aClassName = 'list-group-item list-group-item-action flex-column align-items-start bg-secondary';
  const links = configs.map(
    ({ id, name, description }) => (
      <div className={aClassName} key={id}>
        <a
          href={`?dataset=${id}&theme=${theme}`}
          key={id}
        >
          <h5>{name}</h5>
          <p>{description}</p>
        </a>
        <a
          href={`?dataset=${id}&theme=${theme}&small`}
          style={{ fontSize: '75%' }}
        >
          {name} as component
        </a>
      </div>
    ),
  );
  return (
    <div className="list-group">
      {links}
    </div>
  );
}

function Form(props) {
  const { configs, theme } = props;
  return (
    <form method="GET">
      <h1>Vitessce</h1>
      <div>Select a dataset:</div>
      <DatasetList configs={configs} theme={theme} />

      <br />
      <div>Or specify URL of configuration:</div>
      <div className="input-group mb-3">
        <input type="text" name="url" className="form-control" />
        <input type="hidden" name="theme" value={theme} />
        <div className="input-group-append">
          <button className="btn btn-outline-secondary" type="submit">Load</button>
        </div>
      </div>
    </form>
  );
}

function Info() {
  return (
    <>
      <p className="info-paragraph">
        Vitessce is a visual integration tool for exploration of spatial single cell experiments.
        Its modular design is optimized for scalable, linked visualizations that support the
        spatial and non-spatial representation of tissue-, cell- and molecule-level data.
        Vitessce integrates the <a href="http://viv.gehlenborglab.org/">Viv library</a> to visualize
        highly multiplexed, high-resolution, high-bit depth image data directly from
        OME-TIFF files and Bio-Formats-compatible Zarr stores.
      </p>
      <h5 className="info-section-text">
        Contributors
      </h5>
      <ul>
        <li><a href="https://github.com/keller-mark">Mark Keller</a></li>
        <li><a href="https://github.com/mccalluc">Chuck McCallum</a></li>
        <li><a href="https://github.com/ilan-gold">Ilan Gold</a></li>
        <li><a href="https://github.com/manzt">Trevor Manz</a></li>
        <li><a href="https://github.com/thomaslchan">Tos Chan</a></li>
        <li><a href="https://github.com/jkmarx">Jennifer Marx</a></li>
        <li><a href="https://github.com/pkharchenko">Peter Kharchenko</a></li>
        <li><a href="https://github.com/ngehlenborg">Nils Gehlenborg</a></li>
      </ul>
      <h5 className="info-section-text">
        Source Code
      </h5>
      <ul>
        <li><a href="https://github.com/vitessce/vitessce">GitHub</a></li>
        <li><a href="https://www.npmjs.com/package/vitessce">NPM</a></li>
      </ul>
      <h5 className="info-section-text">
        Funding
      </h5>
      <ul>
        <li>
          NIH/OD Human BioMolecular Atlas Program (HuBMAP)
          (OT2OD026677, PI: Nils Gehlenborg).
        </li>
        <li>
          NIH/NLM Biomedical Informatics and Data Science Research Training Program
          (T15LM007092, PI: Nils Gehlenborg)
        </li>
        <li>Harvard Stem Cell Institute (CF-0014-17-03, PI: Nils Gehlenborg)</li>
      </ul>
      <p className="info-section-text">
        This deployment: branch={version.branch} | hash={version.hash} | date={version.date}
      </p>
    </>
  );
}

export default function Welcome(props) {
  const { configs, theme, showBetaHeader } = props;
  return (
    <div className={`vitessce-container vitessce-theme-${theme} welcome-container`}>
      {showBetaHeader && (
        <div className="welcome-beta-header">
          <p>Visit <a href="http://beta.vitessce.io">beta.vitessce.io</a> to view the next version of the Vitessce home page and documentation!</p>
        </div>
      )}
      <div className="react-grid-layout container-fluid" style={{ height: 'max(100vh, 100%)' }}>
        <div className="row">
          <div className="welcome-col-left">
            <div className="card card-body bg-primary">
              <Form configs={configs} theme={theme} />
            </div>
          </div>
          <div className="welcome-col-right">
            <div className="card card-body bg-primary">
              <Info />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
