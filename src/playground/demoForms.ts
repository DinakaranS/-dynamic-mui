import { DemoRecipe } from './demoRecipes';

const hdr = (text: string): any => ({ type: 'typography', props: { text, MuiAttributes: { variant: 'subtitle1', sx: { fontWeight: 700 } } }, layout: { row: 0, xs: 12 } });
const req = [{ rule: 'mandatory', message: 'Required' }];

/**
 * Date/time pickers always float their label on top (they carry a format
 * placeholder), while plain text/select/number fields keep the label inside
 * the box until filled — so a picker next to a text field looks misaligned.
 * This normalizer pins every input-like field to a "label on top" style so
 * the date field mingles with the rest of the row.
 */
const topLabel = (field: any): any => {
    const f = { ...field, props: { ...field.props } };
    if (['textfield', 'numberfield', 'computed'].includes(f.type)) {
        f.props.MuiAttributes = { ...(f.props.MuiAttributes || {}), InputLabelProps: { shrink: true } };
    } else if (f.type === 'select') {
        f.props.MuiBoxAttributes = { ...(f.props.MuiBoxAttributes || {}), InputLabelProps: { shrink: true } };
    } else if (f.type === 'datetime') {
        // Keep the real MUI X date picker; just pin its label on top like the rest.
        // The picker's outlined look is matched to the text fields in premiumInputSx.
        const mui = f.props.MuiAttributes || {};
        f.props.MuiAttributes = {
            ...mui,
            slotProps: { ...(mui.slotProps || {}), textField: { ...((mui.slotProps || {}).textField || {}), InputLabelProps: { shrink: true } } },
        };
    }
    if (Array.isArray(f.subforms)) {
        f.subforms = f.subforms.map((sf: any) => ({ ...sf, data: (sf.data || []).map(topLabel) }));
    }
    return f;
};

/**
 * Complete, real-world water-utility field forms — showing how labels, text,
 * selects, multi-selects (chips), checkboxes/switches, live formulas, conditional
 * fields and subforms combine into an actual form a crew would fill out.
 */
