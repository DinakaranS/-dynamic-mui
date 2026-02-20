// eslint-disable-next-line import/no-cycle
import * as Controls from '../components/controls';
import mui, { MuiConfigMap } from '../config/mui';
import { generateKey } from './helper';

interface StepperComponentsProps {
    components?: any[];
    onUpdate?: (args: any) => void;
}

export default function StepperComponents({ components = [], onUpdate }: StepperComponentsProps) {
    return (
        <>
            {components.map((component, index) => {
                const config = (mui as MuiConfigMap)[component.type];
                if (!config) return null;

                const CustomComponent = (Controls as any).default[config.map];
                if (!CustomComponent) return null;

                return (
                    <CustomComponent
                        key={generateKey('dynamic-stepper-comp', index)}
                        attributes={component.props}
                        onChange={onUpdate}
                    />
                );
            })}
        </>
    );
}
