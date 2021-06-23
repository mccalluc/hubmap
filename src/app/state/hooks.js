import { useRef, useCallback, useMemo } from 'react';
import create from 'zustand';
import shallow from 'zustand/shallow';
import { fromEntries, capitalize } from '../../utils';

/**
 * The useViewConfigStore hook is initialized via the zustand
 * create() function, which sets up both the state variables
 * and the reducer-type functions.
 * Reference: https://github.com/react-spring/zustand
 * @returns {function} The useStore hook.
 */
export const useViewConfigStore = create(set => ({
  // State:
  // The viewConfig is an object which must conform to the schema
  // found in src/schemas/config.schema.json.
  viewConfig: null,
  // The loaders object is a mapping from dataset ID to
  // data type to loader object instance.
  loaders: null,
  // Reducer functions which update the state
  // (although technically also part of state):
  setViewConfig: viewConfig => set({ viewConfig }),
  setLoaders: loaders => set({ loaders }),
  setCoordinationValue: ({ parameter, scope, value }) => set(state => ({
    viewConfig: {
      ...state.viewConfig,
      coordinationSpace: {
        ...state.viewConfig.coordinationSpace,
        [parameter]: {
          ...state.viewConfig.coordinationSpace[parameter],
          [scope]: value,
        },
      },
    },
  })),
  removeComponent: i => set((state) => {
    const newLayout = state.viewConfig.layout.slice();
    newLayout.splice(i, 1);
    return {
      viewConfig: {
        ...state.viewConfig,
        layout: newLayout,
      },
    };
  }),
  changeLayout: newComponentProps => set((state) => {
    const newLayout = state.viewConfig.layout.slice();
    newComponentProps.forEach(([i, newProps]) => {
      newLayout[i] = {
        ...newLayout[i],
        ...newProps,
      };
    });
    return {
      viewConfig: {
        ...state.viewConfig,
        layout: newLayout,
      },
    };
  }),
}));

/**
 * The useAuxiliaryStore hook is initialized via the zustand
 * create() function, which sets up both the state variables
 * and the reducer-type functions.
 * Reference: https://github.com/react-spring/zustand
 * It is meant to be used for non-viewconfig-based coordination between components.
 * For example, as currently happens, the layer controller can coordinate
 * on-load callbacks with spatial view based on whether or not they are
 * coordinated via `spatialRasterLayers` - the callbacks are not part of the view config
 * though so they live here.
 * @returns {function} The useStore hook.
 */
export const useAuxiliaryStore = create(set => ({
  auxiliaryStore: null,
  setCoordinationValue: ({ parameter, scope, value }) => set(state => ({
    auxiliaryStore: {
      ...state.auxiliaryStore,
      [parameter]: {
        [scope]: value,
      },
    },
  })),
}));

/**
 * The hover store can be used to store global state
 * related to which component is currently hovered,
 * which is required for tooltip / crossover elements.
 * @returns {function} The useStore hook.
 */
const useHoverStore = create(set => ({
  // Components may need to know if they are the "hover source"
  // for tooltip interactions. This value should be a unique
  // component ID, such as its index in the view config layout.
  componentHover: null,
  setComponentHover: componentHover => set({ componentHover }),
}));

/**
 * The warning store can be used to store global state
 * related to app warning messages.
 * @returns {function} The useStore hook.
 */
const useWarnStore = create(set => ({
  // Want a global state to collect warning messages
  // that occur anywhere in the app.
  warning: null,
  setWarning: warning => set({ warning }),
}));

/**
 * The view info store can be used to store component-level
 * viewInfo objects,
 * which are required for tooltip / crossover elements.
 * @returns {function} The useStore hook.
 */
const useViewInfoStore = create(set => ({
  // The viewInfo object is a mapping from
  // component IDs to component view info objects.
  // Each view info object must have a project() function.
  viewInfo: {},
  setComponentViewInfo: (uuid, viewInfo) => set(state => ({
    viewInfo: {
      ...state.viewInfo,
      [uuid]: viewInfo,
    },
  })),
}));