const RAW_FORMS: DemoRecipe[] = [
    {
        id: 'valve-exercise',
        title: 'Valve Exercise Report',
        description: 'Field crew exercises a distribution valve. Uses selects, a completion % formula, a switch, and a subform that appears only when the valve needs repair.',
        icon: 'settings_input_component',
        data: [
            hdr('Valve Exercise Report'),
            { type: 'textfield', props: { id: 'workOrder', MuiAttributes: { label: 'Work Order #' } }, rules: { validation: req }, layout: { row: 1, xs: 6 } },
            { type: 'datetime', props: { id: 'date', MuiAttributes: { label: 'Date', fullWidth: true } }, layout: { row: 1, xs: 6 } },
            { type: 'textfield', props: { id: 'technician', MuiAttributes: { label: 'Technician / crew' } }, layout: { row: 2, xs: 6 } },
            { type: 'textfield', props: { id: 'valveId', MuiAttributes: { label: 'Valve ID' } }, rules: { validation: req }, layout: { row: 2, xs: 6 } },
            { type: 'textfield', props: { id: 'location', MuiAttributes: { label: 'Location / cross street' } }, layout: { row: 3, xs: 12 } },
            { type: 'select', props: { id: 'valveType', options: [{ value: 'gate', label: 'Gate' }, { value: 'butterfly', label: 'Butterfly' }, { value: 'ball', label: 'Ball' }, { value: 'check', label: 'Check' }], MuiBoxAttributes: { label: 'Valve type' } }, layout: { row: 4, xs: 4 } },
            { type: 'select', props: { id: 'valveSize', options: [{ value: '4', label: '4"' }, { value: '6', label: '6"' }, { value: '8', label: '8"' }, { value: '12', label: '12"' }, { value: '16', label: '16"' }], MuiBoxAttributes: { label: 'Size' } }, layout: { row: 4, xs: 4 } },
            { type: 'select', props: { id: 'openDir', options: [{ value: 'left', label: 'Open Left (CCW)' }, { value: 'right', label: 'Open Right (CW)' }], MuiBoxAttributes: { label: 'Open direction' } }, layout: { row: 4, xs: 4 } },
            { type: 'numberfield', props: { id: 'turnsRequired', value: 24, MuiAttributes: { label: 'Turns to close' } }, layout: { row: 5, xs: 4 } },
            { type: 'numberfield', props: { id: 'turnsMade', value: 24, MuiAttributes: { label: 'Turns made' } }, layout: { row: 5, xs: 4 } },
            { type: 'computed', props: { id: 'completion', suffix: ' %', format: '0', MuiAttributes: { label: 'Completion' } }, formula: 'ROUND(turnsMade / turnsRequired * 100, 0)', layout: { row: 5, xs: 4 } },
            { type: 'switch', props: { id: 'operable', value: true, MuiFCLAttributes: { label: 'Valve fully operable' } }, layout: { row: 6, xs: 6 } },
            { type: 'checkbox', props: { id: 'markerVerified', MuiFCLAttributes: { label: 'Valve marker verified' } }, layout: { row: 6, xs: 6 } },
            {
                type: 'select',
                props: { id: 'condition', options: [{ value: 'good', label: 'Good' }, { value: 'fair', label: 'Fair' }, { value: 'poor', label: 'Poor' }, { value: 'repair', label: 'Needs repair' }], MuiBoxAttributes: { label: 'Overall condition' } },
                subforms: [{
                    conditionValue: 'repair',
                    data: [
                        { type: 'chipselect', props: { id: 'issues', label: 'Issues found', multiple: true, options: [{ value: 'leaking', label: 'Leaking' }, { value: 'stuck', label: 'Stuck' }, { value: 'stem', label: 'Broken stem' }, { value: 'buried', label: 'Buried' }, { value: 'corroded', label: 'Corroded' }] }, rules: { validation: [{ rule: 'mandatoryselect', message: 'Select at least one issue' }] }, layout: { row: 1, xs: 12 } },
                        { type: 'textfield', props: { id: 'repairNotes', MuiAttributes: { label: 'Repair details', multiline: true, minRows: 2 } }, layout: { row: 2, xs: 12 } },
                    ],
                }],
                layout: { row: 7, xs: 12 },
            },
            { type: 'textfield', props: { id: 'notes', MuiAttributes: { label: 'Notes', multiline: true, minRows: 2 } }, layout: { row: 8, xs: 12 } },
        ],
    },
    {
        id: 'hydrant-flushing',
        title: 'Hydrant Flushing Report',
        description: 'Unidirectional flushing log. Flow rate × duration computes total gallons live; issues are captured as multi-select chips.',
        icon: 'water_drop',
        data: [
            hdr('Hydrant Flushing Report'),
            { type: 'textfield', props: { id: 'workOrder', MuiAttributes: { label: 'Work Order #' } }, rules: { validation: req }, layout: { row: 1, xs: 6 } },
            { type: 'datetime', props: { id: 'date', MuiAttributes: { label: 'Date', fullWidth: true } }, layout: { row: 1, xs: 6 } },
            { type: 'textfield', props: { id: 'hydrantId', MuiAttributes: { label: 'Hydrant ID' } }, rules: { validation: req }, layout: { row: 2, xs: 6 } },
            { type: 'textfield', props: { id: 'location', MuiAttributes: { label: 'Location' } }, layout: { row: 2, xs: 6 } },
            { type: 'select', props: { id: 'flushType', options: [{ value: 'uni', label: 'Unidirectional' }, { value: 'conv', label: 'Conventional' }], MuiBoxAttributes: { label: 'Flushing type' } }, layout: { row: 3, xs: 6 } },
            { type: 'select', props: { id: 'clarity', options: [{ value: 'clear', label: 'Clear' }, { value: 'slight', label: 'Slightly cloudy' }, { value: 'rusty', label: 'Rusty' }, { value: 'dirty', label: 'Dirty' }], MuiBoxAttributes: { label: 'Water clarity (final)' } }, layout: { row: 3, xs: 6 } },
            { type: 'numberfield', props: { id: 'staticPsi', value: 62, MuiAttributes: { label: 'Static (psi)' } }, layout: { row: 4, xs: 3 } },
            { type: 'numberfield', props: { id: 'residualPsi', value: 48, MuiAttributes: { label: 'Residual (psi)' } }, layout: { row: 4, xs: 3 } },
            { type: 'numberfield', props: { id: 'flowRate', value: 750, MuiAttributes: { label: 'Flow (GPM)' } }, layout: { row: 4, xs: 3 } },
            { type: 'numberfield', props: { id: 'duration', value: 10, MuiAttributes: { label: 'Duration (min)' } }, layout: { row: 4, xs: 3 } },
            { type: 'computed', props: { id: 'gallons', suffix: ' gal', format: '0,0', MuiAttributes: { label: 'Total flushed' } }, formula: 'flowRate * duration', layout: { row: 5, xs: 6 } },
            { type: 'numberfield', props: { id: 'chlorine', value: 0.8, MuiAttributes: { label: 'Chlorine residual (ppm)' } }, layout: { row: 5, xs: 6 } },
            { type: 'chipselect', props: { id: 'issues', label: 'Issues found', multiple: true, options: [{ value: 'lowpsi', label: 'Low pressure' }, { value: 'leak', label: 'Leak' }, { value: 'cap', label: 'Damaged cap' }, { value: 'paint', label: 'Needs paint' }, { value: 'access', label: 'Access blocked' }] }, layout: { row: 6, xs: 12 } },
            { type: 'switch', props: { id: 'operable', value: true, MuiFCLAttributes: { label: 'Hydrant operable' } }, layout: { row: 7, xs: 12 } },
            { type: 'textfield', props: { id: 'notes', MuiAttributes: { label: 'Notes', multiline: true, minRows: 2 } }, layout: { row: 8, xs: 12 } },
        ],
    },
    {
        id: 'meter-maintenance',
        title: 'Meter Maintenance',
        description: 'Meter service record. Consumption = new − old reading (formula); a "meter replaced" toggle reveals the replacement fields (visibleWhen).',
        icon: 'speed',
        data: [
            hdr('Meter Maintenance'),
            { type: 'textfield', props: { id: 'workOrder', MuiAttributes: { label: 'Work Order #' } }, rules: { validation: req }, layout: { row: 1, xs: 6 } },
            { type: 'datetime', props: { id: 'date', MuiAttributes: { label: 'Date', fullWidth: true } }, layout: { row: 1, xs: 6 } },
            { type: 'textfield', props: { id: 'account', MuiAttributes: { label: 'Account #' } }, layout: { row: 2, xs: 6 } },
            { type: 'textfield', props: { id: 'meterId', MuiAttributes: { label: 'Meter ID' } }, rules: { validation: req }, layout: { row: 2, xs: 6 } },
            { type: 'textfield', props: { id: 'address', MuiAttributes: { label: 'Service address' } }, layout: { row: 3, xs: 12 } },
            { type: 'select', props: { id: 'meterSize', options: [{ value: '58', label: '5/8"' }, { value: '34', label: '3/4"' }, { value: '1', label: '1"' }, { value: '2', label: '2"' }], MuiBoxAttributes: { label: 'Size' } }, layout: { row: 4, xs: 4 } },
            { type: 'select', props: { id: 'meterType', options: [{ value: 'pd', label: 'Positive displacement' }, { value: 'turbine', label: 'Turbine' }, { value: 'compound', label: 'Compound' }, { value: 'ultrasonic', label: 'Ultrasonic' }], MuiBoxAttributes: { label: 'Type' } }, layout: { row: 4, xs: 8 } },
            { type: 'chipselect', props: { id: 'workDone', label: 'Work performed', multiple: true, options: [{ value: 'read', label: 'Read' }, { value: 'test', label: 'Test' }, { value: 'calibrate', label: 'Calibrate' }, { value: 'repair', label: 'Repair' }, { value: 'replace', label: 'Replace' }] }, rules: { validation: [{ rule: 'mandatoryselect', message: 'Select the work performed' }] }, layout: { row: 5, xs: 12 } },
            { type: 'numberfield', props: { id: 'readOld', value: 0, MuiAttributes: { label: 'Reading (old)' } }, layout: { row: 6, xs: 4 } },
            { type: 'numberfield', props: { id: 'readNew', value: 0, MuiAttributes: { label: 'Reading (new)' } }, layout: { row: 6, xs: 4 } },
            { type: 'computed', props: { id: 'consumption', format: '0,0', MuiAttributes: { label: 'Consumption' } }, formula: 'readNew - readOld', layout: { row: 6, xs: 4 } },
            { type: 'switch', props: { id: 'replaced', MuiFCLAttributes: { label: 'Meter replaced' } }, layout: { row: 7, xs: 12 } },
            { type: 'textfield', props: { id: 'newMeterId', MuiAttributes: { label: 'New meter ID' } }, visibleWhen: { field: 'replaced', op: 'eq', value: true }, requiredWhen: { field: 'replaced', op: 'eq', value: true }, requiredMessage: 'New meter ID required', layout: { row: 8, xs: 6 } },
            { type: 'numberfield', props: { id: 'newStart', MuiAttributes: { label: 'New start read' } }, visibleWhen: { field: 'replaced', op: 'eq', value: true }, layout: { row: 8, xs: 6 } },
            { type: 'switch', props: { id: 'leak', MuiFCLAttributes: { label: 'Leak detected' } }, layout: { row: 9, xs: 6 } },
            { type: 'textfield', props: { id: 'leakLocation', MuiAttributes: { label: 'Leak location' } }, visibleWhen: { field: 'leak', op: 'eq', value: true }, layout: { row: 9, xs: 6 } },
            { type: 'textfield', props: { id: 'notes', MuiAttributes: { label: 'Notes', multiline: true, minRows: 2 } }, layout: { row: 10, xs: 12 } },
        ],
    },
    {
        id: 'broken-valve-wo',
        title: 'Broken Valve Work Order',
        description: 'Dispatch a repair. Priority + symptom chips, a shut-off toggle that reveals impact fields, an estimated-cost formula, and a completion date that appears when marked Completed.',
        icon: 'engineering',
        data: [
            hdr('Broken Valve Work Order'),
            { type: 'textfield', props: { id: 'workOrder', MuiAttributes: { label: 'Work Order #' } }, rules: { validation: req }, layout: { row: 1, xs: 6 } },
            { type: 'select', props: { id: 'priority', value: 'high', options: [{ value: 'emergency', label: 'Emergency' }, { value: 'high', label: 'High' }, { value: 'normal', label: 'Normal' }, { value: 'low', label: 'Low' }], MuiBoxAttributes: { label: 'Priority' } }, layout: { row: 1, xs: 6 } },
            { type: 'textfield', props: { id: 'reportedBy', MuiAttributes: { label: 'Reported by' } }, layout: { row: 2, xs: 6 } },
            { type: 'datetime', props: { id: 'reportedAt', MuiAttributes: { label: 'Reported', fullWidth: true } }, layout: { row: 2, xs: 6 } },
            { type: 'textfield', props: { id: 'valveId', MuiAttributes: { label: 'Valve ID' } }, rules: { validation: req }, layout: { row: 3, xs: 6 } },
            { type: 'textfield', props: { id: 'location', MuiAttributes: { label: 'Location' } }, rules: { validation: req }, layout: { row: 3, xs: 6 } },
            { type: 'chipselect', props: { id: 'symptoms', label: 'Symptoms', multiple: true, options: [{ value: 'wontclose', label: "Won't close" }, { value: 'leaking', label: 'Leaking' }, { value: 'stem', label: 'Broken stem' }, { value: 'buried', label: 'Buried' }, { value: 'corroded', label: 'Corroded' }, { value: 'noaccess', label: 'No access' }] }, layout: { row: 4, xs: 12 } },
            { type: 'textfield', props: { id: 'problem', MuiAttributes: { label: 'Problem description', multiline: true, minRows: 2 } }, layout: { row: 5, xs: 12 } },
            { type: 'switch', props: { id: 'shutoff', MuiFCLAttributes: { label: 'Water shut-off required' } }, layout: { row: 6, xs: 12 } },
            { type: 'numberfield', props: { id: 'customers', MuiAttributes: { label: 'Customers affected' } }, visibleWhen: { field: 'shutoff', op: 'eq', value: true }, layout: { row: 7, xs: 6 } },
            { type: 'numberfield', props: { id: 'outageHrs', MuiAttributes: { label: 'Est. outage (hrs)' } }, visibleWhen: { field: 'shutoff', op: 'eq', value: true }, layout: { row: 7, xs: 6 } },
            { type: 'chipselect', props: { id: 'materials', label: 'Materials needed', multiple: true, options: [{ value: 'valve', label: 'Replacement valve' }, { value: 'box', label: 'Valve box' }, { value: 'gasket', label: 'Gaskets' }, { value: 'clamp', label: 'Repair clamp' }, { value: 'gravel', label: 'Gravel' }] }, layout: { row: 8, xs: 12 } },
            { type: 'numberfield', props: { id: 'estHours', value: 4, MuiAttributes: { label: 'Est. hours' } }, layout: { row: 9, xs: 3 } },
            { type: 'numberfield', props: { id: 'crew', value: 2, MuiAttributes: { label: 'Crew size' } }, layout: { row: 9, xs: 3 } },
            { type: 'numberfield', props: { id: 'rate', value: 65, MuiAttributes: { label: 'Rate ($/hr)' } }, layout: { row: 9, xs: 3 } },
            { type: 'computed', props: { id: 'laborCost', prefix: '$ ', format: '0,0.00', MuiAttributes: { label: 'Est. labor' } }, formula: 'estHours * crew * rate', layout: { row: 9, xs: 3 } },
            { type: 'select', props: { id: 'status', value: 'open', options: [{ value: 'open', label: 'Open' }, { value: 'progress', label: 'In progress' }, { value: 'completed', label: 'Completed' }], MuiBoxAttributes: { label: 'Status' } }, layout: { row: 10, xs: 6 } },
            { type: 'datetime', props: { id: 'completedAt', MuiAttributes: { label: 'Completed on', fullWidth: true } }, visibleWhen: { field: 'status', op: 'eq', value: 'completed' }, layout: { row: 10, xs: 6 } },
        ],
    },
];

/** Forms with every input normalized to a consistent "label on top" style. */
export const DEMO_FORMS: DemoRecipe[] = RAW_FORMS.map((form) => ({
    ...form,
    data: form.data.map(topLabel),
}));
