/* eslint-disable default-param-last,react/jsx-no-duplicate-props */
import React, { useCallback } from 'react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import PropTypes from 'prop-types';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { checkboxSX, getInputProps } from '../../../util/helper';
// import useUpdateEffect from '../../../util/useUpdateEffect';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const getValue = (options = [], defaultValue = '') =>
  options.find(({ value }) => defaultValue === value);

export default function Select({ attributes, onChange }) {
  const {
    MuiAttributes = {},
    options = [],
    MuiBoxAttributes = {},
    id = '',
    InputProps = {},
  } = attributes;
  const [value, setValue] = React.useState(
    attributes?.value && getValue(options, attributes?.value),
  );
  // const [inputValue, setInputValue] = React.useState('');
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

  // useUpdateEffect(() => {
  //   const newValue = MuiAttributes.multiple
  //     ? (value || []).map((option) => option.title || option.label || option.value)
  //     : inputValue;
  //   onChange({ id, value: newValue, option: value });
  // }, [value, inputValue]);

  // const onInputChange = useCallback((event, newInputValue) => {
  //   setInputValue(newInputValue);
  // }, []);

  const onChangeEvent = useCallback((event, newValue) => {
    setValue(newValue);
    if (newValue) {
      const data = MuiAttributes.multiple
        ? (newValue || []).map((option) => option?.title || option?.label || option?.value)
        : newValue?.title || newValue?.label || newValue?.value;
      onChange({ id, value: data, option: newValue });
    } else onChange({ id, value: '', options: newValue });
  }, []);

  return (
    <Autocomplete
      {...getMuiAttributes()}
      disablePortal
      options={options}
      value={value}
      onChange={onChangeEvent}
      // inputValue={inputValue}
      // onInputChange={onInputChange}
      renderInput={(params) => (
        <TextField
          {...params}
          {...MuiBoxAttributes}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password',
          }}
          InputProps={{ ...params.InputProps, ...getInputProps(InputProps) }}
        />
      )}
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
