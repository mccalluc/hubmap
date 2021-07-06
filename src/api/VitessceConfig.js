import { getNextScope, fromEntries } from '../utils';
import { CoordinationType } from '../app/constants';


/**
 * Class representing a file within a Vitessce config dataset.
 */
export class VitessceConfigDatasetFile {
  /**
   * Construct a new file definition instance.
   * @param {string} url The URL to the file.
   * @param {string} dataType The type of data contained in the file.
   * @param {string} fileType The file type.
   * @param {object|array|null} options An optional object or array
   * which may provide additional parameters to the loader class
   * corresponding to the specified fileType.
   */
  constructor(url, dataType, fileType, options) {
    this.file = {
      url,
      type: dataType,
      fileType,
      ...(options !== null ? { options } : {}),
    };
  }

  /**
   * @returns {object} This dataset file as a JSON object.
   */
  toJSON() {
    return this.file;
  }
}

/**
 * Class representing a dataset within a Vitessce config.
 */
export class VitessceConfigDataset {
  /**
   * Construct a new dataset definition instance.
   * @param {string} uid The unique ID for the dataset.
   * @param {string} name The name of the dataset.
   * @param {string} description A description for the dataset.
   */
  constructor(uid, name, description) {
    this.dataset = {
      uid,
      name,
      description,
      files: [],
    };
  }

  /**
   * Add a file definition to the dataset.
   * @param {string|undefined} url The URL to the file.
   * @param {string} dataType The type of data contained in the file.
   * @param {string} fileType The file type.
   * @param {object|array} options An optional object or array
   * which may provide additional parameters to the loader class
   * corresponding to the specified fileType.
   * @returns {VitessceConfigDataset} This, to allow chaining.
   */
  addFile(url, dataType, fileType, options = null) {
    this.dataset.files.push(
      new VitessceConfigDatasetFile(url, dataType, fileType, options),
    );
    return this;
  }

  /**
   * @returns {object} This dataset as a JSON object.
   */
  toJSON() {
    return {
      ...this.dataset,
      files: this.dataset.files.map(f => f.toJSON()),
    };
  }
}

/**
 * Class representing a view within a Vitessce layout.
 */
export class VitessceConfigView {
  /**
   * Construct a new view instance.
   * @param {string} component The name of the Vitessce component type.
   * @param {object} coordinationScopes A mapping from coordination type
   * names to coordination scope names.
   * @param {number} x The x-coordinate of the view in the layout.
   * @param {number} y The y-coordinate of the view in the layout.
   * @param {number} w The width of the view in the layout.
   * @param {number} h The height of the view in the layout.
   */
  constructor(component, coordinationScopes, x, y, w, h) {
    this.view = {
      component,
      coordinationScopes,
      x,
      y,
      w,
      h,
    };
  }

  /**
   * Attach coordination scopes to this view.
   * @param  {...VitessceConfigCoordinationScope} args A variable number of
   * coordination scope instances.
   * @returns {VitessceConfigView} This, to allow chaining.
   */
  useCoordination(...args) {
    const cScopes = args;
    cScopes.forEach((cScope) => {
      this.view.coordinationScopes[cScope.cType] = cScope.cScope;
    });
    return this;
  }

  /**
    * Set the x, y, w, h values for this view.
    * @param {number} x The x-coordinate of the view in the layout.
    * @param {number} y The y-coordinate of the view in the layout.
    * @param {number} w The width of the view in the layout.
    * @param {number} h The height of the view in the layout.
    * @returns {VitessceConfigView} This, to allow chaining.
    */
  setXYWH(x, y, w, h) {
    this.view.x = x;
    this.view.y = y;
    this.view.w = w;
    this.view.h = h;

    return this;
  }

  /**
   * Set props for this view.
   * @returns {VitessceConfigView} This, to allow chaining.
   */
  setProps(props) {
    this.view.props = {
      ...(this.view.props || {}),
      ...props,
    };
    return this;
  }

  /**
   * @returns {object} This view as a JSON object.
   */
  toJSON() {
    return this.view;
  }
}

/**
 * Class representing a horizontal concatenation of views.
 */
export class VitessceConfigViewHConcat {
  constructor(views) {
    this.views = views;
  }
}

/**
 * Class representing a vertical concatenation of views.
 */
export class VitessceConfigViewVConcat {
  constructor(views) {
    this.views = views;
  }
}

/**
 * A helper function to create a horizontal concatenation of views.
 * @param  {...(VitessceConfigView|VitessceConfigViewHConcat|VitessceConfigViewVConcat)} views A
 * variable number of views or view concatenations.
 * @returns {VitessceConfigViewHConcat} A new horizontal view concatenation instance.
 */
