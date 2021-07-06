import React from 'react';
import Layout from '@theme/Layout';

import BrowserOnly from '@docusaurus/BrowserOnly';

// Reference: https://github.com/mac-s-g/react-json-view/issues/121#issuecomment-670431408
export default function WrappedApp(props) {
  return (
    <Layout
      noFooter
      title="App"
      description="Configure Vitessce instances based on single-cell datasets."
      image="http://beta.vitessce.io/img/logo-card.png"
    >
      <BrowserOnly>
        {() => {
          const App = require('./_App.js').default;
          return (<App {...props} />);
        }}
      </BrowserOnly>
    </Layout>
  );
}

