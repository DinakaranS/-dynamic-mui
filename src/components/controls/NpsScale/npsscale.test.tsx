import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NpsScale from './npsscale';
import { ControlProps } from '../../../types';

describe('NpsScale Control', () => {
    const mockOnChange = vi.fn();
    const baseProps: ControlProps = {
        attributes: {
            id: 'test-nps',
            value: '',
            label: 'How likely are you to recommend us?',
            MuiAttributes: {},
        },
        onChange: mockOnChange,
        rules: {},
    };

    it('renders max-min+1 number buttons plus the low/high labels and group label', () => {
        render(<NpsScale {...baseProps} />);
        expect(screen.getByText('How likely are you to recommend us?')).toBeInTheDocument();
        expect(screen.getByText('Not likely')).toBeInTheDocument();
        expect(screen.getByText('Very likely')).toBeInTheDocument();
        // Default 0..10 -> 11 buttons.
        expect(screen.getAllByRole('radio')).toHaveLength(11);
        expect(screen.getByRole('radio', { name: '0' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: '10' })).toBeInTheDocument();
    });

    it('fires onChange with the selected number', () => {
        mockOnChange.mockClear();
        render(<NpsScale {...baseProps} />);
        fireEvent.click(screen.getByRole('radio', { name: '9' }));
        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'test-nps', value: 9 })
        );
    });

    it('renders a custom min/max range', () => {
        render(<NpsScale {...baseProps} attributes={{ id: 'x', value: '', min: 1, max: 5 }} />);
        expect(screen.getAllByRole('radio')).toHaveLength(5);
        expect(screen.getByRole('radio', { name: '1' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: '5' })).toBeInTheDocument();
    });

    it('uses custom low/high labels', () => {
        render(
            <NpsScale
                {...baseProps}
                attributes={{ id: 'x', value: '', lowLabel: 'Bad', highLabel: 'Great' }}
            />
        );
        expect(screen.getByText('Bad')).toBeInTheDocument();
        expect(screen.getByText('Great')).toBeInTheDocument();
    });

    it('shows a required error on submit when mandatory and empty', () => {
        const mandatoryProps: ControlProps = {
            ...baseProps,
            rules: { validation: [{ rule: 'mandatory', message: 'Please choose a score' }] },
        };
        const { rerender } = render(<NpsScale {...mandatoryProps} submitTick={0} />);
        rerender(<NpsScale {...mandatoryProps} submitTick={1} />);
        expect(screen.getByText('Please choose a score')).toBeInTheDocument();
    });
});
