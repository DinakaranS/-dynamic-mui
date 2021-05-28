import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/core/Autocomplete';
import PropTypes from 'prop-types';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { checkboxSX } from '../../../util/helper';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function Select({ attributes }) {
  const { MuiAttributes = {}, options = [], MuiBoxAttributes = {} } = attributes;
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
};

Select.defaultProps = {
  attributes: {},
};
