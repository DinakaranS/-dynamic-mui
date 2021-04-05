import { remove, clone, map, uniq, sortBy, each } from 'lodash';
import isEmpty from 'lodash/isEmpty';

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

export function getInputProps(library, InputProps) {
  if (!isEmpty(InputProps)) {
    const { MuiInputAdornment = {}, position = 'start', icon, text, textstyle = {} } = InputProps;
    const { InputAdornment, Icon } = library;
    const INPUTADORMENT = InputAdornment;
    const ICON = Icon;
    return {
      [`${position}Adornment`]: (
        <INPUTADORMENT {...MuiInputAdornment}>
          {icon && <ICON>{icon}</ICON>}
          {!isEmpty(textstyle) ? <div style={textstyle}>{text || ''}</div> : text || ''}
        </INPUTADORMENT>
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

export default {
  generateLayout,
  getInputProps,
  generateKey,
};
