import { useEffect, useRef, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { premiumInputSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';
import useUpdateEffect from '../../../util/useUpdateEffect';

/**
 * AsyncAutocomplete — an MUI `Autocomplete` whose options are loaded
 * asynchronously as the user types (server-side search). Client-side filtering
 * is disabled; options come from `loadOptions(query)` or by fetching
 * `optionsUrl` with a `q` query param. Requests are debounced and guarded
 * against out-of-order responses.
 */
export default function AsyncAutocomplete({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const {
        MuiAttributes = {},
        id = '',
        label = 'Search',
        placeholder = '',
        minChars = 1,
        debounceMs = 300,
        labelKey = 'label',
        valueKey = 'value',
        loadOptions,
        optionsUrl,
    } = attributes;

    const [value, setValue] = useState<any>(attributes.value ?? null);
    const [options, setOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Monotonically increasing request id — used to ignore out-of-order results.
    const requestSeq = useRef(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Keep external value in sync.
    useUpdateEffect(() => {
        setValue(attributes.value ?? null);
    }, [attributes.value]);

    // Clean up any pending debounce timer on unmount.
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const fetchOptions = async (query: string): Promise<any[]> => {
        if (typeof loadOptions === 'function') {
            return loadOptions(query);
        }
        if (optionsUrl) {
            const url = `${optionsUrl}${optionsUrl.includes('?') ? '&' : '?'}q=${encodeURIComponent(query)}`;
            const res = await fetch(url);
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        }
        return [];
    };

    const runSearch = (query: string) => {
        const seq = ++requestSeq.current;
        setLoading(true);
        fetchOptions(query)
            .then((result) => {
                // Ignore stale results if a newer query has started.
                if (seq !== requestSeq.current) return;
                setOptions(Array.isArray(result) ? result : []);
                setLoading(false);
            })
            .catch(() => {
                if (seq !== requestSeq.current) return;
                setOptions([]);
                setLoading(false);
            });
    };

    const handleInputChange = (_event: any, newInput: string) => {
        if (timerRef.current) clearTimeout(timerRef.current);

        if (!newInput || newInput.length < minChars) {
            // Below threshold: cancel pending work, clear options.
            requestSeq.current++;
            setLoading(false);
            setOptions([]);
            return;
        }

        timerRef.current = setTimeout(() => {
            runSearch(newInput);
        }, debounceMs);
    };

    const handleChange = (_event: any, selected: any) => {
        setValue(selected);
        onChange?.({
            id,
            value: selected != null ? selected?.[valueKey] ?? selected : selected,
            option: selected,
        });
    };

    const getOptionLabel = (o: any) => (typeof o === 'string' ? o : o?.[labelKey] ?? '');

    const required = !!rules?.validation?.some((r) => r.rule === 'mandatory');

    return (
        <Autocomplete
            value={value}
            onChange={handleChange}
            onInputChange={handleInputChange}
            options={options}
            loading={loading}
            filterOptions={(x) => x}
            getOptionLabel={getOptionLabel}
            renderOption={(props, option: any) => (
                <li {...props} key={(option && option[valueKey]) ?? getOptionLabel(option)}>
                    {getOptionLabel(option)}
                </li>
            )}
            {...MuiAttributes}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    required={required}
                    sx={premiumInputSx as any}
                    slotProps={{
                        ...params.slotProps,

                        input: {
                            ...params.slotProps.input,
                            endAdornment: (
                                <>
                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.slotProps.input.endAdornment}
                                </>
                            ),
                        }
                    }}
                />
            )}
        />
    );
}
