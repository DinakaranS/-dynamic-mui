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
  try {
    const { data = [], patch = {}, guid } = props;
    const config = LIBMap.MUI;
    const dataObj = JSON.parse(JSON.stringify(data));
    const layout = generateLayout(
      updatePatchData(JSON.parse(JSON.stringify(dataObj)), patch, guid)
    );
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
                      map={configObj.map}
                      option={options.type || ''}
                      control={field}
                      attributes={cProps}
                      rules={rules}
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
                map={configObj.map}
                option={options.type || ''}
                control={field}
                attributes={cProps}
                rules={rules}
              />
            </div>
          );
        })}
      </>
    );
  } catch (e) {
    return <div>Error</div>;
  }
};

FormGenerator.propTypes = {
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
