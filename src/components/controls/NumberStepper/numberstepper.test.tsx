import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NumberStepper from './numberstepper';
import { ControlProps } from '../../../types';

describe('NumberStepper Control', () => {
    const makeProps = (overrides: Partial<ControlProps['attributes']> = {}): ControlProps => ({
        attributes: {
            id: 'test-stepper',
            value: 2,
            step: 1,
            label: 'Quantity',
            ...overrides,
        },
        onChange: vi.fn(),
        rules: {},
    });

    it('renders the initial value', () => {
        render(<NumberStepper {...makeProps()} />);
        expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    });

    it('increments and fires onChange with value + step when + is clicked', () => {
        const onChange = vi.fn();
        render(<NumberStepper {...makeProps({ step: 3 })} onChange={onChange} />);
        fireEvent.click(screen.getByRole('button', { name: /increment/i }));

        expect(onChange).toHaveBeenCalledWith({ id: 'test-stepper', value: 5 });
        expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    });

    it('decrements and fires onChange with value - step when - is clicked', () => {
        const onChange = vi.fn();
        render(<NumberStepper {...makeProps()} onChange={onChange} />);
        fireEvent.click(screen.getByRole('button', { name: /decrement/i }));

        expect(onChange).toHaveBeenCalledWith({ id: 'test-stepper', value: 1 });
    });

    it('respects max: plus is disabled and does not fire at the max bound', () => {
        const onChange = vi.fn();
        render(<NumberStepper {...makeProps({ value: 5, max: 5 })} onChange={onChange} />);
        const plus = screen.getByRole('button', { name: /increment/i });
        expect(plus).toBeDisabled();
        fireEvent.click(plus);
        expect(onChange).not.toHaveBeenCalled();
    });

    it('respects min: minus is disabled at the min bound', () => {
        render(<NumberStepper {...makeProps({ value: 0, min: 0 })} />);
        expect(screen.getByRole('button', { name: /decrement/i })).toBeDisabled();
    });

    it('clamps typed input to max on blur', () => {
        const onChange = vi.fn();
        render(<NumberStepper {...makeProps({ value: 1, max: 10 })} onChange={onChange} />);
        const input = screen.getByDisplayValue('1');
        fireEvent.change(input, { target: { value: '99' } });
        fireEvent.blur(input);
        expect(onChange).toHaveBeenCalledWith({ id: 'test-stepper', value: 10 });
        expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    });
});
