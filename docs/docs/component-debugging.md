---
id: component-debugging
title: 'Debugging'
sidebar_label: Debugging
slug: /component-debugging
---


This page contains tips for debugging Vitessce while developing components or writing configurations.

### Get the current config

Vitessce always writes the current config to the browser console, both as a data URI and as JSON.

### Check network requests

The network tab in your browser's developer tools window can help to determine whether any files failed to load.

### Validate & log the config on every change

By default, Vitessce does not validate or log the view config on every coordination scope change (instead validation occurs only on initial load).
However, by setting the query parameter `debug=1` in the URL, you can enable this behavior.
Note that this has a major performance impact.
