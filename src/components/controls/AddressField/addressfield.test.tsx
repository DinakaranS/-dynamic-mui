import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AddressField from './addressfield';
import { ControlProps } from '../../../types';

const baseProps = (overrides: Partial<ControlProps> = {}): ControlProps => ({
    attributes: {
        id: 'addr',
        value: {},
        ...(overrides.attributes || {}),
    },
    onChange: overrides.onChange,
    rules: overrides.rules || {},
});

describe('AddressField Control', () => {
    it('renders the sub-fields (city, state, postal code, country)', () => {
        render(<AddressField {...baseProps()} />);
        expect(screen.getByLabelText('City')).toBeInTheDocument();
        expect(screen.getByLabelText('State / Province')).toBeInTheDocument();
        expect(screen.getByLabelText('Postal code')).toBeInTheDocument();
        expect(screen.getByLabelText('Country')).toBeInTheDocument();
    });

    it('typing into city fires onChange with the merged address object', () => {
        const onChange = vi.fn();
        render(
            <AddressField
                {...baseProps({
                    onChange,
                    attributes: { id: 'addr', value: { street1: '1 Main St' } },
                })}
            />,
        );

        fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Fresno' } });

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'addr',
                value: expect.objectContaining({ street1: '1 Main St', city: 'Fresno' }),
            }),
        );
    });

    it('renders the country Select options', () => {
        render(
            <AddressField
                {...baseProps({
                    attributes: {
                        id: 'addr',
                        value: {},
                        countries: [
                            { value: 'US', label: 'United States' },
                            { value: 'CA', label: 'Canada' },
                        ],
                    },
                })}
            />,
        );

        fireEvent.mouseDown(screen.getByLabelText('Country'));
        const listbox = within(screen.getByRole('listbox'));
        expect(listbox.getByText('United States')).toBeInTheDocument();
        expect(listbox.getByText('Canada')).toBeInTheDocument();
    });
});
