import { useMemo, useRef, useState } from 'react';
import {
    Box, Paper, Typography, Icon, Chip, Collapse, Button, Tooltip, TextField, InputAdornment,
    Switch, FormControlLabel, Table, TableBody, TableRow, TableCell, ToggleButton, ToggleButtonGroup, IconButton,
    Tabs, Tab, Alert,
} from '@mui/material';
import { FormGenerator, FormApi, FormData, ClearFormData, SubmitButtonConfig, registerControl, zodResolver, ControlComponent, validateSchema, SchemaIssue } from '../index';
import { AIFormGenerator, AISchemaReview, AIFill } from '../ai';
import { useAI, AIConfigFields } from './AIContext';
import { FormField } from '../util/helper';
import { TEMPLATES, TOOLBOX_ITEMS } from './templates';
import { COMPONENT_DOCS } from './documentation';
import { CATEGORIES, CATEGORY_META } from './Sidebar';
import { DEMO_VARIANTS, DemoVariant } from './demoVariants';
import { DEMO_RECIPES } from './demoRecipes';
import { DEMO_FORMS } from './demoForms';

const PATTERN_GRAD: [string, string] = ['#7c3aed', '#ec4899']; // violet → pink accent for patterns
const FORM_GRAD: [string, string] = ['#0d9488', '#0ea5e9']; // teal → sky accent for real-world forms

// Per-form submit-button configs — showcases the FormGenerator `submitButton`
// option: different colours, icons, gradients and loading labels.
const FORM_SUBMIT_CONFIGS: Record<string, SubmitButtonConfig> = {
    'valve-exercise': { label: 'Submit report', color: 'primary', icon: 'check_circle', loadingLabel: 'Submitting…' },
    'hydrant-flushing': { label: 'Log flushing', color: 'info', icon: 'water_drop', loadingLabel: 'Logging…' },
    'meter-maintenance': { label: 'Save record', color: 'success', icon: 'save', loadingLabel: 'Saving…' },
    'broken-valve-wo': { label: 'Dispatch work order', gradient: ['#f59e0b', '#ef4444'], icon: 'engineering', loadingLabel: 'Dispatching…' },
};
const DEFAULT_SUBMIT: SubmitButtonConfig = { label: 'Submit report', color: 'primary', icon: 'send', loadingLabel: 'Submitting…' };

const MANDATORY = ['mandatory', 'mandatoryselect'];

/** Apply generic live tweaks (required / disabled) to a variant's field. */
const applyTweaks = (field: FormField, tweaks: { required: boolean; disabled: boolean }): FormField => {
    const f: any = JSON.parse(JSON.stringify(field));
    if (tweaks.disabled) {
        f.props = f.props || {};
        f.props.MuiAttributes = { ...(f.props.MuiAttributes || {}), disabled: true };
    }
    if (tweaks.required) {
        const val = f.rules?.validation || [];
        if (!val.some((v: any) => MANDATORY.includes(v.rule))) {
            f.rules = { ...(f.rules || {}), validation: [...val, { rule: 'mandatory', message: 'Required' }] };
        }
    }
    return f;
};

interface DemoCardProps {
    type: string;
    grad: [string, string];
    onAddField: (field: FormField) => void;
}

