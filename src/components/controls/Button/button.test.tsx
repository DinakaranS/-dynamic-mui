import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from './button';

describe('Button control', () => {
    it('renders the provided text', () => {
        render(<Button attributes={{ text: 'Save' }} />);
        expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
    });

    it('renders the default text when none is provided', () => {
        render(<Button attributes={{}} />);
        expect(screen.getByRole('button', { name: 'Button' })).toBeTruthy();
    });

    it('fires onChange with value "click" and option "button" by default', () => {
        const onChange = vi.fn();
        render(<Button attributes={{ id: 'btn1', text: 'Go' }} onChange={onChange} />);
        fireEvent.click(screen.getByRole('button', { name: 'Go' }));
        expect(onChange).toHaveBeenCalledWith({ id: 'btn1', value: 'click', option: 'button' });
    });

    it('fires onChange with the given action as option and sets the type', () => {
        const onChange = vi.fn();
        render(<Button attributes={{ id: 'btn2', text: 'Submit', action: 'submit' }} onChange={onChange} />);
        const btn = screen.getByRole('button', { name: 'Submit' }) as HTMLButtonElement;
        expect(btn.type).toBe('submit');
        fireEvent.click(btn);
        expect(onChange).toHaveBeenCalledWith({ id: 'btn2', value: 'click', option: 'submit' });
    });

    it('honors a variant passed via MuiAttributes', () => {
        render(<Button attributes={{ text: 'Outlined', MuiAttributes: { variant: 'outlined' } }} />);
        const btn = screen.getByRole('button', { name: 'Outlined' });
        expect(btn.className).toContain('MuiButton-outlined');
    });
});
