import React from 'react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import PropTypes from 'prop-types';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { checkboxSX } from '../../../util/helper';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function Select({ attributes, onChange }) {
  const { MuiAttributes = {}, options = [], MuiBoxAttributes = {}, id = '' } = attributes;
  const [value, setValue] = React.useState();
  const [inputValue, setInputValue] = React.useState('');

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

  React.useEffect(() => {
    onChange({ id, value, inputValue });
  }, [value, inputValue]);

  return (
    <Autocomplete
      {...getMuiAttributes()}
      disablePortal
      options={options}
      value={value}
      onChange={(event, newValue) => {
        setValue(newValue);
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          {...MuiBoxAttributes}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password',
          }}
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
