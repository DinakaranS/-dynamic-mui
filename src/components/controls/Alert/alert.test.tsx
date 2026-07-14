import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Alert from './alert';

describe('Alert Control', () => {
    it('renders the message text', () => {
        render(<Alert attributes={{ text: 'Something happened' }} />);
        expect(screen.getByText('Something happened')).toBeInTheDocument();
    });

    it('accepts `message` as an alias for the body', () => {
        render(<Alert attributes={{ message: 'From message prop' }} />);
        expect(screen.getByText('From message prop')).toBeInTheDocument();
    });

    it('renders the title when provided', () => {
        render(<Alert attributes={{ title: 'Heads up', text: 'Details here' }} />);
        expect(screen.getByText('Heads up')).toBeInTheDocument();
        expect(screen.getByText('Details here')).toBeInTheDocument();
    });

    it('applies the given severity', () => {
        render(<Alert attributes={{ severity: 'warning', text: 'Careful' }} />);
        const alert = screen.getByRole('alert');
        expect(alert.className).toContain('MuiAlert-standardWarning');
    });
});
