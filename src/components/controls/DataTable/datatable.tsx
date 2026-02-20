import { DataGrid } from '@mui/x-data-grid';
import { ControlProps } from '../../../types';

export default function DataTable({ attributes = {} }: ControlProps) {
    const { MuiAttributes = {}, container = {} } = attributes;
    return (
        <div {...container}>
            <DataGrid {...MuiAttributes} />
        </div>
    );
}
