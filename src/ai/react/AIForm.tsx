import React from 'react';
import {
    Box, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, Icon,
} from '@mui/material';
import type { FormField } from '../../types';
import { AIClient } from '../types';
// eslint-disable-next-line import/no-cycle
import { FormGenerator, FormGeneratorProps } from '../../components/FormGenerator';
import AIFill from './AIFill';
import AIFormGenerator from './AIFormGenerator';
import AISchemaReview from './AISchemaReview';

export interface AIFormProps {
    /** Injected, provider-agnostic AI client. */
    client: AIClient;
    /** The form schema (JSON). Used as the initial schema; AI edits update it internally. */
    data: FormField[];
    guid: string;
    /** Initial field values. */
    patch?: Record<string, any>;
    onSubmit?: FormGeneratorProps['onSubmit'];
    onChange?: FormGeneratorProps['onChange'];
    /** Called whenever AI (generate / review) changes the schema. */
    onSchemaChange?: (fields: FormField[]) => void;
    /** Toolbar toggles. */
    enableFill?: boolean;
    enableReview?: boolean;
    enableGenerate?: boolean;
    formRef?: FormGeneratorProps['formRef'];
    /** Extra props forwarded to the inner FormGenerator. */
    formProps?: Partial<FormGeneratorProps>;
}

type Tool = 'fill' | 'review' | 'generate' | null;

/**
 * Drop-in form + AI. Renders a `FormGenerator` from `data` and a small AI toolbar
 * that can generate/edit the schema, review it, and paste-to-fill the values —
 * all wired to the internal schema/patch state. One line to add AI to any form.
 */
export default function AIForm({
    client,
    data,
    guid,
    patch,
    onSubmit,
    onChange,
    onSchemaChange,
    enableFill = true,
    enableReview = true,
    enableGenerate = false,
    formRef,
    formProps,
}: AIFormProps) {
    const [schema, setSchema] = React.useState<FormField[]>(data);
    const [values, setValues] = React.useState<Record<string, any>>(patch || {});
    const [tool, setTool] = React.useState<Tool>(null);

    // Keep in sync when the parent swaps the schema / initial values.
    React.useEffect(() => { setSchema(data); }, [data]);
    React.useEffect(() => { if (patch) setValues((prev) => ({ ...prev, ...patch })); }, [patch]);

    const applySchema = (fields: FormField[]) => {
        if (!fields || !fields.length) return;
        setSchema(fields);
        onSchemaChange?.(fields);
        setTool(null);
    };

    const applyValues = (v: Record<string, any>) => {
        setValues((prev) => ({ ...prev, ...(v || {}) }));
        setTool(null);
    };

    const close = () => setTool(null);

    return (
        <Box>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
                {enableGenerate && (
                    <Button size="small" variant="outlined" startIcon={<Icon>auto_awesome</Icon>}
                        onClick={() => setTool('generate')} sx={{ borderRadius: 2, textTransform: 'none' }}>
                        {schema.length ? 'Edit with AI' : 'Generate with AI'}
                    </Button>
                )}
                {enableFill && !!schema.length && (
                    <Button size="small" variant="outlined" color="secondary" startIcon={<Icon>auto_fix_high</Icon>}
                        onClick={() => setTool('fill')} sx={{ borderRadius: 2, textTransform: 'none' }}>
                        AI Fill
                    </Button>
                )}
                {enableReview && !!schema.length && (
                    <Button size="small" variant="outlined" startIcon={<Icon>fact_check</Icon>}
                        onClick={() => setTool('review')} sx={{ borderRadius: 2, textTransform: 'none' }}>
                        Review
                    </Button>
                )}
            </Stack>

            <FormGenerator
                {...formProps}
                guid={guid}
                data={schema}
                patch={values}
                onSubmit={onSubmit}
                onChange={onChange}
                formRef={formRef}
            />

            <Dialog open={tool === 'generate'} onClose={close} maxWidth="sm" fullWidth>
                <DialogTitle>{schema.length ? 'Edit form with AI' : 'Generate form with AI'}</DialogTitle>
                <DialogContent dividers>
                    <AIFormGenerator client={client} current={schema.length ? schema : undefined} onGenerate={applySchema} />
                </DialogContent>
                <DialogActions><Button onClick={close}>Close</Button></DialogActions>
            </Dialog>

            <Dialog open={tool === 'fill'} onClose={close} maxWidth="sm" fullWidth>
                <DialogTitle>AI Fill — paste text to populate the form</DialogTitle>
                <DialogContent dividers>
                    <AIFill client={client} schema={schema} onFill={applyValues} />
                </DialogContent>
                <DialogActions><Button onClick={close}>Close</Button></DialogActions>
            </Dialog>

            <Dialog open={tool === 'review'} onClose={close} maxWidth="sm" fullWidth>
                <DialogTitle>AI Review</DialogTitle>
                <DialogContent dividers>
                    <AISchemaReview client={client} schema={schema} onApply={applySchema} />
                </DialogContent>
                <DialogActions><Button onClick={close}>Close</Button></DialogActions>
            </Dialog>
        </Box>
    );
}
