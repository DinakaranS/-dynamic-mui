import React, { useReducer, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
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

// Initial State
const initialState = { activeStep: 0, stepperResponse: {}, MuiSteps: [] };

// Reducer Logic
const reducer = (state, action) => {
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

function Stepper({ attributes, onChange, onStepUpdate, currentStep, patch }) {
  const [state, dispatch] = useReducer(reducer, initialState, () => ({
    activeStep: currentStep,
    stepperResponse: patch,
    MuiSteps: attributes.MuiSteps || [],
  }));

  const { activeStep, stepperResponse, MuiSteps } = state;

  useEffect(() => {
    dispatch({ type: 'SET_STEP', payload: { currentStep } });
  }, [currentStep]);

  const handleStepChange = useCallback(
    (stepChange, isScreenChange, isLastStep) => {
      dispatch({ type: 'CHANGE_STEP', payload: { stepChange } });
      const newStep = activeStep + stepChange;
      onStepUpdate?.(newStep, isScreenChange && stepChange > 0, isLastStep);
      if (isLastStep) {
        onChange?.({ id: attributes.id, value: stepperResponse });
      }
    },
    [activeStep, attributes.id, onChange, onStepUpdate, stepperResponse],
  );

  const handleUpdate = useCallback(
    ({ id, value }) => {
      dispatch({ type: 'UPDATE_RESPONSE', payload: { id, value } });
      onChange?.({ id, value });
    },
    [onChange],
  );

  const isDisabled = (mandatoryIds = [], optionalMandatoryIds = []) =>
    mandatoryIds.some((id) => !stepperResponse[id]) ||
    optionalMandatoryIds.some(
      (item) =>
        stepperResponse[item.key] === item.value &&
        item.mandatoryIds.some((id) => !stepperResponse[id]),
    );

  const renderButtons = (index, isScreenChange, mandatoryIds, optionalMandatoryIds) => (
    <Box sx={{ mb: 2 }}>
      <Button
        variant="contained"
        onClick={() => handleStepChange(1, isScreenChange, index === MuiSteps.length - 1)}
        disabled={isDisabled(mandatoryIds, optionalMandatoryIds)}
        sx={{ mt: 1, mr: 1 }}
        {...attributes.MuiButtonAttributes.next}
        {...(index === MuiSteps.length - 1 && { ...attributes.MuiButtonAttributes.final })}
      >
        {index === MuiSteps.length - 1 ? 'Finish' : 'Continue'}
      </Button>
      <Button
        disabled={index === 0}
        onClick={() => handleStepChange(-1, isScreenChange, false)}
        sx={{ mt: 1, mr: 1 }}
        {...attributes.MuiButtonAttributes.back}
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
        {MuiSteps.map((step, index) => (
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
                    stepperResponse,
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

// PropTypes Definition
Stepper.propTypes = {
  attributes: PropTypes.shape({
    id: PropTypes.string.isRequired,
    MuiSteps: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        description: PropTypes.string,
        isScreenChange: PropTypes.bool,
        components: PropTypes.array,
        mandatoryIds: PropTypes.array,
        optionalMandatoryIds: PropTypes.array,
      }),
    ).isRequired,
    MuiButtonAttributes: PropTypes.object,
    MuiBoxAttributes: PropTypes.object,
    MuiStepperAttributes: PropTypes.object,
    MuiStepAttributes: PropTypes.object,
    MuiStepLabelAttributes: PropTypes.object,
    MuiStepContentAttributes: PropTypes.object,
  }),
  onChange: PropTypes.func,
  onStepUpdate: PropTypes.func,
  currentStep: PropTypes.number,
  patch: PropTypes.object,
};

// Default Props
Stepper.defaultProps = {
  attributes: {},
  onChange: () => {},
  onStepUpdate: () => {},
  currentStep: 0,
  patch: {},
};

export default Stepper;
