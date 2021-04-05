import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
// import NumberFormat from 'react-number-format';
import { getInputProps } from '../../../util/helper';
import Validation from '../../../util/validation';

// const NumberFormatCustom = React.forwardRef((props, ref) => {
//   const { onChange, NumberAttributes, ...other } = props;
//   return (
//     <NumberFormat
//       {...other}
//       getInputRef={ref}
//       onValueChange={(values) => {
//         onChange({
//           target: {
//             name: props.name,
//             value: values.value,
//           },
//         });
//       }}
//       {...NumberAttributes}
//     />
//   );
// });
//
// NumberFormatCustom.propTypes = {
//   name: PropTypes.string.isRequired,
//   onChange: PropTypes.func.isRequired,
//   NumberAttributes: PropTypes.objectOf(PropTypes.object),
// };
//
// NumberFormatCustom.defaultProps = {
//   NumberAttributes: {},
// };

export default function TextField(props) {
  const { library, component, attributes, rules = {} } = props;
  const TEXTFIELD = library[component];
  const { MuiAttributes = {}, InputProps = {}, format = '' } = attributes;

  const [textData, setTextData] = React.useState({
    value: attributes.value || '',
    helperText: MuiAttributes.helperText || '',
    error: false,
  });

  const getValue = (v) => (format ? numeral(v).format(format) : v);

  const validate = (value) => {
    let isValid = false;
    const { validation } = rules;
    if (validation) {
      for (let i = 0; i < validation.length; i += 1) {
        const data = validation[i];
        isValid = Validation[data.rule](value, data.value);
        if (!isValid) {
          return {
            isValid: false,
            message: data.message,
          };
        }
      }
    }
    return {
      isValid: true,
      message: '',
    };
  };

  const handleOnChange = (...args) => {
    const { value } = args[0].target;
    // const formatValue = value ? getValue(value) : '';
    const validator = validate(value);
    setTextData({
      value,
      helperText: validator.message,
      error: !validator.isValid,
    });
  };

  const handleOnBlur = (...args) => {
    const { value } = args[0].target;
    const formatValue = getValue(value);
    const validator = validate(formatValue);
    setTextData({
      value: formatValue,
      helperText: validator.message,
      error: !validator.isValid,
    });
  };

  const handleOnFocus = () => {
    // const { value } = args[0].target;
    // const formatValue = getValue(value);
    // const validator = validate(formatValue);
    // setTextData({
    //   value: formatValue,
    //   helperText: validator.message,
    // });
  };
  return (
    <TEXTFIELD
      {...MuiAttributes}
      InputProps={getInputProps(library, InputProps)}
      onChange={handleOnChange}
      onBlur={handleOnBlur}
      onFocus={handleOnFocus}
      value={textData.value}
      error={textData.error}
      helperText={textData.helperText}
    />
  );
}

TextField.propTypes = {
  /** Attributes for TextField */
  attributes: PropTypes.objectOf(PropTypes.object),
  /** Library to be used */
  library: PropTypes.objectOf(PropTypes.object),
  /** Component name */
  component: PropTypes.string.isRequired,
  /** Rules to be used */
  rules: PropTypes.objectOf(PropTypes.array),
};
TextField.defaultProps = {
  attributes: {},
  library: {},
  rules: {},
};
