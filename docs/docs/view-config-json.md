---
id: view-config-json
title: View Configs via JSON
sidebar_label: View Configs via JSON
slug: /view-config-json
---

:::tip

Writing view configs directly as JSON can be tedious and error-prone.
Our object-oriented view config APIs may be easier to use:
- [JavaScript View Config API](/docs/view-config-js/index.html)
- [Python View Config API](https://vitessce.github.io/vitessce-python/api_config.html)
- [R View Config API](https://vitessce.github.io/vitessce-r/reference/VitessceConfig.html#examples)

:::

## Overview

The Vitessce view config defines the datasets (and the URLs to the files they contain) and the individual visualization components that the data will be mapped onto. The view config also stores the [coordination space](/docs/coordination/index.html#coordination-space) and defines whether multiple views are linked to each other (and on which properties they are linked, if any).

## Required properties

:::note

The full view config JSON schema can be found [here](https://github.com/vitessce/vitessce/blob/master/src/schemas/config.schema.json).

:::

### `name`
- Type: `string`

A name for the view config. This name may be displayed in the website `<title>`, for example. Although this field is required, you are welcome to use the empty string.

### `version`

- Type: `string`

The view config schema version.

|Value|Notes|
|-------|-----|
| `1.0.0`| Support for the coordination space was added in this version. We recommend that you use this version. |

### `initStrategy`
- Type: `string`

The coordination space initialization strategy. The initialization strategy determines how missing coordination objects and coordination scope mappings are initially filled in.

|Value|Notes|
|-------|-----|
| `auto`| Recommended. This strategy will allow you to omit some or all coordination scope mappings. |
| `none`| Use this strategy if you would like to define all coordination scope mappings yourself. |

:::note
If you find yourself following certain patterns when initializing coordination spaces manually, please let us know so that we may work with you to implement this pattern as a supported strategy.
:::

### `datasets`
- Type: `object[]`

The datasets array stores a list of dataset objects. Each dataset object must contain a unique ID `uid`, a list of file objects `files`, and an optional `name`.

#### `uid`
- Type: `string`

A unique ID for the dataset. Required.

#### `name`
- Type: `string`

A human-readable name for the dataset. Optional.

#### `files`
- Type: `object[]`

The files array stores a list of file objects for a dataset. Each dataset may have one file of each `type`. File objects must contain a `type` ("data type") and `fileType` ("file type"). All file types require a `url` string, with the exception of [`raster.json`](/docs/data-file-types/index.html#rasterjson) which may point to multiple image URLs via an `options` object. We don't associate any semantics with URL strings.

For more information about data types and file types, please visit our [Data Types and File Types](/docs/data-types-file-types/index.html) documentation page.

```json
...,
"datasets": [
    {
        "uid": "my-dataset",
        "name": "My amazing dataset",
        "files": [
            {
                "url": "http://example.com/a.json",
                "type": "cells",
                "fileType": "cells.json"
            },
            {
                "url": "http://example.com/b.json",
                "type": "cell-sets",
                "fileType": "cell-sets.json"
            },
            {
                "type": "raster",
                "fileType": "raster.json",
                "options": {
                    ...
                }
            }
        ]
    }
],
...
```

### `layout`
- Type: `object[]`

The layout property defines which visualization (and controller) components will be rendered, how they will be arranged on the screen, and optionally how they will map onto coordination scopes. Each layout object represents one "component" or "view", and must contain a component name `component`, width `w` and height `h`, and horizontal position `x` and vertical position `y`. Components are arranged in a grid with 12 columns and a dynamic number of rows. Optionally, each component may contain the properties `coordinationScopes` and `props`.

For more information about the components that are available, please visit the [Visualization Components](/docs/components/index.html) documentation page.

For more information about the coordination types that are available, please visit the [Coordination Types](/docs/coordination-types/index.html) documentation page.

```json
...,
"layout": [
    {
        "component": "spatial",
        "x": 0, "y": 0, "w": 6, "h": 12,
        "coordinationScopes": {
            "dataset": "D1",
            "spatialLayers": "SZ1",
            "spatialZoom": "SZ1"
        }
    },
    {
        "component": "spatial",
        "x": 6, "y": 0, "w": 6, "h": 12,
        "coordinationScopes": {
            "dataset": "D1",
            "spatialLayers": "SL2",
            "spatialZoom": "SZ1"
        }
    }
],
...
```

## Optional properties

### `coordinationSpace`
- Type: `object`

The coordination space stores the values associated with each coordination object. It may be helpful to recall that the coordination **space** is analogous to computer memory which stores values of variables, and the coordination **scope names** are analogous to references to different locations in memory.

The keys of each object (at the first level) in the coordination space represent coordination types. The keys of each coordination type object represent coordination scope names. The types of values that each coordination scope can take can be as simple as a single number or as complex as an array or object, and depend on the types of values supported by its coordination type.

```json
...,
"coordinationSpace": {
    "dataset": {
        "D1": "my-dataset"
    },
    "spatialZoom": {
        "SZ1": 2
    },
    "spatialLayers": {
        "SL1": [
            { "type": "cells", "opacity": 1, "radius": 50, "visible": true }
        ],
        "SL2": [
            { "type": "molecules", "opacity": 1, "radius": 20, "visible": true }
        ]
    }
},
...
```

When the coordination space is entirely or partially omitted from the view config, `initStrategy` determines how the missing parts will be initialized.

### `description`
- Type: `string`

An optional description for the view config.
