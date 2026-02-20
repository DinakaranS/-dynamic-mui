import * as Controls from './controls/index';
// eslint-disable-next-line import/no-cycle
import { ControlProps } from '../types';

interface DynamicComponentProps extends ControlProps {
    map?: string;
    option?: string;
    control?: any;
    currentStep?: number;
    patch?: any;
    onStepUpdate?: any;
    [key: string]: any;
}

export default function DynamicComponent(props: DynamicComponentProps) {
    const { map } = props;
    if (!map) return <div />;

    // @ts-ignore
    const CustomComponent = Controls.default[map];
    if (!CustomComponent) return <div />;

    return <CustomComponent {...props} />;
}
