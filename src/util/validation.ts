import validator from 'validator';
import numeral from 'numeral';

type ValidationFunction = (value: string, ...args: any[]) => boolean;

interface ValidationUtils {
    [key: string]: ValidationFunction;
}

const RawValidation: ValidationUtils = {
    email(value: string, options?: validator.IsEmailOptions) {
        return validator.isEmail(value, options);
    },
    equals(value: string, comparison: string) {
        return validator.equals(value, comparison);
    },
    mandatory(value: string) {
        // Coerce non-strings (e.g. boolean false / numbers) so validator.isEmpty
        // never throws, and treat whitespace-only as empty.
        const str = value == null ? '' : String(value);
        return !validator.isEmpty(str, { ignore_whitespace: true });
    },
    mandatoryselect(value: string) {
        // Guard null/undefined and non-array/string values instead of throwing.
        return (value?.length ?? 0) > 0;
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
        // Non-numeric input is invalid (previously `null || 0` let junk pass as valid).
        const n = numeral(value).value();
        return n != null && n > -1;
    },
};

// validator.js internally `assertString(value)`s and THROWS on any non-string
// input (a number, boolean, null, undefined). A control can validate a
// schema-provided numeric/boolean value, so coerce the value to a string for
// every validator.js-backed rule, and wrap each in a safety net so a validator
// can never throw out into React's render/effect path. The rules below manage
// their own (non-string) inputs, so they pass through untouched.
const SELF_HANDLED = new Set(['mandatory', 'mandatoryselect', 'negative']);
const toStr = (v: any): string => (v == null ? '' : typeof v === 'string' ? v : String(v));

const Validation: ValidationUtils = Object.fromEntries(
    Object.entries(RawValidation).map(([key, fn]) => {
        if (SELF_HANDLED.has(key)) return [key, fn];
        return [key, (value: any, ...args: any[]) => {
            try {
                return fn(toStr(value), ...args);
            } catch {
                return false; // never throw out of a validator
            }
        }];
    }),
);

export default Validation;
