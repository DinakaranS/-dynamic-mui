import MuiTextField from '@mui/material/TextField';
import numeral from 'numeral';
import { premiumInputSx, mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

/**
 * Read-only display for a computed / formula field. The value is derived and
 * supplied by FormGenerator's rule engine (via the field's `formula`); this
 * control just presents it, optionally number-formatted, with a prefix/suffix.
 */
export default function Computed({ attributes = {} }: ControlProps) {
    const {
        MuiAttributes = {},
        format = '',
        prefix = '',
        suffix = '',
        value,
    } = attributes;
    const { sx: userSx, ...restMui } = MuiAttributes;

    const raw = value == null ? '' : value;
    const display =
        format && raw !== '' && Number.isFinite(Number(raw))
            ? numeral(raw).format(format)
            : String(raw);

    return (
        <MuiTextField
            fullWidth
            variant="outlined"
            {...restMui}
            value={display === '' ? '' : `${prefix}${display}${suffix}`}
            InputProps={{ readOnly: true, ...(restMui.InputProps || {}) }}
            aria-readonly
            sx={mergeSx(premiumInputSx as any, userSx)}
        />
    );
}
