// eslint-disable-next-line import/no-extraneous-dependencies
import { LineChart } from '@mui/x-charts/LineChart';
import { ControlProps } from '../../../types';

export default function Line({ attributes = {} }: ControlProps) {
    const { MuiChartAttributes = {}, id = '' } = attributes;
    return <LineChart key={id} {...MuiChartAttributes} />;
}