/**
 * The grid size store can be used to store a
 * counter which updates on each window or react-grid-layout
 * resize event.
 * @returns {function} The useStore hook.
 */
const useGridSizeStore = create(set => ({
  resizeCount: {},
  incrementResizeCount: () => set(state => ({
    resizeCount: state.resizeCount + 1,
  })),
}));

/**
 * The useCoordination hook returns both the
 * values and setter functions for the coordination objects
 * in a particular coordination scope mapping.
 * This hook is intended to be used within the ___Subscriber
 * components to allow them to "hook into" only those coordination
 * objects and setter functions of relevance.
 * @param {string[]} parameters Array of coordination types.
 * @param {object} coordinationScopes Mapping of coordination types
 * to scope names.
 * @returns {array} Returns a tuple [values, setters]
 * where values is an object containing all coordination values,
 * and setters is an object containing all coordination setter
 * functions for the values in `values`, named with a "set"
 * prefix.
 */
export function useCoordination(parameters, coordinationScopes) {
  const setCoordinationValue = useViewConfigStore(state => state.setCoordinationValue);

  const values = useViewConfigStore((state) => {
    const { coordinationSpace } = state.viewConfig;
    return fromEntries(parameters.map((parameter) => {
      if (coordinationSpace && coordinationSpace[parameter]) {
        const value = coordinationSpace[parameter][coordinationScopes[parameter]];
        return [parameter, value];
      }
      return [parameter, undefined];
    }));
  }, shallow);

  const setters = useMemo(() => fromEntries(parameters.map((parameter) => {
    const setterName = `set${capitalize(parameter)}`;
    const setterFunc = value => setCoordinationValue({
      parameter,
      scope: coordinationScopes[parameter],
      value,
    });
    return [setterName, setterFunc];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  })), [parameters, coordinationScopes]);

  return [values, setters];
}

const AUXILIARY_COORDINATION_TYPES_MAP = {
  spatialRasterLayers: ['rasterLayersCallbacks', 'rasterLayersIsChannelLoading'],
};

/**
 * The maps the coordination types of incoming scopes to new types
 * for the auxiliary store.
 * @param {object} coordinationScopes Mapping of coordination types
 * to scope names.
 * @returns {object} Mapping of coordination types
 * to new scope names for the auxiliary store.
 */
const mapCoordinationScopes = (coordinationScopes) => {
  const newCoordinationScopes = {};
  Object.keys(coordinationScopes).forEach((key) => {
    const newCoordinationTypes = AUXILIARY_COORDINATION_TYPES_MAP[key] || [];
    newCoordinationTypes.forEach((coordinationType) => {
      newCoordinationScopes[coordinationType || key] = coordinationScopes[key];
    });
  });
  return newCoordinationScopes;
};

const mapParameters = parameters => parameters
  .map(parameter => AUXILIARY_COORDINATION_TYPES_MAP[parameter]).filter(Boolean).flat();

/**
 * The useAuxiliaryCoordination hook returns both the
 * values and setter functions for the auxiliary coordination objects
 * in a particular coordination scope mapping.
 * This hook is intended to be used within the ___Subscriber
 * components to allow them to "hook into" only those auxiliary coordination
 * objects and setter functions of relevance, for example "on load" callbacks.
 * @param {string[]} parameters Array of coordination types.
 * @param {object} coordinationScopes Mapping of coordination types
 * to scope names.
 * @returns {array} Returns a tuple [values, setters]
 * where values is an object containing all coordination values,
 * and setters is an object containing all coordination setter
 * functions for the values in `values`, named with a "set"
 * prefix.
 */
export function useAuxiliaryCoordination(parameters, coordinationScopes) {
  const setCoordinationValue = useAuxiliaryStore(state => state.setCoordinationValue);
  const mappedCoordinationScopes = mapCoordinationScopes(coordinationScopes);
  const mappedParameters = mapParameters(parameters);
  const values = useAuxiliaryStore((state) => {
    const { auxiliaryStore } = state;
    return fromEntries(mappedParameters.map((parameter) => {
      if (auxiliaryStore && auxiliaryStore[parameter]) {
        const value = auxiliaryStore[parameter][mappedCoordinationScopes[parameter]];
        return [parameter, value];
      }
      return [parameter, undefined];
    }));
  }, shallow);
  const setters = useMemo(() => fromEntries(mappedParameters.map((parameter) => {
    const setterName = `set${capitalize(parameter)}`;
    const setterFunc = value => setCoordinationValue({
      parameter,
      scope: mappedCoordinationScopes[parameter],
      value,
    });
    return [setterName, setterFunc];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  })), [parameters, coordinationScopes]);

  return [values, setters];
}

