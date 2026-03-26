import { useReducer, useCallback, useEffect } from 'react';
import {
    Box,
    Stepper as MuiStepper,
    Step,
    StepLabel,
    StepContent,
    Button,
    Typography,
} from '@mui/material';
// eslint-disable-next-line import/no-cycle
import StepperComponents from '../../../util/stepperComponents';
import { updatePatchData } from '../../../util/helper';
import { ControlProps } from '../../../types';

// Initial State
const initialState = { activeStep: 0, stepperResponse: {}, MuiSteps: [] };

// Types
interface StepperState {
    activeStep: number;
    stepperResponse: Record<string, any>;
    MuiSteps: any[];
}

interface StepperAction {
    type: 'SET_STEPS' | 'SET_STEP' | 'UPDATE_RESPONSE' | 'CHANGE_STEP';
    payload: any;
}

interface StepperProps extends ControlProps {
    onStepUpdate?: (newStep: number, isScreenChange: boolean, isLastStep: boolean) => void;
    currentStep?: number;
    patch?: Record<string, any>;
}

// Reducer Logic
const reducer = (state: StepperState, action: StepperAction): StepperState => {
    const { type, payload } = action;
    switch (type) {
        case 'SET_STEPS':
            return { ...state, MuiSteps: payload.MuiSteps };
        case 'SET_STEP':
            return { ...state, activeStep: payload.currentStep };
        case 'UPDATE_RESPONSE':
            return {
                ...state,
                stepperResponse: { ...state.stepperResponse, [payload.id]: payload.value },
            };
        case 'CHANGE_STEP':
            return { ...state, activeStep: state.activeStep + payload.stepChange };
        default:
            return state;
    }
};

export default function Stepper({ attributes = {}, onChange, onStepUpdate, currentStep = 0, patch = {} }: StepperProps) {
    const [state, dispatch] = useReducer(reducer, initialState, () => ({
        activeStep: currentStep,
        stepperResponse: patch,
        MuiSteps: attributes.MuiSteps || [],
    }));

    const { activeStep, stepperResponse, MuiSteps } = state;

    useEffect(() => {
        dispatch({ type: 'SET_STEP', payload: { currentStep } });
    }, [currentStep]);

    // Sync patch into stepperResponse when patch changes (e.g. async load)
    useEffect(() => {
        if (patch && Object.keys(patch).length > 0) {
            Object.entries(patch).forEach(([key, value]) => {
                if (stepperResponse[key] !== value) {
                    dispatch({ type: 'UPDATE_RESPONSE', payload: { id: key, value } });
                }
            });
        }
    }, [patch]);

    // Initialize stepperResponse with default values from all step component props
    // so that untouched fields are still captured on submit
    useEffect(() => {
        MuiSteps.forEach((step: any) => {
            (step.components || []).forEach((comp: any) => {
                const fieldId = comp.id || comp.props?.id;
                if (fieldId && comp.props?.value !== undefined && stepperResponse[fieldId] === undefined) {
                    dispatch({ type: 'UPDATE_RESPONSE', payload: { id: fieldId, value: comp.props.value } });
                    if (onChange) onChange({ id: fieldId, value: comp.props.value });
                }
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStepChange = useCallback(
        (stepChange: number, isScreenChange: boolean, isLastStep: boolean) => {
            dispatch({ type: 'CHANGE_STEP', payload: { stepChange } });
            const newStep = activeStep + stepChange;
            if (onStepUpdate) onStepUpdate(newStep, isScreenChange && stepChange > 0, isLastStep);
            if (isLastStep && onChange && attributes.id) {
                onChange({ id: attributes.id, value: stepperResponse });
            }
        },
        [activeStep, attributes.id, onChange, onStepUpdate, stepperResponse],
    );

    const handleUpdate = useCallback(
        ({ id, value }: { id: string, value: any }) => {
            dispatch({ type: 'UPDATE_RESPONSE', payload: { id, value } });
            if (onChange) onChange({ id, value });
        },
        [onChange],
    );

    const isDisabled = (mandatoryIds: string[] = [], optionalMandatoryIds: any[] = []) =>
        mandatoryIds.some((id) => !stepperResponse[id]) ||
        optionalMandatoryIds.some(
            (item) =>
                stepperResponse[item.key] === item.value &&
                item.mandatoryIds.some((id: string) => !stepperResponse[id]),
        );

    const renderButtons = (index: number, isScreenChange: boolean, mandatoryIds: string[], optionalMandatoryIds: any[]) => (
        <Box sx={{ mb: 2 }}>
            <Button
                variant="contained"
                onClick={() => handleStepChange(1, isScreenChange, index === MuiSteps.length - 1)}
                disabled={isDisabled(mandatoryIds, optionalMandatoryIds)}
                sx={{ mt: 1, mr: 1 }}
                {...attributes.MuiButtonAttributes?.next}
                {...(index === MuiSteps.length - 1 && { ...attributes.MuiButtonAttributes?.final })}
            >
                {index === MuiSteps.length - 1 ? 'Finish' : 'Continue'}
            </Button>
            <Button
                disabled={index === 0}
                onClick={() => handleStepChange(-1, isScreenChange, false)}
                sx={{ mt: 1, mr: 1 }}
                {...attributes.MuiButtonAttributes?.back}
            >
                Back
            </Button>
        </Box>
    );

    return (
        <Box sx={{ maxWidth: 400 }} {...attributes.MuiBoxAttributes}>
            <MuiStepper
                activeStep={activeStep}
                orientation="vertical"
                {...attributes.MuiStepperAttributes}
            >
                {MuiSteps.map((step: any, index: number) => (
                    <Step key={step.label} {...attributes.MuiStepAttributes}>
                        <StepLabel
                            optional={
                                index === MuiSteps.length - 1 && (
                                    <Typography variant="caption">Last step</Typography>
                                )
                            }
                            {...attributes.MuiStepLabelAttributes}
                        >
                            {step.label}
                        </StepLabel>
                        <StepContent {...attributes.MuiStepContentAttributes}>
                            {step.components ? (
                                <StepperComponents
                                    onUpdate={handleUpdate}
                                    components={updatePatchData(
                                        step.components,
                                        { ...stepperResponse },
                                        '',
                                        {},
                                        step.enableDisableIds,
                                    )}
                                />
                            ) : (
                                <Typography>{step.description}</Typography>
                            )}
                            {renderButtons(
                                index,
                                step.isScreenChange,
                                step.mandatoryIds,
                                step.optionalMandatoryIds,
                            )}
                        </StepContent>
                    </Step>
                ))}
            </MuiStepper>
        </Box>
    );
}
