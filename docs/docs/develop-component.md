---
id: develop-component
title: Component development
slug: /develop-component
---

This page walks through the steps required to create a new visualization component.
Vitessce components are React components which conform to certain conventions, and may be implemented with libraries such as Vega-Lite, D3, DeckGL or plain JavaScript code.

## The Subscriber component

All Vitessce components should consist of at least two React components: an outer "subscriber" component and an inner "plain" component.
By convention, we add the suffix `Subscriber` to the name of the subscriber component.


The subscriber component carries out several functions:
- the subscriber component may get and set values from the coordination space with the `useCoordination` hook function.
- the subscriber component should render the `<TitleInfo />` component as a parent of its "plain" component.
- the subscriber component may load data from files specified in the view config with React hook functions.

The nodes of the React subtree for a component called `Genes` should ultimately look like:

```jsx
<GenesSubscriber>
  <TitleInfo>
    <Genes />
  </TitleInfo>
</GenesSubscriber>
```

A full example of a subscriber component can be found [here](https://github.com/vitessce/vitessce/blob/master/src/components/genes/GenesSubscriber.js).

## The plain component

The plain component may take data and callback functions as props from its parent subscriber function, and should use its props to render a visualization or controller component. The plain component should not use the `useCoordination` hook or any of the `use___Data` hook functions.

A full example of a plain component can be found [here](https://github.com/vitessce/vitessce/blob/master/src/components/genes/Genes.js).

## The coordination constants

In order for a component to access or change values in the coordination space, the mapping from components to coordination types must be defined [here](https://github.com/vitessce/vitessce/blob/master/src/app/state/coordination.js).
For each component, a subset of coordination types may be specified. This helps to avoid unnecessary component re-rendering events (i.e. we know that the heatmap does not depend on the `spatialZoom` coordination type, so we omit this from the list of coordination types used by the heatmap component).

## The component registry

Once the component has been developed, add a key for the component in the component registry [here](https://github.com/vitessce/vitessce/blob/master/src/app/component-registry.js). This key is the string that will be used to specify the component in the `component` property of the [layout](/docs/view-config-json/index.html#layout) array in JSON view configurations.