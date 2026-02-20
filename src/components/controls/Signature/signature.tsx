import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { ControlProps } from '../../../types';

export default function Signature({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const { id = '', MuiAttributes = {}, label = 'Signature' } = attributes;
    const sigPad = useRef<SignatureCanvas>(null);
    const [loading, setLoading] = useState(false);
    const [savedUrl, setSavedUrl] = useState<string | null>(attributes.value || null);

    const isMandatory = rules?.validation?.some((v: any) => v.rule === 'mandatory') || false;

    const clear = () => {
        if (sigPad.current) {
            sigPad.current.clear();
        }
        setSavedUrl(null);
        if (onChange) onChange({ id, value: '' });
    };

    const save = async () => {
        if (!sigPad.current || sigPad.current.isEmpty()) return;

        setLoading(true);
        const dataUrl = sigPad.current.getTrimmedCanvas().toDataURL('image/png');

        // MOCK S3 UPLOAD
        // In production, you would fetch() to your backend presigned URL here.
        // const response = await uploadToS3(dataUrl);

        setTimeout(() => {
            // Mocking a returned S3 URL (using the dataURL for preview purposes)
            // const mockS3Url = `https://s3-bucket.amazonaws.com/signatures/${id}-${Date.now()}.png`;
            // For now, we return the dataURL so it works locally without S3
            const resultLocation = dataUrl;

            setSavedUrl(resultLocation);
            setLoading(false);
            if (onChange) onChange({ id, value: resultLocation });
        }, 1500);
    };

    return (
        <Box sx={{ width: '100%', ...MuiAttributes.sx }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex' }}>
                {label}
                {isMandatory && <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>}
            </Typography>

            <Box
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
                        style: { width: '100%', height: 200 },
                    }}
                    backgroundColor="transparent"
                />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button variant="outlined" color="secondary" onClick={clear} size="small">
                    Clear
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={save}
                    size="small"
                    disabled={loading || savedUrl !== null}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                >
                    {savedUrl ? 'Saved' : 'Save & Upload'}
                </Button>
                {savedUrl && (
                    <Typography variant="caption" color="success.main">
                        Signature Uploaded!
                    </Typography>
                )}
            </Box>
        </Box>
    );
}
