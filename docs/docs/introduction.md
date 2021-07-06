---
id: introduction
title: Introduction
slug: /
---


Vitessce is a visual integration tool for exploration of spatial single cell experiments. Its modular design is optimized for scalable, linked visualizations that support the spatial and non-spatial representation of tissue-, cell- and molecule-level data. Vitessce integrates the [Viv](http://viv.gehlenborglab.org/) library to visualize highly multiplexed, high-resolution, high-bit depth image data directly from OME-TIFF files and Bio-Formats-compatible Zarr stores.


## Platforms

Vitessce can be used in JavaScript, Python, or R.

### Web application

Vitessce can be used as a standalone web application on the [App](/app/index.html) page of this website, where you will find a text editor for configing Vitessce with JSON or JavaScript syntax.

### Embedded component

Vitessce can be used as a React component embedded in another web application.
For example, the [HuBMAP Data Portal](https://portal.hubmapconsortium.org/) currently embeds Vitessce for visualization of HuBMAP datasets.
Visit our [React Component](/docs/component-overview/index.html) documentation pages to learn more about using the Vitessce component.

### Python Jupyter widget

We have developed the [vitessce Python package](https://vitessce.github.io/vitessce-python/) for using Vitessce in Python environments.
The package contains a Python object-oriented API for creating Vitessce configurations (which can be exported to a JSON format).
Vitessce can be used as an ipywidget in Jupyter Notebook and JupyterLab, including in the cloud on Binder.

The Python package also contains helpers which facilitate visualizing data stored in common Python single-cell formats with Vitessce.

### R htmlwidget

We have developed the [vitessce R package](https://vitessce.github.io/vitessce-r/) for using Vitessce in R environments, including RStudio and Shiny apps.
The package contains an R object-oriented API for creating Vitessce configurations (which can be exported to a JSON format).

The R package also contains helpers which facilitate visualizing data stored in common R single-cell formats with Vitessce.


## Architecture

The diagram below highlights how Vitessce is composed of a top-level `<Vitessce/>` React component which encapsulates several individual visualization or controller components such as `<Scatterplot/>` and `<Spatial/>`.

<a href="https://docs.google.com/drawings/d/1vS6wP1vs5QepLhXGDRww7LR505HJ-aIqnGn9O19f6xg/edit" target="_blank">
    <img
        src="https://docs.google.com/drawings/d/e/2PACX-1vSoB3YGPxOTKnFOpYHeHX4JruHnibGXruM36uAZtuvPQNM3a7F4uS3q4b5jwGNQ6TJ7bQ9IPB32rdle/pub?w=650"
        alt="Architecture diagram"
        className="ar-16x9"
    />
</a>


## Configuration

When using the top-level `<Vitessce/>` component (or the Python/R widgets), a [JSON-based configuration](/docs/view-config-json/index.html) termed the "view config" defines how data is retrieved, which visualization components are rendered, and how different components are coordinated.
To simplify the configuration process, we also provide object-oriented APIs for generating view configs in [JavaScript](/docs/view-config-js/index.html), [Python](https://vitessce.github.io/vitessce-python/api_config.html), and [R](https://vitessce.github.io/vitessce-r/reference/VitessceConfig.html#examples).


## Integrations

Vitessce is being used in the following projects:

* [HuBMAP Data Portal](https://portal.hubmapconsortium.org/)


## Contributors

<ul><li><a href="https://github.com/keller-mark">Mark Keller</a></li><li><a href="https://github.com/mccalluc">Chuck McCallum</a></li><li><a href="https://github.com/ilan-gold">Ilan Gold</a></li><li><a href="https://github.com/manzt">Trevor Manz</a></li><li><a href="https://github.com/thomaslchan">Tos Chan</a></li><li><a href="https://github.com/sehilyi">Sehi Lyi</a></li><li><a href="https://github.com/jkmarx">Jennifer Marx</a></li><li><a href="https://github.com/pkharchenko">Peter Kharchenko</a></li><li><a href="https://github.com/ngehlenborg">Nils Gehlenborg</a></li></ul>
