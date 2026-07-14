import React from 'react';
import MuiRating from '@mui/material/Rating';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

/** Premium sx for the rating stars. */
const ratingSx = {
    fontSize: '2rem',
    '& .MuiRating-iconFilled': { color: 'primary.main' },
    '& .MuiRating-iconHover': { color: 'primary.dark' },
} as const;

/** Rating Component — renders a star rating input. */
export default function Rating({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const { id = '', label, MuiAttributes = {} } = attributes;
    const { max = 5, precision, size = 'large', sx: muiSx, ...otherMuiAttributes } = MuiAttributes;

    const [value, setValue] = React.useState<number>(Number(attributes.value) || 0);
    const [error, setError] = React.useState(false);

    useUpdateEffect(() => {
        setValue(Number(attributes.value) || 0);
    }, [attributes.value]);

    const isMandatory =
        rules?.validation?.some((v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect') || false;

    const handleChange = (_event: React.SyntheticEvent, newValue: number | null) => {
        const nextValue = newValue ?? 0;
        setValue(nextValue);
        if (isMandatory) setError(nextValue <= 0);
        onChange?.({ id, value: nextValue });
    };

    return (
        <FormControl required={isMandatory} error={error} component="fieldset">
            {label && <FormLabel component="legend">{label}</FormLabel>}
            <MuiRating
                name={id || 'rating'}
                value={value}
                max={max}
                precision={precision}
                size={size}
                onChange={handleChange}
                {...otherMuiAttributes}
                sx={mergeSx(ratingSx as any, muiSx)}
            />
            {error && <FormHelperText>{'Required'}</FormHelperText>}
        </FormControl>
    );
}
