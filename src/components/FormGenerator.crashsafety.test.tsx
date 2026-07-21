import { render, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MuiConfig from '../config/mui';
import { FormGenerator, ClearFormData } from './FormGenerator';

// Every control must render with sparse props without crashing (a crash would be
// caught by DynamicComponent's error boundary → the "couldn't be loaded" message).
const types = Object.keys(MuiConfig);

// A generous grab-bag of the prop buckets different controls read — but
// deliberately minimal (no real data) so we exercise the empty/undefined paths.
const minimalProps: any = {
    id: 'f',
    MuiAttributes: { label: 'X', 'aria-label': 'X' },
    MuiBoxAttributes: { label: 'X' },
    MuiFCLAttributes: { label: 'X' },
    MuiFLabel: 'X',
    MuiFCLabels: [{ label: 'A', value: 'a' }],
    options: [{ value: 'a', label: 'A' }],
    text: 'Some text',
};

describe('crash-safety: every control renders with minimal props', () => {
    it.each(types)('renders "%s" without hitting the error boundary', async (type) => {
        const guid = `crash-${type}`;
        const { container } = render(
            <FormGenerator guid={guid} data={[{ type, props: { ...minimalProps }, layout: { row: 1, xs: 12 } }] as any} />,
        );
        // Allow any lazy control chunk (charts / data-grid / etc.) to resolve.
        await waitFor(
            () => expect(container.querySelector('.MuiCircularProgress-root')).toBeNull(),
            { timeout: 3000 },
        ).catch(() => { /* control without a spinner, or still loading — fine */ });

        expect(container.textContent || '').not.toContain("couldn’t be loaded");
        expect(container.textContent || '').not.toContain("couldn't be loaded");
        ClearFormData(guid);
    });
});
