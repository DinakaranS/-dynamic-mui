import React from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-cycle
import * as Controls from '../components/controls';
import mui from '../config/mui';
import { generateKey } from './helper';

export default function StepperComponents({ components, onUpdate }) {
  return (
    <>
      {[...components].map((component, index) => {
        const CustomComponent = Controls.default[mui[component.type].map];
        return (
          <CustomComponent
            key={generateKey('dynamic-stepper-comp', index)}
            attributes={component.props}
            onChange={onUpdate}
          />
        );
      })}
    </>
  );
}

StepperComponents.propTypes = {
  /** Attributes for StepperComponent */
  components: PropTypes.arrayOf(PropTypes.object),
  /** Function */
  onUpdate: PropTypes.func,
};
StepperComponents.defaultProps = {
  components: [],
  // rules: {},
  onUpdate: null,
};
