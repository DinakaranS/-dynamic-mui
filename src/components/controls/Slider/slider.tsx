import React from 'react';
import MuiSlider from '@mui/material/Slider';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

type SliderValue = number | number[];

/** Premium sx: thumb lifts with a soft glow on hover/focus. */
const sliderSx = {
    '& .MuiSlider-thumb': {
        transition: 'box-shadow .2s',
        '&:hover, &.Mui-focusVisible': {
            boxShadow: '0 0 0 8px rgba(99,102,241,0.16)',
        },
    },
} as const;

/** Slider Component — renders a single value or range slider. */
export default function Slider({ attributes = {}, onChange }: ControlProps) {
    const {
        id = '',
        label,
        min = 0,
        max = 100,
        step = 1,
        marks,
        valueLabelDisplay = 'auto',
        MuiAttributes = {},
    } = attributes;
    const { sx: muiSx, ...otherMuiAttributes } = MuiAttributes;

    const initialValue: SliderValue = attributes.value ?? min;
    const [value, setValue] = React.useState<SliderValue>(initialValue);

    useUpdateEffect(() => {
        if (attributes.value !== undefined) setValue(attributes.value);
    }, [attributes.value]);

    const handleChange = (_event: Event, newValue: SliderValue) => {
        setValue(newValue);
        onChange?.({ id, value: newValue });
    };

    return (
        <FormControl component="fieldset" fullWidth>
            {label && <FormLabel component="legend">{label}</FormLabel>}
            <MuiSlider
                value={value}
                min={min}
                max={max}
                step={step}
                marks={marks}
                valueLabelDisplay={valueLabelDisplay}
                onChange={handleChange}
                {...otherMuiAttributes}
                sx={mergeSx(sliderSx as any, muiSx)}
            />
        </FormControl>
    );
}
