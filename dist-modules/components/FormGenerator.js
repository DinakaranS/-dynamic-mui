"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.FormGenerator = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _Grid = _interopRequireDefault(require("@material-ui/core/Grid"));

var _mui = _interopRequireDefault(require("../config/mui"));

var _DynamicComponent = _interopRequireDefault(require("./DynamicComponent"));

var _helper = require("../util/helper");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var LIBMap = {
  MUI: {
    map: _mui.default
  }
};
/** FormGenerator */

var FormGenerator = function FormGenerator(props) {
  var library = props.library,
      _props$data = props.data,
      data = _props$data === void 0 ? {} : _props$data;
  var config = LIBMap.MUI;
  var dataObj = JSON.parse(JSON.stringify(data));
  var layout = (0, _helper.generateLayout)(JSON.parse(JSON.stringify(dataObj)));
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, layout.wrows.map(function (row, i) {
    return /*#__PURE__*/_react.default.createElement(_Grid.default, {
      key: (0, _helper.generateKey)('layout-grid', i),
      container: true,
      spacing: 2
    }, row.map(function (field, index) {
      var _field$type = field.type,
          type = _field$type === void 0 ? '' : _field$type,
          _field$style = field.style,
          style = _field$style === void 0 ? {} : _field$style,
          _field$className = field.className,
          className = _field$className === void 0 ? '' : _field$className,
          _field$visible = field.visible,
          visible = _field$visible === void 0 ? false : _field$visible,
          _field$rules = field.rules,
          rules = _field$rules === void 0 ? {} : _field$rules;
      var cProps = field.props || {};
      var cLayout = field.layout || {};
      var configObj = config.map[type] || {};
      return /*#__PURE__*/_react.default.createElement(_Grid.default, _extends({
        key: (0, _helper.generateKey)('layout-comp', index),
        item: true,
        style: style
      }, cLayout, {
        className: "".concat(className, " ").concat(visible === false ? 'hidden' : 'show')
      }), /*#__PURE__*/_react.default.createElement(_DynamicComponent.default, {
        component: configObj.type,
        map: configObj.map,
        option: configObj.options ? configObj.options.type : '',
        control: field,
        library: library,
        attributes: cProps,
        rules: rules
      }));
    }));
  }), layout.worows.map(function (field, index) {
    var _field$type2 = field.type,
        type = _field$type2 === void 0 ? '' : _field$type2,
        _field$style2 = field.style,
        style = _field$style2 === void 0 ? {} : _field$style2,
        _field$className2 = field.className,
        className = _field$className2 === void 0 ? '' : _field$className2,
        _field$visible2 = field.visible,
        visible = _field$visible2 === void 0 ? false : _field$visible2,
        _field$rules2 = field.rules,
        rules = _field$rules2 === void 0 ? {} : _field$rules2;
    var configObj = config.map[type] || {};
    var cProps = field.props;
    return /*#__PURE__*/_react.default.createElement("div", {
      key: (0, _helper.generateKey)('layout-comp', index),
      style: style,
      className: "".concat(className, " ").concat(visible === false ? 'hidden' : 'show')
    }, /*#__PURE__*/_react.default.createElement(_DynamicComponent.default, {
      component: configObj.type,
      map: configObj.map,
      option: configObj.options ? configObj.options.type : '',
      control: field,
      library: library,
      attributes: cProps,
      rules: rules
    }));
  }));
};

exports.FormGenerator = FormGenerator;
FormGenerator.propTypes = process.env.NODE_ENV !== "production" ? {
  /** Library to be used */
  library: _propTypes.default.objectOf(_propTypes.default.object).isRequired,

  /** Component name */
  guid: _propTypes.default.string.isRequired,

  /** Component json data */
  data: _propTypes.default.arrayOf(_propTypes.default.object).isRequired
} : {}; // eslint-disable-next-line import/no-anonymous-default-export

var _default = {
  FormGenerator: FormGenerator
};
exports.default = _default;