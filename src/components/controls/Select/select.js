/* eslint-disable default-param-last,react/jsx-no-duplicate-props */
import React, { useCallback } from 'react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import PropTypes from 'prop-types';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { checkboxSX, getInputProps } from '../../../util/helper';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const getValue = (options = [], defaultValue = '', isMultiple = false) => {
  if (isMultiple) {
    let separator = ',';
    if (defaultValue?.includes(',')) separator = ',';
    else if (defaultValue?.includes(';')) separator = ';';
    const dValueSet = new Set(defaultValue?.split(separator));
    return options?.filter(({ value }) => dValueSet?.has(value));
  }

  return options.find(({ value }) => value === defaultValue);
};

export default function Select({ attributes, onChange }) {
  const {
    MuiAttributes = {},
    options = [],
    MuiBoxAttributes = {},
    id = '',
    InputProps = {},
  } = attributes;
  const [value, setValue] = React.useState(
    attributes?.value && getValue(options, attributes?.value, MuiAttributes.multiple),
  );
  const getMuiAttributes = () => {
    if (MuiAttributes.multiple) {
      MuiAttributes.renderOption = (props, option = {}, { selected }) => (
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

  const extractValue = (option) => option?.value || option?.title || option?.label;

  const onChangeEvent = useCallback((event, newValue) => {
    setValue(newValue);
    if (newValue) {
      const data = MuiAttributes.multiple ? newValue.map(extractValue) : extractValue(newValue);
      onChange({ id, value: MuiAttributes.multiple ? data.toString() : data, option: newValue });
    } else onChange({ id, value: '', option: newValue });
  }, []);

  return (
    <Autocomplete
      disablePortal={false}
      {...getMuiAttributes()}
      options={options}
      value={value}
      onChange={onChangeEvent}
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
              {params.InputProps.startAdornment} {/* Render existing adornments such as tags */}
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

Select.propTypes = {
  /** Attributes for Select */
  attributes: PropTypes.objectOf(PropTypes.object),
  /** Function */
  onChange: PropTypes.func,
};

Select.defaultProps = {
  attributes: {},
  onChange: null,
};