export function hconcat(...views) {
  const vcvhc = new VitessceConfigViewHConcat(views);
  return vcvhc;
}

/**
 * A helper function to create a vertical concatenation of views.
 * @param  {...(VitessceConfigView|VitessceConfigViewHConcat|VitessceConfigViewVConcat)} views A
 * variable number of views or view concatenations.
 * @returns {VitessceConfigViewVConcat} A new vertical view concatenation instance.
 */
export function vconcat(...views) {
  const vcvvc = new VitessceConfigViewVConcat(views);
  return vcvvc;
}

/**
 * Class representing a coordination scope in the coordination space.
 */
export class VitessceConfigCoordinationScope {
  /**
   * Construct a new coordination scope instance.
   * @param {string} cType The coordination type for this coordination scope.
   * @param {string} cScope The name of the coordination scope.
   */
  constructor(cType, cScope) {
    this.cType = cType;
    this.cScope = cScope;
    this.cValue = null;
  }

  /**
   * Set the coordination value of the coordination scope.
   * @param {any} cValue The value to set.
   * @returns {VitessceConfigCoordinationScope} This, to allow chaining.
   */
  setValue(cValue) {
    this.cValue = cValue;
    return this;
  }
}

/**
 * Class representing a Vitessce view config.
 */
export class VitessceConfig {
  /**
   * Construct a new view config instance.
   * @param {string} name A name for the config. Optional.
   * @param {string} description A description for the config. Optional.
   */
  constructor(name = undefined, description = undefined) {
    this.config = {
      version: '1.0.0',
      name,
      description,
      datasets: [],
      coordinationSpace: {},
      layout: [],
      initStrategy: 'auto',
    };
  }

  /**
   * Add a new dataset to the config.
   * @param {string} name A name for the dataset. Optional.
   * @param {string} description A description for the dataset. Optional.
   * @param {object} options Extra parameters to be used internally. Optional.
   * @param {string} options.uid Override the automatically-generated dataset ID.
   * Intended for internal usage by the VitessceConfig.fromJSON code.
   * @returns {VitessceConfigDataset} A new dataset instance.
   */
  addDataset(name = undefined, description = undefined, options = undefined) {
    const { uid } = options || {};
    const prevDatasetUids = this.config.datasets.map(d => d.dataset.uid);
    const nextUid = (uid || getNextScope(prevDatasetUids));
    const newDataset = new VitessceConfigDataset(nextUid, name, description);
    this.config.datasets.push(newDataset);
    const [newScope] = this.addCoordination(CoordinationType.DATASET);
    newScope.setValue(nextUid);
    return newDataset;
  }

  /**
   * Add a new view to the config.
   * @param {VitessceConfigDataset} dataset The dataset instance which defines the data
   * that will be displayed in the view.
   * @param {string} component A component name, such as "scatterplot" or "spatial".
   * @param {object} options Extra options for the component.
   * @param {number} options.x The x-coordinate for the view in the grid layout.
   * @param {number} options.y The y-coordinate for the view in the grid layout.
   * @param {number} options.w The width for the view in the grid layout.
   * @param {number} options.h The height for the view in the grid layout.
   * @param {number} options.mapping A convenience parameter for setting the EMBEDDING_TYPE
   * coordination value. Only applicable if the component is "scatterplot".
   * @returns {VitessceConfigView} A new view instance.
   */
  addView(dataset, component, options) {
    const {
      x = 0,
      y = 0,
      w = 1,
      h = 1,
      mapping = null,
    } = options || {};
    const datasetMatches = (
      this.config.coordinationSpace[CoordinationType.DATASET]
        ? Object.entries(this.config.coordinationSpace[CoordinationType.DATASET])
        // eslint-disable-next-line no-unused-vars
          .filter(([scopeName, datasetScope]) => datasetScope.cValue === dataset.dataset.uid)
          .map(([scopeName]) => scopeName)
        : []
    );
    let datasetScope;
    if (datasetMatches.length === 1) {
      [datasetScope] = datasetMatches;
    } else {
      throw new Error('No coordination scope matching the dataset parameter could be found in the coordination space.');
    }
    const coordinationScopes = {
      [CoordinationType.DATASET]: datasetScope,
    };
    const newView = new VitessceConfigView(component, coordinationScopes, x, y, w, h);
    if (mapping) {
      const [etScope] = this.addCoordination(CoordinationType.EMBEDDING_TYPE);
      etScope.setValue(mapping);
      newView.useCoordination(etScope);
    }
    this.config.layout.push(newView);
    return newView;
  }

