import { remove, clone, map, uniq, sortBy, each, cloneDeep } from 'lodash';
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
import React from 'react';

export function generateLayout(data) {
  const layout = { wrows: [], worows: [] };
  const wrows = clone(data);

  // Items without a row -> worows
  const removed = remove(wrows, (item) => {
    const isLayout = item.layout ? item.layout.row : item.layout;
    return isLayout === undefined;
  });

  // Create a new item with MUI v7-friendly layout.size (no param reassign)
  const normalizeItem = (it) => {
    const l = it.layout ?? {};
    const computedSize = (() => {
      if (l.size && typeof l.size === 'object') return l.size;
      const s = {};
      if (l.xs != null) s.xs = l.xs;
      if (l.sm != null) s.sm = l.sm;
      if (l.md != null) s.md = l.md;
      if (l.lg != null) s.lg = l.lg;
      if (l.xl != null) s.xl = l.xl;
      return Object.keys(s).length ? s : { xs: 12 };
    })();

    // strip legacy breakpoint keys; keep everything else on layout
    const { xs, sm, md, lg, xl, size, ...restLayout } = l;
    const normalizedLayout = { ...restLayout, size: size ?? computedSize };

    return { ...it, layout: normalizedLayout };
  };

  layout.worows = removed.map(normalizeItem);

  // Group remaining items by row
  const rowIndex = map(wrows, 'layout.row');
  const uniqIndex = uniq(rowIndex);
  const sortedIndex = sortBy(uniqIndex);

  each(sortedIndex, (value) => {
    const rows = [];
    each(wrows, (it) => {
      if (it.layout && it.layout.row === value) {
        rows.push(normalizeItem(it));
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
        <InputAdornment {...MuiInputAdornment} key={`custom-icon-Adornment-${position}`}>
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

function isEmptyCustom(value) {
  return (
    // null or undefined
    value == null ||
    // has length and it's zero
    // eslint-disable-next-line no-prototype-builtins
    (value.hasOwnProperty('length') && value.length === 0) ||
    // is an Object and has no keys
    (value.constructor === Object && Object.keys(value).length === 0)
  );
}

export const updatePatchData = (fields, patch, guid, response = {}, enableDisableIds = []) => {
  try {
    // Update response with the patch for the provided GUID
    response[guid] = patch;

    // Map and update fields with response data
    const updatedFields = map(fields, (field) => {
      const newField = cloneDeep(field);
      const id = newField?.id || newField?.props?.id;

      if (id && response[guid] && !isEmptyCustom(response[guid][id])) {
        const defaultValue = ['switch', 'checkbox'].includes(newField?.type) ? false : '';
        newField.props = {
          ...newField.props,
          value: response[guid][id] === undefined ? defaultValue : response[guid][id],
        };
      }
      return newField;
    });

    // Handle enable/disable logic
    if (enableDisableIds.length > 0) {
      enableDisableIds.forEach(({ key, disableIds, compareValues = {} }) => {
        const controllingField = updatedFields.find(
          (field) => field?.id === key || field?.props?.id === key,
        );

        if (controllingField) {
          const disabled = compareValues[controllingField?.props?.value];

          disableIds.forEach((patchId) => {
            const targetFieldIndex = updatedFields.findIndex(
              (field) => field?.id === patchId || field?.props?.id === patchId,
            );

            if (targetFieldIndex !== -1) {
              const tElement = updatedFields[targetFieldIndex];
              const id = tElement?.id || tElement?.props?.id;
              response[guid][id] = disabled ? '' : response[guid][id];
              updatedFields[targetFieldIndex] = {
                ...updatedFields[targetFieldIndex],
                props: {
                  ...updatedFields[targetFieldIndex].props,
                  value: disabled ? '' : updatedFields[targetFieldIndex]?.props?.value,
                  MuiAttributes: {
                    ...updatedFields[targetFieldIndex].props?.MuiAttributes,
                    disabled,
                  },
                },
              };
            }
          });
        }
      });
    }

    return updatedFields;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating patch data:', error);
    return fields; // Return original fields on error
  }
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
