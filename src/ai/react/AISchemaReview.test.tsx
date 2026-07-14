import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AISchemaReview from './AISchemaReview';

const schema = [
    { type: 'textfield', props: { id: 'email', MuiAttributes: { label: 'Email' } }, layout: { row: 1, xs: 12 } },
];

const result = {
    issues: [
        { field: 'email', kind: 'validation', severity: 'warning', message: 'Add an email rule' },
    ],
    improved: [
        { type: 'textfield', props: { id: 'email', MuiAttributes: { label: 'Email' } }, layout: { row: 1, xs: 12 } },
    ],
};

describe('AISchemaReview', () => {
    it('renders the review button', () => {
        const client = { reviewForm: vi.fn().mockResolvedValue(result) } as any;
        render(<AISchemaReview client={client} schema={schema as any} />);

        expect(screen.getByRole('button', { name: 'Review with AI' })).toBeTruthy();
    });

    it('calls reviewForm(schema) and renders the issue message when clicked', async () => {
        const client = { reviewForm: vi.fn().mockResolvedValue(result) } as any;
        render(<AISchemaReview client={client} schema={schema as any} />);

        fireEvent.click(screen.getByRole('button', { name: 'Review with AI' }));

        await waitFor(() => {
            expect(client.reviewForm).toHaveBeenCalledWith(schema);
            expect(screen.getByText('Add an email rule')).toBeTruthy();
        });
    });

    it('calls onApply with result.improved when "Apply improvements" is clicked', async () => {
        const client = { reviewForm: vi.fn().mockResolvedValue(result) } as any;
        const onApply = vi.fn();
        render(<AISchemaReview client={client} schema={schema as any} onApply={onApply} />);

        fireEvent.click(screen.getByRole('button', { name: 'Review with AI' }));

        const applyButton = await screen.findByRole('button', { name: 'Apply improvements' });
        fireEvent.click(applyButton);

        expect(onApply).toHaveBeenCalledWith(result.improved);
    });

    it('shows a "No issues found" success Alert when there are no issues', async () => {
        const client = { reviewForm: vi.fn().mockResolvedValue({ issues: [] }) } as any;
        render(<AISchemaReview client={client} schema={schema as any} />);

        fireEvent.click(screen.getByRole('button', { name: 'Review with AI' }));

        await waitFor(() => {
            expect(screen.getByText('No issues found')).toBeTruthy();
        });
    });
});
