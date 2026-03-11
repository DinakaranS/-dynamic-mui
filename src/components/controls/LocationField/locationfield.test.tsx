import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LocationField from './locationfield';
import { ControlProps } from '../../../types';

describe('LocationField Control', () => {
    const mockOnChange = vi.fn();

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    const defaultProps: ControlProps = {
        attributes: {
            id: 'test-location',
            value: '123 Main Street',
            buttonText: 'Update Location',
            buttonDisplay: 'both',
            MuiAttributes: { label: 'Address' }
        },
        onChange: mockOnChange,
        rules: {}
    };

    it('renders with initial address value', () => {
        render(<LocationField {...defaultProps} />);
        expect(screen.getByDisplayValue('123 Main Street')).toBeInTheDocument();
    });

    it('renders the button with text', () => {
        render(<LocationField {...defaultProps} />);
        expect(screen.getByText('Update Location')).toBeInTheDocument();
    });

    it('calls onChange with location_update_request on button click', () => {
        render(<LocationField {...defaultProps} />);
        const button = screen.getByRole('button', { name: /Update Location/i });
        fireEvent.click(button);
        expect(mockOnChange).toHaveBeenCalledWith({
            id: 'test-location',
            value: '123 Main Street',
            option: 'location_update_request'
        });
    });

    it('updates text field on user input', () => {
        render(<LocationField {...defaultProps} />);
        const input = screen.getByDisplayValue('123 Main Street');
        fireEvent.change(input, { target: { value: '456 Oak Avenue' } });
        expect(screen.getByDisplayValue('456 Oak Avenue')).toBeInTheDocument();
    });

    it('calls onChange on blur with updated value', () => {
        render(<LocationField {...defaultProps} />);
        const input = screen.getByDisplayValue('123 Main Street');
        fireEvent.change(input, { target: { value: '456 Oak Avenue' } });
        fireEvent.blur(input);
        expect(mockOnChange).toHaveBeenCalledWith({
            id: 'test-location',
            value: '456 Oak Avenue'
        });
    });

    it('sends current value on button click after editing', () => {
        render(<LocationField {...defaultProps} />);
        const input = screen.getByDisplayValue('123 Main Street');
        fireEvent.change(input, { target: { value: '456 Oak Avenue' } });

        const button = screen.getByRole('button', { name: /Update Location/i });
        fireEvent.click(button);
        expect(mockOnChange).toHaveBeenCalledWith({
            id: 'test-location',
            value: '456 Oak Avenue',
            option: 'location_update_request'
        });
    });

    it('renders icon-only button when buttonDisplay is "icon"', () => {
        const iconProps: ControlProps = {
            ...defaultProps,
            attributes: {
                ...defaultProps.attributes,
                buttonDisplay: 'icon'
            }
        };
        render(<LocationField {...iconProps} />);
        expect(screen.queryByText('Update Location')).not.toBeInTheDocument();
        const icons = screen.getAllByText('location_on');
        expect(icons.length).toBeGreaterThanOrEqual(1);
    });

    it('renders text-only button when buttonDisplay is "text"', () => {
        const textProps: ControlProps = {
            ...defaultProps,
            attributes: {
                ...defaultProps.attributes,
                buttonDisplay: 'text'
            }
        };
        render(<LocationField {...textProps} />);
        expect(screen.getByText('Update Location')).toBeInTheDocument();
    });

    it('disables both field and button when disabled', () => {
        const disabledProps: ControlProps = {
            ...defaultProps,
            attributes: {
                ...defaultProps.attributes,
                disabled: true
            }
        };
        const { container } = render(<LocationField {...disabledProps} />);
        const input = container.querySelector('input');
        const button = screen.getByRole('button');
        expect(input).toBeDisabled();
        expect(button).toBeDisabled();
    });

    it('renders with empty value', () => {
        const emptyProps: ControlProps = {
            attributes: {
                id: 'empty-location',
                value: '',
                MuiAttributes: { label: 'Address' }
            },
            onChange: mockOnChange,
            rules: {}
        };
        render(<LocationField {...emptyProps} />);
        const input = screen.getByLabelText('Address');
        expect(input).toHaveValue('');
    });

    it('shows validation error for mandatory field when empty', () => {
        const mandatoryProps: ControlProps = {
            ...defaultProps,
            attributes: {
                ...defaultProps.attributes,
                value: ''
            },
            rules: {
                validation: [{ rule: 'mandatory', message: 'Address is required' }]
            }
        };
        render(<LocationField {...mandatoryProps} />);
        const input = screen.getByLabelText(/Address/i);
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.blur(input);
        expect(screen.getByText('Address is required')).toBeInTheDocument();
    });

    it('marks field as required when mandatory rule is set', () => {
        const mandatoryProps: ControlProps = {
            ...defaultProps,
            rules: {
                validation: [{ rule: 'mandatory', message: 'Required' }]
            }
        };
        const { container } = render(<LocationField {...mandatoryProps} />);
        const input = container.querySelector('input[required]');
        expect(input).toBeInTheDocument();
    });
});
