/* eslint-disable */
import React from 'react';
import Box from '@material-ui/core/Box';
import Slider from '@material-ui/core/Slider';

export default function HeatmapControls(props) {
    const {
        colorScaleLo,
        colorScaleHi,
        onColorScaleChange,
    } = props;

    return (
        <Box component="div" m={1} height="50px">
            <Slider
                orientation="vertical"
                value={[colorScaleLo, colorScaleHi]}
                onChange={onColorScaleChange}
                aria-labelledby="colorscale-slider"
                min={0.0}
                max={1.0}
                step={0.005}
            />
        </Box>
    );
}