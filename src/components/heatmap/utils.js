/* eslint-disable */
import clamp from 'lodash/clamp';

export const COLOR_BAR_SIZE = 20;
export const LOADING_TEXT_SIZE = 13;
export const AXIS_LABEL_TEXT_SIZE = 8;
export const AXIS_TITLE_TEXT_SIZE = 14;
export const AXIS_MIN_SIZE = 10;
export const AXIS_MAX_SIZE = 80;

export function layerFilter({ layer, viewport }) {
  if (viewport.id === 'axisLeft') {
    return layer.id.startsWith('axisLeft');
  } if (viewport.id === 'axisTop') {
    return layer.id.startsWith('axisTop');
  } if (viewport.id === 'heatmap') {
    return layer.id.startsWith('heatmap');
  } if (viewport.id === 'colorsLeft') {
    return layer.id.startsWith('colorsLeft');
  } if (viewport.id === 'colorsTop') {
    return layer.id.startsWith('colorsTop');
  }
  return false;
}

export function getAxisSizes(transpose, geneLabelMaxLength, cellLabelMaxLength) {
  const axisOffsetLeft = clamp(
    (transpose ? geneLabelMaxLength : cellLabelMaxLength) * AXIS_LABEL_TEXT_SIZE,
    AXIS_MIN_SIZE,
    AXIS_MAX_SIZE,
  );
  const axisOffsetTop = clamp(
    (transpose ? cellLabelMaxLength : geneLabelMaxLength) * AXIS_LABEL_TEXT_SIZE,
    AXIS_MIN_SIZE,
    AXIS_MAX_SIZE,
  );
  return [axisOffsetLeft, axisOffsetTop];
}

/**
 * Convert a mouse coordinate (x, y) to a heatmap coordinate (col index, row index).
 */
export function mouseToHeatmapPosition(mouseX, mouseY, {
  offsetLeft, offsetTop, targetX, targetY, scaleFactor, matrixWidth, matrixHeight, numRows, numCols,
}) {
  const viewMouseX = mouseX - offsetLeft;
  const viewMouseY = mouseY - offsetTop;

  if (viewMouseX < 0 || viewMouseY < 0) {
    // The mouse is outside the heatmap.
    return [null, null];
  }

  // Determine the rowI and colI values based on the current viewState.
  const bboxTargetX = targetX * scaleFactor + matrixWidth * scaleFactor / 2;
  const bboxTargetY = targetY * scaleFactor + matrixHeight * scaleFactor / 2;

  const bboxLeft = bboxTargetX - matrixWidth / 2;
  const bboxTop = bboxTargetY - matrixHeight / 2;

  const zoomedOffsetLeft = bboxLeft / (matrixWidth * scaleFactor);
  const zoomedOffsetTop = bboxTop / (matrixHeight * scaleFactor);

  const zoomedViewMouseX = viewMouseX / (matrixWidth * scaleFactor);
  const zoomedViewMouseY = viewMouseY / (matrixHeight * scaleFactor);

  const zoomedMouseX = zoomedOffsetLeft + zoomedViewMouseX;
  const zoomedMouseY = zoomedOffsetTop + zoomedViewMouseY;

  const rowI = Math.floor(zoomedMouseY * numRows);
  const colI = Math.floor(zoomedMouseX * numCols);
  return [colI, rowI];
}

/**
 * Convert a heatmap coordinate (col index, row index) to a mouse coordinate (x, y).
 */
export function heatmapToMousePosition(colI, rowI, { offsetLeft, offsetTop, targetX, targetY, scaleFactor, matrixWidth, matrixHeight, numRows, numCols, }) {
  let zoomedMouseY = null
  let zoomedMouseX = null;

  if(rowI !== null) {
    const minY = - matrixHeight * scaleFactor / 2;
    const maxY = matrixHeight * scaleFactor / 2;
    const totalHeight = maxY - minY;

    const minInViewY = (targetY * scaleFactor) - (matrixHeight / 2);
    const maxInViewY = (targetY * scaleFactor) + (matrixHeight / 2);
    const inViewHeight = maxInViewY - minInViewY;
    
    const normalizedRowY = (rowI + 0.5) / numRows;
    const globalRowY = minY + (normalizedRowY * totalHeight);

    if (minInViewY <= globalRowY && globalRowY <= maxInViewY) {
      zoomedMouseY = offsetTop + ((globalRowY - minInViewY) / inViewHeight) * matrixHeight;
    }
  }
  if(colI !== null) {
    const minX = - matrixWidth * scaleFactor / 2;
    const maxX = matrixWidth * scaleFactor / 2;
    const totalWidth = maxX - minX;

    const minInViewX = (targetX * scaleFactor) - (matrixWidth / 2);
    const maxInViewX = (targetX * scaleFactor) + (matrixWidth / 2);
    const inViewWidth = maxInViewX - minInViewX;
    
    const normalizedRowX = (colI + 0.5) / numCols;
    const globalRowX = minX + (normalizedRowX * totalWidth);

    if (minInViewX <= globalRowX && globalRowX <= maxInViewX) {
      zoomedMouseX = offsetLeft + ((globalRowX - minInViewX) / inViewWidth) * matrixWidth;
    }
  }
  return [zoomedMouseX, zoomedMouseY];
}
