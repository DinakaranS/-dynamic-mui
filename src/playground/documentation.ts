export const COMPONENT_DOCS: Record<string, { title: string; description: string; usage: string; props: Record<string, string> }> = {
    textfield: {
        title: 'Text Field',
        description: 'A basic input field for text data.',
        usage: 'Use for names, addresses, or short text inputs.',
        props: {
            label: 'The label text displayed above or inside the input',
            placeholder: 'Ghost text shown when empty',
            helperText: 'Supportive text shown below the input',
            required: 'Whether the field is mandatory'
        }
    },
    select: {
        title: 'Select Dropdown',
        description: 'A dropdown menu to select one option from a list.',
        usage: 'Use when you have 5-15 mutually exclusive options.',
        props: {
            label: 'Label for the dropdown',
            options: 'Array of { value, label } objects',
            fullWidth: 'Whether it takes full width of container'
        }
    },
    checkbox: {
        title: 'Checkbox',
        description: 'A binary selection control.',
        usage: 'Use for boolean choices like "I agree" or binary settings.',
        props: {
            label: 'Text displayed next to the checkbox',
            defaultChecked: 'Initial state'
        }
    },
    switch: {
        title: 'Switch',
        description: 'A toggle switch for on/off states.',
        usage: 'Use for settings or instant-effect toggles.',
        props: {
            label: 'Label text',
            color: 'Color theme of the switch'
        }
    },
    radio: {
        title: 'Radio Group',
        description: 'A set of mutually exclusive options.',
        usage: 'Use when users need to see all options at once (unlike select).',
        props: {
            options: 'List of radio options',
            row: 'Display horizontally if true'
        }
    },
    chipselect: {
        title: 'Chip Select',
        description: 'A set of premium, pill-shaped selectable chips. Works in single-select (radio-like) or multi-select mode. Every item is configurable — label, value, leading icon, colour, and disabled state.',
        usage: 'Use for tags, categories, interests, filters, or any compact single/multi choice where all options should be visible at once.',
        props: {
            id: 'Unique field identifier',
            multiple: 'true = multi-select (returns an array); false/omitted = single-select (returns a scalar)',
            label: 'Group label shown above the chips',
            options: 'Array of string OR { value, label, icon?, color?, disabled? } items',
            value: 'Initial selection — a value, an array of values, or a separator-joined string',
            separator: 'Separator used when hydrating a joined-string value (default ";")',
            color: 'Default MUI palette colour for selected chips, or a custom hex (default "primary")',
            size: '"small" | "medium" chip size (default "medium")',
            allowDeselect: 'Single-select only: click a selected chip to clear it (default true)',
            MuiAttributes: 'MUI Chip props spread onto every chip (incl. sx)',
            MuiStackAttributes: 'MUI Stack props spread onto the chip container'
        }
    },
    datetime: {
        title: 'Date Time Picker',
        description: 'A comprehensive date and time selector.',
        usage: 'Use for scheduling or timestamp inputs.',
        props: {
            disablePast: 'Prevent selecting past dates',
            format: 'Date format string'
        }
    },
    datetimepicker: {
        title: 'Date + Time',
        description: 'A combined date-and-time picker (MUI DateTimePicker).',
        usage: 'Use when a single field must capture both a date and a time.',
        props: {
            id: 'Unique field identifier',
            value: 'Initial value (parsed by day.js)',
            'MuiAttributes.format': 'Display format, e.g. "MM/DD/YYYY hh:mm A"',
            'MuiAttributes.disablePast': 'Prevent selecting past date-times'
        }
    },
    mixchart: {
        title: 'Mixed Chart',
        description: 'A combined bar + line chart on shared axes (MUI X Charts, lazy-loaded).',
        usage: 'Use to compare a measure (bars) against a trend (line) over the same categories.',
        props: {
            id: 'Unique field identifier',
            'MuiChartContainerAttributes.series': 'Array of { type: "bar" | "line", data, label }',
            'MuiChartContainerAttributes.xAxis': 'Axis config, e.g. [{ scaleType: "band", data: [...] }]',
            'MuiChartContainerAttributes.width': 'Chart width',
            'MuiChartContainerAttributes.height': 'Chart height'
        }
    },
    daterangepicker: {
        title: 'Date Range Picker',
        description: 'A start + end date pair (built from two free MUI DatePickers — no Pro dependency). Validates that end is on or after start.',
        usage: 'Use for booking ranges, reporting periods, or any from/to date span.',
        props: {
            id: 'Unique field identifier',
            value: '{ start, end }, [start, end], or a "start~end" string',
            format: 'Day.js date format (default "MM/DD/YYYY")',
            startLabel: 'Label for the start field (default "Start")',
            endLabel: 'Label for the end field (default "End")'
        }
    },
    rating: {
        title: 'Rating',
        description: 'A star rating input.',
        usage: 'Use for reviews, feedback, or satisfaction scores.',
        props: {
            id: 'Unique field identifier',
            value: 'Initial numeric rating',
            label: 'Label shown above the stars',
            'MuiAttributes.max': 'Number of stars (default 5)',
            'MuiAttributes.precision': 'Step, e.g. 0.5 for half stars'
        }
    },
    slider: {
        title: 'Slider',
        description: 'A draggable slider for a single value or a [min, max] range.',
        usage: 'Use for amounts, thresholds, price ranges, or any bounded numeric value.',
        props: {
            id: 'Unique field identifier',
            value: 'A number, or [number, number] for a range slider',
            min: 'Minimum value (default 0)',
            max: 'Maximum value (default 100)',
            step: 'Increment (default 1)',
            marks: 'true or an array of marks',
            valueLabelDisplay: '"auto" | "on" | "off"'
        }
    },
    tagsinput: {
        title: 'Tags Input',
        description: 'Free-text tag entry with autocomplete suggestions. Returns an array of strings.',
        usage: 'Use for keywords, labels, skills, or any repeatable free-text list.',
        props: {
            id: 'Unique field identifier',
            value: 'string[] or a separator-joined string',
            options: 'Suggestion list (string[])',
            separator: 'Separator for hydrating a joined-string value (default ";")',
            label: 'Field label',
            placeholder: 'Ghost text for the entry box'
        }
    },
    togglebuttons: {
        title: 'Toggle Buttons',
        description: 'A segmented button group for single or multiple selection.',
        usage: 'Use for compact exclusive choices (alignment, view mode) or multi-toggles.',
        props: {
            id: 'Unique field identifier',
            value: 'Selected value (scalar) or array when multiple',
            options: 'string[] or { value, label, icon }[]',
            multiple: 'Allow multiple selection (default false = exclusive)',
            label: 'Group label',
            color: 'MUI palette colour for the selected state'
        }
    },
    password: {
        title: 'Password Field',
        description: 'A password input with a show/hide toggle and an optional strength meter.',
        usage: 'Use for passwords and other masked secrets.',
        props: {
            id: 'Unique field identifier',
            value: 'Initial value',
            showStrength: 'Show a strength meter below the field',
            'MuiAttributes.label': 'Field label',
            rules: 'Validation rules (e.g. length) applied on change'
        }
    },
    otp: {
        title: 'OTP / PIN Input',
        description: 'A one-time-code input of N single-character boxes with auto-advance, backspace, and paste support.',
        usage: 'Use for verification codes, PINs, and 2FA entry.',
        props: {
            id: 'Unique field identifier',
            value: 'Initial code string',
            length: 'Number of boxes (default 6)',
            label: 'Label shown above the boxes'
        }
    },
    phone: {
        title: 'Phone Number',
        description: 'A pattern-formatted phone input (powered by react-number-format).',
        usage: 'Use for phone numbers with a consistent display format.',
        props: {
            id: 'Unique field identifier',
            value: 'Initial value (raw digits)',
            format: 'Pattern, e.g. "+1 (###) ###-####"',
            mask: 'Placeholder character for empty digits (default "_")',
            'MuiAttributes.label': 'Field label'
        }
    },
    currency: {
        title: 'Currency',
        description: 'A money input with thousands separators, prefix, and fixed decimals (react-number-format).',
        usage: 'Use for prices, amounts, and any monetary value.',
        props: {
            id: 'Unique field identifier',
            value: 'Initial numeric value',
            prefix: 'Currency symbol (default "$")',
            thousandSeparator: 'Grouping separator (default ",")',
            decimalScale: 'Decimal places (default 2)'
        }
    },
    fileupload: {
        title: 'File Upload',
        description: 'A drag-and-drop / click dropzone with previews. Uploads to S3 when configured, otherwise returns a data URL. Returns the uploaded URL(s).',
        usage: 'Use for attachments, images, or documents.',
        props: {
            id: 'Unique field identifier',
            multiple: 'Allow multiple files',
            accept: 'Accepted file types, e.g. "image/*"',
            maxSizeMB: 'Reject files larger than this',
            bucket: 'S3 bucket (optional)',
            region: 'AWS region (optional)',
            identityPoolId: 'Cognito Identity Pool ID (optional)',
            path: 'Folder path within the bucket'
        }
    },
    alert: {
        title: 'Alert',
        description: 'A static inline message banner (info / success / warning / error).',
        usage: 'Use for instructions, notices, or validation summaries between fields.',
        props: {
            severity: '"info" | "success" | "warning" | "error"',
            title: 'Optional bold title',
            text: 'Message body (also accepts "message")',
            variant: '"standard" | "filled" | "outlined"'
        }
    },
    computed: {
        title: 'Computed Field',
        description: 'A read-only field whose value is derived from other fields via a formula, recomputed live as the form changes.',
        usage: 'Use for totals, subtotals, tax, or any value calculated from other inputs.',
        props: {
            id: 'Unique field identifier (its computed value is submitted)',
            formula: 'Arithmetic expression, e.g. "qty * price" or "SUM(a,b,c)" (functions: SUM/AVG/MIN/MAX/ROUND/ABS/FLOOR/CEIL)',
            prefix: 'Text shown before the value (e.g. "$ ")',
            suffix: 'Text shown after the value',
            format: 'numeral.js format string, e.g. "0,0.00"'
        }
    },
    keyvalue: {
        title: 'Key-Value',
        description: 'A dynamic list of key/value pairs. Returns an object map.',
        usage: 'Use for metadata, custom attributes, HTTP headers, or any ad-hoc dictionary.',
        props: {
            id: 'Unique field identifier',
            value: 'Object map { key: value } or [{ key, value }] array',
            keyLabel: 'Label for the key input (default "Key")',
            valueLabel: 'Label for the value input (default "Value")'
        }
    },
    numberstepper: {
        title: 'Number Stepper',
        description: 'A quantity spinner with − / + buttons and a numeric input, clamped to a range.',
        usage: 'Use for counts, quantities, and small bounded numbers.',
        props: {
            id: 'Unique field identifier',
            value: 'Initial number',
            min: 'Minimum value',
            max: 'Maximum value',
            step: 'Increment (default 1)'
        }
    },
    matrix: {
        title: 'Matrix / Grid',
        description: 'A survey grid of questions (rows) × options (columns); single or multiple choice per row.',
        usage: 'Use for Likert scales, rating matrices, and multi-question surveys.',
        props: {
            id: 'Unique field identifier',
            rows: 'Questions — [{id,label}] or string[]',
            columns: 'Options — [{value,label}] or string[]',
            multiple: 'Allow multiple selections per row',
            value: 'Object map { rowId: colValue | colValue[] }'
        }
    },
    consent: {
        title: 'Consent',
        description: 'A scrollable terms box with an agree checkbox that can require scroll-to-bottom before enabling.',
        usage: 'Use for terms & conditions, privacy consent, and legal agreements.',
        props: {
            id: 'Unique field identifier',
            text: 'The terms content',
            label: 'Agree checkbox label',
            requireScroll: 'Require scrolling to the bottom before enabling (default true)'
        }
    },
    colorpicker: {
        title: 'Color Picker',
        description: 'A colour swatch with a native picker, a hex field, and optional preset swatches.',
        usage: 'Use for theme colours, tags, or any colour selection.',
        props: {
            id: 'Unique field identifier',
            value: 'Hex colour (default "#000000")',
            presets: 'Array of hex colours to show as quick swatches'
        }
    },
    markdown: {
        title: 'Markdown Editor',
        description: 'A markdown text editor with a live, safely-rendered preview (no external dependency).',
        usage: 'Use for descriptions, notes, and formatted long text.',
        props: {
            id: 'Unique field identifier',
            value: 'Markdown string',
            rows: 'Editor height in rows (default 6)'
        }
    },
    address: {
        title: 'Address',
        description: 'A composite address block (street, city, state, postal code, country). Returns an object.',
        usage: 'Use for shipping/billing addresses and any structured location.',
        props: {
            id: 'Unique field identifier',
            value: 'Object { street1, street2, city, state, postalCode, country }',
            countries: 'Optional [{value,label}] list (falls back to a built-in list)',
            labels: 'Optional label overrides for sub-fields'
        }
    },
    cascadeselect: {
        title: 'Cascade Select',
        description: 'A dependent Select whose options change based on a parent field value; clears itself when the parent changes.',
        usage: 'Use for country→state→city and other dependent dropdowns.',
        props: {
            id: 'Unique field identifier',
            parentValue: "The parent field's current value (drives the options)",
            optionsMap: 'Record<parentValue, options[]> mapping parent values to option lists',
            options: 'Fallback options when no map entry matches'
        }
    },
    formwizard: {
        title: 'Form Wizard',
        description: 'A multi-step wizard that renders each step with FormGenerator and a Stepper header with Back/Next navigation.',
        usage: 'Use for long forms split into logical steps (onboarding, checkout, applications).',
        props: {
            id: 'Unique field identifier',
            steps: 'Array of { label, fields: FormField[] }',
            patch: 'Initial values across steps',
            finishLabel: 'Label for the final-step button (default "Finish")'
        }
    },
    geo: {
        title: 'Geo / Map',
        description: 'Latitude & longitude inputs with an "Open in Maps" link and an optional OpenStreetMap embed.',
        usage: 'Use for coordinates, pins, or capturing a point location.',
        props: {
            id: 'Unique field identifier',
            value: 'Object { lat, lng } or "lat,lng" string',
            showMap: 'Show an embedded OpenStreetMap preview (default false)'
        }
    },
    summary: {
        title: 'Summary',
        description: "A read-only review panel listing the current form's values as label → value rows.",
        usage: 'Use as a final review step before submission.',
        props: {
            id: 'Unique field identifier',
            guid: 'The FormGenerator guid to read values from',
            data: 'Explicit values object (overrides guid)',
            title: 'Panel title (default "Summary")',
            labels: 'Optional { fieldId: "Nice Label" } map',
            hideEmpty: 'Hide rows with empty values'
        }
    },
    richtext: {
        title: 'Rich Text Editor',
        description: 'A lightweight WYSIWYG editor (bold/italic/underline, lists, links). Returns an HTML string.',
        usage: 'Use for formatted descriptions, notes, or email bodies.',
        props: {
            id: 'Unique field identifier',
            value: 'Initial HTML content',
            label: 'Field label',
            minHeight: 'Editor min height in px (default 160)'
        }
    },
    nps: {
        title: 'NPS Scale',
        description: 'A 0–N rating scale (buttons) with low/high anchor labels. Common for Net Promoter Score.',
        usage: 'Use for satisfaction/likelihood surveys.',
        props: {
            id: 'Unique field identifier',
            value: 'Selected number',
            min: 'Lowest value (default 0)',
            max: 'Highest value (default 10)',
            lowLabel: 'Caption under the low end',
            highLabel: 'Caption under the high end'
        }
    },
    editabletable: {
        title: 'Editable Table',
        description: 'An inline-editable table — users add/edit/delete rows. Returns an array of row objects.',
        usage: 'Use to collect tabular data (line items, participants, custom rows).',
        props: {
            id: 'Unique field identifier',
            columns: 'Array of { key, label, type: "text" | "number" }',
            value: 'Array of row objects',
            addLabel: 'Text on the add-row button (default "Add row")'
        }
    },
    intlphone: {
        title: 'International Phone',
        description: 'A country dial-code selector (flag + code) beside a formatted phone number input.',
        usage: 'Use for international phone entry.',
        props: {
            id: 'Unique field identifier',
            value: 'Initial value (e.g. "+1 …")',
            defaultCountry: 'ISO code of the initial country (default "US")'
        }
    },
    asyncautocomplete: {
        title: 'Async Autocomplete',
        description: 'An autocomplete that loads options asynchronously as the user types (server-side search), debounced.',
        usage: 'Use for large or remote datasets (user lookup, product search).',
        props: {
            id: 'Unique field identifier',
            loadOptions: '(query) => Promise<options[]> — preferred fetch function',
            optionsUrl: 'URL to GET ?q=<query> returning a JSON array (alternative to loadOptions)',
            minChars: 'Min characters before searching (default 1)',
            debounceMs: 'Debounce delay in ms (default 300)',
            labelKey: 'Option label field (default "label")',
            valueKey: 'Option value field (default "value")'
        }
    },
    button: {
        title: 'Button',
        description: 'A clickable action element.',
        usage: 'Use for form submission, resets, or navigation.',
        props: {
            text: 'Button label',
            variant: 'contained | outlined | text',
            color: 'primary | secondary | error'
        }
    },
    typography: {
        title: 'Typography',
        description: 'Static text for headings and labels.',
        usage: 'Use for section headers, instructions, or disclaimers.',
        props: {
            text: 'Content to display',
            variant: 'h1...h6 | body1 | body2'
        }
    },
    lineitemlist: {
        title: 'Line Item List',
        description: 'A dynamic list of rows — each row has a description field and a fee/amount field. Rows can be added or removed. The key prefix for each row is derived automatically from the patched data, or set via the keyPrefix prop.',
        usage: 'Use for itemised charges, miscellaneous entries, or any repeatable description+amount pairs.',
        props: {
            id: 'Unique field identifier',
            keyPrefix: 'Prefix for generated row keys, e.g. "charge" → charge1, charge2 (auto-detected from patch data)',
            showRowBadge: 'Show/hide the row-number circle badge. Default: true',
            'MuiAttributes.row': 'MUI Box props spread onto each row container',
            'MuiAttributes.rowBadge': 'MUI Typography props spread onto the row-number badge',
            'MuiAttributes.description': 'MUI TextField props spread onto the description input',
            'MuiAttributes.fee': 'MUI TextField props spread onto the fee input',
            'MuiAttributes.addButton': 'MUI Button props spread onto the Add (+) button',
            'MuiAttributes.removeButton': 'MUI IconButton props spread onto the Remove button'
        }
    },
    locationfield: {
        title: 'Location Field',
        description: 'A text field with an adjacent button for updating location/address. Clicking the button sends an onChange event with option "location_update_request" to the parent, which can then enable a map picker. The updated address can be patched back.',
        usage: 'Use for address fields where the user can update the location via a map or geocoding.',
        props: {
            id: 'Unique field identifier',
            value: 'Initial address string',
            buttonText: 'Text on the update button (default: "Update Location")',
            buttonIcon: 'Iconify icon name for the button (default: "mdi:map-marker")',
            buttonDisplay: '"text" | "icon" | "both" — controls what the button shows (default: "both")',
            MuiAttributes: 'MUI TextField props (label, variant, etc.)',
            MuiButtonAttributes: 'MUI Button props (variant, color, size, sx, etc.)',
            disabled: 'Disables both the text field and the button'
        }
    },
    formrepeater: {
        title: 'Form Repeater',
        description: 'A number input that dynamically generates N copies of a form group. Each group renders any sub-fields defined in subFields. Output is an array of objects, one per group.',
        usage: 'Use for repeating data entry — team members, line items, addresses, beneficiaries, etc.',
        props: {
            id: 'Unique field identifier',
            label: 'Label prefix for each group heading (e.g. "Member" → Member 1, Member 2)',
            count: 'Initial number of groups to render',
            min: 'Minimum number of groups allowed (default: 1)',
            max: 'Maximum number of groups allowed (optional)',
            subFields: 'Array of FormField definitions rendered inside each group',
            value: 'Array of patch objects, one per group, to pre-fill values'
        }
    }
};
