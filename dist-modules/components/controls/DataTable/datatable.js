"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = DataTable;

var React = _interopRequireWildcard(require("react"));

var _dataGrid = require("@material-ui/data-grid");

var _propTypes = _interopRequireDefault(require("prop-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function DataTable(props) {
  var attributes = props.attributes;
  var _attributes$MuiAttrib = attributes.MuiAttributes,
      MuiAttributes = _attributes$MuiAttrib === void 0 ? {} : _attributes$MuiAttrib,
      _attributes$container = attributes.container,
      container = _attributes$container === void 0 ? {} : _attributes$container;
  return /*#__PURE__*/React.createElement("div", container, /*#__PURE__*/React.createElement(_dataGrid.DataGrid, MuiAttributes));
}

DataTable.propTypes = process.env.NODE_ENV !== "production" ? {
  /** Attributes for TextField */
  attributes: _propTypes.default.objectOf(_propTypes.default.object)
} : {};
DataTable.defaultProps = {
  attributes: {}
};