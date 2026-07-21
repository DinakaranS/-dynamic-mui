/**
 * MUI X tier configuration. dynamic-mui uses the free **Community** MUI X
 * components by default (charts, data grid, date pickers). If your app uses MUI X
 * **Pro** or **Premium**, inject those components here once at startup and the
 * matching controls will render them (so you get pro/premium features and avoid
 * mixing tiers). Anything you don't override falls back to Community.
 *
 * ```ts
 * import { DataGridPremium } from '@mui/x-data-grid-premium';
 * import { BarChartPro } from '@mui/x-charts-pro';
 * import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
 * import { configureMuiX } from 'dynamic-mui';
 *
 * configureMuiX({
 *   DataGrid: DataGridPremium,   // datatable control uses Premium grid
 *   BarChart: BarChartPro,       // bar chart uses Pro chart
 *   // DatePicker / DateTimePicker / TimePicker / LocalizationProvider / dateAdapter …
 * });
 * ```
 */
export interface MuiXOverrides {
    // Data grid — Community `DataGrid` | `DataGridPro` | `DataGridPremium`
    DataGrid?: any;
    // Charts — Community or the `*Pro` variants
    BarChart?: any;
    LineChart?: any;
    PieChart?: any;
    ScatterChart?: any;
    // Pickers — Community or `*Pro`; keyed by the picker `name` the control resolves
    DatePicker?: any;
    DesktopDatePicker?: any;
    MobileDatePicker?: any;
    DateTimePicker?: any;
    DesktopDateTimePicker?: any;
    MobileDateTimePicker?: any;
    TimePicker?: any;
    DesktopTimePicker?: any;
    MobileTimePicker?: any;
    // Localization + adapter (e.g. a Pro `LocalizationProvider`, or `AdapterDateFns`)
    LocalizationProvider?: any;
    dateAdapter?: any;
    [name: string]: any;
}

const registry: MuiXOverrides = {};

/** Register your MUI X tier / adapter overrides (merges with any previous call). */
export function configureMuiX(overrides: MuiXOverrides): void {
    if (overrides && typeof overrides === 'object') Object.assign(registry, overrides);
}

/** Resolve an override component/adapter by name (undefined → use the default). */
export function getMuiX(name: keyof MuiXOverrides | string): any {
    return registry[name as string];
}

/** Clear all overrides (mainly for tests). */
export function resetMuiX(): void {
    Object.keys(registry).forEach((k) => delete registry[k]);
}
