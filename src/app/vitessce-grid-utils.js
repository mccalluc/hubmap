import {
  useState, useEffect, useRef,
} from 'react';
import { fileTypeToLoader } from '../loaders/types';
import JsonLoader from '../loaders/JsonLoader';

/**
 * Return the bottom coordinate of the layout.
 * https://github.com/STRML/react-grid-layout/blob/20dac73f91274526034c00968b5bedb9c2ed36b9/lib/utils.js#L82
 * @param  {array} layout react-grid-layout layout array.
 * @returns {number} Bottom coordinate.
 */
function getNumRows(layout) {
  let max = 0;
  let bottomY;
  // eslint-disable-next-line no-plusplus
  for (let i = 0, len = layout.length; i < len; i++) {
    bottomY = layout[i].y + layout[i].h;
    if (bottomY > max) max = bottomY;
  }
  return max;
}

/**
 * Compute the row height based on the container height, number of rows,
 * and margin/padding. Basically the reverse of the react-grid-layout's
 * `.containerHeight()` function.
 * https://github.com/STRML/react-grid-layout/blob/83251e5e682abfa3252ff89d4bacf47fdc1f4270/lib/ReactGridLayout.jsx#L223
 * @param {number} containerHeight The height of the .vitessce-container element.
 * @param {number} numRows The number of rows in the layout.
 * @param {number} margin The margin value that will be passed to VitessceGrid.
 * @param {number} padding The padding value that will be passed to VitessceGrid.
 * @returns {number} The new row height value.
 */
function getRowHeight(containerHeight, numRows, margin, padding) {
  const effectiveContainerHeight = containerHeight - 2 * padding - (numRows - 1) * margin;
  return effectiveContainerHeight / numRows;
}

export function useRowHeight(config, initialRowHeight, height, margin, padding) {
  const [containerHeight, setContainerHeight] = useState(height);
  const [rowHeight, setRowHeight] = useState(initialRowHeight);
  const containerRef = useRef();

  // Detect when the `config` or `containerHeight` variables
  // have changed, and update `rowHeight` in response.
  useEffect(() => {
    const numRows = getNumRows(config.layout);
    const newRowHeight = getRowHeight(containerHeight, numRows, margin, padding);
    setRowHeight(newRowHeight);
  }, [containerHeight, config, margin, padding]);

  // Update the `containerHeight` state when the `height` prop has changed.
  useEffect(() => {
    if (height !== null && height !== undefined) {
      setContainerHeight(height);
    }
  }, [height]);

  // If no height prop has been provided, set the `containerHeight`
  // using height of the `.vitessce-container` element.
  // Check the container element height whenever the window has been
  // resized, as it may change if `.vitessce-container` should be
  // sized relative to its parent (and by extension, potentially the window).
  useEffect(() => {
    if (height !== null && height !== undefined) {
      // eslint will complain if the return value is inconsistent,
      // so return a no-op function.
      return () => {};
    }
    function onWindowResize() {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      setContainerHeight(containerRect.height);
    }
    window.addEventListener('resize', onWindowResize);
    onWindowResize();
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, [containerRef, height]);


  return [rowHeight, containerRef];
}

/**
 * Create a mapping from dataset ID to loader objects by data type.
 * @param {object[]} datasets The datasets array from the view config.
 * @param {string} configDescription The top-level description in the
 * view config.
 * @returns {object} Mapping from dataset ID to data type to loader
 * instance.
 */
export function createLoaders(datasets, configDescription) {
  const result = {};
  datasets.forEach((dataset) => {
    const datasetLoaders = {
      name: dataset.name,
      description: dataset.description || configDescription,
      loaders: {},
    };
    dataset.files.forEach((file) => {
      // Fall back to JsonLoader if a loader is not found for the file type.
      const matchingLoaderClass = fileTypeToLoader[file.fileType] || JsonLoader;
      // eslint-disable-next-line new-cap
      const loader = new matchingLoaderClass(file);
      if (Array.isArray(file.type)) {
        file.type.forEach((type) => {
          datasetLoaders.loaders[type] = loader;
        });
      } else {
        datasetLoaders.loaders[file.type] = loader;
      }
    });
    result[dataset.uid] = datasetLoaders;
  });
  return result;
}
