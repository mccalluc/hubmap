import React from 'react';

export default function CellEmphasis(props) {
  const {
    hoveredCellInfo = null,
    mapping,
    viewInfo,
    uuid,
  } = props;
  if (hoveredCellInfo && viewInfo.viewport && mapping) {
    // Convert the DeckGL coordinates to pixel coordinates
    // using the DeckGL viewport's `project` function
    const projectedXY = viewInfo.viewport.project(hoveredCellInfo.mappings[mapping]);
    const x = projectedXY[0];
    const y = projectedXY[1];
    // Only show the tooltip element if the hovered cell
    // is within the current DeckGL zoom boundaries
    if (hoveredCellInfo.uuid !== uuid
        && x >= 0 && x <= viewInfo.width && y >= 0 && y <= viewInfo.height) {
      // Position a circle-shaped <div> element on top of the hovered cell
      return (
        <div>
          <div
            className="cell-emphasis"
            style={{
              left: `${x - 0.5}px`,
              top: `${y - 10}px`,
              width: '1px',
              height: '20px',
            }}
          />
          <div
            className="cell-emphasis"
            style={{
              left: `${x - 10}px`,
              top: `${y - 0.5}px`,
              width: '20px',
              height: '1px',
            }}
          />
        </div>
      );
    }
  }
  return (<div />);
}
