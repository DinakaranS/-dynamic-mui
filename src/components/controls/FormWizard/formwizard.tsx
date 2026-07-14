// eslint-disable-next-line import/no-cycle
import { useState, useCallback, useMemo } from 'react';
import { Box, Button, Stepper, Step, StepLabel } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { ControlProps } from '../../../types';
// eslint-disable-next-line import/no-cycle
import { FormGenerator } from '../../FormGenerator';
import { FormField } from '../../../util/helper';
import { mergeSx, PREMIUM_RADIUS, PREMIUM_EASING } from '../../../util/premiumStyles';

interface WizardStep {
    label: string;
    fields: FormField[];
}

export default function FormWizard({ attributes = {}, onChange }: ControlProps) {
    const {
        id = '',
        guid: baseGuid,
        steps = [] as WizardStep[],
        patch = {},
        finishLabel = 'Finish',
        MuiAttributes = {},
    } = attributes as any;

    const [active, setActive] = useState(0);

    /** Stable base guid for the wizard; per-step guids derived from it. */
    const rootGuid = useMemo(() => baseGuid || `${id}-${uuidv4()}`, []); // eslint-disable-line react-hooks/exhaustive-deps

    const stepList: WizardStep[] = Array.isArray(steps) ? steps : [];
    const lastIndex = Math.max(stepList.length - 1, 0);
    const isLast = active >= lastIndex;
    const isFirst = active <= 0;

    const stepGuid = `${rootGuid}-step-${active}`;

    const handleBack = useCallback(() => {
        setActive((prev) => Math.max(prev - 1, 0));
    }, []);

    const handleNext = useCallback(() => {
        if (active >= lastIndex) {
            // Finishing the last step: signal completion.
            onChange?.({ id, value: 'complete', option: active });
            return;
        }
        setActive((prev) => Math.min(prev + 1, lastIndex));
    }, [active, lastIndex, id, onChange]);

    const btnSx = ((theme: any) => ({
        borderRadius: `${PREMIUM_RADIUS + 8}px`,
        textTransform: 'none',
        fontWeight: 600,
        px: 3,
        transition: `box-shadow .18s ${PREMIUM_EASING}, transform .18s ${PREMIUM_EASING}`,
        '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 12px ${theme.palette.primary.main}22`,
        },
    })) as any;

    return (
        <Box sx={{ width: '100%' }} {...MuiAttributes}>
            {/* ── Stepper header ─────────────────────────────── */}
            <Stepper
                activeStep={active}
                alternativeLabel
                sx={{
                    mb: 3,
                    '& .MuiStepLabel-label': { fontWeight: 500 },
                    '& .MuiStepIcon-root.Mui-active': { transition: `color .2s ${PREMIUM_EASING}` },
                }}
            >
                {stepList.map((step, i) => (
                    <Step key={`${rootGuid}-label-${i}`}>
                        <StepLabel>{step?.label ?? `Step ${i + 1}`}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {/* ── Active step's fields ───────────────────────── */}
            <Box sx={{ mb: 3 }}>
                {stepList[active] && (
                    <FormGenerator
                        key={stepGuid}
                        guid={stepGuid}
                        data={stepList[active].fields ?? []}
                        patch={patch}
                        persistOnUnmount
                        onChange={(args) => {
                            // Bubble inner field changes up to the parent.
                            onChange?.(args);
                        }}
                    />
                )}
            </Box>

            {/* ── Navigation ─────────────────────────────────── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={isFirst}
                    sx={mergeSx(btnSx)}
                >
                    Back
                </Button>
                <Button variant="contained" onClick={handleNext} sx={mergeSx(btnSx)}>
                    {isLast ? finishLabel : 'Next'}
                </Button>
            </Box>
        </Box>
    );
}
