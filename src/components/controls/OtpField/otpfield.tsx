import React, { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react';
import MuiTextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { PREMIUM_EASING, mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

const toChars = (value: string, length: number): string[] => {
    const chars = (value || '').slice(0, length).split('');
    return Array.from({ length }, (_, i) => chars[i] || '');
};

export default function OtpField({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const { MuiAttributes = {}, id = '', label = '' } = attributes;
    const length: number = attributes.length || 6;

    const [values, setValues] = React.useState<string[]>(() =>
        toChars(attributes.value || '', length),
    );

    const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);

    useUpdateEffect(() => {
        setValues(toChars(attributes.value || '', length));
    }, [attributes.value, length]);

    const isMandatory =
        rules?.validation?.some(
            (v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect',
        ) || false;

    const emit = (next: string[]) => {
        setValues(next);
        if (typeof onChange === 'function') onChange({ id, value: next.join('') });
    };

    const focusBox = (index: number) => {
        const el = inputsRef.current[index];
        if (el) el.focus();
    };

    const handleChange = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        // Only keep the last typed character for this box.
        const char = raw ? raw.slice(-1) : '';
        const next = [...values];
        next[index] = char;
        emit(next);
        if (char && index < length - 1) focusBox(index + 1);
    };

    const handleKeyDown = (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !values[index] && index > 0) {
            e.preventDefault();
            const next = [...values];
            next[index - 1] = '';
            emit(next);
            focusBox(index - 1);
        } else if (e.key === 'ArrowLeft' && index > 0) {
            focusBox(index - 1);
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            focusBox(index + 1);
        }
    };

    const handlePaste = (index: number) => (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').trim();
        if (!pasted) return;
        const next = [...values];
        for (let i = 0; i < pasted.length && index + i < length; i += 1) {
            next[index + i] = pasted[i];
        }
        emit(next);
        const lastFilled = Math.min(index + pasted.length, length - 1);
        focusBox(lastFilled);
    };

    const { sx: userSx, ...restAttrs } = MuiAttributes as any;

    const boxSx = mergeSx(
        ((theme: any) => ({
            width: 48,
            transition: `box-shadow .2s ${PREMIUM_EASING}`,
            '& input': {
                textAlign: 'center',
                fontSize: '1.25rem',
                fontWeight: 700,
            },
            '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                transition: `box-shadow .2s ${PREMIUM_EASING}`,
                '&.Mui-focused': {
                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.16)}`,
                },
            },
        })) as any,
        userSx,
    );

    return (
        <FormControl component="fieldset" required={isMandatory}>
            {label ? <FormLabel component="legend">{label}</FormLabel> : null}
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mt: label ? 1 : 0 }}>
                {values.map((char, index) => (
                    <MuiTextField
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        {...restAttrs}
                        size="small"
                        value={char}
                        inputRef={(el: HTMLInputElement | null) => {
                            inputsRef.current[index] = el;
                        }}
                        onChange={handleChange(index)}
                        onKeyDown={handleKeyDown(index)}
                        onPaste={handlePaste(index)}
                        slotProps={{
                            htmlInput: {
                                maxLength: 1,
                                inputMode: 'text',
                                'aria-label': `${label || 'Code'} digit ${index + 1}`,
                            },
                        }}
                        sx={boxSx as any}
                    />
                ))}
            </Box>
            {isMandatory ? (
                <FormHelperText>{MuiAttributes.helperText || 'Required'}</FormHelperText>
            ) : null}
        </FormControl>
    );
}
