import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LineItemList from './lineitemlist';

const defaultProps = {
    attributes: { id: 'lineitemlist' },
    rules: {},
    onChange: vi.fn(),
};

describe('LineItemList', () => {
    // ─── Rendering ────────────────────────────────────────────────────────────

    it('renders one empty row by default when no value is patched', () => {
        render(<LineItemList {...defaultProps} />);
        expect(screen.getAllByLabelText(/Description/i)).toHaveLength(1);
        expect(screen.getAllByLabelText(/Fee/i)).toHaveLength(1);
    });

    it('renders correct number of rows from a patched array value', () => {
        const patch = [
            { fee: 10, miscellaneous1: 'qwerty' },
            { fee: 20, miscellaneous2: 'Keypad' },
            { fee: 0, miscellaneous3: 'Lion' },
        ];
        render(
            <LineItemList
                attributes={{ id: 'lineitemlist', value: patch }}
                rules={{}}
                onChange={vi.fn()}
            />
        );
        expect(screen.getAllByLabelText(/Description/i)).toHaveLength(3);
        expect(screen.getAllByLabelText(/Fee/i)).toHaveLength(3);
    });

    it('pre-fills description and fee values from the patch', () => {
        const patch = [{ fee: 42, miscellaneous1: 'Hello' }];
        render(
            <LineItemList
                attributes={{ id: 'lineitemlist', value: patch }}
                rules={{}}
                onChange={vi.fn()}
            />
        );
        const descInput = screen.getByLabelText(/Description/i) as HTMLInputElement;
        const feeInput = screen.getByLabelText(/Fee/i) as HTMLInputElement;
        expect(descInput.value).toBe('Hello');
        expect(feeInput.value).toBe('42');
    });

    // ─── Dynamic key prefix ───────────────────────────────────────────────────

    it('derives key prefix from patch data (miscellaneous)', async () => {
        const mockOnChange = vi.fn();
        const patch = [{ fee: 0, miscellaneous1: 'Alpha' }];
        render(
            <LineItemList
                attributes={{ id: 'lineitemlist', value: patch }}
                rules={{}}
                onChange={mockOnChange}
            />
        );
        // Add a row and check the new key uses the same prefix
        fireEvent.click(screen.getByTitle('Add row'));
        await waitFor(() => {
            const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
            expect(lastCall.value[1]).toHaveProperty('miscellaneous2');
        });
    });

    it('derives key prefix from patch data (charge)', async () => {
        const mockOnChange = vi.fn();
        const patch = [{ fee: 5, charge1: 'Delivery' }, { fee: 10, charge2: 'Tax' }];
        render(
            <LineItemList
                attributes={{ id: 'lineitemlist', value: patch }}
                rules={{}}
                onChange={mockOnChange}
            />
        );
        fireEvent.click(screen.getByTitle('Add row'));
        await waitFor(() => {
            const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
            // New row should use the same "charge" prefix
            expect(lastCall.value[2]).toHaveProperty('charge3');
        });
    });

    it('uses keyPrefix prop as fallback when no patch is provided', async () => {
        const mockOnChange = vi.fn();
        render(
            <LineItemList
                attributes={{ id: 'lineitemlist', keyPrefix: 'expense' }}
                rules={{}}
                onChange={mockOnChange}
            />
        );
        await waitFor(() => {
            const firstCall = mockOnChange.mock.calls[0][0];
            expect(firstCall.value[0]).toHaveProperty('expense1');
        });
    });

    it('falls back to "item" prefix when neither patch nor keyPrefix is given', async () => {
        const mockOnChange = vi.fn();
        render(<LineItemList {...defaultProps} onChange={mockOnChange} />);
        await waitFor(() => {
            const firstCall = mockOnChange.mock.calls[0][0];
            expect(firstCall.value[0]).toHaveProperty('item1');
        });
    });

    // ─── Add / Remove ─────────────────────────────────────────────────────────

    it('adds a new row when the Add (+) button is clicked', async () => {
        render(<LineItemList {...defaultProps} />);
        fireEvent.click(screen.getByTitle('Add row'));
        await waitFor(() => {
            expect(screen.getAllByLabelText(/Description/i)).toHaveLength(2);
        });
    });

    it('removes a row when the Delete button is clicked', async () => {
        const patch = [
            { fee: 0, miscellaneous1: 'Row 1' },
            { fee: 0, miscellaneous2: 'Row 2' },
        ];
        render(
            <LineItemList
                attributes={{ id: 'lineitemlist', value: patch }}
                rules={{}}
                onChange={vi.fn()}
            />
        );
        fireEvent.click(screen.getByTitle('Remove row'));
        await waitFor(() => {
            expect(screen.getAllByLabelText(/Description/i)).toHaveLength(1);
        });
    });

    // ─── onChange output ──────────────────────────────────────────────────────

    it('calls onChange with correct array format when description is edited', async () => {
        const mockOnChange = vi.fn();
        const patch = [{ fee: 0, invoice1: '' }];
        render(
            <LineItemList
                attributes={{ id: 'lineitemlist', value: patch }}
                rules={{}}
                onChange={mockOnChange}
            />
        );
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New Item' } });

        await waitFor(() => {
            const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
            expect(lastCall.id).toBe('lineitemlist');
            expect(Array.isArray(lastCall.value)).toBe(true);
            expect(lastCall.value[0]).toMatchObject({ invoice1: 'New Item' });
        });
    });

    it('calls onChange with correct fee value when fee is changed', async () => {
        const mockOnChange = vi.fn();
        render(<LineItemList {...defaultProps} onChange={mockOnChange} />);
        fireEvent.change(screen.getByLabelText(/Fee/i), { target: { value: '99' } });

        await waitFor(() => {
            const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
            expect(lastCall.value[0].fee).toBe(99);
        });
    });

    // ─── Key re-sequencing after remove ───────────────────────────────────────

    it('re-sequences keys after removing a row', async () => {
        const mockOnChange = vi.fn();
        const patch = [
            { fee: 1, miscellaneous1: 'a' },
            { fee: 2, miscellaneous2: 'b' },
            { fee: 3, miscellaneous3: 'c' },
        ];
        render(
            <LineItemList
                attributes={{ id: 'lineitemlist', value: patch }}
                rules={{}}
                onChange={mockOnChange}
            />
        );

        const removeBtns = screen.getAllByTitle('Remove row');
        fireEvent.click(removeBtns[0]); // remove first row

        await waitFor(() => {
            const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
            // Remaining 2 rows should re-key to 1 and 2
            expect(lastCall.value[0]).toHaveProperty('miscellaneous1');
            expect(lastCall.value[1]).toHaveProperty('miscellaneous2');
        });
    });
});
