"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Typography;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Typography Component */
function Typography(props) {
  var library = props.library,
      component = props.component,
      attributes = props.attributes;
  var TYPOGRAPHY = library[component];
  var _attributes$MuiAttrib = attributes.MuiAttributes,
      MuiAttributes = _attributes$MuiAttrib === void 0 ? {} : _attributes$MuiAttrib,
      _attributes$text = attributes.text,
      text = _attributes$text === void 0 ? '' : _attributes$text;
  return /*#__PURE__*/_react.default.createElement(TYPOGRAPHY, MuiAttributes, text);
}

Typography.propTypes = process.env.NODE_ENV !== "production" ? {
  /** Attributes for Typography */
  attributes: _propTypes.default.objectOf(_propTypes.default.object),

  /** Library to be used */
  library: _propTypes.default.objectOf(_propTypes.default.object),

  /** Component name */
  component: _propTypes.default.string.isRequired
} : {};
Typography.defaultProps = {
  attributes: {},
  library: {}
};