const DemoCard = ({ type, grad, onAddField }: DemoCardProps) => {
    const [from, to] = grad;
    const item = TOOLBOX_ITEMS.find((t) => t.type === type);
    const variants: DemoVariant[] = DEMO_VARIANTS[type]
        || ((TEMPLATES[type] || []).length ? [{ label: 'Default', field: (TEMPLATES[type] as FormField[])[0] }] : []);
    const doc = COMPONENT_DOCS[type];
    const [section, setSection] = useState<'preview' | 'props' | 'code'>('preview');
    const [codeMode, setCodeMode] = useState<'json' | 'usage' | 'typed'>('json');
    const [tweaks, setTweaks] = useState({ required: false, disabled: false });
    const [emitted, setEmitted] = useState<Record<number, any>>({});
    const [copied, setCopied] = useState('');
    const apiRefs = useRef<Record<number, FormApi | null>>({});

    if (!item || variants.length === 0) return null;

    const fields = variants.map((v) => applyTweaks(v.field, tweaks));
    const configJson = JSON.stringify(fields, null, 2);
    const usageCode = `import { FormGenerator } from 'dynamic-mui';\n\n<FormGenerator\n  guid="my-form"\n  data={${configJson}}\n/>`;
    const typedCode = `import { defineForm, FormGenerator } from 'dynamic-mui';\n\nconst schema = defineForm(${configJson});\n\n<FormGenerator guid="my-form" data={schema} />`;
    const codeText = codeMode === 'usage' ? usageCode : codeMode === 'typed' ? typedCode : configJson;
    const copy = (text: string, key: string) => {
        try { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(''), 1200); } catch { /* ignore */ }
    };
    const propEntries = doc?.props ? Object.entries(doc.props) : [];

    return (
        <Paper
            elevation={0}
            sx={{
                border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden',
                display: 'flex', flexDirection: 'column', bgcolor: 'background.paper',
                transition: 'box-shadow .2s, border-color .2s',
                '&:hover': { boxShadow: '0 14px 30px -18px rgba(15,23,42,0.3)', borderColor: `${from}55` },
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.6, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{
                    width: 34, height: 34, borderRadius: 2, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                    background: `linear-gradient(135deg, ${from}, ${to})`, boxShadow: `0 4px 10px -3px ${from}99`,
                }}>
                    <Icon fontSize="small">{item.icon}</Icon>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.2 }} noWrap>{item.label}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontFamily: 'monospace' }}>{type}</Typography>
                </Box>
                <ToggleButtonGroup
                    value={section}
                    exclusive
                    size="small"
                    onChange={(_e, v) => v && setSection(v)}
                    sx={{ '& .MuiToggleButton-root': { px: 1, py: 0.25, textTransform: 'none', border: '1px solid', borderColor: 'divider' } }}
                >
                    <ToggleButton value="preview"><Tooltip title="Preview"><Icon fontSize="small">visibility</Icon></Tooltip></ToggleButton>
                    <ToggleButton value="props"><Tooltip title="Props"><Icon fontSize="small">tune</Icon></Tooltip></ToggleButton>
                    <ToggleButton value="code"><Tooltip title="Code"><Icon fontSize="small">code</Icon></Tooltip></ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {doc?.description && (
                <Typography
                    variant="body2"
                    sx={{
                        color: "text.secondary",
                        px: 1.6,
                        pt: 1.4
                    }}>{doc.description}</Typography>
            )}

            {/* PREVIEW */}
            {section === 'preview' && (
                <Box sx={{ p: 1.6, flex: 1, display: 'flex', flexDirection: 'column', gap: 1.6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', pb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Try:</Typography>
                        <FormControlLabel
                            control={<Switch size="small" checked={tweaks.required} onChange={(e) => setTweaks((t) => ({ ...t, required: e.target.checked }))} />}
                            label={<Typography variant="caption">Required</Typography>}
                            sx={{ m: 0 }}
                        />
                        <FormControlLabel
                            control={<Switch size="small" checked={tweaks.disabled} onChange={(e) => setTweaks((t) => ({ ...t, disabled: e.target.checked }))} />}
                            label={<Typography variant="caption">Disabled</Typography>}
                            sx={{ m: 0 }}
                        />
                    </Box>

                    {variants.map((v, i) => (
                        <Box key={i}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.6 }}>
                                <Box component="span" sx={{ px: 0.85, py: 0.15, borderRadius: 1, fontSize: '0.68rem', fontWeight: 700, bgcolor: `${from}14`, color: from }}>{v.label}</Box>
                                <Box sx={{ flex: 1 }} />
                                <Tooltip title="Validate">
                                    <IconButton size="small" onClick={() => apiRefs.current[i]?.validate()}><Icon fontSize="small">rule</Icon></IconButton>
                                </Tooltip>
                                <Tooltip title="Add this variant to the builder">
                                    <IconButton size="small" onClick={() => onAddField(fields[i])}><Icon fontSize="small">add_circle</Icon></IconButton>
                                </Tooltip>
                            </Box>
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#fafbff', border: '1px dashed', borderColor: 'divider' }}>
                                <FormGenerator
                                    guid={`demo-${type}-${i}`}
                                    data={[fields[i]]}
                                    apiRef={(h: FormApi | null) => { apiRefs.current[i] = h; }}
                                    onChange={(a: any) => setEmitted((prev) => ({ ...prev, [i]: a }))}
                                    MuiGridAttributes={{ spacing: 1 }}
                                />
                            </Box>
                            {emitted[i] !== undefined && (
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontFamily: 'monospace', color: 'text.secondary', wordBreak: 'break-all' }}>
                                    emits: {`${emitted[i].id ?? type} = ${JSON.stringify(emitted[i].value)}`}
                                </Typography>
                            )}
                        </Box>
                    ))}
                </Box>
            )}

            {/* PROPS */}
            {section === 'props' && (
                <Box sx={{ p: 1.6, flex: 1 }}>
                    {propEntries.length ? (
                        <Table size="small">
                            <TableBody>
                                {propEntries.map(([prop, desc]) => (
                                    <TableRow key={prop}>
                                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'secondary.main', fontSize: 12, verticalAlign: 'top', width: '38%', px: 1, borderColor: 'divider' }}>{prop}</TableCell>
                                        <TableCell sx={{ fontSize: 12, color: 'text.secondary', px: 1, borderColor: 'divider' }}>{desc}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Typography variant="body2" sx={{
                            color: "text.secondary"
                        }}>No props documented for this component.</Typography>
                    )}
                </Box>
            )}

            {/* CODE */}
            {section === 'code' && (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.6, pb: 1 }}>
                        <ToggleButtonGroup value={codeMode} exclusive size="small" onChange={(_e, v) => v && setCodeMode(v)} sx={{ '& .MuiToggleButton-root': { px: 1.25, py: 0.25, textTransform: 'none', fontSize: '0.72rem', fontWeight: 700 } }}>
                            <ToggleButton value="json">Config</ToggleButton>
                            <ToggleButton value="usage">Usage</ToggleButton>
                            <ToggleButton value="typed">Typed</ToggleButton>
                        </ToggleButtonGroup>
                        <Box sx={{ flex: 1 }} />
                        <Button size="small" onClick={() => copy(codeText, 'code')} startIcon={<Icon>{copied === 'code' ? 'check' : 'content_copy'}</Icon>} sx={{ textTransform: 'none' }}>
                            {copied === 'code' ? 'Copied' : 'Copy'}
                        </Button>
                    </Box>
                    <Box component="pre" sx={{ m: 0, p: 1.6, mx: 1.6, mb: 1.6, borderRadius: 2, bgcolor: '#1e293b', color: '#e2e8f0', overflow: 'auto', maxHeight: 300, fontFamily: 'Consolas, Monaco, monospace', fontSize: 11.5, lineHeight: 1.6 }}>
                        {codeText}
                    </Box>
                </Box>
            )}
        </Paper>
    );
};

/** A practical multi-field pattern (formula, dependent selects, conditional logic, …).
 *  With `features`, adds the UX toolbar: Review mode, Print, PDF, Undo, dirty flag. */
