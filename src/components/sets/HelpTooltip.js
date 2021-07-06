import React, { useRef, useCallback } from 'react';
import RcTooltip from 'rc-tooltip';

/**
 * This is a small wrapper around the Tooltip component from the rc-tooltip library,
 * which is required to be able to apply theme styles to the tooltip.
 * The default `getTooltipContainer` function used by rc-tooltip
 * just returns `document.body` (see https://github.com/react-component/tooltip#props),
 * We want theme styles to be applied relative to the closest `.vitessce-container`
 * ancestor element.
 * https://github.com/vitessce/vitessce/pull/494#discussion_r395957914
 * @param {object} props Props are passed through to the <RcTooltip/> from the library.
 */
export default function HelpTooltip(props) {
  const { title, content, overlayClassName } = props;
  const spanRef = useRef();

  const getTooltipContainer = useCallback(() => {
    if (spanRef.current) {
      return spanRef.current.closest('.vitessce-container');
    }
    return null;
  }, [spanRef]);

  const overlay = title || content;

  return (
    <>
      <span ref={spanRef} />
      <RcTooltip
        getTooltipContainer={getTooltipContainer}
        overlayClassName={overlayClassName}
        overlay={overlay}
        {...props}
      />
    </>
  );
}

HelpTooltip.defaultProps = {
  overlayClassName: 'help-tooltip',
  placement: 'top',
  trigger: 'hover',
  mouseEnterDelay: 0.2,
  mouseLeaveDelay: 0,
};
