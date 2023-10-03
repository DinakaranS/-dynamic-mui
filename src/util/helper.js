import { remove, clone, map, uniq, sortBy, each } from 'lodash';
import isEmpty from 'lodash/isEmpty';
import { Icon, InputAdornment } from '@mui/material';
import {
  DatePicker,
  MobileDatePicker,
  DesktopDatePicker,
  // DateRangePicker,
  // MobileDateRangePicker,
  // DesktopDateRangePicker,
  MobileDateTimePicker,
  DesktopDateTimePicker,
  DateTimePicker,
  TimePicker,
  DesktopTimePicker,
  MobileTimePicker,
} from '@mui/x-date-pickers';

const response = {};

export function generateLayout(data) {
  const layout = {
    wrows: [],
    worows: [],
  };
  // All Items
  const wrows = clone(data);
  // Remove Without Rows
  layout.worows = remove(wrows, (item) => {
    const isLayout = item.layout ? item.layout.row : item.layout;
    return isLayout === undefined;
  }); // Concat all items without rows

  // All row indices
  const rowIndex = map(wrows, 'layout.row');
  const uniqIndex = uniq(rowIndex);
  const sortedIndex = sortBy(uniqIndex);

  each(sortedIndex, (value) => {
    const rows = [];
    each(wrows, (item) => {
      if (item.layout) {
        if (item.layout.row === value) {
          rows.push(item);
        }
      }
    });
    layout.wrows.push(rows);
  });

  return layout;
}

export function getInputProps(InputProps) {
  if (!isEmpty(InputProps)) {
    const { MuiInputAdornment = {}, position = 'start', icon, text, textstyle = {} } = InputProps;
    return {
      [`${position}Adornment`]: (
        <InputAdornment {...MuiInputAdornment}>
          {icon && <Icon>{icon}</Icon>}
          {!isEmpty(textstyle) ? <div style={textstyle}>{text || ''}</div> : text || ''}
        </InputAdornment>
      ),
    };
  }
  return {};
}

export const generateKey = (prefix = '', index = 0) => {
  const random = Math.random().toString(36).substr(2, 9);
  const currentTime = new Date().toLocaleTimeString('en').trim();

  return `${prefix}_${index}_${random}_${currentTime}`;
};

export const updatePatchData = (fields, patch, guid) => {
  response[guid] = patch;
  const formData = Object.assign([], fields);
  // if (isEmpty(patch)) return fields;
  return map(formData, (field) => {
    const newField = { ...field };
    if (newField.id && response[guid][field.id]) {
      newField.props.value = response[guid][field.id] || '';
    }
    return newField;
  });
};

export const DateComponent = (name) => {
  if (name === 'MobileDatePicker') return MobileDatePicker;
  if (name === 'DesktopDatePicker') return DesktopDatePicker;
  // if (name === 'DateRangePicker') return DateRangePicker;
  // if (name === 'MobileDateRangePicker') return MobileDateRangePicker;
  // if (name === 'DesktopDateRangePicker') return DesktopDateRangePicker;
  if (name === 'DateTimePicker') return DateTimePicker;
  if (name === 'MobileDateTimePicker') return MobileDateTimePicker;
  if (name === 'DesktopDateTimePicker') return DesktopDateTimePicker;
  if (name === 'TimePicker') return TimePicker;
  if (name === 'MobileTimePicker') return MobileTimePicker;
  if (name === 'DesktopTimePicker') return DesktopTimePicker;
  return DatePicker;
};

export const checkboxSX = (color) => {
  if (color)
    return {
      color,
      '&.Mui-checked': {
        color,
      },
    };
  return {};
};

export default {
  generateLayout,
  getInputProps,
  generateKey,
  updatePatchData,
  DateComponent,
  checkboxSX,
};
