import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { FormGenerator, FormData, ClearFormData } from '../../FormGenerator';
import {
    collectionIssues,
    collectionReviewRows,
    describeDescendants,
    describeItem,
    formatValue,
    pluralize,
    resolveText,
} from '../../../util/collection';
import example from '../../../../examples/collection-customer-locations.json';

afterEach(() => ClearFormData());

const req = [{ rule: 'mandatory', message: 'Required' }];

const serviceFields = [
    { type: 'select', props: { id: 'serviceType', options: [{ value: 'dom', label: 'Domestic' }, { value: 'irr', label: 'Irrigation' }], MuiBoxAttributes: { label: 'Service type' } }, layout: { row: 1, xs: 12 } },
    { type: 'textfield', props: { id: 'meterSize', MuiAttributes: { label: 'Meter size' } }, rules: { validation: req }, layout: { row: 2, xs: 12 } },
];

const backflowFields = [
    { type: 'textfield', props: { id: 'serial', MuiAttributes: { label: 'Serial number' } }, rules: { validation: req }, layout: { row: 1, xs: 12 } },
];

const locationProps = {
    id: 'locations',
    itemLabel: 'Customer Location',
    icon: 'location_on',
    fields: [
        { type: 'textfield', props: { id: 'customerName', MuiAttributes: { label: 'Customer name' } }, rules: { validation: req }, layout: { row: 1, xs: 12 } },
        { type: 'textfield', props: { id: 'address', MuiAttributes: { label: 'Address' } }, layout: { row: 2, xs: 12 } },
    ],
    display: { title: 'customerName', subtitle: 'address' },
    collections: [
        { id: 'services', itemLabel: 'Service', icon: 'water_drop', fields: serviceFields, display: { title: '{serviceType} · {meterSize}' } },
        { id: 'backflows', itemLabel: 'Backflow', icon: 'shield', fields: backflowFields },
    ],
};

const schema = (props: any = {}, rules?: any) => [
    { type: 'collection', props: { ...locationProps, ...props }, ...(rules ? { rules } : {}), layout: { row: 1, xs: 12 } },
];

/** Find an input by label — prefix match, since required labels end in " *". */
const input = (scope: HTMLElement, label: string) =>
    within(scope).getByLabelText(new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)) as HTMLInputElement;

const setField = (scope: HTMLElement, label: string, value: string) => {
    const el = input(scope, label);
    fireEvent.change(el, { target: { value } });
    fireEvent.blur(el);
};

const dialog = () => screen.getByRole('dialog');

/** Open a level's add dialog (by the add button's name), fill fields, save
 *  (the dialog's save button is "Add {label}"). */
