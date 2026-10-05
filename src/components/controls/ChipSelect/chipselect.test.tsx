import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChipSelect from './chipselect';
import { ControlProps } from '../../../types';

const OPTIONS = [
    { value: 'design', label: 'Design' },
    { value: 'dev', label: 'Development' },
    { value: 'sales', label: 'Sales' },
];

const clickChip = (labelText: string) => {
    fireEvent.click(screen.getByText(labelText));
};

describe('ChipSelect Control', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    describe('rendering & configuration', () => {
        it('renders every configured option as a chip', () => {
            render(<ChipSelect attributes={{ id: 'c', options: OPTIONS }} onChange={onChange} />);
            expect(screen.getByText('Design')).toBeInTheDocument();
            expect(screen.getByText('Development')).toBeInTheDocument();
            expect(screen.getByText('Sales')).toBeInTheDocument();
        });

        it('renders the group label', () => {
            render(<ChipSelect attributes={{ id: 'c', label: 'Pick one', options: OPTIONS }} onChange={onChange} />);
            expect(screen.getByText('Pick one')).toBeInTheDocument();
        });

        it('supports plain string options', () => {
            render(<ChipSelect attributes={{ id: 'c', options: ['Red', 'Green', 'Blue'] }} onChange={onChange} />);
            expect(screen.getByText('Red')).toBeInTheDocument();
            expect(screen.getByText('Blue')).toBeInTheDocument();
        });

        it('shows an empty-state message when no options are configured', () => {
            render(<ChipSelect attributes={{ id: 'c', options: [] }} onChange={onChange} />);
            expect(screen.getByText(/no options configured/i)).toBeInTheDocument();
        });

        it('does not select or fire onChange for a disabled option', () => {
            const opts = [{ value: 'a', label: 'Alpha', disabled: true }];
            render(<ChipSelect attributes={{ id: 'c', options: opts }} onChange={onChange} />);
            clickChip('Alpha');
            expect(onChange).not.toHaveBeenCalled();
        });
    });

    describe('single select mode', () => {
        const single: ControlProps = {
            attributes: { id: 'plan', multiple: false, options: OPTIONS },
            onChange,
        };

        it('selects an option and emits the scalar value + option object', () => {
            render(<ChipSelect {...single} />);
            clickChip('Design');
            expect(onChange).toHaveBeenCalledWith({
                id: 'plan',
                value: 'design',
                option: { label: 'Design', value: 'design', icon: undefined, color: undefined, disabled: undefined },
            });
        });

        it('replaces the selection when another chip is clicked', () => {
            render(<ChipSelect {...single} />);
            clickChip('Design');
            clickChip('Sales');
            expect(onChange).toHaveBeenLastCalledWith(
                expect.objectContaining({ id: 'plan', value: 'sales' }),
            );
        });

        it('deselects when clicking the selected chip (allowDeselect default)', () => {
            render(<ChipSelect {...single} />);
            clickChip('Design');
            clickChip('Design');
            expect(onChange).toHaveBeenLastCalledWith(
                expect.objectContaining({ id: 'plan', value: '', option: null }),
            );
        });

        it('keeps the selection when allowDeselect is false', () => {
            render(<ChipSelect attributes={{ id: 'plan', multiple: false, allowDeselect: false, options: OPTIONS }} onChange={onChange} />);
            clickChip('Design');
            clickChip('Design');
            expect(onChange).toHaveBeenLastCalledWith(
                expect.objectContaining({ value: 'design' }),
            );
        });

        it('hydrates the initial selection from a scalar value', () => {
            render(<ChipSelect attributes={{ id: 'plan', multiple: false, value: 'dev', options: OPTIONS }} onChange={onChange} />);
            const chip = screen.getByText('Development').closest('.MuiChip-root');
            expect(chip?.className).toContain('MuiChip-filled');
        });
    });

    describe('multi select mode', () => {
        const multi: ControlProps = {
            attributes: { id: 'tags', multiple: true, options: OPTIONS },
            onChange,
        };

        it('accumulates selections and emits an array value', () => {
            render(<ChipSelect {...multi} />);
            clickChip('Design');
            clickChip('Sales');
            expect(onChange).toHaveBeenLastCalledWith(
                expect.objectContaining({ id: 'tags', value: ['design', 'sales'] }),
            );
        });

        it('emits the array of matching option objects', () => {
            render(<ChipSelect {...multi} />);
            clickChip('Design');
            const call = onChange.mock.calls[0][0];
            expect(call.option).toEqual([
                { label: 'Design', value: 'design', icon: undefined, color: undefined, disabled: undefined },
            ]);
        });

        it('removes an already-selected value on second click', () => {
            render(<ChipSelect {...multi} />);
            clickChip('Design');
            clickChip('Sales');
            clickChip('Design');
            expect(onChange).toHaveBeenLastCalledWith(
                expect.objectContaining({ value: ['sales'] }),
            );
        });

        it('hydrates an array value', () => {
            render(<ChipSelect attributes={{ id: 'tags', multiple: true, value: ['design', 'sales'], options: OPTIONS }} onChange={onChange} />);
            expect(screen.getByText('Design').closest('.MuiChip-root')?.className).toContain('MuiChip-filled');
            expect(screen.getByText('Sales').closest('.MuiChip-root')?.className).toContain('MuiChip-filled');
            expect(screen.getByText('Development').closest('.MuiChip-root')?.className).toContain('MuiChip-outlined');
        });

        it('hydrates a separator-joined string value', () => {
            render(<ChipSelect attributes={{ id: 'tags', multiple: true, value: 'design;sales', options: OPTIONS }} onChange={onChange} />);
            expect(screen.getByText('Design').closest('.MuiChip-root')?.className).toContain('MuiChip-filled');
            expect(screen.getByText('Sales').closest('.MuiChip-root')?.className).toContain('MuiChip-filled');
        });
    });

    describe('validation', () => {
        it('marks the group required when a mandatory rule is present', () => {
            render(
                <ChipSelect
                    attributes={{ id: 'c', label: 'Interests', options: OPTIONS }}
                    rules={{ validation: [{ rule: 'mandatoryselect', message: 'Required' }] }}
                    onChange={onChange}
                />,
            );
            expect(screen.getByText('Interests').className).toContain('Mui-required');
        });

        it('shows an error when a mandatory single-select is deselected back to empty', () => {
            render(
                <ChipSelect
                    attributes={{ id: 'c', multiple: false, options: OPTIONS }}
                    rules={{ validation: [{ rule: 'mandatory', message: 'Please choose one' }] }}
                    onChange={onChange}
                />,
            );
            clickChip('Design'); // select -> valid
            clickChip('Design'); // deselect -> empty -> invalid
            expect(screen.getByText('Please choose one')).toBeInTheDocument();
        });
    });
});
