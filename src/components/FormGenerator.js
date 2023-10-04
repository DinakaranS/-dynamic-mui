import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import isEmpty from 'lodash/isEmpty';

import mui from '../config/mui';
import DynamicComponent from './DynamicComponent';
import { generateLayout, generateKey, updatePatchData } from '../util/helper';

const LIBMap = {
  MUI: {
    map: mui,
  },
};

const response = {};

const handleSubmit = (callback, data) => {
  if (typeof callback === 'function') {
    callback(response, null, data);
  }
};

const FormData = (id) => {
  if (id) return response[id];
  return response;
};

const ClearFormData = (id) => {
  if (id) delete response[id];
  else Object.keys(response).map((key) => delete response[key]);
};

/** FormGenerator */
export function FormGenerator(props) {
  try {
    const { data = [], patch = {}, guid, formRef, onSubmit, onChange } = props;
    const config = LIBMap.MUI;
    const dataObj = JSON.parse(JSON.stringify(data));
    const layout = generateLayout(
      updatePatchData(JSON.parse(JSON.stringify(dataObj)), patch, guid),
    );
    const onUpdate = ({ id, value }) => {
      try {
        if (isEmpty(response[guid])) response[guid] = patch;
        response[guid][id] = value;
        if (typeof onChange === 'function') {
          onChange({ id, value });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
    };

    return (
      <>
        <Grid key={generateKey('layout-grid')} container spacing={2}>
          {layout.wrows.map((row) => (
            <>
              {row.map((field, index) => {
                const {
                  type = '',
                  style = {},
                  className = '',
                  visible = false,
                  rules = {},
                } = field;
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
                    className={`${className} ${visible === false ? 'hidden' : 'show'}`}
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
              })}
            </>
          ))}
        </Grid>
        {layout.worows.map((field, index) => {
          const { type = '', style = {}, className = '', visible = false, rules = {} } = field;
          const configObj = config.map[type] || {};
          const cProps = field.props;
          const { options = {} } = configObj;
          return (
            <div
              key={generateKey('layout-comp', index)}
              style={style}
              className={`${className} ${visible === false ? 'hidden' : 'show'}`}
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
            </div>
          );
        })}
        <button
          type="button"
          ref={formRef}
          onClick={() => {
            handleSubmit(onSubmit, data, guid);
          }}
          style={{
            display: 'none',
          }}
        >
          {}
        </button>
      </>
    );
  } catch (e) {
    return <div>Error</div>;
  }
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
};

FormGenerator.defaultProps = {
  patch: {},
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  FormGenerator,
  FormData,
  ClearFormData,
};
