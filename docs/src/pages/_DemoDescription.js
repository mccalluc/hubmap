import React from 'react';
import Loading from '@theme/Loading';
import Loadable from 'react-loadable';
import registry from '@generated/registry';

function DemoDescription(props) {
    const { demo } = props;

    console.log(demo);

  // Try to get the Description component from the markdown file in
  // the docs/demos/ directory (if one exists).
  // Adapted from https://github.com/facebook/docusaurus/blob/cf97662/packages/docusaurus/src/client/exports/ComponentCreator.tsx#L56
  const chunkRegistry = registry ? (
      Object.values(registry)
        .find(c => c[1] === `@site/docs/demos/${demo}.md`)
  ) : null;

  console.log(chunkRegistry);

  let Description = () => null;
  if(chunkRegistry) {
    const [optsLoader, optsModules, optsWebpack] = chunkRegistry;

    if(optsLoader && optsModules && optsWebpack) {
        Description = Loadable({
            loading: Loading,
            loader: optsLoader,
            modules: optsModules,
            webpack: () => optsWebpack,
        });
    }
  }

  return <Description />;
}

export default DemoDescription;