const RecipeCard = ({ recipe, onAddFields, grad = PATTERN_GRAD, features = false }: { recipe: typeof DEMO_RECIPES[number]; onAddFields: (f: FormField[]) => void; grad?: [string, string]; features?: boolean }) => {
    const [from, to] = grad;
    const [values, setValues] = useState<Record<string, any>>({});
    const [showConfig, setShowConfig] = useState(false);
    const [copied, setCopied] = useState(false);
    const [review, setReview] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [flash, setFlash] = useState<'ok' | 'err' | null>(null);
    const apiRef = useRef<FormApi | null>(null);
    const guid = `recipe-${recipe.id}`;
    const configJson = JSON.stringify(recipe.data, null, 2);
    const copy = () => { try { navigator.clipboard.writeText(configJson); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { /* ignore */ } };
    const refresh = () => { setValues({ ...(FormData(guid) || {}) }); setDirty(!!apiRef.current?.isDirty()); };
    const onFormSubmit = (_v: any, errs: any[]) => {
        if (errs.length) { setFlash('err'); setTimeout(() => setFlash(null), 2400); return undefined; }
        // Return a Promise → FormGenerator shows the button's loader until it settles.
        return new Promise<void>((res) => setTimeout(res, 1300)).then(() => { setFlash('ok'); setTimeout(() => setFlash(null), 2400); });
    };
    const downloadPdf = () => { apiRef.current?.exportPdf({ title: recipe.title }).catch((e) => window.alert(e?.message || 'PDF export failed')); };

    return (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', '&:hover': { boxShadow: '0 14px 30px -18px rgba(15,23,42,0.3)', borderColor: `${from}55` } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 1.6, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ width: 34, height: 34, mr: 0.75, borderRadius: 2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: `linear-gradient(135deg, ${from}, ${to})`, boxShadow: `0 4px 10px -3px ${from}99` }}>
                    <Icon fontSize="small">{recipe.icon}</Icon>
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', flex: 1 }} noWrap>{recipe.title}</Typography>
                {features && flash === 'ok' && <Chip size="small" label="Submitted ✓" sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, bgcolor: '#16a34a22', color: '#15803d' }} />}
                {features && flash === 'err' && <Chip size="small" label="Fix errors" sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, bgcolor: '#ef444422', color: '#b91c1c' }} />}
                {features && dirty && <Chip size="small" label="Modified" sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, bgcolor: '#f59e0b22', color: '#b45309' }} />}
                {features && (
                    <>
                        <Tooltip title={review ? 'Back to edit' : 'Review summary'}><IconButton size="small" onClick={() => setReview((v) => !v)} sx={{ color: review ? from : undefined }}><Icon fontSize="small">{review ? 'edit' : 'visibility'}</Icon></IconButton></Tooltip>
                        <Tooltip title="Print / Save as PDF"><IconButton size="small" onClick={() => apiRef.current?.print({ title: recipe.title })}><Icon fontSize="small">print</Icon></IconButton></Tooltip>
                        <Tooltip title="Download PDF"><IconButton size="small" onClick={downloadPdf}><Icon fontSize="small">picture_as_pdf</Icon></IconButton></Tooltip>
                        <Tooltip title="Undo all edits"><span><IconButton size="small" disabled={!dirty} onClick={() => { apiRef.current?.resetToInitial(); refresh(); }}><Icon fontSize="small">undo</Icon></IconButton></span></Tooltip>
                    </>
                )}
                <Tooltip title="Validate (submit)"><IconButton size="small" onClick={() => apiRef.current?.validate()}><Icon fontSize="small">rule</Icon></IconButton></Tooltip>
                <Tooltip title="Add to builder"><IconButton size="small" onClick={() => onAddFields(recipe.data)}><Icon fontSize="small">add_circle</Icon></IconButton></Tooltip>
                <Tooltip title="Config"><IconButton size="small" onClick={() => setShowConfig((v) => !v)}><Icon fontSize="small">{showConfig ? 'expand_less' : 'code'}</Icon></IconButton></Tooltip>
            </Box>
            <Typography
                variant="body2"
                sx={{
                    color: "text.secondary",
                    px: 1.6,
                    pt: 1.4
                }}>{recipe.description}</Typography>
            <Box sx={{ p: 1.6, flex: 1 }}>
                <Box sx={{ p: 1.6, borderRadius: 2, bgcolor: review ? '#f8fafc' : '#fafbff', border: '1px dashed', borderColor: 'divider', ...(features && !review ? { maxHeight: 460, overflowY: 'auto' } : {}) }}>
                    {features && review && (
                        <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 700, color: from, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Review — read-only summary</Typography>
                    )}
                    <FormGenerator
                        guid={guid}
                        data={recipe.data}
                        reviewMode={features && review}
                        submitButton={features && !review ? (FORM_SUBMIT_CONFIGS[recipe.id] || DEFAULT_SUBMIT) : undefined}
                        stickySubmit={features}
                        onSubmit={features ? onFormSubmit : undefined}
                        apiRef={(h: FormApi | null) => { apiRef.current = h; }}
                        onChange={refresh}
                        MuiGridAttributes={{ spacing: 1.5 }}
                    />
                </Box>
                {Object.keys(values).length > 0 && (
                    <Box sx={{ mt: 1.25, display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Chip size="small" label="data" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: `${from}16`, color: from }} />
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', wordBreak: 'break-all' }}>{JSON.stringify(values)}</Typography>
                    </Box>
                )}
            </Box>
            <Collapse in={showConfig} unmountOnExit>
                <Box sx={{ position: 'relative', borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button size="small" onClick={copy} startIcon={<Icon>{copied ? 'check' : 'content_copy'}</Icon>} sx={{ position: 'absolute', top: 8, right: 8, textTransform: 'none', color: 'grey.300', zIndex: 1, '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>{copied ? 'Copied' : 'Copy'}</Button>
                    <Box component="pre" sx={{ m: 0, p: 1.75, bgcolor: '#1e293b', color: '#e2e8f0', overflow: 'auto', maxHeight: 280, fontFamily: 'Consolas, Monaco, monospace', fontSize: 11.5, lineHeight: 1.6 }}>{configJson}</Box>
                </Box>
            </Collapse>
        </Paper>
    );
};

/** A titled card with a live preview and a collapsible code snippet — used by
 *  the Extensibility page. */
const DemoInfoCard = ({ title, icon, grad, desc, code, children }: { title: string; icon: string; grad: [string, string]; desc: React.ReactNode; code: string; children: React.ReactNode }) => {
    const [showCode, setShowCode] = useState(false);
    const [copied, setCopied] = useState(false);
    const copy = () => { try { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { /* ignore */ } };
    return (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.6, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ width: 34, height: 34, borderRadius: 2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`, boxShadow: `0 4px 10px -3px ${grad[0]}99` }}>
                    <Icon fontSize="small">{icon}</Icon>
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', flex: 1 }}>{title}</Typography>
                <Tooltip title="Show code"><IconButton size="small" onClick={() => setShowCode((v) => !v)}><Icon fontSize="small">{showCode ? 'expand_less' : 'code'}</Icon></IconButton></Tooltip>
            </Box>
            <Typography
                variant="body2"
                sx={{
                    color: "text.secondary",
                    px: 1.6,
                    pt: 1.4
                }}>{desc}</Typography>
            <Box sx={{ p: 1.6, flex: 1 }}>
                <Box sx={{ p: 1.6, borderRadius: 2, bgcolor: '#fafbff', border: '1px dashed', borderColor: 'divider' }}>{children}</Box>
            </Box>
            <Collapse in={showCode} unmountOnExit>
                <Box sx={{ position: 'relative', borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button size="small" onClick={copy} startIcon={<Icon>{copied ? 'check' : 'content_copy'}</Icon>} sx={{ position: 'absolute', top: 8, right: 8, textTransform: 'none', color: 'grey.300', zIndex: 1, '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>{copied ? 'Copied' : 'Copy'}</Button>
                    <Box component="pre" sx={{ m: 0, p: 1.75, bgcolor: '#1e293b', color: '#e2e8f0', overflow: 'auto', maxHeight: 300, fontFamily: 'Consolas, Monaco, monospace', fontSize: 11.5, lineHeight: 1.6 }}>{code}</Box>
                </Box>
            </Collapse>
        </Paper>
    );
};

// ── Custom controls, registered via the public `registerControl` API. They get
//    the same ControlProps as built-ins (value in attributes.value, id in
//    attributes.id) and participate fully in the engine. ────────────────────────
const StarRatingControl: ControlComponent = ({ attributes = {}, onChange }) => {
    const value = Number(attributes.value ?? 0);
    return (
        <Box>
            {attributes.MuiAttributes?.label && <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>{attributes.MuiAttributes.label}</Typography>}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                    <Icon key={n} onClick={() => onChange?.({ id: attributes.id || '', value: n })} sx={{ cursor: 'pointer', fontSize: 28, color: n <= value ? '#f59e0b' : '#cbd5e1', transition: 'color .15s' }}>{n <= value ? 'star' : 'star_border'}</Icon>
                ))}
            </Box>
        </Box>
    );
};

const ColorSwatchControl: ControlComponent = ({ attributes = {}, onChange }) => {
    const value = (attributes.value as string) ?? '#6366f1';
    return (
        <Box>
            {attributes.MuiAttributes?.label && <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>{attributes.MuiAttributes.label}</Typography>}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Box component="input" type="color" value={value} onChange={(e: any) => onChange?.({ id: attributes.id || '', value: e.target.value })} sx={{ width: 46, height: 36, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, cursor: 'pointer', p: 0, bgcolor: 'transparent' }} />
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{value}</Typography>
            </Box>
        </Box>
    );
};

// Register once at module load — usable anywhere as `{ type: 'star-rating' }` etc.
registerControl('star-rating', StarRatingControl);
registerControl('color-swatch', ColorSwatchControl);

const CODE_REGISTER = `import { registerControl } from 'dynamic-mui';

registerControl('star-rating', ({ attributes, onChange }) => {
  const value = Number(attributes.value ?? 0);
  return [1,2,3,4,5].map(n => (
    <Star key={n} filled={n <= value}
      onClick={() => onChange({ id: attributes.id, value: n })} />
  ));
});

// then use it in any schema:
{ type: 'star-rating', props: { id: 'rating' } }`;

const CODE_ZOD = `import { z } from 'zod';
import { zodResolver } from 'dynamic-mui';

const schema = z.object({
  email:    z.string().email(),
  username: z.string().min(3),
  age:      z.number().min(18),
});

<FormGenerator data={fields} resolver={zodResolver(schema)} />`;

// Zod-style schema, duck-typed so the playground needs no zod install; with real
// zod you'd pass zodResolver(z.object({...})).
const signupSchema = {
    safeParse: (v: Record<string, any>) => {
        const issues: any[] = [];
        if (!v.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v.email))) issues.push({ path: ['email'], message: 'Enter a valid email' });
        if (!v.username || String(v.username).length < 3) issues.push({ path: ['username'], message: 'At least 3 characters' });
        if (Number(v.age ?? 0) < 18) issues.push({ path: ['age'], message: 'Must be 18 or older' });
        return issues.length ? { success: false, error: { issues } } : { success: true };
    },
};

const customControlSchema: FormField[] = [
    { type: 'star-rating', props: { id: 'rating', MuiAttributes: { label: 'Rate this' } }, layout: { row: 1, xs: 12, sm: 6 } },
    { type: 'color-swatch', props: { id: 'brand', value: '#6366f1', MuiAttributes: { label: 'Brand color' } }, layout: { row: 1, xs: 12, sm: 6 } },
    { type: 'textfield', props: { id: 'note', MuiAttributes: { label: 'Note', multiline: true, minRows: 2 } }, layout: { row: 2, xs: 12 } },
] as any;

const zodFormSchema: FormField[] = [
    { type: 'textfield', props: { id: 'email', MuiAttributes: { label: 'Email' } }, layout: { row: 1, xs: 12, sm: 4 } },
    { type: 'textfield', props: { id: 'username', MuiAttributes: { label: 'Username' } }, layout: { row: 1, xs: 12, sm: 4 } },
    { type: 'numberfield', props: { id: 'age', MuiAttributes: { label: 'Age' } }, layout: { row: 1, xs: 12, sm: 4 } },
] as any;

const CODE_ASYNC = `const checkUsername = async (value) => {
  const res = await fetch('/api/username?u=' + value);
  const { taken } = await res.json();
  return taken ? 'That username is taken' : null; // falsy = valid
};

<FormGenerator data={fields}
  asyncValidators={{ username: checkUsername }} />`;

// Simulated server — these names are "taken".
const takenNames = new Set(['admin', 'root', 'test', 'ada', 'user']);
const checkUsernameDemo = (value: any) => new Promise<string | null>((res) => {
    setTimeout(() => res(value && takenNames.has(String(value).toLowerCase()) ? 'That username is already taken' : null), 700);
});
const asyncFormSchema: FormField[] = [
    { type: 'textfield', props: { id: 'username', MuiAttributes: { label: 'Choose a username' } }, rules: { validation: [{ rule: 'mandatory', message: 'Required' }] }, layout: { row: 1, xs: 12 } },
] as any;

const CODE_LINT = `import { validateSchema } from 'dynamic-mui';

const issues = validateSchema(mySchema);
// [{ level, code, field?, message }]
if (issues.some(i => i.level === 'error')) {
  console.error('Fix the form schema:', issues);
}`;

// A deliberately broken schema so the linter has something to report.
const LINT_SAMPLE = JSON.stringify([
    { type: 'textfield', props: { id: 'email' } },
    { type: 'textfield', props: { id: 'email' } },
    { type: 'select', props: { id: 'state' }, dependsOn: 'country', optionsMap: { us: [] } },
    { type: 'textfield', props: { id: 'reason' }, visibleWhen: { field: 'status', op: 'eq', value: 'other' } },
    { type: 'select', props: { id: 'kind', options: [{ value: 'a', label: 'A' }] }, subforms: [{ conditionValue: 'zzz', data: [{ type: 'textfield', props: { id: 'note' } }] }] },
], null, 2);

const SchemaLinterCard = () => {
    const [text, setText] = useState(LINT_SAMPLE);
    const { issues, parseError } = useMemo(() => {
        try {
            const parsed = JSON.parse(text);
            return { issues: validateSchema(Array.isArray(parsed) ? parsed : []) as SchemaIssue[], parseError: null as string | null };
        } catch (e: any) {
            return { issues: [] as SchemaIssue[], parseError: e?.message || 'Invalid JSON' };
        }
    }, [text]);

    return (
        <DemoInfoCard
            title="Schema linter — validateSchema()" icon="fact_check" grad={['#f43f5e', '#8b5cf6']}
            desc={<>Catch config mistakes <b>before</b> runtime. Edit the schema below and the issues update live — try fixing the duplicate <code>email</code> id or pointing <code>dependsOn</code> at a real field.</>}
            code={CODE_LINT}
        >
            <TextField
                multiline minRows={8} maxRows={14} fullWidth value={text} onChange={(e) => setText(e.target.value)}
                spellCheck={false}
                sx={{ mb: 1.5, '& textarea': { fontFamily: 'Consolas, Monaco, monospace', fontSize: 11.5, lineHeight: 1.5 } }}
            />
            {parseError ? (
                <Alert severity="error" icon={<Icon fontSize="small">error_outline</Icon>}>Invalid JSON: {parseError}</Alert>
            ) : issues.length === 0 ? (
                <Alert severity="success" icon={<Icon fontSize="small">check_circle</Icon>}>No issues — the schema is clean.</Alert>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{issues.length} issue{issues.length > 1 ? 's' : ''}</Typography>
                    {issues.map((iss, i) => {
                        const err = iss.level === 'error';
                        return (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1, borderRadius: 1.5, bgcolor: err ? '#fef2f2' : '#fffbeb', border: '1px solid', borderColor: err ? '#fecaca' : '#fde68a' }}>
                                <Icon fontSize="small" sx={{ color: err ? '#dc2626' : '#d97706', mt: 0.1 }}>{err ? 'error' : 'warning'}</Icon>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: err ? '#b91c1c' : '#b45309' }}>
                                        {iss.code}{iss.field ? ` · ${iss.field}` : ''}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{iss.message}</Typography>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            )}
        </DemoInfoCard>
    );
};

const CODE_I18N = `// your app's i18n dictionary → a translate function
const t = (s) => dictionary[s] ?? s;

<FormGenerator data={fields} translate={t} />
// every label, option, placeholder, helper text, validation
// message and the submit button gets localized.`;

// Demo dictionaries. English is the base (identity); the others map the strings
// used in the form below.
const I18N: Record<string, Record<string, string>> = {
    en: {},
    fil: {
        'Contact form': 'Form ng pakikipag-ugnayan',
        'Full name': 'Buong pangalan',
        Email: 'Email',
        Country: 'Bansa',
        Message: 'Mensahe',
        Submit: 'Isumite',
        Required: 'Kailangan',
        Philippines: 'Pilipinas',
        'United States': 'Estados Unidos',
        India: 'India',
    },
    ta: {
        'Contact form': 'தொடர்பு படிவம்',
        'Full name': 'முழுப் பெயர்',
        Email: 'மின்னஞ்சல்',
        Country: 'நாடு',
        Message: 'செய்தி',
        Submit: 'சமர்ப்பிக்கவும்',
        Required: 'தேவையானது',
        Philippines: 'பிலிப்பைன்ஸ்',
        'United States': 'அமெரிக்கா',
        India: 'இந்தியா',
    },
};

const i18nForm: FormField[] = [
    { type: 'typography', props: { text: 'Contact form', MuiAttributes: { variant: 'subtitle1', sx: { fontWeight: 700 } } }, layout: { row: 0, xs: 12 } },
    { type: 'textfield', props: { id: 'name', MuiAttributes: { label: 'Full name' } }, rules: { validation: [{ rule: 'mandatory', message: 'Required' }] }, layout: { row: 1, xs: 12, sm: 6 } },
    { type: 'textfield', props: { id: 'email', MuiAttributes: { label: 'Email' } }, layout: { row: 1, xs: 12, sm: 6 } },
    { type: 'select', props: { id: 'country', options: [{ value: 'ph', label: 'Philippines' }, { value: 'us', label: 'United States' }, { value: 'in', label: 'India' }], MuiBoxAttributes: { label: 'Country' } }, layout: { row: 2, xs: 12 } },
    { type: 'textfield', props: { id: 'message', MuiAttributes: { label: 'Message', multiline: true, minRows: 2 } }, layout: { row: 3, xs: 12 } },
] as any;

const LanguageCard = () => {
    const [lang, setLang] = useState('en');
    const t = useMemo(() => (s: string) => (I18N[lang]?.[s] ?? s), [lang]);
    return (
        <DemoInfoCard
            title="Language / i18n — translate" icon="translate" grad={['#0ea5e9', '#8b5cf6']}
            desc={<>Pass a <code>translate</code> function and every label, option and validation message is localized. Switch the language — the form updates while keeping your values.</>}
            code={CODE_I18N}
        >
            <ToggleButtonGroup exclusive size="small" value={lang} onChange={(_e, v) => v && setLang(v)} sx={{ mb: 1.5, '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 700, px: 1.5 } }}>
                <ToggleButton value="en">English</ToggleButton>
                <ToggleButton value="fil">Filipino</ToggleButton>
                <ToggleButton value="ta">தமிழ் (Tamil)</ToggleButton>
            </ToggleButtonGroup>
            <FormGenerator
                guid="ext-i18n" data={i18nForm} translate={t} validationSummary
                submitButton={{ label: 'Submit', icon: 'send', color: 'primary' }}
                MuiGridAttributes={{ spacing: 1.5 }}
            />
        </DemoInfoCard>
    );
};

/** Extensibility & DX page — custom controls + Zod/Yup + schema linter + i18n. */
const ExtensibilityPage = () => (
    <Box sx={{ maxWidth: 1400, mx: 'auto', display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' } }}>
        <DemoInfoCard
            title="Custom controls — registerControl()" icon="extension" grad={['#8b5cf6', '#6366f1']}
            desc={<>Plug in your own field types. <b>star-rating</b> and <b>color-swatch</b> below are custom components registered with <code>registerControl</code> — they validate, submit, and read/write <code>FormData</code> just like built-ins.</>}
            code={CODE_REGISTER}
        >
            <FormGenerator guid="ext-custom" data={customControlSchema} MuiGridAttributes={{ spacing: 1.5 }} />
        </DemoInfoCard>
        <DemoInfoCard
            title="Zod / Yup validation — resolver" icon="verified_user" grad={['#0ea5e9', '#22c55e']}
            desc={<>Validate the whole form against a schema. Submit with an invalid email, a short username, or an age under 18 — the resolver’s errors appear in the summary. <code>zod</code>/<code>yup</code> are never bundled.</>}
            code={CODE_ZOD}
        >
            <FormGenerator
                guid="ext-zod" data={zodFormSchema} resolver={zodResolver(signupSchema)} validationSummary
                submitButton={{ label: 'Create account', icon: 'person_add', color: 'primary' }}
                MuiGridAttributes={{ spacing: 1.5 }}
            />
        </DemoInfoCard>
        <DemoInfoCard
            title="Async / remote validation" icon="cloud_sync" grad={['#f59e0b', '#ef4444']}
            desc={<>Validate a field against a server, debounced. Type a username — <b>admin</b>, <b>root</b>, <b>test</b>, <b>ada</b> and <b>user</b> are “taken”. Watch the <i>Checking… → Available / taken</i> indicator; a taken name blocks submit.</>}
            code={CODE_ASYNC}
        >
            <FormGenerator
                guid="ext-async" data={asyncFormSchema} asyncValidators={{ username: checkUsernameDemo }}
                submitButton={{ label: 'Claim username', icon: 'how_to_reg', color: 'success' }}
                MuiGridAttributes={{ spacing: 1.5 }}
            />
        </DemoInfoCard>
        <LanguageCard />
        <SchemaLinterCard />
    </Box>
);

const AI_FEATURES = [
    { icon: 'auto_awesome', title: 'Build a form from a prompt', desc: 'AIFormGenerator turns "a contact form with name, email and message" into a working schema.' },
    { icon: 'content_paste_go', title: 'Paste-to-fill', desc: 'AIFill reads pasted text (an email, a doc) and fills the matching fields automatically.' },
    { icon: 'edit_note', title: 'Field assist', desc: 'AITextAssist rewrites, expands, or summarizes a single field’s text inline.' },
    { icon: 'rule', title: 'Schema review', desc: 'AISchemaReview suggests validation, better labels, and missing fields for a schema.' },
    { icon: 'image_search', title: 'Vision import', desc: 'AIVisionImport builds a form from a screenshot or photo of a paper form.' },
];

const AIStepCard = ({ step, title, children }: { step: string; title: string; children: React.ReactNode }) => (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
            <Box sx={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>{step}</Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{title}</Typography>
        </Box>
        {children}
    </Paper>
);

/** AI page — a live, end-to-end AI demo: generate a form from a prompt, edit it
 *  with words, paste-to-fill, and run an AI schema review. Uses the shared BYOK
 *  client from AIContext, so your provider key stays server-side. */
const AIPage = ({ onAddFields }: { onAddFields: (fields: FormField[]) => void }) => {
    const { client, configured } = useAI();
    const [aiForm, setAiForm] = useState<FormField[] | null>(null);
    const [ver, setVer] = useState(0);
    const apiRef = useRef<FormApi | null>(null);
    const guid = 'ai-demo-form';
    const setForm = (f: FormField[]) => { ClearFormData(guid); setAiForm(f); setVer((v) => v + 1); };

    return (
        <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
            <Paper elevation={0} sx={{ p: 3, mb: 2.5, borderRadius: 3, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
                    <Icon>auto_awesome</Icon>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>AI-assisted forms</Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.92, maxWidth: 820 }}>
                    Build a form from a prompt, refine it with plain-language edits, paste text to autofill, and run an AI review — all through <b>your</b> relay, so your provider key stays server-side (BYOK). Enter your relay URL + key below to try it live.
                </Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 1 }}>Connect your AI relay (BYOK)</Typography>
                <AIConfigFields />
            </Paper>

            {configured && client ? (
                <>
                    <Box sx={{ mb: 2.5 }}>
                        <AIStepCard step="1" title="Generate a form from a prompt">
                            <AIFormGenerator
                                client={client}
                                onGenerate={setForm}
                                label="Describe the form"
                                placeholder="e.g. A patient intake form with name, date of birth, symptoms (multi-select) and a consent checkbox"
                            />
                        </AIStepCard>
                    </Box>

                    {aiForm && (
                        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.1fr) minmax(0, 1fr)' } }}>
                            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', alignSelf: 'start' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', flex: 1 }}>Live form <Chip size="small" label={`${aiForm.length} fields`} sx={{ ml: 0.5, height: 20, fontSize: '0.65rem', fontWeight: 700 }} /></Typography>
                                    <Button size="small" variant="outlined" startIcon={<Icon>add_circle</Icon>} onClick={() => onAddFields(aiForm)} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>Add to Builder</Button>
                                </Box>
                                <Box sx={{ p: 1.6, borderRadius: 2, bgcolor: '#fafbff', border: '1px dashed', borderColor: 'divider' }}>
                                    <FormGenerator key={ver} guid={guid} data={aiForm} apiRef={(h: FormApi | null) => { apiRef.current = h; }} MuiGridAttributes={{ spacing: 1.5 }} />
                                </Box>
                            </Paper>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <AIStepCard step="2" title="Edit with words">
                                    <AIFormGenerator
                                        client={client}
                                        current={aiForm}
                                        onGenerate={setForm}
                                        label="Edit instruction"
                                        placeholder="e.g. add a required phone field after email; make symptoms optional; add a date"
                                    />
                                </AIStepCard>
                                <AIStepCard step="3" title="Paste to autofill">
                                    <AIFill client={client} schema={aiForm} onFill={(vals) => apiRef.current?.setValues(vals)} />
                                </AIStepCard>
                                <AIStepCard step="4" title="AI schema review">
                                    <AISchemaReview client={client} schema={aiForm} onApply={setForm} />
                                </AIStepCard>
                            </Box>
                        </Box>
                    )}
                </>
            ) : (
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' } }}>
                    {AI_FEATURES.map((f) => (
                        <Paper key={f.title} elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                            <Box sx={{ width: 34, height: 34, mb: 1.25, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                                <Icon fontSize="small">{f.icon}</Icon>
                            </Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', mb: 0.5 }}>{f.title}</Typography>
                            <Typography variant="body2" sx={{
                                color: "text.secondary"
                            }}>{f.desc}</Typography>
                        </Paper>
                    ))}
                </Box>
            )}
        </Box>
    );
};

/** Component gallery page — search + every control in multiple config variants. */
const ComponentsPage = ({ onAddField }: { onAddField: (field: FormField) => void }) => {
    const [search, setSearch] = useState('');
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
        const init: Record<string, boolean> = {};
        Object.keys(CATEGORIES).forEach((c) => { init[c] = true; });
        return init;
    });

    const matches = (type: string) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        const it = TOOLBOX_ITEMS.find((t) => t.type === type);
        return type.includes(q) || (it?.label || '').toLowerCase().includes(q);
    };
    const sections = useMemo(() => Object.entries(CATEGORIES).map(([category, types]) => ({
        category,
        meta: CATEGORY_META[category],
        types: types.filter((t) => (TEMPLATES[t] || DEMO_VARIANTS[t] || []).length > 0 && matches(t)),
    })).filter((s) => s.types.length > 0), [search]);

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
            <TextField
                size="small" placeholder="Search components…" value={search} onChange={(e) => setSearch(e.target.value)}
                sx={{ minWidth: 260, mb: 2.5, bgcolor: 'background.paper', borderRadius: 2 }}
                slotProps={{
                    input: { startAdornment: <InputAdornment position="start"><Icon fontSize="small" sx={{ color: 'text.disabled' }}>search</Icon></InputAdornment> }
                }}
            />
            {sections.map(({ category, meta, types }) => {
                const open = search.trim() ? true : !collapsed[category];
                return (
                    <Box key={category} sx={{ mb: 3 }}>
                        <Box
                            onClick={() => setCollapsed((p) => ({ ...p, [category]: !p[category] }))}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 1.25, mb: open ? 2 : 0,
                                p: 1.4, borderRadius: 2.5, cursor: 'pointer', userSelect: 'none',
                                bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
                                boxShadow: '0 1px 3px rgba(15,23,42,0.05)', transition: 'all .18s',
                                '&:hover': { borderColor: `${meta.grad[0]}66`, boxShadow: `0 8px 20px -12px ${meta.grad[0]}66` },
                            }}
                        >
                            <Box sx={{ width: 30, height: 30, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: `linear-gradient(135deg, ${meta.grad[0]}, ${meta.grad[1]})`, boxShadow: `0 4px 10px -3px ${meta.grad[0]}99` }}>
                                <Icon fontSize="small">{meta.icon}</Icon>
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: meta.grad[0], letterSpacing: '0.02em' }}>{category}</Typography>
                            <Chip size="small" label={types.length} sx={{ fontWeight: 700, bgcolor: `${meta.grad[0]}16`, color: meta.grad[0] }} />
                            <Box sx={{ flex: 1 }} />
                            <Icon sx={{ color: 'text.disabled', transition: 'transform .2s', transform: open ? 'none' : 'rotate(-90deg)' }}>expand_more</Icon>
                        </Box>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ display: 'grid', gridTemplateColumns: category === 'Charts' ? { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' } : { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2, pt: 0.5 }}>
                                {types.map((type) => <DemoCard key={type} type={type} grad={meta.grad} onAddField={onAddField} />)}
                            </Box>
                        </Collapse>
                    </Box>
                );
            })}
            {sections.length === 0 && (
                <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 8 }}>
                    <Icon sx={{ fontSize: 40, opacity: 0.4, mb: 1 }}>search_off</Icon>
                    <Typography>No components match “{search}”.</Typography>
                </Box>
            )}
        </Box>
    );
};

