import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OtpField from './otpfield';
import { ControlProps } from '../../../types';

describe('OtpField Control', () => {
    const makeProps = (overrides: Partial<ControlProps> = {}): ControlProps => ({
        attributes: {
            id: 'otp',
            value: '',
            length: 6,
            label: 'One-time code',
        },
        onChange: vi.fn(),
        ...overrides,
    });

    it('renders exactly `length` inputs', () => {
        const { container } = render(<OtpField {...makeProps()} />);
        expect(container.querySelectorAll('input')).toHaveLength(6);
    });

    it('renders a custom length', () => {
        const props = makeProps();
        (props.attributes as any).length = 4;
        const { container } = render(<OtpField {...props} />);
        expect(container.querySelectorAll('input')).toHaveLength(4);
    });

    it('fires onChange with a growing concatenated value as digits are typed', () => {
        const onChange = vi.fn();
        const { container } = render(<OtpField {...makeProps({ onChange })} />);
        const inputs = container.querySelectorAll('input');
        fireEvent.change(inputs[0], { target: { value: '1' } });
        fireEvent.change(inputs[1], { target: { value: '2' } });
        expect(onChange).toHaveBeenCalled();
        const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(lastCall.id).toBe('otp');
        expect(lastCall.value).toContain('12');
    });

    it('renders the label', () => {
        render(<OtpField {...makeProps()} />);
        expect(screen.getByText('One-time code')).toBeInTheDocument();
    });
});
