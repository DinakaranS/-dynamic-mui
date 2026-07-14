import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { mergeSx, premiumSurfaceSx } from '../../../util/premiumStyles';
import { uploadToS3 } from '../../../util/s3Upload';
import { ControlProps } from '../../../types';

/** Normalise an incoming value (string | string[]) into a string[] of URLs. */
const toList = (value: any): string[] => {
    if (!value) return [];
    return Array.isArray(value) ? value.filter(Boolean) : [value];
};

const isImageUrl = (url: string): boolean =>
    /^data:image\//i.test(url) || /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(url);

/** Reads a File into a base64 data URL. */
const readAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || '');
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });

/** FileUpload Control — dropzone + S3 upload with preview list. */
export default function FileUpload({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const {
        id = '',
        multiple = false,
        accept = '',
        bucket = '',
        region = '',
        identityPoolId = '',
        path = '',
        maxSizeMB = 0,
        label = 'Upload file',
        MuiAttributes = {},
    } = attributes;

    const inputRef = useRef<HTMLInputElement>(null);
    const [urls, setUrls] = useState<string[]>(toList(attributes.value));
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isMandatory =
        rules?.validation?.some((v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect') || false;

    // Sync external value changes (patch / reset) into local state.
    useUpdateEffect(() => {
        setUrls(toList(attributes.value));
    }, [attributes.value]);

    const emit = (next: string[], files?: File[]) => {
        onChange?.({ id, value: multiple ? next : next[0] ?? '', option: files });
    };

    const processFiles = async (fileList: FileList | File[]) => {
        const files = Array.from(fileList);
        if (!files.length) return;

        setError('');
        setLoading(true);

        const uploaded: string[] = [];
        const accepted: File[] = [];
        try {
            for (const file of files) {
                if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
                    setError(`"${file.name}" exceeds the ${maxSizeMB}MB limit.`);
                    continue;
                }
                const dataUrl = await readAsDataUrl(file);
                const url = await uploadToS3(dataUrl, file.name, bucket, region, identityPoolId, path);
                uploaded.push(url);
                accepted.push(file);
            }
        } catch (e) {
            console.error('FileUpload failed', e);
            setError('Upload failed. Please try again.');
        } finally {
            setLoading(false);
        }

        if (!uploaded.length) return;

        const next = multiple ? [...urls, ...uploaded] : uploaded.slice(0, 1);
        setUrls(next);
        emit(next, accepted);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) processFiles(e.target.files);
        // Allow re-selecting the same file.
        e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer?.files?.length) processFiles(e.dataTransfer.files);
    };

    const handleRemove = (index: number) => {
        const next = urls.filter((_, i) => i !== index);
        setUrls(next);
        emit(next);
    };

    return (
        <Box sx={{ width: '100%', ...MuiAttributes.sx }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex' }}>
                {label}
                {isMandatory && (
                    <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                        *
                    </Box>
                )}
            </Typography>

            <input
                ref={inputRef}
                type="file"
                hidden
                multiple={multiple}
                accept={accept || undefined}
                onChange={handleInputChange}
            />

            <Box
                role="button"
                aria-label={label}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                sx={{
                    border: '2px dashed',
                    borderColor: dragging ? 'primary.main' : 'divider',
                    borderRadius: '12px',
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all .2s',
                    bgcolor: dragging ? 'action.hover' : 'background.paper',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                }}
            >
                {loading ? (
                    <CircularProgress size={28} />
                ) : (
                    <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                )}
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Drag &amp; drop {multiple ? 'files' : 'a file'} here, or click to browse
                </Typography>
                {accept && (
                    <Typography variant="caption" color="text.secondary">
                        Accepted: {accept}
                    </Typography>
                )}
            </Box>

            {error && (
                <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 1 }}>
                    {error}
                </Typography>
            )}

            {urls.length > 0 && (
                <Box sx={mergeSx(premiumSurfaceSx as any, { mt: 1.5, p: 1 })}>
                    {urls.map((url, index) => (
                        <Box
                            key={`${url}-${index}`}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                p: 1,
                                borderRadius: '8px',
                                transition: 'background-color .18s',
                                '&:hover': { bgcolor: 'action.hover' },
                            }}
                        >
                            {isImageUrl(url) ? (
                                <Box
                                    component="img"
                                    src={url}
                                    alt={`upload-${index}`}
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        flexShrink: 0,
                                    }}
                                />
                            ) : (
                                <InsertDriveFileIcon color="action" sx={{ flexShrink: 0 }} />
                            )}
                            <Typography
                                variant="body2"
                                sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            >
                                {url.split('/').pop()?.split('?')[0] || url}
                            </Typography>
                            <IconButton
                                size="small"
                                aria-label="remove"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(index);
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}
