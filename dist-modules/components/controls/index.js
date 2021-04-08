"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _typography = _interopRequireDefault(require("./Typography/typography"));

var _textfield = _interopRequireDefault(require("./TextField/textfield"));

var _datatable = _interopRequireDefault(require("./DataTable/datatable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Controls = {
  Typography: _typography.default,
  TextField: _textfield.default,
  Table: _datatable.default
};
var _default = Controls;
exports.default = _default;