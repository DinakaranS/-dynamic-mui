import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DateRangePicker from './daterangepicker';
import { ControlProps } from '../../../types';

describe('DateRangePicker Control', () => {
    const defaultProps: ControlProps = {
        attributes: { id: 'test-range' },
        rules: {},
    };

    it('renders Start and End labeled inputs', () => {
        const { container } = render(<DateRangePicker {...defaultProps} />);
        expect(screen.getAllByText('Start').length).toBeGreaterThan(0);
        expect(screen.getAllByText('End').length).toBeGreaterThan(0);
        // two picker fields render as role="group"
        expect(container.querySelectorAll('[role="group"]').length).toBe(2);
    });

    it('renders custom labels when provided', () => {
        render(
            <DateRangePicker
                attributes={{ id: 'r', startLabel: 'From', endLabel: 'To' }}
                rules={{}}
            />,
        );
        expect(screen.getAllByText('From').length).toBeGreaterThan(0);
        expect(screen.getAllByText('To').length).toBeGreaterThan(0);
    });

    it('renders required asterisks when mandatory', () => {
        const { container } = render(
            <DateRangePicker
                attributes={{ id: 'r' }}
                rules={{ validation: [{ rule: 'mandatory', message: 'Required' }] }}
            />,
        );
        // one asterisk per required field (Start + End)
        expect(container.querySelectorAll('.MuiFormLabel-asterisk').length).toBe(2);
    });

    it('keeps both fields present when a range value is supplied', () => {
        const { container } = render(
            <DateRangePicker
                attributes={{ id: 'r', value: { start: '2023-01-01', end: '2023-01-05' } }}
                rules={{}}
            />,
        );
        expect(screen.getAllByText('Start').length).toBeGreaterThan(0);
        expect(screen.getAllByText('End').length).toBeGreaterThan(0);
        expect(container.querySelectorAll('[role="group"]').length).toBe(2);
    });

    it('accepts the "start~end" string value shape', () => {
        const { container } = render(
            <DateRangePicker
                attributes={{ id: 'r', value: '01/01/2023~01/05/2023' }}
                rules={{}}
            />,
        );
        expect(container.querySelectorAll('[role="group"]').length).toBe(2);
    });
});
