import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';

import mui from '../config/mui';
import DynamicComponent from './DynamicComponent';
import { generateLayout, generateKey, updatePatchData } from '../util/helper';

const LIBMap = {
  MUI: {
    map: mui,
  },
};

/** FormGenerator */
export const FormGenerator = (props) => {
  const { library, data = {}, patch = {}, guid } = props;
  const config = LIBMap.MUI;
  const dataObj = JSON.parse(JSON.stringify(data));
  const layout = updatePatchData(generateLayout(JSON.parse(JSON.stringify(dataObj))), patch, guid);
  return (
    <>
      {layout.wrows.map((row, i) => (
        <Grid key={generateKey('layout-grid', i)} container spacing={2}>
          {row.map((field, index) => {
            const { type = '', style = {}, className = '', visible = false, rules = {} } = field;
            const cProps = field.props || {};
            const cLayout = field.layout || {};
            const configObj = config.map[type] || {};
            return (
              <Grid
                key={generateKey('layout-comp', index)}
                item
                style={style}
                {...cLayout}
                className={`${className} ${visible === false ? 'hidden' : 'show'}`}
              >
                <DynamicComponent
                  component={configObj.type}
                  map={configObj.map}
                  option={configObj.options ? configObj.options.type : ''}
                  control={field}
                  library={library}
                  attributes={cProps}
                  rules={rules}
                />
              </Grid>
            );
          })}
        </Grid>
      ))}
      {layout.worows.map((field, index) => {
        const { type = '', style = {}, className = '', visible = false, rules = {} } = field;
        const configObj = config.map[type] || {};
        const cProps = field.props;
        return (
          <div
            key={generateKey('layout-comp', index)}
            style={style}
            className={`${className} ${visible === false ? 'hidden' : 'show'}`}
          >
            <DynamicComponent
              component={configObj.type}
              map={configObj.map}
              option={configObj.options ? configObj.options.type : ''}
              control={field}
              library={library}
              attributes={cProps}
              rules={rules}
            />
          </div>
        );
      })}
    </>
  );
};

FormGenerator.propTypes = {
  /** Library to be used */
  library: PropTypes.objectOf(PropTypes.object).isRequired,
  /** Component name */
  guid: PropTypes.string.isRequired,
  /** Component json data */
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  /** Json data to assign value */
  patch: PropTypes.objectOf(PropTypes.object),
};

FormGenerator.defaultProps = {
  patch: {},
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  FormGenerator,
};
