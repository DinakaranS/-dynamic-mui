import { useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { ControlProps } from '../../../types';
import { uploadToS3 } from '../../../util/s3Upload';

export default function Signature({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const { id = '', MuiAttributes = {}, label = 'Signature', bucket = '', region = '', identityPoolId = '', path = '', disabled = false, CanvasProps = {} } = attributes;
    const sigPad = useRef<SignatureCanvas>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [savedUrl, setSavedUrl] = useState<string | null>(attributes.value || null);
    const [canvasWidth, setCanvasWidth] = useState(400);
    const [userSaved, setUserSaved] = useState(false);

    const isMandatory = rules?.validation?.some((v: any) => v.rule === 'mandatory') || false;

    const canvasHeight = CanvasProps?.style?.height || 150;

    // Observe parent grid container width using ResizeObserver
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new ResizeObserver((entries) => {
            const width = entries[0]?.contentRect?.width;
            if (width && width > 0) setCanvasWidth(Math.floor(width));
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (attributes.value && sigPad.current) {
            // Load existing signature if provided in initial patch/attributes
            sigPad.current.fromDataURL(attributes.value, { width: canvasWidth, height: canvasHeight });
        }
    }, [attributes.value, canvasWidth, canvasHeight]);

    const clear = () => {
        if (sigPad.current) {
            sigPad.current.clear();
        }
        setSavedUrl(null);
        setUserSaved(false);
        if (onChange) onChange({ id, value: '' });
    };

    const save = async () => {
        if (!sigPad.current || sigPad.current.isEmpty()) return;

        setLoading(true);
        const dataUrl = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
        const fileName = `${id}-${Date.now()}.png`;

        try {
            const uploadedUrl = await uploadToS3(dataUrl, fileName, bucket, region, identityPoolId, path);
            setSavedUrl(uploadedUrl);
            setUserSaved(true);
            if (onChange) onChange({ id, value: uploadedUrl });
        } catch (error) {
            console.error("Signature upload failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ width: '100%', ...MuiAttributes.sx }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex' }}>
                {label}
                {isMandatory && <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>}
            </Typography>

            <Box
                ref={containerRef}
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                }}
            >
                <SignatureCanvas
                    ref={sigPad}
                    penColor="black"
                    canvasProps={{
                        className: 'sigCanvas',
                        width: canvasWidth,
                        height: canvasHeight,
                        style: { display: 'block', pointerEvents: disabled ? 'none' : 'auto', ...CanvasProps?.style, width: '100%', height: canvasHeight },
                    }}
                    backgroundColor="transparent"
                />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mt: 1 }}>
                <Button variant="outlined" color="secondary" onClick={clear} size="small" disabled={disabled || loading}>
                    Clear
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={save}
                    size="small"
                    disabled={disabled || loading || savedUrl !== null}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                >
                    {savedUrl ? 'Saved' : 'Save'}
                </Button>
                {userSaved && savedUrl && (
                    <Typography variant="caption" color="success.main">
                        Signature Saved!
                    </Typography>
                )}
            </Box>
        </Box>
    );
}