const DEMO_TABS = [
    { key: 'forms', label: 'Real-World Forms', icon: 'description', grad: FORM_GRAD },
    { key: 'components', label: 'Components', icon: 'widgets', grad: ['#0ea5e9', '#6366f1'] as [string, string] },
    { key: 'patterns', label: 'Patterns', icon: 'bolt', grad: PATTERN_GRAD },
    { key: 'extensibility', label: 'Extensibility', icon: 'extension', grad: ['#8b5cf6', '#6366f1'] as [string, string] },
    { key: 'ai', label: 'AI', icon: 'auto_awesome', grad: ['#7c3aed', '#db2777'] as [string, string] },
];

/** Tabbed demo — each tab is its own page and only the active one mounts, so the
 *  heavy live forms of one section never slow down the others. */
export const DemoGallery = ({ onAddField, onAddFields }: { onAddField: (field: FormField) => void; onAddFields: (fields: FormField[]) => void }) => {
    const [tab, setTab] = useState('forms');

    return (
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#f4f6fb' }}>
            <Box sx={{ px: { xs: 1, md: 3 }, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>
                <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ minHeight: 52, '& .MuiTab-root': { minHeight: 52, textTransform: 'none', fontWeight: 700, fontSize: '0.86rem' } }}>
                    {DEMO_TABS.map((t) => (
                        <Tab
                            key={t.key}
                            value={t.key}
                            iconPosition="start"
                            icon={<Icon fontSize="small" sx={{ color: tab === t.key ? t.grad[0] : 'text.disabled' }}>{t.icon}</Icon>}
                            label={t.label}
                            sx={{ color: tab === t.key ? t.grad[0] : 'text.secondary', '&.Mui-selected': { color: t.grad[0] } }}
                        />
                    ))}
                </Tabs>
            </Box>

            {/* Only the active tab's page mounts — keeps each page fast. */}
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', p: { xs: 2, md: 4 } }}>
                {tab === 'forms' && (
                    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                                mb: 2
                            }}>
                            Complete water-utility field forms. Each card has a toolbar: 👁 Review · 🖨 Print/PDF · 📄 Download PDF · ↩ Undo, and a sticky configured <b>Submit</b> bar with validation.
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 2.5 }}>
                            {DEMO_FORMS.map((f) => <RecipeCard key={f.id} recipe={f} onAddFields={onAddFields} grad={FORM_GRAD} features />)}
                        </Box>
                    </Box>
                )}
                {tab === 'components' && <ComponentsPage onAddField={onAddField} />}
                {tab === 'patterns' && (
                    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                                mb: 2
                            }}>
                            Real multi-field examples of the dynamic engine — live formulas, dependent selects, conditional visibility, required/disabled rules, and cross-field validation.
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2.5 }}>
                            {DEMO_RECIPES.map((r) => <RecipeCard key={r.id} recipe={r} onAddFields={onAddFields} />)}
                        </Box>
                    </Box>
                )}
                {tab === 'extensibility' && <ExtensibilityPage />}
                {tab === 'ai' && <AIPage onAddFields={onAddFields} />}
            </Box>
        </Box>
    );
};
