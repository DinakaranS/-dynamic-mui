import React, { ChangeEvent } from 'react';
import MuiSwitch, { SwitchProps } from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import { alpha, styled } from '@mui/material/styles';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { premiumControlLabelSx, premiumSwitchSx, mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

interface StyledSwitchProps extends Omit<SwitchProps, 'color'> {
    color?: string;
}

// @ts-ignore
const ColorSwitch = styled(({ color, ...other }: StyledSwitchProps) => <MuiSwitch {...other} />)(({ theme, color }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
        color: color || 'green',
        '&:hover': {
            backgroundColor: alpha(color || 'green', theme.palette.action.hoverOpacity),
        },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: color || 'green',
    },
}));

/** Switch Component */
export default function Switch({ attributes = {}, rules = {}, onChange, submitTick, messages }: ControlProps) {
    const { MuiAttributes = {}, MuiFCLAttributes = {}, color = '', id = '' } = attributes;

    const [checked, setChecked] = React.useState<boolean>(
        MuiAttributes.defaultValue || !!attributes.value || false
    );
    const [error, setError] = React.useState(false);
    const [helperText, setHelperText] = React.useState('');

    useUpdateEffect(() => {
        setChecked(!!attributes.value);
    }, [attributes.value]);

    const isMandatory = rules?.validation?.some((v: any) => v.rule === 'mandatory') || false;

    const validate = (isChecked: boolean) => {
        let isValid = true;
        let msg = '';
        if (rules?.validation) {
            for (const rule of rules.validation) {
                if (rule.rule === 'mandatory') {
                    if (!isChecked) {
                        isValid = false;
                        msg = rule.message || messages?.required || 'Required';
                        break;
                    }
                }
            }
        }
        return { isValid, message: msg };
    };

    useUpdateEffect(() => {
        if (submitTick) {
            const v = validate(checked);
            setError(!v.isValid);
            setHelperText(v.message);
        }
    }, [submitTick]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setChecked(isChecked);

        const v = validate(isChecked);
        setError(!v.isValid);
        setHelperText(v.message);

        if (onChange) onChange({ id, value: isChecked });
    };

    const MSwitch = color ? ColorSwitch : MuiSwitch;

    // Extract defaultChecked to avoid passing it to a controlled component
    const { defaultChecked, sx: muiSx, ...otherMuiAttributes } = MuiAttributes;

    const { label, sx: fclSx, ...otherFCLAttributes } = MuiFCLAttributes;
    const finalLabel = isMandatory ? (
        <span>
            {label}
            <span aria-hidden="true" style={{ color: error ? '#d32f2f' : '#d32f2f', marginLeft: 2 }}>
                *
            </span>
        </span>
    ) : (
        label
    );

    // Build color prop: custom color for ColorSwitch, valid MUI color or 'primary' default for MuiSwitch
    const switchColorProp = color ? { color } : { color: 'primary' as const };

    return (
        <FormControl required={isMandatory} error={error} component="fieldset">
            <FormControlLabel
                {...otherFCLAttributes}
                label={finalLabel}
                sx={mergeSx(premiumControlLabelSx as any, fclSx)}
                control={
                    <MSwitch
                        id={id}
                        checked={checked}
                        onChange={handleChange}
                        required={isMandatory}
                        {...otherMuiAttributes}
                        // @ts-ignore
                        {...switchColorProp}
                        sx={mergeSx(premiumSwitchSx as any, muiSx)}
                        inputProps={{ 'aria-label': 'controlled' }}
                    />
                }
            />
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
}
