import React, { ChangeEvent } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import MuiTextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { premiumInputSx, premiumSurfaceSx, mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';
import useUpdateEffect from '../../../util/useUpdateEffect';

interface Coords {
    lat: string;
    lng: string;
}

/** Normalize an incoming value ({lat,lng} object OR 'lat,lng' string) to Coords. */
const parseValue = (value: any): Coords => {
    if (value && typeof value === 'object') {
        return {
            lat: value.lat !== undefined && value.lat !== null ? String(value.lat) : '',
            lng: value.lng !== undefined && value.lng !== null ? String(value.lng) : '',
        };
    }
    if (typeof value === 'string' && value.includes(',')) {
        const [lat = '', lng = ''] = value.split(',');
        return { lat: lat.trim(), lng: lng.trim() };
    }
    return { lat: '', lng: '' };
};

/**
 * Latitude + longitude coordinate picker with an "Open in Maps" link and an
 * optional OpenStreetMap embed (opt-in via `showMap`).
 */
export default function GeoField({ attributes = {}, onChange }: ControlProps) {
    const {
        id = '',
        label = '',
        showMap = false,
        MuiAttributes = {},
    } = attributes as any;

    const [coords, setCoords] = React.useState<Coords>(() => parseValue(attributes.value));

    useUpdateEffect(() => {
        setCoords(parseValue(attributes.value));
    }, [attributes.value]);

    const emit = (next: Coords) => {
        onChange?.({
            id,
            value: { lat: next.lat, lng: next.lng },
            option: `${next.lat},${next.lng}`,
        });
    };

    const handleChange = (key: keyof Coords) => (e: ChangeEvent<HTMLInputElement>) => {
        const next = { ...coords, [key]: e.target.value };
        setCoords(next);
        emit(next);
    };

    const hasBoth = coords.lat !== '' && coords.lng !== '';
    const inputSx = mergeSx(premiumInputSx as any, MuiAttributes.sx);

    // OpenStreetMap needs a bounding box around the marker.
    const buildEmbedSrc = () => {
        const lat = parseFloat(coords.lat);
        const lng = parseFloat(coords.lng);
        const d = 0.01;
        const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&marker=${lat},${lng}`;
    };

    return (
        <Box id={id}>
            {label ? (
                <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500 }}>
                    {label}
                </Typography>
            ) : null}

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <MuiTextField
                    type="number"
                    {...MuiAttributes}
                    label="Latitude"
                    value={coords.lat}
                    onChange={handleChange('lat')}
                    sx={inputSx}
                    slotProps={{
                        htmlInput: { 'aria-label': 'Latitude', step: 'any' }
                    }}
                />
                <MuiTextField
                    type="number"
                    {...MuiAttributes}
                    label="Longitude"
                    value={coords.lng}
                    onChange={handleChange('lng')}
                    sx={inputSx}
                    slotProps={{
                        htmlInput: { 'aria-label': 'Longitude', step: 'any' }
                    }}
                />
            </Box>

            <Box sx={{ mt: 1 }}>
                <Link
                    href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    variant="body2"
                >
                    Open in Maps
                </Link>
            </Box>

            {showMap && hasBoth ? (
                <Box
                    sx={mergeSx((theme) => ({
                        ...(premiumSurfaceSx(theme) as any),
                        mt: 1.5,
                    }))}
                >
                    <iframe
                        title="map"
                        width="100%"
                        height="240"
                        style={{ border: 0, display: 'block' }}
                        src={buildEmbedSrc()}
                    />
                </Box>
            ) : null}
        </Box>
    );
}
