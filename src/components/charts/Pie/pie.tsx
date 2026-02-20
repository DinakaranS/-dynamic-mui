// @ts-nocheck
// eslint-disable-next-line import/no-extraneous-dependencies
import { PieChart } from '@mui/x-charts/PieChart';
import { ControlProps } from '../../../types';

export default function Pie({ attributes = {} }: ControlProps) {
    const { MuiChartAttributes = {}, id = '' } = attributes;
    return <PieChart key={id} {...MuiChartAttributes} />;
}
