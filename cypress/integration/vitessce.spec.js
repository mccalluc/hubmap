import { urlPrefix } from '../../src/demo/utils';

Cypress.on('window:before:load', (win) => {
  // Forces fallback to XHR, so cypress can mock response.
  //
  // Using this work-around:
  // https://github.com/cypress-io/cypress-example-recipes/tree/master/examples/stubbing-spying__window-fetch
  //
  // until this feature is implemented:
  // https://github.com/cypress-io/cypress/issues/95

  delete win.fetch; // eslint-disable-line no-param-reassign
});

describe('Vitessce Mocked Routes', () => {
  beforeEach(() => {
    // Any request we do not explicitly route will return 404,
    // so we won't end up depending on outside resources by accident.
    cy.server({ force404: true });
    ['cells', 'cell-sets', 'molecules', 'raster', 'clusters', 'neighborhoods'].forEach(
      (type) => {
        cy.route(
          `${urlPrefix}/linnarsson/linnarsson.${type}.json`,
          `fixture:../../src/schemas/fixtures/${type}.good.json`,
        );
      },
    );
  });

  it('has title, blurb, and link to "Please wait"', () => {
    cy.visit('/?show=all');
    cy.contains('Vitessce');
    cy.contains('Its modular design is optimized');
    cy.contains('just scatterplot as component'); // Not public; requires "show=all".
    cy.contains('Spraggins as component')
      .click();
    // This part seems to be fragile: Might run too fast?
    // cy.contains('Please wait');
    // cy.get('.modal-body').should('be.visible');
  });

  it('loads details', () => {
    cy.visit('/?dataset=codeluppi-2018&debug=true');

    // Data Set:
    cy.contains('Spatial organization');

    // Status:
    // Contents will depend on load order, so not sure how to make a good test
    // that won't have race condition problems.

    // Spatial:
    cy.contains('1 cell');
    cy.contains('1 molecule');
    cy.contains('3 locations');

    // Heatmap:
    cy.contains('3 cells × 3 genes');
    cy.contains(/with [0-9]+ cells selected/g);

    // Cell sets:
    cy.contains('Cell Sets');
    cy.contains('Clustering Algorithm');

    // Expression Levels:
    cy.contains('3 genes');
    cy.contains('Sox10');

    // Scatterplots:
    cy.contains('Scatterplot (t-SNE)');
    cy.contains('Scatterplot (PCA)');

    // Fails on Travis: Another race condition?
    // cy.get('.modal-body').should('not.be.visible');
  });

  it('loads a warning message for undefined dataset config', () => {
    cy.visit('/?dataset=nonexistent-dataset');
    cy.contains('No such dataset');
  });
});

describe('Vitessce Zarr Store Routes', () => {
  it('loads AnnData zarr store', () => {
    // 8080 is serving the loader fixtures directory.
    cy.visit('/?url=http://127.0.0.1:8080/anndata/good-config.json&debug=true');
    cy.contains('UMAP');
    // This should exist as per the create-fixtures.py file.
    cy.contains('gene_0');
  });

  it('loads OME-TIFF', () => {
    // 8080 is serving the loader fixtures directory.
    cy.visit('/?url=http://127.0.0.1:8080/ome/good-config.json&debug=true');
    cy.contains('Multi Channel Test');
    // This is a 3-channel image
    cy.contains('Channel 0');
    cy.contains('Channel 1');
    cy.contains('Channel 2');
  });
});
