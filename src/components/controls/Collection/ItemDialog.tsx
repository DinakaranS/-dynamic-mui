// eslint-disable-next-line import/no-cycle
import { useRef, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, Icon, IconButton, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
// eslint-disable-next-line import/no-cycle
import { FormGenerator, FormApi } from '../../FormGenerator';
import type { CollectionUi } from './ui';

export type ItemDialogMode = 'add' | 'edit' | 'view';

interface ItemDialogProps {
    ui: CollectionUi;
    open: boolean;
    mode: ItemDialogMode;
    /** Unique per collection level; the inner form's store key derives from it. */
    guid: string;
    /** Changes on every open so the inner form always remounts fresh. */
    session: number;
    initial?: Record<string, any>;
    /** Title of the parent item this one belongs to ("Acme Corp"). */
    context?: string;
    onClose: () => void;
    onSave: (values: Record<string, any>, keepOpen: boolean) => void;
}

/** Add / edit / view dialog for one collection item, hosting a FormGenerator.
 *  Every part is styled through the level's `styles` (dialog* slots). */
export default function ItemDialog({ ui, open, mode, guid, session, initial, context, onClose, onSave }: ItemDialogProps) {
    const theme = useTheme();
    const options = ui.config.dialog || {};
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const fullScreen = options.fullScreen === true || (options.fullScreen !== false && isMobile);
    const apiRef = useRef<FormApi>(null);
    // Bumped after "Save & add another" to remount a blank form.
    const [round, setRound] = useState(0);
    const { accent } = ui;

    const title = ui.t(mode === 'add' ? 'dialogAddTitle' : mode === 'edit' ? 'dialogEditTitle' : 'dialogViewTitle');
    const formGuid = `${guid}-dialog-${session}-${round}`;
    // "For {parent}" with the parent's name emphasised.
    const contextText = ui.t('dialogContext');
    const [ctxBefore, ctxAfter] = contextText.includes('{parent}') ? contextText.split('{parent}') : [contextText, null];

    const save = (keepOpen: boolean) => {
        const api = apiRef.current;
        if (!api || !api.validate()) return;
        onSave({ ...api.getValues() }, keepOpen);
        if (keepOpen) setRound((r) => r + 1);
    };

    return (
        <Dialog
            open={open}
            onClose={(_e, reason) => { if (reason !== 'backdropClick') onClose(); }}
            fullScreen={fullScreen}
            fullWidth
            maxWidth={options.maxWidth || 'sm'}
            aria-labelledby={`${guid}-dialog-title`}
            onKeyDown={(e) => {
                if (mode !== 'view' && e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    save(false);
                }
            }}
            sx={{
                '& .MuiDialog-paper': ui.merged('dialog', {
                    borderRadius: fullScreen ? 0 : '12px',
                    backgroundImage: 'none',
                }),
            }}
        >
            <Box sx={ui.sx('dialogHeader', {
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                px: { xs: 2, sm: 3 },
                pt: 2.5,
                pb: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
            })}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography id={`${guid}-dialog-title`} sx={ui.sx('dialogTitle', { fontWeight: 600, fontSize: 18, lineHeight: 1.3 })}>
                        {title}
                    </Typography>
                    {context && (
                        <Typography sx={ui.sx('dialogContext', { fontSize: 13.5, color: 'text.secondary', mt: 0.25 })}>
                            {ctxBefore}
                            {ctxAfter !== null && <Box component="strong" sx={{ color: 'text.primary', fontWeight: 600 }}>{context}</Box>}
                            {ctxAfter}
                        </Typography>
                    )}
                    {options.description && (
                        <Typography sx={ui.sx('dialogDescription', { fontSize: 13.5, color: 'text.secondary', mt: 0.25 })}>
                            {options.description}
                        </Typography>
                    )}
                </Box>
                <IconButton aria-label={ui.t('closeAria')} onClick={onClose} size="small" sx={{ mt: -0.5, mr: -1, color: 'text.secondary' }}>
                    <Icon>close</Icon>
                </IconButton>
            </Box>

            <DialogContent sx={ui.sx('dialogContent', { px: { xs: 2, sm: 3 }, pt: '20px !important', pb: 3 })}>
                <FormGenerator
                    key={formGuid}
                    guid={formGuid}
                    data={ui.config.fields || []}
                    patch={mode === 'add' ? {} : (initial || {})}
                    apiRef={apiRef}
                    readOnly={mode === 'view'}
                    MuiGridAttributes={{ spacing: options.spacing ?? 2 }}
                />
            </DialogContent>

            <DialogActions sx={ui.sx('dialogActions', {
                px: { xs: 2, sm: 3 },
                py: 1.5,
                gap: 1,
                flexWrap: 'wrap',
                borderTop: `1px solid ${theme.palette.divider}`,
                '& .MuiButton-root': { textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 2, whiteSpace: 'nowrap', ml: '0 !important' },
            })}>
                {mode === 'view' ? (
                    <Button variant="contained" disableElevation onClick={onClose} sx={ui.sx('dialogSave', { bgcolor: accent.main, color: accent.contrastText, '&:hover': { bgcolor: accent.dark } })}>
                        {ui.t('close')}
                    </Button>
                ) : (
                    <>
                        <Button onClick={onClose} color="inherit" sx={ui.sx('dialogCancel', { color: 'text.secondary' })}>{ui.t('cancel')}</Button>
                        {mode === 'add' && options.addAnother !== false && (
                            <Button
                                variant="outlined"
                                color="inherit"
                                onClick={() => save(true)}
                                sx={ui.sx('dialogSaveAnother', { color: ui.ink, borderColor: alpha(accent.main, 0.5), '&:hover': { borderColor: accent.main, bgcolor: alpha(accent.main, 0.06) } })}
                            >
                                {ui.t('saveAndAddAnother')}
                            </Button>
                        )}
                        <Tooltip title={ui.t('shortcut')} placement="top" describeChild>
                            <Button
                                variant="contained"
                                color="inherit"
                                disableElevation
                                startIcon={<Icon>{mode === 'add' ? 'add' : 'check'}</Icon>}
                                onClick={() => save(false)}
                                sx={ui.sx('dialogSave', { bgcolor: accent.main, color: accent.contrastText, '&:hover': { bgcolor: accent.dark } })}
                            >
                                {mode === 'add' ? ui.t('save') : ui.t('saveChanges')}
                            </Button>
                        </Tooltip>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}
