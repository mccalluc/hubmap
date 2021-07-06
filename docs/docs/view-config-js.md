---
id: view-config-js
title: View Configs via JS API
sidebar_label: View Configs via JS API
slug: /view-config-js
---

## Overview

The Vitessce view config defines how data is retrieved, which visualization components are rendered, and how different components are coordinated. Ultimately, this configuration must be a JSON object when it is passed to the `<Vitessce/>` React component's `config` prop. Writing large JSON objects by hand can be difficult and prevents from using variables for more easily maintainable string constants, so we have developed object-oriented APIs to simplify this process. There are corresponding APIs in [Python](https://vitessce.github.io/vitessce-python/) and [R](https://vitessce.github.io/vitessce-r/) if one of those languages is more familiar to you.


## `VitessceConfig`

`VitessceConfig` is a class representing a Vitessce view config. To begin creating a view config with the API, you will need to instantiate a `VitessceConfig` object.
The methods of this object (and the objects its methods return) allow you to manipulate the underlying configuration.
When you are ready to render the Vitessce component, you can use the `.toJSON()` method to translate the `VitessceConfig` object to a plain JSON object.


### `constructor(name, description)`

Construct a Vitessce view config object.


#### Parameters:
- `name` (`string`) - A name for the view config.
- `description` (`string`) - A description for the view config. Optional.

```js {3}
import { VitessceConfig } from 'vitessce';

const vc = new VitessceConfig("My config");
```


### `addDataset(name)`

Add a dataset to the config.

#### Parameters:
- `name` (`string`) - A name for the dataset.

#### Returns:
- Type: `VitessceConfigDataset`

Returns the instance for the new dataset.


```js {4}
import { VitessceConfig, DataType as dt, FileType as ft } from 'vitessce';

const vc = new VitessceConfig("My config");
const dataset = vc.addDataset("My dataset")
    .addFile(
        "http://example.com/my-cells-data.json",
        dt.CELLS,
        ft.CELLS_JSON,
    );
```


### `addView(dataset, component, extra)`

Add a view to the config.