  /**
   * Get an array of new coordination scope instances corresponding to coordination types
   * of interest.
   * @param {...string} args A variable number of coordination type names.
   * @returns {VitessceConfigCoordinationScope[]} An array of coordination scope instances.
   */
  addCoordination(...args) {
    const cTypes = args;
    const result = [];
    cTypes.forEach((cType) => {
      const prevScopes = (
        this.config.coordinationSpace[cType]
          ? Object.keys(this.config.coordinationSpace[cType])
          : []
      );
      const scope = new VitessceConfigCoordinationScope(cType, getNextScope(prevScopes));
      if (!this.config.coordinationSpace[scope.cType]) {
        this.config.coordinationSpace[scope.cType] = {};
      }
      this.config.coordinationSpace[scope.cType][scope.cScope] = scope;
      result.push(scope);
    });
    return result;
  }

  /**
   * A convenience function for setting up new coordination scopes across a set of views.
   * @param {VitessceConfigView[]} views An array of view objects to link together.
   * @param {string[]} cTypes The coordination types on which to coordinate the views.
   * @param {any[]} cValues Initial values corresponding to each coordination type.
   * Should have the same length as the cTypes array. Optional.
   * @returns {VitessceConfig} This, to allow chaining.
   */
  linkViews(views, cTypes, cValues = null) {
    const cScopes = this.addCoordination(...cTypes);
    views.forEach((view) => {
      cScopes.forEach((cScope) => {
        view.useCoordination(cScope);
      });
    });
    if (Array.isArray(cValues) && cValues.length === cTypes.length) {
      cScopes.forEach((cScope, i) => {
        cScope.setValue(cValues[i]);
      });
    }
    return this;
  }

  /**
   * Set the layout of views.
   * @param {VitessceConfigView|VitessceConfigViewHConcat|VitessceConfigViewVConcat} viewConcat A
   * view or a concatenation of views.
   * @returns {VitessceConfig} This, to allow chaining.
   */
  layout(viewConcat) {
    function layoutAux(obj, xMin, xMax, yMin, yMax) {
      const w = xMax - xMin;
      const h = yMax - yMin;
      if (obj instanceof VitessceConfigView) {
        obj.setXYWH(xMin, yMin, w, h);
      } else if (obj instanceof VitessceConfigViewHConcat) {
        const { views } = obj;
        const numViews = views.length;
        views.forEach((view, i) => {
          layoutAux(view, xMin + (w / numViews) * i, xMin + (w / numViews) * (i + 1), yMin, yMax);
        });
      } else if (obj instanceof VitessceConfigViewVConcat) {
        const { views } = obj;
        const numViews = views.length;
        views.forEach((view, i) => {
          layoutAux(view, xMin, xMax, yMin + (h / numViews) * i, yMin + (h / numViews) * (i + 1));
        });
      }
    }

    layoutAux(viewConcat, 0, 12, 0, 12);

    return this;
  }

  /**
   * Convert this instance to a JSON object that can be passed to the Vitessce component.
   * @returns {object} The view config as a JSON object.
   */
  toJSON() {
    return {
      ...this.config,
      datasets: this.config.datasets.map(d => d.toJSON()),
      coordinationSpace: fromEntries(
        Object.entries(this.config.coordinationSpace).map(([cType, cScopes]) => ([
          cType,
          fromEntries(
            Object.entries(cScopes).map(([cScopeName, cScope]) => ([
              cScopeName,
              cScope.cValue,
            ])),
          ),
        ])),
      ),
      layout: this.config.layout.map(c => c.toJSON()),
    };
  }

  /**
   * Create a VitessceConfig instance from an existing view config, to enable
   * manipulation with the JavaScript API.
   * @param {object} config An existing Vitessce view config as a JSON object.
   * @returns {VitessceConfig} A new config instance, with values set to match
   * the config parameter.
   */
  static fromJSON(config) {
    const { name, description } = config;
    const vc = new VitessceConfig(name, description);
    config.datasets.forEach((d) => {
      const newDataset = vc.addDataset(d.name, d.description, { uid: d.uid });
      d.files.forEach((f) => {
        newDataset.addFile(
          f.url,
          f.type,
          f.fileType,
        );
      });
    });
    Object.keys(config.coordinationSpace).forEach((cType) => {
      if (cType !== CoordinationType.DATASET) {
        const cObj = config.coordinationSpace[cType];
        vc.config.coordinationSpace[cType] = {};
        Object.entries(cObj).forEach(([cScopeName, cScopeValue]) => {
          const scope = new VitessceConfigCoordinationScope(cType, cScopeName);
          scope.setValue(cScopeValue);
          vc.config.coordinationSpace[cType][cScopeName] = scope;
        });
      }
    });
    config.layout.forEach((c) => {
      const newView = new VitessceConfigView(c.component, c.coordinationScopes, c.x, c.y, c.w, c.h);
      vc.config.layout.push(newView);
    });
    return vc;
  }
}
