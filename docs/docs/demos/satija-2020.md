
### Description

In order to facilitate the comparison and joint analysis of multiple HuBMAP datasets, we aim to assign each cell an annotation from a pre-established Cell Ontology. Here we preview sample annotations for scRNA-seq datasets generated from the human spleen, but future data releases will include cell annotations for multiple organs and modalities. We utilize a 'semi-supervised' process for cell annotation. First, the highest quality datasets are manually annotated collaboratively by HIVE and TMC members. Next, additional datasets are automatically annotated using the Label Transfer workflow in Seurat v3.1 (Stuart*, Butler* et al, Cell 2019), returning both a predicted annotation and an associated confidence score. Here, we annotate cells using the [OBO cell ontology](http://www.obofoundry.org/ontology/cl.html), a structured vocabulary of cell types, which allows for browsing annotations at different levels of molecular resolution.

### Attribution

| Group | Creator |
| --- | --- |
| NYGC and UF | Rahul Satija |