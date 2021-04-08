"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateLayout = generateLayout;
exports.getInputProps = getInputProps;
exports.default = exports.generateKey = void 0;

var _lodash = require("lodash");

var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function generateLayout(data) {
  var layout = {
    wrows: [],
    worows: []
  }; // All Items

  var wrows = (0, _lodash.clone)(data); // Remove Without Rows

  layout.worows = (0, _lodash.remove)(wrows, function (item) {
    var isLayout = item.layout ? item.layout.row : item.layout;
    return isLayout === undefined;
  }); // Concat all items without rows
  // All row indices

  var rowIndex = (0, _lodash.map)(wrows, 'layout.row');
  var uniqIndex = (0, _lodash.uniq)(rowIndex);
  var sortedIndex = (0, _lodash.sortBy)(uniqIndex);
  (0, _lodash.each)(sortedIndex, function (value) {
    var rows = [];
    (0, _lodash.each)(wrows, function (item) {
      if (item.layout) {
        if (item.layout.row === value) {
          rows.push(item);
        }
      }
    });
    layout.wrows.push(rows);
  });
  return layout;
}

function getInputProps(library, InputProps) {
  if (!(0, _isEmpty.default)(InputProps)) {
    var _InputProps$MuiInputA = InputProps.MuiInputAdornment,
        MuiInputAdornment = _InputProps$MuiInputA === void 0 ? {} : _InputProps$MuiInputA,
        _InputProps$position = InputProps.position,
        position = _InputProps$position === void 0 ? 'start' : _InputProps$position,
        icon = InputProps.icon,
        text = InputProps.text,
        _InputProps$textstyle = InputProps.textstyle,
        textstyle = _InputProps$textstyle === void 0 ? {} : _InputProps$textstyle;
    var InputAdornment = library.InputAdornment,
        Icon = library.Icon;
    var INPUTADORMENT = InputAdornment;
    var ICON = Icon;
    return _defineProperty({}, "".concat(position, "Adornment"), /*#__PURE__*/React.createElement(INPUTADORMENT, MuiInputAdornment, icon && /*#__PURE__*/React.createElement(ICON, null, icon), !(0, _isEmpty.default)(textstyle) ? /*#__PURE__*/React.createElement("div", {
      style: textstyle
    }, text || '') : text || ''));
  }

  return {};
}

var generateKey = function generateKey() {
  var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var random = Math.random().toString(36).substr(2, 9);
  var currentTime = new Date().toLocaleTimeString('en').trim();
  return "".concat(prefix, "_").concat(index, "_").concat(random, "_").concat(currentTime);
};

exports.generateKey = generateKey;
var _default = {
  generateLayout: generateLayout,
  getInputProps: getInputProps,
  generateKey: generateKey
};
exports.default = _default;