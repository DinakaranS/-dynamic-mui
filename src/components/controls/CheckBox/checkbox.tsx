import React, { ChangeEvent } from 'react';
import MuiCheckBox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { ControlProps } from '../../../types';

/** Playground Component */
export default function CheckBox({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const { MuiAttributes = {}, MuiFCLAttributes = {}, id = '' } = attributes;

    const [checked, setChecked] = React.useState<boolean>(
        MuiAttributes.defaultChecked || !!attributes.value || false
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
                    // Start unchecked?
                    if (!isChecked) {
                        isValid = false;
                        msg = rule.message || 'Required';
                        break;
                    }
                }
            }
        }
        return { isValid, message: msg };
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setChecked(isChecked);

        const v = validate(isChecked);
        setError(!v.isValid);
        setHelperText(v.message);

        if (onChange) onChange({ id, value: isChecked });
    };

    const { label, ...otherFCLAttributes } = MuiFCLAttributes;
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

    return (
        <FormControl required={isMandatory} error={error} component="fieldset">
            <FormControlLabel
                {...otherFCLAttributes}
                label={finalLabel}
                control={
                    <MuiCheckBox
                        checked={checked}
                        onChange={handleChange}
                        required={isMandatory}
                        {...MuiAttributes}
                        inputProps={{ 'aria-label': 'controlled' }}
                    />
                }
            />
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
}
