import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes, { number } from 'prop-types';
import Grid from '@mui/material/Grid';
import isEmpty from 'lodash/isEmpty';

import mui from '../config/mui';
import DynamicComponent from './DynamicComponent';
import { generateLayout, generateKey, updatePatchData } from '../util/helper';
import useUpdateEffect from '../util/useUpdateEffect';

const LIBMap = { MUI: { map: mui } };
const response = {};

export const FormData = (id) => (id ? response[id] : response);

export const ClearFormData = (id) => {
  const responseKeys = Object.keys(response);
  if (id) {
    delete response[id];
  } else {
    responseKeys.forEach((key) => delete response[key]);
  }
};

export function FormGenerator({
  data = [],
  patch = {},
  guid,
  formRef,
  onSubmit,
  onChange,
  onStepChange,
  MuiGridAttributes = { spacing: 2 },
  activeStep = 0,
}) {
  const [newPatch, setNewPatch] = useState(patch);
  const config = LIBMap.MUI;
  const layout = useMemo(
    () => generateLayout(updatePatchData(data, newPatch, guid, response)),
    [newPatch, data, guid],
  );

  useEffect(() => {
    if (isEmpty(response[guid])) response[guid] = patch;
  }, []);

  useUpdateEffect(() => {
    setNewPatch({ ...patch });
  }, [patch]);

  const onUpdate = useCallback(({ id, value, option }) => {
    response[guid][id] = value;
    if (typeof onChange === 'function') {
      onChange({ id, value, option });
    }
  }, []);

  const handleSubmit = useCallback((submitCallback, formData, formGuid) => {
    if (typeof submitCallback === 'function') {
      submitCallback(response, null, formData, formGuid);
    }
  }, []);

  const onStepUpdate = (currentStep, isScreenChange, isLastStep) => {
    if (typeof onStepChange === 'function') {
      onStepChange(currentStep, isScreenChange, isLastStep);
    }
  };

  const renderDynamicComponent = (field, index) => {
    const { type = '', style = {}, className = '', visible = false, rules = {} } = field;
    const cProps = field.props || {};
    const cLayout = field.layout || {};
    const configObj = config.map[type] || {};
    const { options = {} } = configObj;

    return (
      <Grid
        key={generateKey('layout-comp', index)}
        item
        style={style}
        {...cLayout}
        className={`${className} ${visible ? 'show' : 'hidden'}`}
      >
        <DynamicComponent
          key={generateKey('dynamic-comp', index)}
          map={configObj.map}
          option={options.type || ''}
          control={field}
          attributes={cProps}
          rules={rules}
          onChange={onUpdate}
          onStepUpdate={onStepUpdate}
          currentStep={activeStep}
          patch={patch}
        />
      </Grid>
    );
  };

  return (
    <>
      <Grid key={generateKey('layout-grid')} container {...MuiGridAttributes}>
        {layout.wrows.map((row, rowIndex) => (
          <React.Fragment key={generateKey('row', rowIndex)}>
            {row.map(renderDynamicComponent)}
          </React.Fragment>
        ))}
      </Grid>
      {layout.worows.map((field, index) => (
        <div
          key={generateKey('layout-comp', index)}
          style={field.style || {}}
          className={`${field.className || ''} ${field.visible ? 'show' : 'hidden'}`}
        >
          {renderDynamicComponent(field, index)}
        </div>
      ))}
      <button
        aria-label="button"
        type="button"
        ref={formRef}
        onClick={() => handleSubmit(onSubmit, data, guid)}
        style={{ display: 'none' }}
      />
    </>
  );
}

FormGenerator.propTypes = {
  /** Component name */
  guid: PropTypes.string.isRequired,
  /** Component json data */
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  /** Json data to assign value */
  patch: PropTypes.objectOf(PropTypes.object),
  /** Component Ref */
  formRef: PropTypes.objectOf(PropTypes.object),
  /** Component Submit Function */
  onSubmit: PropTypes.func,
  /** Component On Change Function */
  onChange: PropTypes.func,
  /** Component On Change Function */
  onStepChange: PropTypes.func,
  /** Grid Container Attributes */
  MuiGridAttributes: PropTypes.objectOf(PropTypes.object),
  /** Stepper Active Step */
  activeStep: number,
};

FormGenerator.defaultProps = {
  patch: {},
  formRef: {},
  onSubmit: null,
  onChange: null,
  onStepChange: null,
  MuiGridAttributes: {
    spacing: 2,
  },
  activeStep: 0,
};

export default { FormGenerator, FormData, ClearFormData };
