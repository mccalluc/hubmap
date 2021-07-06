---
id: coordination
title: Coordination Model
sidebar_label: Coordination Model
slug: /coordination
---

Vitessce supports *coordinated multiple views*, meaning that visualizations can be linked together on many properties.

The implementation of coordinated multiple views in Vitessce follows a coordination model proposed by Boukhelifa and Rodgers ([Information Visualization 2003](https://kar.kent.ac.uk/13874/1/cmvev.pdf)). The coordination details live in the Vitessce view config.

## Graph Representation

We can think about the coordination model as a graph in which there are three types of nodes: coordination types, coordination scopes, and views.

[![Coordination model as graph representation - multiple coordination types - node encoding](https://docs.google.com/drawings/d/e/2PACX-1vRdNNkA8lCXj62edJMB7i6dvDxYxlv127sg9ZvtS7fLMCatG5jh3AyD1A6yqnhTFqi5YIft-T1nsBIT/pub?w=800)](https://docs.google.com/drawings/d/1w64tYpHgkxgoUlmYw02HKM6q2GDiz_ev77TZFhqywi4/edit)

## Glossary

### Coordination Model
The approach or architecture used to achieve view coordination ([Roberts 2007](https://kar.kent.ac.uk/14569/1/Coordinated_%26_Multiple.pdf)).

### Coordination Type
The property or parameter being coordinated, such as "spatial rotation" or "heatmap zoom" or "gene expression colormap". Vitessce further requires that coordination type values conform to a JSON schema, for instance a primitive number or a more complex array or object schema.

### Coordination Scope
A named instance of a coordination type. Each `(coordination type, view)` tuple may map onto a different coordination scope. Views are "coordinated" if they are linked to a common coordination scope. Views may update their `(coordination type, coordination scope)` tuples if changes to the coordinated view connections are initiated by the user.

### Coordination Value
The value of a given coordination scope at a given time.

### Coordination Object
The container for a particular coordination type and its associated coordination scopes & values. Each coordination type has one coordination object.

### Coordination Space
The container for all coordination objects in a visualization system.
In Vitessce, the coordination space is stored in the view config in a serializable JSON format.

### Translation Function
A function that translates values between the coordination space and a visualization implementation.
Coordination values may be stored in an abstract format rather than the format required for any particular view. For this reason, coordinated views must define a translation function for each coordination type, which maps coordination values onto the native format used by the view. In the simplest case the identity function may be used.

