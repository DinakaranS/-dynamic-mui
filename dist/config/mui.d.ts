export interface ComponentConfig {
    type: string;
    map: string;
    options?: Record<string, any>;
}
export type MuiConfigMap = Record<string, ComponentConfig>;
declare const mui: MuiConfigMap;
export default mui;
