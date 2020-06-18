import React, { useReducer, useRef } from 'react';

import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { useOptionStyles } from './styles';

import ColorPalette from './ColorPalette';

/**
 * Dropdown for options for a channel on the three dots button.
 * @prop {function} handlePropertyChange Callback for changing property (color, IQR of sliders).
 * @prop {function} handleChannelRemove Callback for channel removal.
 * @prop {function} handleIQRUpdate Callback for IQR slider update.
 */
function ChannelOptions({ handlePropertyChange, handleChannelRemove, handleIQRUpdate }) {
  const [open, toggle] = useReducer(v => !v, false);
  const anchorRef = useRef(null);

  const handleColorSelect = (color) => {
    handlePropertyChange('color', color);
  };

  const handleRemove = () => {
    toggle();
    handleChannelRemove();
  };

  const classes = useOptionStyles();
  return (
    <>
      <IconButton
        aria-label="Remove channel"
        size="small"
        onClick={toggle}
        ref={anchorRef}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Popper className={classes.popper} open={open} anchorEl={anchorRef.current} placement="bottom-end" disablePortal>
        <Paper className={classes.paper}>
          <ClickAwayListener onClickAway={toggle}>
            <MenuList id="channel-options">
              <MenuItem dense disableGutters onClick={handleRemove}>
                <span className={classes.span}>Remove</span>
              </MenuItem>
              <MenuItem dense disableGutters onClick={handleIQRUpdate}>
                <span className={classes.span}>Use IQR</span>
              </MenuItem>
              <MenuItem dense disableGutters className={classes.colors}>
                <ColorPalette handleChange={handleColorSelect} />
              </MenuItem>
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>
    </>
  );
}

export default ChannelOptions;
