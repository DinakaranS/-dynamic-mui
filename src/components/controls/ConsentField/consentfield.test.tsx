import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConsentField from './consentfield';
import { ControlProps } from '../../../types';

describe('ConsentField Control', () => {
    const baseProps: ControlProps = {
        attributes: {
            id: 'terms',
            text: 'These are the terms and conditions you must accept.',
            label: 'I accept the terms',
            requireScroll: false,
        },
        onChange: vi.fn(),
        rules: {},
    };

    it('renders the terms text and the checkbox', () => {
        render(<ConsentField {...baseProps} />);
        expect(
            screen.getByText('These are the terms and conditions you must accept.')
        ).toBeInTheDocument();
        expect(screen.getByLabelText('consent-agree')).toBeInTheDocument();
        expect(screen.getByText('I accept the terms')).toBeInTheDocument();
    });

    it('with requireScroll:false the checkbox is enabled and checking fires onChange(true)', () => {
        const onChange = vi.fn();
        render(<ConsentField {...baseProps} onChange={onChange} />);
        const checkbox = screen.getByLabelText('consent-agree') as HTMLInputElement;
        expect(checkbox).not.toBeDisabled();
        fireEvent.click(checkbox);
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'terms', value: true })
        );
    });

    it('with requireScroll:true the checkbox starts disabled', () => {
        const props: ControlProps = {
            ...baseProps,
            attributes: { ...baseProps.attributes, requireScroll: true },
        };
        render(<ConsentField {...props} />);
        expect(screen.getByLabelText('consent-agree')).toBeDisabled();
    });

    it('becomes enabled after a scroll event reaching the bottom', () => {
        const props: ControlProps = {
            ...baseProps,
            attributes: { ...baseProps.attributes, requireScroll: true },
        };
        render(<ConsentField {...props} />);
        const box = screen.getByTestId('consent-terms');

        // Simulate the terms box scrolled to the bottom.
        Object.defineProperty(box, 'scrollHeight', { value: 500, configurable: true });
        Object.defineProperty(box, 'clientHeight', { value: 200, configurable: true });
        Object.defineProperty(box, 'scrollTop', { value: 300, configurable: true });
        fireEvent.scroll(box);

        expect(screen.getByLabelText('consent-agree')).not.toBeDisabled();
    });

    it('renders mandatory asterisk', () => {
        const props: ControlProps = {
            ...baseProps,
            rules: { validation: [{ rule: 'mandatory', message: 'Required' }] },
        };
        render(<ConsentField {...props} />);
        expect(screen.getAllByText('*').length).toBeGreaterThan(0);
    });
});
