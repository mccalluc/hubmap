---
id: component-vitessce
title: Vitessce Component
slug: /component-vitessce
---

The top-level `<Vitessce/>` component can be used as one would any other React component.

```jsx
import React from 'react';
import { Vitessce } from 'vitessce';
import myViewConfig from './my-view-config';
import 'vitessce/dist/es/production/static/css/index.css';
import './index.css';

export default function MyApp() {
    return (
        <Vitessce
            config={myViewConfig}
            height={800}
            theme="light"
        />
    );
}
```

## Required props

### `config`
- Type: `object`

This parameter takes a Vitessce view config as a JSON object. Please visit our [view config](/docs/view-config-json/index.html) documentation pages for more details.

### `height`
- Type: `number`

The height in pixels that the Vitessce grid will fill on the page.

## Optional props

### `theme`
- Type: `string`

The theme, used for styling the components. By default, `dark`.

|Value| Notes|
|-----|------|
| `light` | The light theme |
| `dark` | The dark theme |

### `onConfigChange`
- Type: `function`

A callback for view config updates.

### `validateOnConfigChange`
- Type: `boolean`

Whether to validate
against the view config schema when publishing changes. Use for debugging
purposes only, as this has a performance impact.

## Lazy loading

We are aware that the main JavaScript bundle for Vitessce is large.
If you would like to use the `<Vitessce/>` component in certain parts of your app without increasing the bundle size, one option is lazy loading.

### Bundle splitting approach

`React.lazy` only works with [default exports](https://reactjs.org/docs/code-splitting.html#named-exports) (rather than named exports), but we can work around this by adding a new file to wrap the `Vitessce` named export as a default export.
```js title="/src/components/VitessceWrapper.js"
export { Vitessce as default } from 'vitessce';
```

Then in our app, we can dynamically import from this file in a call to `React.lazy` and use the lazy-loaded component within `<Suspense/>`.

```jsx title="/src/components/MyApp.js"
import React, { Suspense } from 'react';
const Vitessce = React.lazy(() => import('./VitessceWrapper'));

export default function MyApp(props) {
  const { config } = props;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Vitessce config={config} theme="dark" height={600} />
    </Suspense>
  );
}
```


### CDN dynamic import approach

One disadvantage of React.lazy is that it works with the bundler (e.g. Webpack) to do "bundle splitting", i.e. the bundle will now be split into two files: the main bundle and the separate bundle for the lazy component.
This can be problematic if you are building a component (which wraps `<Vitessce/>`) which you also intend to publish, as those users dependent on your app will not necessarily be aware that one of your component's dependencies is lazily loaded.
An alternative approach is to use a dynamic import to grab Vitessce from a CDN at run-time.
The [dynamic-import-polyfill](https://github.com/GoogleChromeLabs/dynamic-import-polyfill) package can be used to do this.

```jsx title="/src/components/MyApp.js"
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import dynamicImportPolyfill from 'dynamic-import-polyfill';
import packageJson from '../../package.json';
import { createWarningComponent, asEsModule } from '../utils';
import 'vitessce/es/production/static/css/index.css';

const VITESSCE_BUNDLE_VERSION = packageJson.dependencies.vitessce;
const VITESSCE_BUNDLE_URL = `https://unpkg.com/vitessce@${VITESSCE_BUNDLE_VERSION}/dist/umd/production/index.min.js`;

// Initialize the dynamic __import__() function.
dynamicImportPolyfill.initialize();

export function createWarningComponent(props) {
  return () => {
    const {
      title,
      message,
    } = props;
    return (
      <div className={PRIMARY_CARD}>
        <h1>{title}</h1>
        <div>{message}</div>
      </div>
    );
  };
}

export function asEsModule(component) {
  return {
    __esModule: true,
    default: component,
  };
}

// Lazy load the Vitessce React component,
// using dynamic imports with absolute URLs.
const Vitessce = React.lazy(() => {
  if (!window.React) {
    window.React = React;
  }
  if (!window.ReactDOM) {
    window.ReactDOM = ReactDOM;
  }
  return new Promise((resolve) => {
    const handleImportError = (e) => {
      console.warn(e);
      resolve(asEsModule(createWarningComponent({
        title: 'Could not load Vitessce',
        message: 'The Vitessce scripts could not be dynamically imported.',
      })));
    };
    __import__(VITESSCE_BUNDLE_URL).then(() => {
        // React.lazy promise must return an ES module with the
        // component as the default export.
        resolve(asEsModule(window.vitessce));
    }).catch(handleImportError);
  });
});

export default function MyApp(props) {
  const { config } = props;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Vitessce config={config} theme="dark" height={600} />
    </Suspense>
  );
}
```