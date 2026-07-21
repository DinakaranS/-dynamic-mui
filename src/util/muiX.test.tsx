import { render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { FormGenerator, ClearFormData, configureMuiX, resetMuiX } from '../index';

afterEach(() => { ClearFormData(); resetMuiX(); });

// Stand-ins for a Pro/Premium DataGrid and a Pro chart.
const FakeDataGrid = (props: any) => <div data-testid="pro-grid">rows: {(props.rows || []).length}</div>;
const FakeBarChart = (props: any) => <div data-testid="pro-bar">bar h={props.height}</div>;

describe('MUI X tier injection (configureMuiX)', () => {
    it('renders the injected DataGrid instead of the Community one', async () => {
        configureMuiX({ DataGrid: FakeDataGrid });
        render(<FormGenerator guid="mx-1" data={[{ type: 'datatable', props: { id: 't', MuiAttributes: { columns: [], rows: [] } }, layout: { row: 1, xs: 12 } }] as any} />);
        expect(await screen.findByTestId('pro-grid')).toBeInTheDocument();
    });

    it('renders the injected chart instead of the Community one', async () => {
        configureMuiX({ BarChart: FakeBarChart });
        render(<FormGenerator guid="mx-2" data={[{ type: 'bar', props: { id: 'c', MuiChartAttributes: {} }, layout: { row: 1, xs: 12 } }] as any} />);
        const el = await screen.findByTestId('pro-bar');
        expect(el).toBeInTheDocument();
        expect(el).toHaveTextContent('h=300'); // default height still applied
    });

    it('falls back to the Community component when nothing is configured', () => {
        // No configureMuiX → no override present.
        render(<FormGenerator guid="mx-3" data={[{ type: 'bar', props: { id: 'c', MuiChartAttributes: {} }, layout: { row: 1, xs: 12 } }] as any} />);
        // Community chart is lazy → the Suspense spinner shows first; the point is
        // no injected component and no crash.
        expect(screen.queryByTestId('pro-bar')).toBeNull();
    });
});