const addVia = async (openName: string, values: Record<string, string>, saveName = openName) => {
    fireEvent.click(screen.getAllByRole('button', { name: openName })[0]);
    await screen.findByRole('dialog');
    Object.entries(values).forEach(([label, v]) => setField(dialog(), label, v));
    fireEvent.click(within(dialog()).getByRole('button', { name: saveName }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
};

describe('collection helpers', () => {
    it('pluralizes labels', () => {
        expect(pluralize('Service')).toBe('Services');
        expect(pluralize('Address')).toBe('Addresses');
        expect(pluralize('Facility')).toBe('Facilities');
        expect(pluralize('Backflow', 1)).toBe('Backflow');
    });

    it('resolves templates and tidies separators left by empty values', () => {
        const fields: any[] = [{ type: 'select', props: { id: 'st', options: [{ value: 'tx', label: 'Texas' }] } }];
        expect(resolveText('{city}, {st} {zip}', { city: 'Austin', st: 'tx', zip: '78701' }, fields)).toBe('Austin, Texas 78701');
        expect(resolveText('{city}, {st} {zip}', { st: 'tx' }, fields)).toBe('Texas');
        expect(resolveText('{name} ({acct})', { name: 'Acme' }, fields)).toBe('Acme');
        expect(resolveText(['a', 'b', 'c'], { a: 'x', c: 'z' }, fields)).toBe('x · z');
        expect(resolveText((i) => `#${i.n}`, { n: 4 }, fields)).toBe('#4');
    });

    it('describes an item: title, then every other filled field as a labelled detail', () => {
        const fields: any[] = [
            { type: 'textfield', props: { id: 'model', MuiAttributes: { label: 'Model' } } },
            { type: 'select', props: { id: 'kind', MuiBoxAttributes: { label: 'Type' }, options: [{ value: 'rp', label: 'Reduced pressure' }] } },
            { type: 'switch', props: { id: 'active', MuiFCLAttributes: { label: 'Active' } } },
            { type: 'textfield', props: { id: 'status', MuiAttributes: { label: 'Status' } } },
            { type: 'textfield', props: { id: 'notes', MuiAttributes: { label: 'Notes' } } },
        ];
        const cfg: any = { itemLabel: 'Device', fields };
        const item = { model: 'Watts 009', kind: 'rp', active: true, status: 'ok' };
        expect(describeItem(item, cfg, 0)).toEqual({
            title: 'Watts 009',
            // What the item actually says, before any fallback is applied.
            rawTitle: 'Watts 009',
            subtitle: '',
            details: [
                { id: 'kind', label: 'Type', value: 'Reduced pressure', icon: 'list_alt' },
                { id: 'active', label: 'Active', value: 'Yes', icon: 'toggle_on' },
                { id: 'status', label: 'Status', value: 'ok', icon: 'notes' },
            ],
        });
        // Fields shown as the badge are not repeated; an explicit list picks + orders.
        expect(describeItem(item, { ...cfg, display: { title: '{model}', badge: 'status' } }, 0).details.map((d) => d.id)).toEqual(['kind', 'active']);
        expect(describeItem(item, { ...cfg, display: { details: ['status', 'kind'] } }, 0).details.map((d) => d.id)).toEqual(['status', 'kind']);
        expect(describeItem(item, { ...cfg, display: { details: false } }, 0).details).toEqual([]);
        // A JSON detail spec sets the label, icon and span.
        expect(describeItem(item, { ...cfg, display: { details: [{ field: 'kind', label: 'Assembly', icon: 'category', span: 2 }] } }, 0).details)
            .toEqual([{ id: 'kind', label: 'Assembly', value: 'Reduced pressure', icon: 'category', span: 2 }]);
        expect(describeItem({}, cfg, 2).title).toBe('Device 3');
    });

    it('separates the card fallback from what the item actually says', () => {
        /*
         * A card heading cannot be blank, so `title` falls back to "Device 1".
         * A TABLE's first column sits under a real field's label — "Model #",
         * "Type Of Service" — so putting a row number there renders as a value
         * the user never entered, while every other column in the same row
         * shows a placeholder. `rawTitle` is what the table uses.
         */
        const fields: any[] = [{ type: 'textfield', props: { id: 'model', MuiAttributes: { label: 'Model' } } }];
        const cfg: any = { itemLabel: 'Device', fields, display: { title: 'model' } };

        const filled = describeItem({ model: 'Watts 009' }, cfg, 0);
        expect(filled.title).toBe('Watts 009');
        expect(filled.rawTitle).toBe('Watts 009');

        const blank = describeItem({ model: '' }, cfg, 0);
        expect(blank.title).toBe('Device 1');
        expect(blank.rawTitle).toBe('');

        // The number follows the row, so the fallback stays useful on a card.
        expect(describeItem({ model: '' }, cfg, 4).title).toBe('Device 5');
    });

    it('formats dates by picker type, reading a bare YYYY-MM-DD as a local date', () => {
        const day = new Date(2026, 9, 7).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        expect(formatValue({ type: 'datetime' } as any, '2026-10-07')).toBe(day);
        expect(formatValue({ type: 'datetime' } as any, new Date(2026, 9, 7, 15, 30))).toBe(day); // no time for a date-only picker
        expect(formatValue({ type: 'datetimepicker' } as any, new Date(2026, 9, 7, 15, 30))).toMatch(/3:30/);
        expect(formatValue({ type: 'datetime' } as any, 'not a date')).toBe('not a date');
    });

    it('reports nested min/max issues with paths', () => {
        const cfg: any = { ...locationProps, collections: [{ ...locationProps.collections[0], min: 1 }, locationProps.collections[1]] };
        const value = [{ customerName: 'A', services: [{ meterSize: '1' }] }, { customerName: 'B', services: [] }];
        expect(collectionIssues(value, cfg)).toEqual([{ path: [1, 'services'], message: 'Add at least 1 service' }]);
        expect(collectionIssues([], cfg, { required: true })[0].message).toBe('Add at least 1 customer location');
        expect(collectionIssues([{}, {}], { ...cfg, collections: [], max: 1 })[0].message).toBe('No more than 1 customer location allowed');
    });

    it('describes nested items for delete confirmations', () => {
        expect(describeDescendants({ services: [{}, {}], backflows: [{}] }, locationProps as any)).toBe('2 services and 1 backflow');
        expect(describeDescendants({ services: [] }, locationProps as any)).toBe('');
    });

    it('builds review rows for nested items', () => {
        const rows = collectionReviewRows([{ customerName: 'Acme', address: '1 Main', services: [{ serviceType: 'dom', meterSize: '3/4"' }], backflows: [] }], locationProps as any);
        expect(rows).toEqual([
            { label: 'Customer Location 1', value: 'Acme — 1 Main' },
            { label: 'Customer Location 1 › Service 1', value: 'Domestic · 3/4"' },
        ]);
    });
});

describe('collection control (via FormGenerator)', () => {
    it('renders the heading, add button and empty state', async () => {
        render(<FormGenerator guid="col-empty" data={schema() as any} />);
        expect(await screen.findByText('Customer Locations')).toBeInTheDocument();
        expect(screen.getByText('No customer locations yet')).toBeInTheDocument();
        expect(screen.getByText('Add a customer location, then add its services and backflows.')).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: 'Add Customer Location' }).length).toBeGreaterThan(0);
    });

    it('adds an item through the dialog and stores nested arrays', async () => {
        render(<FormGenerator guid="col-add" data={schema() as any} />);
        await screen.findByText('Customer Locations');
        await addVia('Add Customer Location', { 'Customer name': 'Acme Corp', Address: '1 Main St' });

        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
        expect(screen.getByText('1 Main St')).toBeInTheDocument();
        expect(FormData('col-add').locations).toEqual([{ customerName: 'Acme Corp', address: '1 Main St', services: [], backflows: [] }]);
    });

    it('blocks saving while a dialog field is invalid', async () => {
        render(<FormGenerator guid="col-invalid" data={schema() as any} />);
        await screen.findByText('Customer Locations');
        fireEvent.click(screen.getAllByRole('button', { name: 'Add Customer Location' })[0]);
        await screen.findByRole('dialog');
        fireEvent.click(within(dialog()).getByRole('button', { name: 'Add Customer Location' }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(FormData('col-invalid').locations).toBeUndefined();
    });

    it('adds multiple services and backflows under a customer', async () => {
        render(<FormGenerator guid="col-nested" data={schema() as any} />);
        await screen.findByText('Customer Locations');
        await addVia('Add Customer Location', { 'Customer name': 'Acme Corp' });

        await addVia('Add Service', { 'Meter size': '3/4"' });
        await addVia('Add Service', { 'Meter size': '1"' });
        await addVia('Add Backflow', { 'Serial number': 'SN-1001' });

        const loc = FormData('col-nested').locations[0];
        expect(loc.services).toEqual([{ meterSize: '3/4"' }, { meterSize: '1"' }]);
        expect(loc.backflows).toEqual([{ serial: 'SN-1001' }]);
        // Nested lists are simple tables: one row per item.
        const [services, backflows] = screen.getAllByRole('table');
        expect(within(services).getAllByRole('row')).toHaveLength(3); // header + 2 services
        expect(within(backflows).getByText('SN-1001')).toBeInTheDocument();
    }, 20000);

    it('shows the parent as context in a nested dialog', async () => {
        render(<FormGenerator guid="col-ctx" data={schema() as any} patch={{ locations: [{ customerName: 'Acme Corp', services: [], backflows: [] }] }} />);
        await screen.findByText('Acme Corp');
        fireEvent.click(screen.getByRole('button', { name: 'Add Backflow' }));
        await screen.findByRole('dialog');
        expect(within(dialog()).getByText('Acme Corp')).toBeInTheDocument();
    });

    it('"Save & add another" keeps the dialog open for the next item', async () => {
        render(<FormGenerator guid="col-another" data={schema() as any} />);
        await screen.findByText('Customer Locations');
        fireEvent.click(screen.getAllByRole('button', { name: 'Add Customer Location' })[0]);
        await screen.findByRole('dialog');
        setField(dialog(), 'Customer name', 'First');
        fireEvent.click(within(dialog()).getByRole('button', { name: /Save & add another/ }));
        await waitFor(() => expect(input(dialog(), 'Customer name').value).toBe(''));
        setField(dialog(), 'Customer name', 'Second');
        fireEvent.click(within(dialog()).getByRole('button', { name: 'Add Customer Location' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        expect(FormData('col-another').locations.map((l: any) => l.customerName)).toEqual(['First', 'Second']);
    });

    it('hydrates from a patch and edits an item in place', async () => {
        const patch = { locations: [{ customerName: 'Acme Corp', address: '1 Main', services: [{ serviceType: 'dom', meterSize: '1"' }], backflows: [] }] };
        render(<FormGenerator guid="col-edit" data={schema() as any} patch={patch} />);
        expect(await screen.findByText('Acme Corp')).toBeInTheDocument();
        expect(screen.getByText('Domestic · 1"')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Edit Acme Corp' }));
        await screen.findByRole('dialog');
        expect(input(dialog(), 'Customer name').value).toBe('Acme Corp');
        setField(dialog(), 'Customer name', 'Acme Holdings');
        fireEvent.click(within(dialog()).getByRole('button', { name: 'Save changes' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

        expect(screen.getByText('Acme Holdings')).toBeInTheDocument();
        const saved = FormData('col-edit').locations[0];
        expect(saved.customerName).toBe('Acme Holdings');
        expect(saved.services).toEqual([{ serviceType: 'dom', meterSize: '1"' }]); // children kept
    });

    it('confirms before deleting and names the nested items it removes', async () => {
        const patch = { locations: [{ customerName: 'Acme Corp', services: [{ meterSize: '1' }, { meterSize: '2' }], backflows: [{ serial: 'X' }] }] };
        render(<FormGenerator guid="col-del" data={schema() as any} patch={patch} />);
        await screen.findByText('Acme Corp');
        fireEvent.click(screen.getByRole('button', { name: 'Delete Acme Corp' }));

        const confirm = await screen.findByRole('dialog');
        expect(within(confirm).getByText(/along with 2 services and 1 backflow/)).toBeInTheDocument();
        fireEvent.click(within(confirm).getByRole('button', { name: 'Delete' }));

        await waitFor(() => expect(screen.queryByText('Acme Corp')).toBeNull());
        expect(FormData('col-del').locations).toEqual([]);
    });

    it('duplicates an item together with its nested items (when enabled)', async () => {
        const patch = { locations: [{ customerName: 'Acme Corp', services: [{ meterSize: '1' }], backflows: [] }] };
        render(<FormGenerator guid="col-dup" data={schema({ actions: { duplicate: true } }) as any} patch={patch} />);
        await screen.findByText('Acme Corp');
        fireEvent.click(screen.getByRole('button', { name: 'More actions for Acme Corp' }));
        fireEvent.click(await screen.findByRole('menuitem', { name: 'Duplicate' }));
        await waitFor(() => expect(FormData('col-dup').locations).toHaveLength(2));
        expect(FormData('col-dup').locations[1]).toEqual({ customerName: 'Acme Corp', services: [{ meterSize: '1' }], backflows: [] });
    });

    it('blocks submit when required or a nested minimum is unmet, and shows the reason', async () => {
        const onSubmit = vi.fn();
        const data = schema({ collections: [{ ...locationProps.collections[0], min: 1 }, locationProps.collections[1]] }, { validation: [{ rule: 'mandatory' }] });
        const { rerender } = render(<FormGenerator guid="col-submit" data={data as any} onSubmit={onSubmit} submitLabel="Submit" />);
        await screen.findByText('Customer Locations');

        fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
        expect(onSubmit.mock.calls[0][1].map((e: any) => e.id)).toEqual(['locations']);
        expect(await screen.findByText('Add at least 1 customer location')).toBeInTheDocument();

        rerender(<FormGenerator guid="col-submit" data={data as any} onSubmit={onSubmit} submitLabel="Submit" patch={{ locations: [{ customerName: 'Acme', services: [], backflows: [] }] }} />);
        await screen.findByText('Acme');
        fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
        const errors = onSubmit.mock.calls[1][1];
        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({ id: 'locations', rule: 'collection', message: 'Add at least 1 service' });
        expect(await screen.findByText('Add at least 1 service')).toBeInTheDocument();
    });

    it('lists nested items in review mode', () => {
        const patch = { locations: [{ customerName: 'Acme', services: [{ serviceType: 'irr', meterSize: '2"' }], backflows: [{ serial: 'SN-9' }] }] };
        render(<FormGenerator guid="col-review" data={schema() as any} patch={patch} reviewMode />);
        expect(screen.getByText('Customer Location 1')).toBeInTheDocument();
        expect(screen.getByText('Customer Location 1 › Service 1')).toBeInTheDocument();
        expect(screen.getByText('Irrigation · 2"')).toBeInTheDocument();
        expect(screen.getByText('Customer Location 1 › Backflow 1')).toBeInTheDocument();
    });

    it('is view-only when the form is read-only', async () => {
        const patch = { locations: [{ customerName: 'Acme', services: [], backflows: [] }] };
        render(<FormGenerator guid="col-ro" data={schema() as any} patch={patch} readOnly />);
        await screen.findByText('Acme');
        expect(screen.queryByRole('button', { name: /^Add / })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Edit Acme' })).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'View Acme' }));
        await screen.findByRole('dialog');
        expect(within(dialog()).getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
});

describe('examples/collection-customer-locations.json', () => {
    it('renders the shipped template with its sample patch', async () => {
        render(<FormGenerator guid="col-example" data={example.schema as any} patch={example.patch} />);
        expect(await screen.findByText('Riverside Medical Center')).toBeInTheDocument();
        expect(screen.getByText('1200 River Rd, Austin, TX 78701')).toBeInTheDocument();
        expect(screen.getAllByText('Services')).toHaveLength(2); // a full-width section per customer
        expect(screen.getAllByText('Meter #').length).toBeGreaterThan(0); // labelled details
        expect(screen.getByText('M-20931')).toBeInTheDocument();
        expect(screen.getByText('Watts LF909')).toBeInTheDocument();
        expect(screen.getByText('RP (Reduced pressure)')).toBeInTheDocument();
        expect(screen.getByText('W909-55120')).toBeInTheDocument();
        expect(screen.getByText(new Date(2026, 2, 18).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }))).toBeInTheDocument();
        expect(screen.getByText('Passed')).toBeInTheDocument();
        expect(screen.getByText('Maple Street Residence')).toBeInTheDocument();
        // An empty nested section is just its title + add button — no placeholder text.
        expect(screen.queryByText(/No backflow/)).toBeNull();
        expect(screen.getAllByRole('button', { name: 'Add Backflow' }).length).toBe(2);
        expect(screen.getByText('Result')).toBeInTheDocument(); // badge column label from the JSON
        expect(screen.getAllByText('Account #').length).toBeGreaterThan(0); // icon + label + value details
        expect(screen.getByText('100-48213')).toBeInTheDocument();
    });
});

describe('collection is controlled from JSON', () => {
    const render1 = (props: any, guid: string, patch?: any) =>
        render(<FormGenerator guid={guid} data={schema(props) as any} patch={patch ?? { locations: [{ customerName: 'Acme', address: '1 Main', services: [], backflows: [] }] }} />);

    it('applies styles[slot] overrides on top of the built-in look', async () => {
        render1({ styles: { itemTitle: { color: 'rgb(255, 0, 0)' }, root: { padding: '11px' } } }, 'json-styles');
        const title = await screen.findByRole('button', { name: 'Acme' });
        expect(title).toHaveStyle({ color: 'rgb(255, 0, 0)' });
        expect(document.querySelector('[data-collection="locations"]')).toHaveStyle({ padding: '11px' });
    });

    it('rewords every text, and nested levels inherit them', async () => {
        render1({ texts: { add: 'New {labelLower}', editAria: 'Change {title}' } }, 'json-texts', {});
        expect(await screen.findByRole('button', { name: 'New customer location' })).toBeInTheDocument();
        await addVia('New customer location', { 'Customer name': 'Acme' }, 'Add Customer Location');
        expect(screen.getByRole('button', { name: 'Change Acme' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'New service' })).toBeInTheDocument(); // inherited
    });

    it('places the add button where addButton.position says', async () => {
        const collections = [{ ...locationProps.collections[0], addButton: { position: 'footer', variant: 'dashed' } }];
        render1({ collections }, 'json-add', { locations: [{ customerName: 'Acme', services: [{ meterSize: '1"' }] }] });
        await screen.findByText('Acme');
        // Footer placement: "Add another …" below the list, nothing beside the title.
        expect(screen.getByRole('button', { name: 'Add another service' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Add Service' })).toBeNull();
    });

    it('shows nested items as a table by default, or as cards via layout', async () => {
        const patch = { locations: [{ customerName: 'Acme', services: [{ serviceType: 'dom', meterSize: '1"' }] }] };
        const { unmount } = render1({}, 'json-table', patch);
        const table = await screen.findByRole('table');
        expect(within(table).getByRole('columnheader', { name: 'Service' })).toBeInTheDocument();
        unmount();
        render1({ collections: [{ ...locationProps.collections[0], layout: 'cards' }] }, 'json-cards', patch);
        expect(await screen.findByText('Domestic · 1"')).toBeInTheDocument();
        expect(screen.queryByRole('table')).toBeNull();
    });

    it('turns opt-in actions on: menu (duplicate / move) and collapse', async () => {
        render1({ actions: { duplicate: true, move: true, collapse: true } }, 'json-actions-on', { locations: [{ customerName: 'Acme', services: [{ meterSize: '1"' }], backflows: [] }] });
        await screen.findByText('Acme');
        expect(screen.getByRole('button', { name: 'More actions for Acme' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Collapse Acme' }));
        // Collapsed card shows child counts as separate pills (not a single joined string)
        expect(screen.getByText('1 service')).toBeInTheDocument();
        expect(screen.getByText('0 backflows')).toBeInTheDocument();
    });

    it('is simple by default: only Edit and Delete, both switchable from JSON', async () => {
        const { unmount } = render1({}, 'json-actions-default');
        await screen.findByText('Acme');
        expect(screen.getByRole('button', { name: 'Edit Acme' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Delete Acme' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'More actions for Acme' })).toBeNull();
        // Collapse button now always shows for cards that have details or child collections
        expect(screen.getByRole('button', { name: 'Collapse Acme' })).toBeInTheDocument();
        unmount();
        render1({ actions: { delete: false } }, 'json-actions-off');
        await screen.findByText('Acme');
        expect(screen.queryByRole('button', { name: 'Delete Acme' })).toBeNull();
    });

    it.each(['grid', 'list', 'inline'])('renders the %s details layout with labels and values', async (detailsLayout) => {
        const display = { title: 'customerName', detailsLayout, details: [{ field: 'address', label: 'Street', icon: 'place' }] };
        render1({ display }, 'json-layout-' + detailsLayout);
        expect(await screen.findByText('Street')).toBeInTheDocument();
        expect(screen.getByText('1 Main')).toBeInTheDocument();
    });

    it('accepts any CSS colour as the accent', async () => {
        render1({ color: '#0ea5e9', collections: [{ ...locationProps.collections[0], color: '#7c3aed' }] }, 'json-color');
        expect(await screen.findByText('Acme')).toBeInTheDocument();
    });
});
