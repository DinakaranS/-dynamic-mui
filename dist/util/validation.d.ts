type ValidationFunction = (value: string, ...args: any[]) => boolean;
interface ValidationUtils {
    [key: string]: ValidationFunction;
}
declare const Validation: ValidationUtils;
export default Validation;
