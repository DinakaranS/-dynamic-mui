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

    // Sync the stored signature (from patch / after save) into local state.
    // The stored value is rendered as an <img> preview (see below) — we
    // deliberately do NOT draw it onto the SignatureCanvas: the value is a
    // cross-origin S3 URL, and drawing a cross-origin image taints the canvas,
    // which then makes toDataURL() throw "Tainted canvases may not be exported"
    // on the next Save. Keeping the canvas image-free avoids that entirely and
    // also sidesteps the async fromDataURL draw races (double / disappearing image).
    useEffect(() => {
        if (!attributes.value) {
            // Patch cleared the signature: reset state and wipe any fresh strokes.
            setSavedUrl(null);
            setUserSaved(false);
            if (sigPad.current) sigPad.current.clear();
            return;
        }
        setSavedUrl(attributes.value);
    }, [attributes.value]);

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
        // Use full canvas (not getTrimmedCanvas) so the saved image dimensions
        // match the canvas. fromDataURL on reload then renders at the same
        // size — trimming produces a tiny bbox image that gets stretched up
        // to canvas size on reload, looking blurry and oversized.
        const dataUrl = sigPad.current.toDataURL('image/png');
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
                    position: 'relative',
                    // Own stacking context so neighbouring fields can never paint
                    // over the drawing surface and steal pointer events.
                    isolation: 'isolate',
                    zIndex: 1,
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
                        style: {
                            display: 'block',
                            position: 'relative',
                            zIndex: 1,
                            // Prevent the browser from treating a signing drag as a
                            // scroll/pan gesture (touch & stylus) — without this,
                            // strokes are swallowed whenever the page can scroll,
                            // which is exactly when other fields are present.
                            touchAction: 'none',
                            pointerEvents: disabled ? 'none' : 'auto',
                            ...CanvasProps?.style,
                            width: '100%',
                            height: canvasHeight,
                        },
                    }}
                    backgroundColor="transparent"
                />

                {/* Stored signature shown as a plain image overlay — keeps the
                    canvas untainted so re-signing + toDataURL() stays exportable.
                    Cleared via the Clear button (savedUrl -> null) to re-sign. */}
                {savedUrl && (
                    <Box
                        component="img"
                        src={savedUrl}
                        alt="Signature"
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: canvasHeight,
                            objectFit: 'contain',
                            bgcolor: 'background.paper',
                        }}
                    />
                )}
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
