// eslint-disable-next-line import/no-cycle
import * as Controls from '../components/controls';
import mui, { MuiConfigMap } from '../config/mui';

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

                const compId = component.id || component.props?.id || `stepper-comp-${index}`;
                return (
                    <CustomComponent
                        key={compId}
                        attributes={component.props}
                        onChange={onUpdate}
                    />
                );
            })}
        </>
    );
}
