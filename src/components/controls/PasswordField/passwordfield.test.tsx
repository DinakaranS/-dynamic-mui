import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PasswordField from './passwordfield';
import { ControlProps } from '../../../types';

describe('PasswordField Control', () => {
    const makeProps = (overrides: Partial<ControlProps> = {}): ControlProps => ({
        attributes: {
            id: 'pwd',
            value: '',
            MuiAttributes: {
                label: 'Password',
                placeholder: 'Enter password',
            },
        },
        onChange: vi.fn(),
        ...overrides,
    });

    it('renders a password-type input initially', () => {
        const { container } = render(<PasswordField {...makeProps()} />);
        const input = container.querySelector('input') as HTMLInputElement;
        expect(input).toBeInTheDocument();
        expect(input.getAttribute('type')).toBe('password');
    });

    it('toggles input type to text when the visibility button is clicked', () => {
        const { container } = render(<PasswordField {...makeProps()} />);
        const input = container.querySelector('input') as HTMLInputElement;
        expect(input.getAttribute('type')).toBe('password');
        const toggle = screen.getByRole('button', { name: /show password/i });
        fireEvent.click(toggle);
        expect(input.getAttribute('type')).toBe('text');
    });

    it('fires onChange on blur with the typed value', () => {
        const onChange = vi.fn();
        const { container } = render(<PasswordField {...makeProps({ onChange })} />);
        const input = container.querySelector('input') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'Secret123!' } });
        fireEvent.blur(input);
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'pwd', value: 'Secret123!' }),
        );
    });

    it('renders a strength progress bar when showStrength is true', () => {
        const props = makeProps();
        (props.attributes as any).showStrength = true;
        (props.attributes as any).value = 'Secret123!';
        const { container } = render(<PasswordField {...props} />);
        expect(container.querySelector('.MuiLinearProgress-root')).toBeInTheDocument();
    });
});
