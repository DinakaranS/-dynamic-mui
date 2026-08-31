import React, { ChangeEvent, UIEvent } from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { alpha } from '@mui/material/styles';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { premiumSurfaceSx, premiumControlLabelSx, mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

/** ConsentField Component — scrollable terms box with a scroll-to-accept checkbox. */
export default function ConsentField({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const {
        MuiAttributes = {},
        id = '',
        text = '',
        label = 'I agree to the terms',
        requireScroll = true,
    } = attributes as any;

    const [checked, setChecked] = React.useState<boolean>(!!attributes.value);
    const [scrolledToEnd, setScrolledToEnd] = React.useState<boolean>(!requireScroll);
    const [error, setError] = React.useState(false);
    const [helperText, setHelperText] = React.useState('');

    useUpdateEffect(() => {
        setChecked(!!attributes.value);
    }, [attributes.value]);

    const isMandatory =
        rules?.validation?.some((v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect') || false;

    const validate = (isChecked: boolean) => {
        let isValid = true;
        let msg = '';
        if (isMandatory && !isChecked) {
            isValid = false;
            const rule = rules?.validation?.find(
                (r: any) => r.rule === 'mandatory' || r.rule === 'mandatoryselect'
            );
            msg = rule?.message || 'Required';
        }
        return { isValid, message: msg };
    };

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        const el = event.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
            setScrolledToEnd(true);
        }
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setChecked(isChecked);
        const v = validate(isChecked);
        setError(!v.isValid);
        setHelperText(v.message);
        onChange?.({ id, value: isChecked });
    };

    const disabled = requireScroll && !scrolledToEnd;
    const { sx: userSx, ...restMui } = MuiAttributes;

    const agreeLabel = isMandatory ? (
        <span>
            {label}
            <span aria-hidden="true" style={{ color: '#d32f2f', marginLeft: 2 }}>
                *
            </span>
        </span>
    ) : (
        label
    );

    return (
        <FormControl required={isMandatory} error={error} component="fieldset" fullWidth>
            <Box
                data-testid="consent-terms"
                onScroll={handleScroll}
                sx={mergeSx(premiumSurfaceSx as any, {
                    maxHeight: 200,
                    overflow: 'auto',
                    p: 2,
                    mb: 1,
                    whiteSpace: 'pre-wrap',
                    backgroundColor: (theme) => alpha(theme.palette.background.paper, 1),
                })}
            >
                {text}
            </Box>
            <FormControlLabel
                {...restMui}
                sx={mergeSx(premiumControlLabelSx as any, userSx)}
                label={agreeLabel}
                control={
                    <Checkbox
                        checked={checked}
                        disabled={disabled}
                        onChange={handleChange}
                        required={isMandatory}
                        slotProps={{
                            input: { 'aria-label': 'consent-agree' }
                        }}
                    />
                }
            />
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
}
