import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import IntlPhone from './intlphone';
import { ControlProps } from '../../../types';

describe('IntlPhone Control', () => {
    const makeProps = (overrides: Partial<ControlProps['attributes']> = {}): ControlProps => ({
        attributes: {
            id: 'test-phone',
            label: 'Mobile',
            ...overrides,
        },
        onChange: vi.fn(),
        rules: {},
    });

    it('renders the country selector defaulting to US and a number input', () => {
        render(<IntlPhone {...makeProps()} />);
        // renderValue shows the US flag + dial code
        expect(screen.getByText('🇺🇸 +1')).toBeInTheDocument();
        expect(screen.getByLabelText('Phone number')).toBeInTheDocument();
    });

    it('fires onChange with dial code + digits and option.dial when typing a number', () => {
        const onChange = vi.fn();
        render(<IntlPhone {...makeProps()} onChange={onChange} />);
        fireEvent.change(screen.getByLabelText('Phone number'), {
            target: { value: '5551234567' },
        });

        expect(onChange).toHaveBeenCalled();
        const lastArg = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(lastArg.id).toBe('test-phone');
        expect(lastArg.value).toContain('+1');
        expect(lastArg.value).toContain('5551234567');
        expect(lastArg.option.dial).toBe('+1');
        expect(lastArg.option.number).toBe('5551234567');
    });

    it('updates the emitted dial code when the country changes', () => {
        const onChange = vi.fn();
        render(<IntlPhone {...makeProps()} onChange={onChange} />);

        // Open the MUI select and choose India
        fireEvent.mouseDown(screen.getByRole('combobox'));
        const listbox = within(screen.getByRole('listbox'));
        fireEvent.click(listbox.getByText(/India/));

        const lastArg = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(lastArg.option.dial).toBe('+91');
        expect(lastArg.option.country).toBe('IN');
        expect(lastArg.value.startsWith('+91')).toBe(true);
    });

    it('honors defaultCountry', () => {
        render(<IntlPhone {...makeProps({ defaultCountry: 'GB' })} />);
        expect(screen.getByText('🇬🇧 +44')).toBeInTheDocument();
    });
});
