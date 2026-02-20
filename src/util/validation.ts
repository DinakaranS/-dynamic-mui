import validator from 'validator';
import numeral from 'numeral';

type ValidationFunction = (value: string, ...args: any[]) => boolean;

interface ValidationUtils {
    [key: string]: ValidationFunction;
}

const Validation: ValidationUtils = {
    email(value: string, options?: validator.IsEmailOptions) {
        return validator.isEmail(value, options);
    },
    equals(value: string, comparison: string) {
        return validator.equals(value, comparison);
    },
    mandatory(value: string) {
        return !validator.isEmpty(value);
    },
    mandatoryselect(value: string) {
        return value.length > 0;
    },
    mobile(value: string, locale?: validator.MobilePhoneLocale) {
        return validator.isMobilePhone(value, locale);
    },
    lowercase(value: string) {
        return validator.isLowercase(value);
    },
    uppercase(value: string) {
        return validator.isUppercase(value);
    },
    length(value: string, options?: validator.IsLengthOptions) {
        return validator.isLength(value, options);
    },
    url(value: string, options?: validator.IsURLOptions) {
        return validator.isURL(value, options);
    },
    creditcard(value: string) {
        return validator.isCreditCard(value);
    },
    currency(value: string, options?: validator.IsCurrencyOptions) {
        return validator.isCurrency(value, options);
    },
    date(value: string) {
        return validator.isDate(value);
    },
    boolean(value: string) {
        return validator.isBoolean(value);
    },
    alphanumeric(value: string, locale?: validator.AlphanumericLocale) {
        return validator.isAlphanumeric(value, locale);
    },
    contains(value: string, seed: string) {
        return validator.contains(value, seed);
    },
    FQDN(value: string, options?: validator.IsFQDNOptions) {
        return validator.isFQDN(value, options);
    },
    float(value: string, options?: validator.IsFloatOptions) {
        return validator.isFloat(value, options);
    },
    ip(value: string, version?: 4 | 6) {
        return validator.isIP(value, version);
    },
    ISBN(value: string, version?: 10 | 13) {
        return validator.isISBN(value, version as any);
    },
    MACAddress(value: string) {
        return validator.isMACAddress(value);
    },
    MD5(value: string) {
        return validator.isMD5(value);
    },
    numeric(value: string) {
        return validator.isNumeric(value);
    },
    UUID(value: string, version?: 3 | 4 | 5 | '3' | '4' | '5' | 'all') {
        return validator.isUUID(value, version);
    },
    matches(value: string, pattern: RegExp | string) {
        return validator.matches(value, pattern);
    },
    int(value: string, options?: validator.IsIntOptions) {
        return validator.isInt(value, options);
    },
    hexcolor(value: string) {
        return validator.isHexColor(value);
    },
    dataURI(value: string) {
        return validator.isDataURI(value);
    },
    decimal(value: string) {
        return validator.isDecimal(value);
    },
    alpha(value: string, locale?: validator.AlphaLocale) {
        return validator.isAlpha(value, locale);
    },
    negative(value: string) {
        return (numeral(value).value() || 0) > -1;
    },
};

export default Validation;
