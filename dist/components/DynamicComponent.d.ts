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
export default function DynamicComponent(props: DynamicComponentProps): import("react/jsx-runtime").JSX.Element;
export {};
