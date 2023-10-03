import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import PropTypes from 'prop-types';

export default function DataTable(props) {
  const { attributes } = props;
  const { MuiAttributes = {}, container = {} } = attributes;
  return (
    <div {...container}>
      <DataGrid {...MuiAttributes} />
    </div>
  );
}

DataTable.propTypes = {
  /** Attributes for TextField */
  attributes: PropTypes.objectOf(PropTypes.object),
};
DataTable.defaultProps = {
  attributes: {},
};
