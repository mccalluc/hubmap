import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

// Reference: https://github.com/mac-s-g/react-json-view/issues/121#issuecomment-670431408
export default function WrappedIndex() {
  return (
    <Layout
      description="Vitessce is a visual integration tool for exploration of spatial single-cell experiments."
      image="http://beta.vitessce.io/img/logo-card.png"
    >
      <BrowserOnly>
        {() => {
          const Index = require('./_Index.js').default;
          return (
            <Index />
          );
        }}
      </BrowserOnly>
    </Layout>
  );
}
