import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GeoField from './geofield';
import { ControlProps } from '../../../types';

describe('GeoField Control', () => {
    const mockOnChange = vi.fn();

    const defaultProps: ControlProps = {
        attributes: {
            id: 'geo',
            label: 'Coordinates',
            value: { lat: '40.7128', lng: '-74.0060' },
        } as any,
        onChange: mockOnChange,
    };

    it('renders the label and lat/lng inputs', () => {
        render(<GeoField {...defaultProps} />);
        expect(screen.getByText('Coordinates')).toBeInTheDocument();
        expect(screen.getByLabelText('Latitude')).toBeInTheDocument();
        expect(screen.getByLabelText('Longitude')).toBeInTheDocument();
    });

    it('fires onChange with an object whose lat matches when latitude changes', () => {
        mockOnChange.mockClear();
        render(<GeoField {...defaultProps} />);
        const latInput = screen.getByLabelText('Latitude');
        fireEvent.change(latInput, { target: { value: '12.5' } });
        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'geo',
                value: expect.objectContaining({ lat: '12.5' }),
            }),
        );
    });

    it('builds an Open in Maps link containing the coordinates', () => {
        render(<GeoField {...defaultProps} />);
        const link = screen.getByRole('link', { name: /Open in Maps/i });
        expect(link).toHaveAttribute('href', 'https://www.google.com/maps?q=40.7128,-74.0060');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('parses a "lat,lng" string value', () => {
        render(
            <GeoField
                attributes={{ id: 'geo', value: '1.5,2.5' } as any}
                onChange={mockOnChange}
            />,
        );
        expect(screen.getByLabelText('Latitude')).toHaveValue(1.5);
        expect(screen.getByLabelText('Longitude')).toHaveValue(2.5);
    });

    it('does not render a map iframe by default', () => {
        const { container } = render(<GeoField {...defaultProps} />);
        expect(container.querySelector('iframe')).toBeNull();
    });
});
