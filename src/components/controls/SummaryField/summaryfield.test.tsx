import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SummaryField from './summaryfield';
import { ControlProps } from '../../../types';

describe('SummaryField Control', () => {
    it('renders the values and their keys', () => {
        const props: ControlProps = {
            attributes: {
                id: 'summary',
                data: { name: 'Ada', role: 'Engineer' },
            } as any,
        };
        render(<SummaryField {...props} />);
        expect(screen.getByText('Ada')).toBeInTheDocument();
        expect(screen.getByText('Engineer')).toBeInTheDocument();
        expect(screen.getByText('name')).toBeInTheDocument();
        expect(screen.getByText('role')).toBeInTheDocument();
    });

    it('renders mapped labels when provided', () => {
        const props: ControlProps = {
            attributes: {
                id: 'summary',
                data: { name: 'Ada' },
                labels: { name: 'Full Name' },
            } as any,
        };
        render(<SummaryField {...props} />);
        expect(screen.getByText('Full Name')).toBeInTheDocument();
        expect(screen.queryByText('name')).not.toBeInTheDocument();
    });

    it('renders the title', () => {
        const props: ControlProps = {
            attributes: {
                id: 'summary',
                data: { name: 'Ada' },
                title: 'Review Details',
            } as any,
        };
        render(<SummaryField {...props} />);
        expect(screen.getByText('Review Details')).toBeInTheDocument();
    });

    it('defaults the title to "Summary"', () => {
        const props: ControlProps = {
            attributes: { id: 'summary', data: { name: 'Ada' } } as any,
        };
        render(<SummaryField {...props} />);
        expect(screen.getByText('Summary')).toBeInTheDocument();
    });

    it('hides empty rows when hideEmpty is set', () => {
        const props: ControlProps = {
            attributes: {
                id: 'summary',
                data: { name: 'Ada', notes: '' },
                hideEmpty: true,
            } as any,
        };
        render(<SummaryField {...props} />);
        expect(screen.getByText('name')).toBeInTheDocument();
        expect(screen.queryByText('notes')).not.toBeInTheDocument();
    });

    it('joins array values and stringifies objects', () => {
        const props: ControlProps = {
            attributes: {
                id: 'summary',
                data: { tags: ['a', 'b'], meta: { x: 1 } },
            } as any,
        };
        render(<SummaryField {...props} />);
        expect(screen.getByText('a, b')).toBeInTheDocument();
        expect(screen.getByText('{"x":1}')).toBeInTheDocument();
    });
});
