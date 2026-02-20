import { ControlProps } from '../../../types';
interface StepperProps extends ControlProps {
    onStepUpdate?: (newStep: number, isScreenChange: boolean, isLastStep: boolean) => void;
    currentStep?: number;
    patch?: Record<string, any>;
}
export default function Stepper({ attributes, onChange, onStepUpdate, currentStep, patch }: StepperProps): import("react/jsx-runtime").JSX.Element;
export {};
