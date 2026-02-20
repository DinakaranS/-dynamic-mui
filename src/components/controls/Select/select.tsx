import React, { useCallback } from 'react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { checkboxSX, getInputProps } from '../../../util/helper';
import { ControlProps } from '../../../types';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const getValue = (options: any[] = [], defaultValue: any = '', isMultiple = false, separator = ',') => {
    try {
        const safeOptions = Array.isArray(options) ? options : [];

        if (isMultiple) {
            let values: any[] = [];

            if (Array.isArray(defaultValue)) {
                values = defaultValue;
            } else if (typeof defaultValue === 'string' && defaultValue.trim() !== '') {
                let tempSeparator = separator;
                if (defaultValue.includes(',')) tempSeparator = ',';
                else if (defaultValue.includes(';')) tempSeparator = ';';

                values = defaultValue.split(tempSeparator).map((v) => v.trim());
            }

            const dValueSet = new Set(values);
            return safeOptions.filter(({ value }) => dValueSet.has(value));
        }

        if (Array.isArray(defaultValue)) {
            const first = defaultValue[0];
            return safeOptions.find(({ value }) => value === first);
        }

        return safeOptions.find(({ value }) => value === defaultValue);
    } catch (err) {
         
        console.error('getValue error:', err);
        return isMultiple ? [] : null;
    }
};

export default function Select({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const {
        MuiAttributes = {},
        options = [],
        MuiBoxAttributes = {},
        id = '',
        InputProps = {},
    } = attributes;
    const [value, setValue] = React.useState(
        attributes?.value &&
        getValue(options, attributes?.value, MuiAttributes.multiple, attributes?.separator),
    );

    // Validation State
    const [error, setError] = React.useState(false);
    const [helperText, setHelperText] = React.useState('');

    const validate = (val: any) => {
        let isValid = true;
        let msg = '';
        if (rules?.validation) {
            for (const rule of rules.validation) {
                // ... (inside loop)
                // Simplified for mandatory:
                if (rule.rule === 'mandatory') {
                    const isEmpty = !val || (Array.isArray(val) && val.length === 0);
                    if (isEmpty) {
                        isValid = false;
                        msg = rule.message || 'Required';
                        break;
                    }
                }
                // ...
            }
        }
        return { isValid, message: msg };
    };

    const getMuiAttributes = () => {
        // ... (existing logic)
        if (MuiAttributes.multiple) {
            MuiAttributes.renderOption = (props: React.HTMLAttributes<HTMLLIElement>, option: any = {}, { selected }: any) => (
                <li {...props}>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                        sx={checkboxSX(option.color || '')}
                    />
                    {option.title || option.label || option.value}
                </li>
            );
        }
        return MuiAttributes;
    };

    const extractValue = useCallback((option: any) => option?.value || option?.title || option?.label, []);

    const onChangeEvent = useCallback(
        (_event: any, newValue: any) => {
            setValue(newValue);

            // Validate
            const validation = validate(newValue);
            setError(!validation.isValid);
            setHelperText(validation.message);

            // Use attributes?.separator, default to ';'
            const separator = attributes?.separator ?? ';';

            if (newValue && onChange) {
                const data = MuiAttributes.multiple ? newValue.map(extractValue) : extractValue(newValue);

                const customValue = MuiAttributes.multiple
                    ? data.join(separator)
                    : data;

                onChange({
                    id,
                    value: customValue,
                    option: newValue,
                });
            } else if (onChange) {
                onChange({
                    id,
                    value: '',
                    option: newValue,
                });
            }
        },
        [
            id,
            onChange,
            attributes?.separator,
            MuiAttributes.multiple,
            extractValue,
            rules.validation // Added dependency
        ],
    );

    const isMandatory = rules?.validation?.some((v: any) => v.rule === 'mandatory') || false;

    return (
        <Autocomplete
            disablePortal={false}
            {...getMuiAttributes()}
            options={options}
            value={value}
            onChange={onChangeEvent}
            onBlur={() => {
                const validation = validate(value);
                setError(!validation.isValid);
                setHelperText(validation.message);
            }}
            PopperProps={{
                modifiers: [
                    {
                        name: 'preventOverflow',
                        options: {
                            boundary: 'window',
                        },
                    },
                ],
            }}
            renderInput={(params) => {
                // Ensure custom adornments are incorporated without overriding other essential props
                const customInputProps = getInputProps(InputProps);
                const mergedInputProps = {
                    ...params.InputProps,
                    ...customInputProps,
                    startAdornment: (
                        <>
                            {customInputProps?.startAdornment}
                            {params.InputProps.startAdornment}
                        </>
                    ),
                    endAdornment: (
                        <>
                            {customInputProps?.endAdornment}
                            {params.InputProps.endAdornment}
                        </>
                    ),
                };

                return (
                    <TextField
                        {...params}
                        {...MuiBoxAttributes}
                        required={isMandatory}
                        error={error}
                        helperText={helperText}
                        slotProps={{
                            input: {
                                ...mergedInputProps,
                                autoComplete: 'new-password',
                            },
                        }}
                    />
                );
            }}
        />
    );
}
