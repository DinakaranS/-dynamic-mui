"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = TextField;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _numeral = _interopRequireDefault(require("numeral"));

var _helper = require("../../../util/helper");

var _validation = _interopRequireDefault(require("../../../util/validation"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

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
function TextField(props) {
  var library = props.library,
      component = props.component,
      attributes = props.attributes,
      _props$rules = props.rules,
      rules = _props$rules === void 0 ? {} : _props$rules;
  var TEXTFIELD = library[component];
  var _attributes$MuiAttrib = attributes.MuiAttributes,
      MuiAttributes = _attributes$MuiAttrib === void 0 ? {} : _attributes$MuiAttrib,
      _attributes$InputProp = attributes.InputProps,
      InputProps = _attributes$InputProp === void 0 ? {} : _attributes$InputProp,
      _attributes$format = attributes.format,
      format = _attributes$format === void 0 ? '' : _attributes$format;

  var _React$useState = _react.default.useState({
    value: attributes.value || '',
    helperText: MuiAttributes.helperText || '',
    error: false
  }),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      textData = _React$useState2[0],
      setTextData = _React$useState2[1];

  var getValue = function getValue(v) {
    return format ? (0, _numeral.default)(v).format(format) : v;
  };

  var validate = function validate(value) {
    var isValid = false;
    var validation = rules.validation;

    if (validation) {
      for (var i = 0; i < validation.length; i += 1) {
        var data = validation[i];
        isValid = _validation.default[data.rule](value, data.value);

        if (!isValid) {
          return {
            isValid: false,
            message: data.message
          };
        }
      }
    }

    return {
      isValid: true,
      message: ''
    };
  };

  var handleOnChange = function handleOnChange() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var value = args[0].target.value; // const formatValue = value ? getValue(value) : '';

    var validator = validate(value);
    setTextData({
      value: value,
      helperText: validator.message,
      error: !validator.isValid
    });
  };

  var handleOnBlur = function handleOnBlur() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var value = args[0].target.value;
    var formatValue = getValue(value);
    var validator = validate(formatValue);
    setTextData({
      value: formatValue,
      helperText: validator.message,
      error: !validator.isValid
    });
  };

  var handleOnFocus = function handleOnFocus() {// const { value } = args[0].target;
    // const formatValue = getValue(value);
    // const validator = validate(formatValue);
    // setTextData({
    //   value: formatValue,
    //   helperText: validator.message,
    // });
  };

  return /*#__PURE__*/_react.default.createElement(TEXTFIELD, _extends({}, MuiAttributes, {
    InputProps: (0, _helper.getInputProps)(library, InputProps),
    onChange: handleOnChange,
    onBlur: handleOnBlur,
    onFocus: handleOnFocus,
    value: textData.value,
    error: textData.error,
    helperText: textData.helperText
  }));
}

TextField.propTypes = process.env.NODE_ENV !== "production" ? {
  /** Attributes for TextField */
  attributes: _propTypes.default.objectOf(_propTypes.default.object),

  /** Library to be used */
  library: _propTypes.default.objectOf(_propTypes.default.object),

  /** Component name */
  component: _propTypes.default.string.isRequired,

  /** Rules to be used */
  rules: _propTypes.default.objectOf(_propTypes.default.array)
} : {};
TextField.defaultProps = {
  attributes: {},
  library: {},
  rules: {}
};