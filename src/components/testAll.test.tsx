import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormGenerator } from './FormGenerator';
import { ALL_CONTROLS_TEST_DATA } from '../playground/testData';

describe('Test All Data Render', () => {
    it('should render the hyperlink and switch components without crashing', () => {
        const filteredData = ALL_CONTROLS_TEST_DATA.filter(f => f.type !== 'signature' && f.type !== 'chart-bar' && f.type !== 'chart-pie' && f.type !== 'chart-line' && f.type !== 'datatable');
        const { container } = render(
            <FormGenerator guid="testAll" data={filteredData} />
        );

        // Let's log out the rendered DOM string for debugging
        const html = container.innerHTML;

        // Assertions just to surface errors if any
        const switchControl = screen.queryByLabelText(/Toggle Subform/i);
        console.log("Switch Found?", !!switchControl);

        if (switchControl) {
            import('@testing-library/react').then(async ({ fireEvent, waitFor }) => {
                fireEvent.click(switchControl);
                await waitFor(() => {
                    const hiddenField = screen.queryByLabelText(/Hidden Field/i);
                    console.log("Subform Hidden Field revealed after click?", !!hiddenField);
                });
            });
        }
    });
});
