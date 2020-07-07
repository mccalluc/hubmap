import React, { useCallback, useState, useReducer } from 'react';

import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import { makeStyles } from '@material-ui/core/styles';

import debounce from 'lodash/debounce';
import PubSub from 'pubsub-js';

import { useExpansionPanelStyles } from './styles';
import { CELLS_OPACITY } from '../../events';

export default function NonRasterLayerController(props) {
  const [slider, setSliderValue] = useState(1);
  const [isOn, toggle] = useReducer(v => !v, true);

  const { type = CELLS_OPACITY, label = 'Cell Segmenations' } = props;

  const handleSliderChange = v => PubSub.publish(type, isOn * v) && setSliderValue(v);
  const handleCheckBoxChange = v => PubSub.publish(type, v * slider) && toggle();
  const handleSliderChangeDebounced = useCallback(
    debounce(handleSliderChange, 3, { trailing: true }),
    [isOn],
  );

  const classes = useExpansionPanelStyles();
  const sliderStyle = makeStyles(theme => ({
    paddingRight: theme.spacing(1),
  }));
  return (
    <Grid item style={{ marginTop: '10px' }}>
      <Paper className={classes.root}>
        <Typography style={{ paddingTop: '20px', paddingLeft: '10px' }}>
          {label}
        </Typography>
        <Grid container direction="row" justify="space-between">
          <Grid item xs={2}>
            <Checkbox color="info" checked={isOn} onChange={(e, v) => handleCheckBoxChange(v)} />
          </Grid>
          <Grid item xs={9} style={{ paddingRight: '5px' }}>
            <Slider
              value={slider}
              min={0}
              max={1}
              step={0.001}
              onChange={(e, v) => handleSliderChangeDebounced(v)}
              className={sliderStyle}
              style={{ marginTop: '7px' }}
              orientation="horizontal"
            />
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}
