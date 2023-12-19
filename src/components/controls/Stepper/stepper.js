import React, { useReducer, useCallback } from 'react';
import PropTypes from 'prop-types';
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
    case 'NEXT_STEP':
      return { ...state, activeStep: state.activeStep + 1 };
    case 'PREVIOUS_STEP':
      return { ...state, activeStep: state.activeStep - 1 };
    case 'UPDATE_RESPONSE': {
      return {
        ...state,
        stepperResponse: {
          ...state.stepperResponse,
          [action.guid]: { ...state.stepperResponse[action.guid], [action.id]: action.value },
        },
      };
    }
    default:
      return state;
  }
}

export default function Stepper({ attributes, onChange, onStepUpdate }) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    stepperResponse: { [attributes.id]: attributes.value },
  });
  const { activeStep, stepperResponse } = state;

  const handleStepChange = (stepChange, isScreenChange, isLastStep) => {
    dispatch({ type: stepChange });
    onStepUpdate?.(activeStep + (stepChange === 'NEXT_STEP' ? 1 : -1), isScreenChange, isLastStep);
    if (isLastStep) {
      onChange?.({ id: attributes.id, value: stepperResponse });
    }
  };

  const handleUpdate = useCallback(
    ({ id, value }) => {
      dispatch({ type: 'UPDATE_RESPONSE', guid: attributes.id, id, value });
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
        {...attributes.MuiButtonAttributes.back}
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
                    stepperResponse[attributes.id],
                    attributes.id,
                    stepperResponse,
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
};

Stepper.defaultProps = {
  attributes: {},
  onChange: null,
  onStepUpdate: null,
};