#### Parameters:
- `dataset` (`VitessceConfigDataset`) - A dataset instance to be used for the data visualized in this view.
- `component` (`string`) - A component name. A full list of components can be found on the [components](/docs/components/index.html) documentation page. We recommend using the [`Component`](/docs/components/index.html#constants) constant values rather than writing strings directly.
- `extra` (`object`) - An optional object with extra parameters.
    - `mapping` (`string`) - A convenience parameter for setting the `embeddingType` coordination scope value. This parameter is only applicable when adding the `scatterplot` component. Optional.
    - `x` (`number`) - The horizontal position of the view. Must be an integer between 0 and 11. Optional.
    - `y` (`number`) - The vertical position of the view. Must be an integer between 0 and 11. Optional.
    - `w` (`number`) - The width of the view. Must be an integer between 1 and 12. Optional.
    - `h` (`number`) - The height of the view. Must be an integer between 1 and 12. Optional.

#### Returns:
- Type: `VitessceConfigView`

Returns the instance for the new view.

```js {5-6}
import { VitessceConfig, Component as cm } from 'vitessce';

const vc = new VitessceConfig("My config");
const dataset = vc.addDataset("My dataset");
const v1 = vc.addView(dataset, cm.SPATIAL);
const v2 = vc.addView(dataset, cm.SCATTERPLOT, { mapping: "X_umap" });
```


### `linkViews(views, cTypes, cValues)`

A convenience function for setting up new coordination scopes across a set of views.

#### Parameters:
- `views` (`VitessceConfigView[]`) - An array of view objects to coordinate together.
- `cTypes` (`string[]`) - The coordination types on which to coordinate the views. We recommend using the [`CoordinationType`](/docs/coordination-types/index.html#constants) constant values rather than writing strings directly.
- `cValues` (`array`) - Initial values for each coordination type. Should have the same length as the `cTypes` array. Optional.

#### Returns:
- Type: `VitessceConfig`

Returns `this` to allow chaining.

```js {7-11}
import { VitessceConfig, Component as cm, CoordinationType as ct } from 'vitessce';

const vc = new VitessceConfig("My config");
const dataset = vc.addDataset("My dataset");
const v1 = vc.addView(dataset, cm.SPATIAL);
const v2 = vc.addView(dataset, cm.SPATIAL);
vc.linkViews(
    [v1, v2]
    [ct.SPATIAL_ZOOM, ct.SPATIAL_TARGET_X, ct.SPATIAL_TARGET_Y]
    [2, 0, 0]
);
```


### `layout(viewConcat)`

Create a multi-view layout based on (potentially recursive) view concatenations.

#### Parameters:
- `viewConcat` (`VitessceConfigViewHConcat` or `VitessceConfigViewVConcat` or `VitessceConfigView`) - Views arranged by concatenating vertically or horizontally. Alternatively, a single view can be passed.

#### Returns:
- Type: `VitessceConfig`

Returns `this` to allow chaining.

```js {8}
import { VitessceConfig, Component as cm, hconcat, vconcat } from 'vitessce';

const vc = new VitessceConfig("My config");
const dataset = vc.addDataset("My dataset");
const v1 = vc.addView(dataset, cm.SPATIAL);
const v2 = vc.addView(dataset, cm.SPATIAL);
const v3 = vc.addView(dataset, cm.SPATIAL);
vc.layout(hconcat(v1, vconcat(v2, v3)));
```


### `addCoordination(...cTypes)`

Add scope(s) for new coordination type(s) to the config. See also `VitessceConfig.linkViews()`.

#### Parameters:
- `...cTypes` (variable number of `string`) - A variable number of coordination types. We recommend using the [`CoordinationType`](/docs/coordination-types/index.html#constants) constant values rather than writing strings directly.

#### Returns:
- Type: `VitessceConfigCoordinationScope[]`

Returns the instances for the new scope objects corresponding to each coordination type. These can be linked to views via the `VitessceConfigView.use_coordination()` method.

```js {7-11}
import { VitessceConfig, Component as cm, CoordinationType as ct } from 'vitessce';

const vc = new VitessceConfig("My config");
const dataset = vc.addDataset("My dataset");
const v1 = vc.addView(dataset, cm.SPATIAL);
const v2 = vc.addView(dataset, cm.SPATIAL);
const [zoomScope, xScope, yScope] = vc.addCoordination(
    ct.SPATIAL_ZOOM,
    ct.SPATIAL_TARGET_X,
    ct.SPATIAL_TARGET_Y,
);
v1.useCoordination(zoomScope, xScope, yScope);
v2.useCoordination(zoomScope, xScope, yScope);
zoomScope.setValue(2);
xScope.setValue(0);
yScope.setValue(0);
```


### `toJSON()`

Convert the view config instance to a JSON object.

#### Returns:
- Type: `object`

Returns the config instance as a JSON object.

```js {6}
import { VitessceConfig, Component as cm } from 'vitessce';

const vc = new VitessceConfig("My config");
const dataset = vc.addDataset("My dataset");
vc.layout(vc.addView(dataset, cm.SPATIAL));
const vcJson = vc.toJSON();
```


### `static fromJSON(config)`

Static method to construct a view config instance from an existing JSON config.

#### Parameters:
- `config` (`object`) - A view config as a JSON object.

#### Returns:
- Type: `VitessceConfig`

Returns the config instance.

```js {4}
import { VitessceConfig } from 'vitessce';
import myConfig from './my-config.json';

const vc = VitessceConfig.fromJSON(myConfig);
```


## `hconcat`

Helper function to allow horizontal concatenation of views in the Vitessce grid layout.

```js {7}
import { VitessceConfig, Component as cm, hconcat } from 'vitessce';

const vc = new VitessceConfig("My config");
const dataset = vc.addDataset("My dataset");
const v1 = vc.addView(dataset, cm.SPATIAL);
const v2 = vc.addView(dataset, cm.SPATIAL);
vc.layout(hconcat(v1, v2));
```

### Visual Examples

- Split grid in half horizontally
    ```js
    hconcat(v1, v2)
    ```
    <table className="table-concat">
        <tbody>
            <tr>
                <td>v1</td>
                <td>v2</td>
            </tr>
        </tbody>
    </table>

- Split grid in thirds horizontally
    ```js
    hconcat(v1, v2, v3)
    ```
    <table className="table-concat">
        <tbody>
            <tr>
                <td>v1</td>
                <td>v2</td>
                <td>v3</td>
            </tr>
        </tbody>
    </table>

- Split grid in half horizontally and in half again vertically on right side
    ```js
    hconcat(v1, vconcat(v2, v3))
    ```
    <table className="table-concat">
        <tbody>
            <tr>
                <td rowSpan="2">v1</td>
                <td>v2</td>
            </tr>
            <tr>
                <td>v3</td>
            </tr>
        </tbody>
    </table>

- Use a nested `hconcat` to split in half on left side and fourths on right side (top row).
    ```js {2}
    vconcat(
        hconcat(v1, hconcat(v2, v3)),
        hconcat(v4, v5, v6, v7)
    )
    ```
    <table className="table-concat">
        <tbody>
            <tr>
                <td colSpan="2">v1</td>
                <td>v2</td>
                <td>v3</td>
            </tr>
            <tr>
                <td>v4</td>
                <td>v5</td>
                <td>v6</td>
                <td>v7</td>
            </tr>
        </tbody>
    </table>


## `vconcat`

Helper function to allow vertical concatenation of views in the Vitessce grid layout.

```js {7}
import { VitessceConfig, Component as cm, vconcat } from 'vitessce';

const vc = new VitessceConfig("My config");
const dataset = vc.addDataset("My dataset");
const v1 = vc.addView(dataset, cm.SPATIAL);
const v2 = vc.addView(dataset, cm.SPATIAL);
vc.layout(vconcat(v1, v2));
```

### Visual Examples

- Split grid in half vertically
    ```js
    vconcat(v1, v2)
    ```
    <table className="table-concat">
        <tbody>
            <tr>
                <td>v1</td>
            </tr>
            <tr>
                <td>v2</td>
            </tr>
        </tbody>
    </table>

- Split grid in thirds horizontally
    ```js
    vconcat(v1, v2, v3)
    ```
    <table className="table-concat">
        <tbody>
            <tr>
                <td>v1</td>
            </tr>
            <tr>
                <td>v2</td>
            </tr>
            <tr>
                <td>v3</td>
            </tr>
        </tbody>
    </table>

- Split grid in half horizontally and in half again vertically on right side
    ```js
    vconcat(v1, hconcat(v2, v3))
    ```
    <table className="table-concat">
        <tbody>
            <tr>
                <td colSpan="2">v1</td>
            </tr>
            <tr>
                <td>v2</td>
                <td>v3</td>
            </tr>
        </tbody>
    </table>


- Use a nested `vconcat` to split in half on top and fourths on bottom (left column).
    ```js {2}
    hconcat(
        vconcat(v1, vconcat(v2, v3)),
        vconcat(v4, v5, v6, v7)
    )
    ```
    <table className="table-concat">
        <tbody>
            <tr>
                <td rowSpan="2">v1</td>
                <td>v4</td>
            </tr>
            <tr>
                <td>v5</td>
            </tr>
            <tr>
                <td>v2</td>
                <td>v6</td>
            </tr>
            <tr>
                <td>v3</td>
                <td>v7</td>
            </tr>
        </tbody>
    </table>

## `VitessceConfigDataset`

`VitessceConfigDataset` is a class used to represent a dataset (i.e. list of files containing common biological entities) in the Vitessce view config.

This class is not meant to be instantiated directly, but instances will be created and returned by the `VitessceConfig.addDataset()` method.

### `addFile(url, dataType, fileType, options = null)`

#### Parameters:
- `url` (`string|undefined`) - The URL for the file, pointing to either a local or remote location. We don't associate any semantics with URL strings.
- `dataType` (`string`) - The type of data stored in the file. Must be compatible with the specified [file type](/docs/data-types-file-types/index.html). We recommend using the [`DataType`](/docs/data-types-file-types/index.html#constants) constant values rather than writing strings directly.
- `fileType` (`string`) - The file type. Must be compatible with the specified [data type](/docs/data-types-file-types/index.html). We recommend using the [`FileType`](/docs/data-types-file-types/index.html#constants) constant values rather than writing strings directly.
- `options` (`object|array|null`) -  An optional object or array which may provide additional parameters to the loader class corresponding to the specified `fileType`.

#### Returns:
- Type: `VitessceConfigDataset`

Returns `this` to allow chaining.

```js {5-9}
import { VitessceConfig, DataType as dt, FileType as ft } from 'vitessce';

const vc = new VitessceConfig("My config");
const dataset = vc.addDataset("My dataset")
    .addFile(
        "http://example.com/my-cells-data.json",
        dt.CELLS,
        ft.CELLS_JSON,
    );
```

## `VitessceConfigView`

`VitessceConfigView` is a class used to represent a view (i.e. visualization or controller component) in the Vitessce view config layout.

This class is not meant to be instantiated directly, but instances will be created and returned by the `VitessceConfig.addView()` method.

### `useCoordination(...cScopes)`

Attach coordination scopes to this view instance. All views using the same coordination scope for a particular coordination type will effectively be linked together.

#### Parameters:
- `...cScopes` (variable number of `VitessceConfigCoordinationScope`) - A variable number of coordination scope instances.

#### Returns:
- Type: `VitessceConfigView`

Returns `this` to allow chaining.

### `setProps(props)`

Set extra props for this view. Mostly for debugging.

#### Parameters:
- `props` (`object`) - The props as a JSON object.

#### Returns:
- Type: `VitessceConfigView`

Returns `this` to allow chaining.

### `setXYWH(x, y, w, h)`

Set the x, y, w, h values for this view. This method can be used in place of calling `VitessceConfig.layout()` if more fine-grained control over the layout is required.

#### Returns:
- Type: `VitessceConfigView`

Returns `this` to allow chaining.

## `VitessceConfigCoordinationScope`

Class representing a coordination scope in the coordination space.

### `setValue(cValue)`

Set the coordination value of the coordination scope.

#### Parameters:
- `cValue` (`any`) - The value to set.

#### Returns:
- Type: `VitessceConfigCoordinationScope`

Returns `this` to allow chaining.
