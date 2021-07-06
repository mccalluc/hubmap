---
id: component-scatterplot
title: Scatterplot Component
slug: /component-scatterplot
---

Now that you have [installed](/docs/installation/index.html) the `vitessce` package, you can import individual components into your app.

:::tip

Note the `vitessce-container` and `vitessce-theme-light` classes added to the parent div element. Vitessce component styles are scoped under these classes, which means that a parent element must apply the classes in order for child components to inherit the expected styles.

:::

```jsx
import React, { useState } from 'react';
import { Scatterplot } from 'vitessce/es/production/scatterplot.min.js';
import 'vitessce/es/production/static/css/index.css';

export default function App() {
    const [viewState, setViewState] = useState({
        target: [0, 0, 0],
        zoom: 0.75,
    });
    const mapping = "PCA";
    const cells = {
        1: { mappings: { [mapping]: [0, 0] } },
        2: { mappings: { [mapping]: [1, 1] } },
        3: { mappings: { [mapping]: [1, 2] } }
    };
    const cellColors = new Map();
    const dimensions = {
        width: '400px', height: '400px', margin: '10px',
    };

    return (
        <div className="vitessce-container vitessce-theme-light">
            <div className="card card-body bg-secondary" style={dimensions}>
                <Scatterplot
                    uuid="my-vitessce-scatterplot"
                    theme="light"
                    viewState={viewState}
                    setViewState={setViewState}
                    mapping={mapping}
                    cells={cells}
                    cellColors={cellColors}
                />
            </div>
        </div>
    );
}
```