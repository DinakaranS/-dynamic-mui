import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import isEmpty from 'lodash/isEmpty';

import mui from '../config/mui';
import DynamicComponent from './DynamicComponent';
import { generateLayout, generateKey, updatePatchData } from '../util/helper';

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
  MuiGridAttributes = { spacing: 2 },
}) {
  const config = LIBMap.MUI;
  const layout = generateLayout(updatePatchData(data, patch, guid, response));

  const onUpdate = useCallback(
    ({ id, value, option }) => {
      if (isEmpty(response[guid])) response[guid] = patch;
      response[guid][id] = value;
      if (typeof onChange === 'function') {
        onChange({ id, value, option });
      }
    },
    [onChange, patch, guid],
  );

  const handleSubmit = useCallback((submitCallback, formData, formGuid) => {
    if (typeof submitCallback === 'function') {
      submitCallback(response, null, formData, formGuid);
    }
  }, []);

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
  /** Grid Container Attributes */
  MuiGridAttributes: PropTypes.objectOf(PropTypes.object),
};

FormGenerator.defaultProps = {
  patch: {},
  formRef: {},
  onSubmit: null,
  onChange: null,
  MuiGridAttributes: {
    spacing: 2,
  },
};

export default { FormGenerator, FormData, ClearFormData };
