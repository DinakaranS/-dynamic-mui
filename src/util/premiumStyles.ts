import { alpha, Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/material';

/**
 * Shared "premium" design language for every control.
 *
 * The published controls render under the *consumer's* MUI ThemeProvider, so
 * these styles are applied inline via `sx` (not global theme overrides) and are
 * written against palette tokens (primary/error/background/text) so they adapt
 * to whatever theme the host app provides — light or dark.
 *
 * Each export is a theme-aware `sx` function. Compose with a control's existing
 * user `sx` via `mergeSx(premiumX, userSx)` so consumer overrides always win.
 */

export const PREMIUM_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
export const PREMIUM_RADIUS = 10;

/** Compose base premium sx with user-provided sx (user wins, later in array). */
export const mergeSx = (
    base?: SxProps<Theme>,
    userSx?: SxProps<Theme>,
): SxProps<Theme> => ([] as any[]).concat(base ?? [], userSx ?? []);

/** Text-like inputs: TextField, NumberField, MultiTextbox, Select, pickers. */
export const premiumInputSx = (theme: Theme): SxProps<Theme> => ({
    // Cover both the plain outlined input AND the MUI X pickers' outlined input
    // (`.MuiPickersOutlinedInput-root`, used since x-date-pickers v7's accessible
    // sectioned field) so a date picker matches the text fields around it exactly.
    '& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root': {
        borderRadius: `${PREMIUM_RADIUS}px`,
        backgroundColor: theme.palette.background.paper,
        transition: `box-shadow .2s ${PREMIUM_EASING}, border-color .2s ${PREMIUM_EASING}`,
        '& fieldset': {
            borderColor: alpha(theme.palette.text.primary, 0.12),
            transition: `border-color .2s ${PREMIUM_EASING}`,
        },
        '&:hover': {
            boxShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.06)}`,
        },
        '&:hover fieldset': {
            borderColor: alpha(theme.palette.primary.main, 0.5),
        },
        '&.Mui-focused': {
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.16)}`,
        },
        '&.Mui-focused fieldset': {
            borderWidth: 1.5,
            borderColor: theme.palette.primary.main,
        },
        '&.Mui-error.Mui-focused': {
            boxShadow: `0 0 0 3px ${alpha(theme.palette.error.main, 0.16)}`,
        },
    },
    '& .MuiFilledInput-root, & .MuiInput-root': {
        transition: `box-shadow .2s ${PREMIUM_EASING}`,
    },
    '& .MuiInputLabel-root': { fontWeight: 500 },
});

/** A single selectable row (FormControlLabel) for radio / checkbox groups. */
export const premiumControlLabelSx = (theme: Theme): SxProps<Theme> => ({
    borderRadius: `${PREMIUM_RADIUS}px`,
    marginLeft: 0,
    marginRight: 0,
    paddingRight: 1.25,
    transition: `background-color .18s ${PREMIUM_EASING}`,
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.06),
    },
});

/** Switch: refined track + thumb with smooth motion. */
export const premiumSwitchSx = (theme: Theme): SxProps<Theme> => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
        '& + .MuiSwitch-track': { opacity: 1 },
    },
    '& .MuiSwitch-thumb': {
        boxShadow: `0 2px 6px ${alpha(theme.palette.common.black, 0.2)}`,
    },
    '& .MuiSwitch-track': {
        borderRadius: 22 / 2,
        transition: `background-color .2s ${PREMIUM_EASING}, opacity .2s ${PREMIUM_EASING}`,
    },
});

/** Pill-shaped chip with a soft lift on hover. */
export const premiumChipSx = (theme: Theme): SxProps<Theme> => ({
    borderRadius: '999px',
    fontWeight: 600,
    transition: `transform .18s ${PREMIUM_EASING}, box-shadow .18s ${PREMIUM_EASING}`,
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.12)}`,
    },
});

/** Surfaces: List / Paper-like containers with a crisp, soft border. */
export const premiumSurfaceSx = (theme: Theme): SxProps<Theme> => ({
    borderRadius: `${PREMIUM_RADIUS + 2}px`,
    border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
    overflow: 'hidden',
    transition: `box-shadow .2s ${PREMIUM_EASING}`,
    '&:hover': {
        boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.08)}`,
    },
});