/**
 * Obtain the loaders object from
 * the global app state.
 * @returns {object} The loaders object
 * in the `useViewConfigStore` store.
 */
export function useLoaders() {
  return useViewConfigStore(state => state.loaders);
}

/**
 * Obtain the view config layout array from
 * the global app state.
 * @returns {object[]} The layout array
 * in the `useViewConfigStore` store.
 */
export function useLayout() {
  return useViewConfigStore(state => state.viewConfig?.layout);
}

/**
 * Obtain the component removal function from
 * the global app state.
 * @returns {function} The remove component function
 * in the `useViewInfoStore` store.
 */
export function useRemoveComponent() {
  return useViewConfigStore(state => state.removeComponent);
}

/**
 * Obtain the component prop setter function from
 * the global app state.
 * @returns {function} The set component props function
 * in the `useViewInfoStore` store.
 */
export function useChangeLayout() {
  return useViewConfigStore(state => state.changeLayout);
}

/**
 * Obtain the loaders setter function from
 * the global app state.
 * @returns {function} The loaders setter function
 * in the `useViewConfigStore` store.
 */
export function useSetLoaders() {
  return useViewConfigStore(state => state.setLoaders);
}

/**
 * Obtain the view config setter function from
 * the global app state.
 * @returns {function} The view config setter function
 * in the `useViewConfigStore` store.
 */
export function useSetViewConfig() {
  const setViewConfigRef = useRef(useViewConfigStore.getState().setViewConfig);
  const setViewConfig = setViewConfigRef.current;
  return setViewConfig;
}

/**
 * Obtain the component hover value from
 * the global app state.
 * @returns {number} The hovered component ID
 * in the `useHoverStore` store.
 */
export function useComponentHover() {
  return useHoverStore(state => state.componentHover);
}

/**
 * Obtain the component hover setter function from
 * the global app state.
 * @returns {function} The component hover setter function
 * in the `useHoverStore` store.
 */
export function useSetComponentHover() {
  return useHoverStore(state => state.setComponentHover);
}

/**
 * Obtain the warning message from
 * the global app state.
 * @returns {string} The warning message
 * in the `useWarnStore` store.
 */
export function useWarning() {
  return useWarnStore(state => state.warning);
}

/**
 * Obtain the warning setter function from
 * the global app state.
 * @returns {function} The warning setter function
 * in the `useWarnStore` store.
 */
export function useSetWarning() {
  return useWarnStore(state => state.setWarning);
}

/**
 * Obtain the component view info value from
 * the global app state.
 * @returns {object} The view info object for the component
 * in the `useViewInfoStore` store.
 */
export function useComponentViewInfo(uuid) {
  return useViewInfoStore(useCallback(state => state.viewInfo[uuid], [uuid]));
}

/**
 * Obtain the component view info setter function from
 * the global app state.
 * @returns {function} The component view info setter function
 * in the `useViewInfoStore` store.
 */
export function useSetComponentViewInfo(uuid) {
  const setViewInfoRef = useRef(useViewInfoStore.getState().setComponentViewInfo);
  const setComponentViewInfo = viewInfo => setViewInfoRef.current(uuid, viewInfo);
  return setComponentViewInfo;
}

/**
 * Obtain the grid resize count value
 * from the global app state.
 * @returns {number} The grid resize increment value.
 */
export function useGridResize() {
  return useGridSizeStore(state => state.resizeCount);
}

/**
 * Obtain the grid resize count increment function
 * from the global app state.
 * @returns {function} The grid resize count increment
 * function.
 */
export function useEmitGridResize() {
  return useGridSizeStore(state => state.incrementResizeCount);
}
