import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { FormGenerator } from './FormGenerator';
import { FormField } from '../util/helper';

describe('FormGenerator Integration', () => {
    const mockOnSubmit = vi.fn();
    const mockOnChange = vi.fn();

    const formFields: FormField[] = [
        {
            id: 'name',
            type: 'textfield',
            layout: { xs: 12 },
            props: {
                id: 'name',
                MuiAttributes: {
                    label: 'Full Name'
                }
            },
            visible: true
        },
        {
            id: 'agreed',
            type: 'checkbox',
            layout: { xs: 12 },
            props: {
                id: 'agreed',
                MuiFCLAttributes: {
                    label: 'I Agree'
                }
            },
            visible: true
        }
    ];

    it('renders controls and handles patch, change, and submit', async () => {
        const formRef = createRef<HTMLButtonElement>();
        const initialPatch = { name: 'John Doe', agreed: false };

        const { rerender } = render(
            <FormGenerator
                guid="test-form"
                data={formFields}
                patch={initialPatch}
                onSubmit={mockOnSubmit}
                onChange={mockOnChange}
                formRef={formRef}
            />
        );

        // 1. Verify Initial Render
        const nameInput = screen.getByLabelText(/Full Name/i) as HTMLInputElement;
        const agreeCheckbox = screen.getByLabelText(/I Agree/i) as HTMLInputElement;

        expect(nameInput.value).toBe('John Doe');
        expect(agreeCheckbox.checked).toBe(false);

        // 2. Test patching new data
        const newPatch = { name: 'Jane Smith', agreed: true };
        rerender(
            <FormGenerator
                guid="test-form"
                data={formFields}
                patch={newPatch}
                onSubmit={mockOnSubmit}
                onChange={mockOnChange}
                formRef={formRef}
            />
        );

        // Re-query inputs because FormGenerator regenerates keys (remounts components) on render
        const nameInputAfterPatch = screen.getByLabelText(/Full Name/i) as HTMLInputElement;
        const agreeCheckboxAfterPatch = screen.getByLabelText(/I Agree/i) as HTMLInputElement;

        await waitFor(() => {
            expect(nameInputAfterPatch.value).toBe('Jane Smith');
            expect(agreeCheckboxAfterPatch.checked).toBe(true);
        });

        // 3. Test Interaction (onChange)
        // Use the new inputs
        fireEvent.change(nameInputAfterPatch, { target: { value: 'Alice' } });
        fireEvent.blur(nameInputAfterPatch); // TextField triggers onChange on blur
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
            id: 'name',
            value: 'Alice'
        }));

        fireEvent.click(agreeCheckboxAfterPatch);
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
            id: 'agreed',
            value: false // It was true, clicked -> false
        }));

        // 4. Test Submit
        // Trigger submit via ref
        expect(formRef.current).not.toBeNull();
        formRef.current?.click();

        expect(mockOnSubmit).toHaveBeenCalled();
        // Check arguments passed to onSubmit: (response, errors, data, guid)
        // response[guid] should have current values
        const expectedResponse = expect.objectContaining({
            'test-form': expect.objectContaining({
                name: 'Alice',
                agreed: false
            })
        });

        expect(mockOnSubmit).toHaveBeenCalledWith(
            expectedResponse,
            expect.anything(), // errors
            expect.anything(), // data
            'test-form' // guid
        );
    });
});
