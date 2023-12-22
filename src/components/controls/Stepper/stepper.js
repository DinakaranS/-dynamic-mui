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

const initialState = { activeStep: 0, stepperResponse: {}, MuiSteps: [] };
const response = {}; // Reintegrated response object

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_STEPS':
      return { ...state, MuiSteps: action.MuiSteps };
    case 'SET_STEP':
      return { ...state, activeStep: action.currentStep };
    case 'NEXT_STEP':
      return { ...state, activeStep: state.activeStep + 1 };
    case 'PREVIOUS_STEP':
      return { ...state, activeStep: state.activeStep - 1 };
    case 'UPDATE_RESPONSE':
      return { ...state, stepperResponse: { ...state.stepperResponse, [action.id]: action.value } };
    default:
      return state;
  }
};

export default function Stepper({ attributes, onChange, onStepUpdate, currentStep, patch }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => ({
    ...init,
    activeStep: currentStep,
    stepperResponse: patch,
    MuiSteps: [...attributes.MuiSteps],
  }));

  const { activeStep, stepperResponse, MuiSteps } = state;

  useEffect(() => {
    response[attributes.id] = patch; // Update response on patch change
    return () => {
      response[attributes.id] = {}; // Cleanup response on component unmount
      // eslint-disable-next-line no-console
      console.log('Component unmounted');
    };
  }, [patch, attributes.id]);

  useEffect(() => {
    dispatch({ type: 'SET_STEP', currentStep });
  }, [currentStep]);

  const handleStepChange = useCallback(
    (stepChange, isScreenChange, isLastStep) => {
      dispatch({ type: stepChange });
      const newStep = activeStep + (stepChange === 'NEXT_STEP' ? 1 : -1);
      onStepUpdate?.(newStep, isScreenChange && stepChange === 'NEXT_STEP', isLastStep);
      if (isLastStep) {
        onChange?.({ id: attributes.id, value: stepperResponse });
      }
    },
    [activeStep, attributes.id, onChange, onStepUpdate, stepperResponse],
  );

  const handleUpdate = useCallback(
    ({ id, value }) => {
      response[attributes.id][id] = value;
      dispatch({ type: 'UPDATE_RESPONSE', id, value });
      onChange?.({ id, value });
      // let updateUI = false;
      // const newMuiSteps = MuiSteps.map((step) => {
      //   let newComponents = step.components || [];
      //   const fElement = newComponents?.find(
      //     (component) => component?.id === id || component?.props?.id === id,
      //   );
      //   if (fElement && fElement.onChangeUpdate) {
      //     fElement.onChangeUpdate.forEach(({ enableDisableConfig, patchId, replaceUiConfig }) => {
      //       if (enableDisableConfig) {
      //         let disableElement = newComponents.find(
      //           (k) => k.id === patchId || k?.props?.id === patchId,
      //         );
      //         if (disableElement && disableElement?.props?.MuiAttributes) {
      //           disableElement = {
      //             ...disableElement,
      //             props: {
      //               ...disableElement?.props,
      //               MuiAttributes: {
      //                 ...disableElement?.props?.MuiAttributes,
      //                 disabled: enableDisableConfig[value],
      //               },
      //             },
      //           };
      //           newComponents = newComponents.filter((k) => k?.props?.id !== patchId);
      //           newComponents.push(disableElement);
      //           updateUI = true;
      //         }
      //       }
      //       if (replaceUiConfig) {
      //         newComponents = newComponents.filter((k) => k?.props?.id !== patchId);
      //         newComponents.push(replaceUiConfig);
      //         updateUI = true;
      //       }
      //     });
      //   }
      //   return { ...step, components: newComponents };
      // });
      // if (updateUI) {
      //   dispatch({ type: 'SET_STEPS', MuiSteps: newMuiSteps });
      // }
    },
    [onChange],
  );

  const renderStepButtons = (index, isScreenChange) => (
    <Box sx={{ mb: 2 }}>
      <Button
        variant="contained"
        onClick={() => handleStepChange('NEXT_STEP', isScreenChange, index === MuiSteps.length - 1)}
        sx={{ mt: 1, mr: 1 }}
        {...attributes.MuiButtonAttributes.next}
        {...(index === MuiSteps.length - 1 && { ...attributes.MuiButtonAttributes.final })}
      >
        {index === MuiSteps.length - 1 ? 'Finish' : 'Continue'}
      </Button>
      <Button
        disabled={index === 0}
        onClick={() => handleStepChange('PREVIOUS_STEP', isScreenChange, false)}
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
  attributes: PropTypes.shape({
    id: PropTypes.string.isRequired,
    MuiSteps: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        description: PropTypes.string,
        isScreenChange: PropTypes.bool,
        components: PropTypes.array,
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

Stepper.defaultProps = {
  attributes: {},
  currentStep: 0,
  patch: {},
  onChange: () => {},
  onStepUpdate: () => {},
};
