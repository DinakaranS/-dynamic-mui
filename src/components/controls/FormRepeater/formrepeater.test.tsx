import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FormRepeater from './formrepeater';

const subFields = [
    {
        type: 'textfield',
        props: { id: 'name', MuiAttributes: { label: 'Name', fullWidth: true } },
        layout: { xs: 12 },
        visible: true,
    },
    {
        type: 'numberfield',
        props: { id: 'age', MuiAttributes: { label: 'Age', fullWidth: true } },
        layout: { xs: 12 },
        visible: true,
    },
];

const defaultProps = {
    attributes: { id: 'repeater', label: 'Person', subFields },
    rules: {},
    onChange: vi.fn(),
};

describe('FormRepeater', () => {
    // ─── Rendering ────────────────────────────────────────────────────────────

    it('renders a count input', () => {
        render(<FormRepeater {...defaultProps} />);
        expect(screen.getByLabelText(/Number of Persons/i)).toBeTruthy();
    });

    it('renders 1 group by default (min=1)', () => {
        render(<FormRepeater {...defaultProps} />);
        expect(screen.getAllByText(/Person 1/i)).toBeTruthy();
        expect(screen.queryByText(/Person 2/i)).toBeNull();
    });

    it('renders N groups when count prop is set', () => {
        render(
            <FormRepeater
                attributes={{ ...defaultProps.attributes, count: 3 }}
                rules={{}}
                onChange={vi.fn()}
            />
        );
        expect(screen.getByText('Person 1')).toBeTruthy();
        expect(screen.getByText('Person 2')).toBeTruthy();
        expect(screen.getByText('Person 3')).toBeTruthy();
    });

    it('uses patch array length to determine initial group count', () => {
        render(
            <FormRepeater
                attributes={{
                    ...defaultProps.attributes,
                    value: [{ name: 'Alice' }, { name: 'Bob' }],
                }}
                rules={{}}
                onChange={vi.fn()}
            />
        );
        expect(screen.getByText('Person 1')).toBeTruthy();
        expect(screen.getByText('Person 2')).toBeTruthy();
        expect(screen.queryByText('Person 3')).toBeNull();
    });

    // ─── Count changes ────────────────────────────────────────────────────────

    it('adds groups when count input is increased', async () => {
        render(<FormRepeater {...defaultProps} />);
        const countInput = screen.getByLabelText(/Number of Persons/i);
        fireEvent.change(countInput, { target: { value: '3' } });
        await waitFor(() => {
            expect(screen.getByText('Person 3')).toBeTruthy();
        });
    });

    it('removes groups when count input is decreased', async () => {
        render(
            <FormRepeater
                attributes={{ ...defaultProps.attributes, count: 3 }}
                rules={{}}
                onChange={vi.fn()}
            />
        );
        const countInput = screen.getByLabelText(/Number of Persons/i);
        fireEvent.change(countInput, { target: { value: '1' } });
        await waitFor(() => {
            expect(screen.queryByText('Person 2')).toBeNull();
        });
    });

    it('does not go below min when count is reduced to 0', async () => {
        render(
            <FormRepeater
                attributes={{ ...defaultProps.attributes, min: 1 }}
                rules={{}}
                onChange={vi.fn()}
            />
        );
        const countInput = screen.getByLabelText(/Number of Persons/i);
        fireEvent.change(countInput, { target: { value: '0' } });
        await waitFor(() => {
            expect(screen.getByText('Person 1')).toBeTruthy();
        });
    });

    it('does not exceed max when count is set above it', async () => {
        render(
            <FormRepeater
                attributes={{ ...defaultProps.attributes, max: 2 }}
                rules={{}}
                onChange={vi.fn()}
            />
        );
        const countInput = screen.getByLabelText(/Number of Persons/i);
        fireEvent.change(countInput, { target: { value: '99' } });
        await waitFor(() => {
            expect(screen.getByText('Person 2')).toBeTruthy();
            expect(screen.queryByText('Person 3')).toBeNull();
        });
    });

    // ─── Label ────────────────────────────────────────────────────────────────

    it('uses default label "Group" when none provided', () => {
        render(
            <FormRepeater
                attributes={{ id: 'r', subFields }}
                rules={{}}
                onChange={vi.fn()}
            />
        );
        expect(screen.getByText('Group 1')).toBeTruthy();
        expect(screen.getByLabelText(/Number of Groups/i)).toBeTruthy();
    });

    it('uses custom label from attributes', () => {
        render(
            <FormRepeater
                attributes={{ id: 'r', label: 'Member', subFields, count: 2 }}
                rules={{}}
                onChange={vi.fn()}
            />
        );
        expect(screen.getByText('Member 1')).toBeTruthy();
        expect(screen.getByText('Member 2')).toBeTruthy();
    });
});
