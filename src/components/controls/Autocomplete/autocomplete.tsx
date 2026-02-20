import { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { ControlProps } from '../../../types';
import useUpdateEffect from '../../../util/useUpdateEffect';

export default function AutoComplete({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const { MuiAttributes = {}, id = '', options = [], label = 'Combo Box' } = attributes;

    const [value, setValue] = useState(attributes.value || null);
    const [error, setError] = useState(false);
    const [helperText, setHelperText] = useState('');

    useEffect(() => {
        if (attributes.value) setValue(attributes.value);
    }, []);

    useUpdateEffect(() => {
        setValue(attributes.value);
    }, [attributes.value]);

    const validate = (val: any) => {
        let isValid = true;
        let msg = '';
        if (rules?.validation) {
            for (const rule of rules.validation) {
                if (rule.rule === 'mandatory') {
                    if (!val) {
                        isValid = false;
                        msg = rule.message || 'Required';
                        break;
                    }
                }
            }
        }
        return { isValid, message: msg };
    };

    const handleChange = (_event: any, newValue: any) => {
        setValue(newValue);
        const v = validate(newValue);
        setError(!v.isValid);
        setHelperText(v.message);

        if (onChange) {
            onChange({ id, value: newValue });
        }
    };

    const handleBlur = () => {
        const v = validate(value);
        setError(!v.isValid);
        setHelperText(v.message);
    };

    const isMandatory = rules?.validation?.some((v: any) => v.rule === 'mandatory') || false;

    return (
        <Autocomplete
            disablePortal
            id={id}
            options={options}
            value={value}
            onChange={handleChange}
            fullWidth
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    required={isMandatory}
                    error={error}
                    helperText={helperText}
                    onBlur={handleBlur}
                />
            )}
            {...MuiAttributes}
        />
    );
}
