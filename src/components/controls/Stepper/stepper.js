import React, { useReducer, useCallback, useEffect } from 'react';
import PropTypes, { number } from 'prop-types';
import Box from '@mui/material/Box';
import MuiStepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
// eslint-disable-next-line import/no-cycle
import StepperComponents from '../../../util/stepperComponents';
import { updatePatchData } from '../../../util/helper';

const initialState = { activeStep: 0, stepperResponse: {} };

function reducer(state, action) {
  switch (action.type) {
    case 'PATCH_STEP':
      return { ...state, activeStep: action.currentStep };
    case 'NEXT_STEP':
      return { ...state, activeStep: state.activeStep + 1 };
    case 'PREVIOUS_STEP':
      return { ...state, activeStep: state.activeStep - 1 };
    case 'UPDATE_RESPONSE': {
      return {
        ...state,
        stepperResponse: {
          ...state.stepperResponse,
          [action.id]: action.value,
        },
      };
    }
    default:
      return state;
  }
}

const response = {};
export default function Stepper({ attributes, onChange, onStepUpdate, currentStep, patch }) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    activeStep: currentStep,
    stepperResponse: { ...patch },
  });
  const { activeStep, stepperResponse } = state;

  useEffect(() => {
    response[attributes.id] = { ...patch };
    // eslint-disable-next-line no-return-assign
    return () => (response[attributes.id] = {});
  }, [patch]);

  useEffect(() => {
    dispatch({ type: 'PATCH_STEP', currentStep });
  }, [currentStep]);

  const handleStepChange = (stepChange, isScreenChange, isLastStep) => {
    dispatch({ type: stepChange });
    onStepUpdate?.(activeStep + (stepChange === 'NEXT_STEP' ? 1 : -1), isScreenChange, isLastStep);
    if (isLastStep) {
      onChange?.({ id: attributes.id, value: response });
    }
  };

  const handleUpdate = useCallback(
    ({ id, value }) => {
      response[attributes.id][id] = value;
      dispatch({ type: 'UPDATE_RESPONSE', id, value });
      onChange?.({ id, value });
    },
    [onChange],
  );

  const renderStepButtons = (index, isScreenChange) => (
    <Box sx={{ mb: 2 }}>
      <Button
        variant="contained"
        onClick={() =>
          handleStepChange('NEXT_STEP', isScreenChange, index === attributes.MuiSteps.length - 1)
        }
        sx={{ mt: 1, mr: 1 }}
        {...attributes.MuiButtonAttributes.next}
        {...(index === attributes.MuiSteps.length - 1 && {
          ...attributes.MuiButtonAttributes.final,
        })}
      >
        {index === attributes.MuiSteps.length - 1
          ? attributes.MuiButtonAttributes.finalLabel || 'Finish'
          : attributes.MuiButtonAttributes.nextLabel || 'Continue'}
      </Button>
      <Button
        disabled={index === 0}
        onClick={() => handleStepChange('PREVIOUS_STEP', isScreenChange, false)}
        sx={{ mt: 1, mr: 1 }}
        {...attributes.MuiButtonAttributes.back}
      >
        {attributes.MuiButtonAttributes.backLabel || 'Back'}
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
        {attributes.MuiSteps.map((step, index) => (
          <Step key={step.label} {...attributes.MuiStepAttributes}>
            <StepLabel
              optional={
                index === attributes.MuiSteps.length - 1 && (
                  <Typography variant="caption">
                    {attributes.MuiStepLabelOptionalLabel || 'Last step'}
                  </Typography>
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
                    attributes.id,
                    response,
                  )}
                />
              ) : (
                <Typography>{step.description}</Typography>
              )}
              {renderStepButtons(index, step.isScreenChange)}
            </StepContent>
          </Step>
        ))}
      </MuiStepper>
    </Box>
  );
}

Stepper.propTypes = {
  /** Attributes for Stepper */
  attributes: PropTypes.objectOf(PropTypes.object),
  /** Function */
  onChange: PropTypes.func,
  /** Function */
  onStepUpdate: PropTypes.func,
  /** Default Step */
  currentStep: number,
  /** Default Patch */
  patch: PropTypes.objectOf(PropTypes.object),
};

Stepper.defaultProps = {
  attributes: {},
  onChange: null,
  onStepUpdate: null,
  currentStep: 0,
  patch: {},
};
