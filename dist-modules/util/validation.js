"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _validator = _interopRequireDefault(require("validator"));

var _numeral = _interopRequireDefault(require("numeral"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Validation = {
  email: function email(value, options) {
    return _validator.default.isEmail(value, options);
  },
  equals: function equals(value, comparison) {
    return _validator.default.equals(value, comparison);
  },
  mandatory: function mandatory(value) {
    return !_validator.default.isEmpty(value);
  },
  mandatoryselect: function mandatoryselect(value) {
    return value.length > 0;
  },
  mobile: function mobile(value, locale) {
    return _validator.default.isMobilePhone(value, locale);
  },
  lowercase: function lowercase(value) {
    return _validator.default.isLowercase(value);
  },
  uppercase: function uppercase(value) {
    return _validator.default.isUppercase(value);
  },
  length: function length(value, options) {
    return _validator.default.isLength(value, options);
  },
  url: function url(value, options) {
    return _validator.default.isURL(value, options);
  },
  creditcard: function creditcard(value) {
    return _validator.default.isCreditCard(value);
  },
  currency: function currency(value, options) {
    return _validator.default.isCurrency(value, options);
  },
  date: function date(value) {
    return _validator.default.isDate(value);
  },
  boolean: function boolean(value) {
    return _validator.default.isBoolean(value);
  },
  alphanumeric: function alphanumeric(value, locale) {
    _validator.default.isAlphanumeric(value, locale);
  },
  contains: function contains(value, seed) {
    return _validator.default.contains(value, seed);
  },
  FQDN: function FQDN(value, options) {
    return _validator.default.isFQDN(value, options);
  },
  float: function float(value, options) {
    return _validator.default.isFloat(value, options);
  },
  ip: function ip(value, version) {
    return _validator.default.isIP(value, version);
  },
  ISBN: function ISBN(value, version) {
    return _validator.default.isISBN(value, version);
  },
  MACAddress: function MACAddress(value) {
    return _validator.default.isMACAddress(value);
  },
  MD5: function MD5(value) {
    return _validator.default.isMD5(value);
  },
  numeric: function numeric(value) {
    return _validator.default.isNumeric(value);
  },
  UUID: function UUID(value, version) {
    return _validator.default.isUUID(value, version);
  },
  matches: function matches(value, pattern) {
    return _validator.default.matches(value, pattern);
  },
  int: function int(value, options) {
    return _validator.default.isInt(value, options);
  },
  hexcolor: function hexcolor(value) {
    return _validator.default.isHexColor(value);
  },
  dataURI: function dataURI(value) {
    return _validator.default.isDataURI(value);
  },
  decimal: function decimal(value) {
    return _validator.default.isDecimal(value);
  },
  alpha: function alpha(value, locale) {
    return _validator.default.isAlpha(value, locale);
  },
  negative: function negative(value) {
    return (0, _numeral.default)(value).value() > -1;
  }
};
var _default = Validation;
exports.default = _default;