// @ts-nocheck
// eslint-disable-next-line import/no-extraneous-dependencies
import { BarChart } from '@mui/x-charts/BarChart';
import { ControlProps } from '../../../types';

export default function Bar({ attributes = {} }: ControlProps) {
    const { MuiChartAttributes = {}, id = '' } = attributes;
    return <BarChart key={id} {...MuiChartAttributes} />;
}
