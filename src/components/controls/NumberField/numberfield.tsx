import React from 'react';
import { NumericFormat } from 'react-number-format';
import TextField from '@mui/material/TextField';
import Validation from '../../../util/validation';
import { ControlProps } from '../../../types';

interface CustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
}

const NumericFormatCustom = React.forwardRef<HTMLElement, CustomProps>(
    function NumericFormatCustom(props, ref) {
        const { onChange, ...other } = props;

        return (
            <NumericFormat
                {...other}
                getInputRef={ref}
                onValueChange={(values) => {
                    onChange({
                        target: {
                            name: props.name,
                            value: values.value,
                        },
                    });
                }}
                thousandSeparator
                valueIsNumericString
            />
        );
    },
);

export default function NumberField({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const { MuiAttributes = {}, id = '' } = attributes;
    const [value, setValue] = React.useState(attributes.value || '');
    const [error, setError] = React.useState(false);
    const [helperText, setHelperText] = React.useState('');

    const validate = (val: any) => {
        let isValid = true;
        let msg = '';
        if (rules?.validation) {
            for (const rule of rules.validation) {
                // Re-use Validation util for standard rules
                // Mandatory:
                if (rule.rule === 'mandatory') {
                    if (!val) {
                        isValid = false;
                        msg = rule.message || 'Required';
                        break;
                    }
                }
                // Add other rules if needed, e.g. 'numeric'
                if (Validation[rule.rule]) {
                    if (!Validation[rule.rule](val, rule.value)) {
                        isValid = false;
                        msg = rule.message || 'Invalid';
                        break;
                    }
                }
            }
        }
        return { isValid, message: msg };
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const val = event.target.value;
        setValue(val);

        const v = validate(val);
        setError(!v.isValid);
        setHelperText(v.message);

        if (onChange) onChange({ id, value: val });
    };

    const isMandatory = rules?.validation?.some((v: any) => v.rule === 'mandatory') || false;

    return (
        <TextField
            fullWidth
            required={isMandatory}
            value={value}
            onChange={handleChange}
            error={error}
            helperText={helperText}
            onBlur={() => {
                const v = validate(value);
                setError(!v.isValid);
                setHelperText(v.message);
            }}
            {...MuiAttributes}
            name="numberformat"
            id={id}
            InputProps={{
                inputComponent: NumericFormatCustom as any,
                ...MuiAttributes.InputProps
            }}
        />
    );
}
