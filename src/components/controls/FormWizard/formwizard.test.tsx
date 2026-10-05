import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FormWizard from './formwizard';

const steps = [
    {
        label: 'First Step',
        fields: [
            {
                type: 'textfield',
                props: { id: 'a', MuiAttributes: { label: 'Step One Field' } },
                layout: { row: 1, xs: 12 },
            },
        ],
    },
    {
        label: 'Second Step',
        fields: [
            {
                type: 'textfield',
                props: { id: 'b', MuiAttributes: { label: 'Step Two Field' } },
                layout: { row: 1, xs: 12 },
            },
        ],
    },
];

describe('FormWizard', () => {
    it('renders both step labels and the first step field', () => {
        render(<FormWizard attributes={{ id: 'wiz', guid: 'g1', steps } as any} />);
        expect(screen.getByText('First Step')).toBeTruthy();
        expect(screen.getByText('Second Step')).toBeTruthy();
        expect(screen.getByLabelText('Step One Field')).toBeTruthy();
        expect(screen.queryByLabelText('Step Two Field')).toBeNull();
    });

    it('advances to the second step field on Next', () => {
        render(<FormWizard attributes={{ id: 'wiz', guid: 'g2', steps } as any} />);
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        expect(screen.getByLabelText('Step Two Field')).toBeTruthy();
        expect(screen.queryByLabelText('Step One Field')).toBeNull();
    });

    it('returns to the first step field on Back', () => {
        render(<FormWizard attributes={{ id: 'wiz', guid: 'g3', steps } as any} />);
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        expect(screen.getByLabelText('Step Two Field')).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Back' }));
        expect(screen.getByLabelText('Step One Field')).toBeTruthy();
    });

    it('shows the finish label on the last step and fires complete on finish', () => {
        const onChange = vi.fn();
        render(
            <FormWizard
                attributes={{ id: 'wiz', guid: 'g4', steps, finishLabel: 'Done' } as any}
                onChange={onChange}
            />,
        );
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        const finishBtn = screen.getByRole('button', { name: 'Done' });
        expect(finishBtn).toBeTruthy();
        fireEvent.click(finishBtn);
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'wiz', value: 'complete', option: 1 }),
        );
    });

    it('disables Back on the first step', () => {
        render(<FormWizard attributes={{ id: 'wiz', guid: 'g5', steps } as any} />);
        expect(screen.getByRole('button', { name: 'Back' })).toHaveProperty('disabled', true);
    });

    it('with validateSteps, blocks Next until the current step is valid', () => {
        const gatedSteps = [
            {
                label: 'First Step',
                fields: [
                    {
                        type: 'textfield',
                        props: { id: 'a', MuiAttributes: { label: 'Required Field' } },
                        rules: { validation: [{ rule: 'mandatory', message: 'Required' }] },
                        layout: { row: 1, xs: 12 },
                    },
                ],
            },
            steps[1],
        ];
        render(<FormWizard attributes={{ id: 'wiz', guid: 'g6', steps: gatedSteps, validateSteps: true } as any} />);

        // Empty required field → Next is blocked, still on step one.
        // (Regex matcher: a required field's label carries an asterisk.)
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        expect(screen.getByLabelText(/Required Field/)).toBeTruthy();
        expect(screen.queryByLabelText('Step Two Field')).toBeNull();

        // Fill it → Next now advances.
        const input = screen.getByLabelText(/Required Field/);
        fireEvent.change(input, { target: { value: 'ok' } });
        fireEvent.blur(input);
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        expect(screen.getByLabelText('Step Two Field')).toBeTruthy();
    });
});
