import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import List from './list';
import { ControlProps } from '../../../types';

describe('List Control', () => {
    const defaultProps: ControlProps = {
        attributes: {
            MuiAttributes: {},
            items: [
                {
                    primary: 'Item 1',
                    secondary: 'Desc 1',
                    MuiListItemAttributes: {},
                    MuiListItemTextAttributes: {}
                },
                {
                    primary: 'Item 2',
                    secondary: 'Desc 2'
                }
            ]
        },
        rules: {}
    };

    it('renders list items correctly', () => {
        render(<List {...defaultProps} />);
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Desc 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
});
