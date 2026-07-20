import { useMemo, useRef, useState } from 'react';
import {
    Box, Paper, Typography, Icon, Chip, Collapse, Button, Tooltip, TextField, InputAdornment,
    Switch, FormControlLabel, Table, TableBody, TableRow, TableCell, ToggleButton, ToggleButtonGroup, IconButton,
} from '@mui/material';
import { FormGenerator, FormApi, FormData } from '../index';
import { FormField } from '../util/helper';
import { TEMPLATES, TOOLBOX_ITEMS } from './templates';
import { COMPONENT_DOCS } from './documentation';
import { CATEGORIES, CATEGORY_META } from './Sidebar';
import { DEMO_VARIANTS, DemoVariant } from './demoVariants';
import { DEMO_RECIPES } from './demoRecipes';
import { DEMO_FORMS } from './demoForms';

const PATTERN_GRAD: [string, string] = ['#7c3aed', '#ec4899']; // violet → pink accent for patterns
const FORM_GRAD: [string, string] = ['#0d9488', '#0ea5e9']; // teal → sky accent for real-world forms

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
                <Typography variant="body2" color="text.secondary" sx={{ px: 1.6, pt: 1.4 }}>{doc.description}</Typography>
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
                        <Typography variant="body2" color="text.secondary">No props documented for this component.</Typography>
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

/** A practical multi-field pattern (formula, dependent selects, conditional logic, …). */
const RecipeCard = ({ recipe, onAddFields, grad = PATTERN_GRAD }: { recipe: typeof DEMO_RECIPES[number]; onAddFields: (f: FormField[]) => void; grad?: [string, string] }) => {
    const [from, to] = grad;
    const [values, setValues] = useState<Record<string, any>>({});
    const [showConfig, setShowConfig] = useState(false);
    const [copied, setCopied] = useState(false);
    const apiRef = useRef<FormApi | null>(null);
    const configJson = JSON.stringify(recipe.data, null, 2);
    const copy = () => { try { navigator.clipboard.writeText(configJson); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { /* ignore */ } };

    return (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', '&:hover': { boxShadow: '0 14px 30px -18px rgba(15,23,42,0.3)', borderColor: `${from}55` } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.6, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ width: 34, height: 34, borderRadius: 2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: `linear-gradient(135deg, ${from}, ${to})`, boxShadow: `0 4px 10px -3px ${from}99` }}>
                    <Icon fontSize="small">{recipe.icon}</Icon>
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', flex: 1 }} noWrap>{recipe.title}</Typography>
                <Tooltip title="Validate (submit)"><IconButton size="small" onClick={() => apiRef.current?.validate()}><Icon fontSize="small">rule</Icon></IconButton></Tooltip>
                <Tooltip title="Add to builder"><IconButton size="small" onClick={() => onAddFields(recipe.data)}><Icon fontSize="small">add_circle</Icon></IconButton></Tooltip>
                <Tooltip title="Config"><IconButton size="small" onClick={() => setShowConfig((v) => !v)}><Icon fontSize="small">{showConfig ? 'expand_less' : 'code'}</Icon></IconButton></Tooltip>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ px: 1.6, pt: 1.4 }}>{recipe.description}</Typography>
            <Box sx={{ p: 1.6, flex: 1 }}>
                <Box sx={{ p: 1.6, borderRadius: 2, bgcolor: '#fafbff', border: '1px dashed', borderColor: 'divider' }}>
                    <FormGenerator
                        guid={`recipe-${recipe.id}`}
                        data={recipe.data}
                        apiRef={(h: FormApi | null) => { apiRef.current = h; }}
                        onChange={() => setValues({ ...(FormData(`recipe-${recipe.id}`) || {}) })}
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

/** A collapsible accent section (Real-World Forms / Practical Patterns). */
const AccentSection = ({ id, title, description, icon, grad, count, open, onToggle, children }: {
    id: string; title: string; description: string; icon: string; grad: [string, string]; count: number; open: boolean; onToggle: () => void; children: React.ReactNode;
}) => (
    <Box id={`demo-cat-${id}`} sx={{ mb: 3, scrollMarginTop: 16 }}>
        <Box
            onClick={onToggle}
            sx={{
                display: 'flex', alignItems: 'center', gap: 1.25, p: 1.4, borderRadius: 2.5,
                cursor: 'pointer', userSelect: 'none', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
                boxShadow: '0 1px 3px rgba(15,23,42,0.05)', transition: 'all .18s',
                '&:hover': { borderColor: `${grad[0]}66`, boxShadow: `0 8px 20px -12px ${grad[0]}66` },
            }}
        >
            <Box sx={{ width: 30, height: 30, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`, boxShadow: `0 4px 10px -3px ${grad[0]}99` }}>
                <Icon fontSize="small">{icon}</Icon>
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: grad[0], letterSpacing: '0.02em' }}>{title}</Typography>
            <Chip size="small" label={count} sx={{ fontWeight: 700, bgcolor: `${grad[0]}16`, color: grad[0] }} />
            <Box sx={{ flex: 1 }} />
            <Icon sx={{ color: 'text.disabled', transition: 'transform .2s', transform: open ? 'none' : 'rotate(-90deg)' }}>expand_more</Icon>
        </Box>
        <Collapse in={open} timeout="auto" unmountOnExit>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, mb: 2, px: 0.5 }}>{description}</Typography>
            {children}
        </Collapse>
    </Box>
);

/** Full-width live gallery: patterns + every component in multiple config variants, with props, code, and add-to-builder. */
export const DemoGallery = ({ onAddField, onAddFields }: { onAddField: (field: FormField) => void; onAddFields: (fields: FormField[]) => void }) => {
    const [search, setSearch] = useState('');
    // Everything is collapsed by default — sections render their (heavy) live forms
    // only when the user expands them, keeping the tab fast.
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
        // Real-World Forms is open on arrival; everything else is collapsed so the
        // tab stays fast — heavy live forms mount only when a section is expanded.
        const init: Record<string, boolean> = { Forms: false, Patterns: true };
        Object.keys(CATEGORIES).forEach((c) => { init[c] = true; });
        return init;
    });
    const toggle = (key: string) => setCollapsed((p) => ({ ...p, [key]: !p[key] }));
    // The demo body is the single scroll region. We scroll IT directly (never
    // scrollIntoView, which would drag the whole app / header out of view).
    const bodyRef = useRef<HTMLDivElement>(null);

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

    const jumpTo = (category: string) => {
        setCollapsed((prev) => ({ ...prev, [category]: false }));
        setTimeout(() => {
            const container = bodyRef.current;
            const target = document.getElementById(`demo-cat-${category}`);
            if (!container || !target) return;
            // Scroll the container by the delta between the target and the container
            // top — precise and scoped, so ancestors (and the header) never move.
            const delta = target.getBoundingClientRect().top - container.getBoundingClientRect().top;
            container.scrollTo({ top: container.scrollTop + delta - 8, behavior: 'smooth' });
        }, 60);
    };

    return (
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#f4f6fb' }}>
            {/* Toolbar */}
            <Box sx={{ px: { xs: 2, md: 4 }, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                    size="small"
                    placeholder="Search components…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ minWidth: 240, bgcolor: 'background.paper', borderRadius: 2 }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Icon fontSize="small" sx={{ color: 'text.disabled' }}>search</Icon></InputAdornment> }}
                />
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    <Chip
                        label="Forms"
                        size="small"
                        onClick={() => jumpTo('Forms')}
                        icon={<Icon sx={{ fontSize: 15 }}>description</Icon>}
                        sx={{ fontWeight: 700, color: FORM_GRAD[0], bgcolor: `${FORM_GRAD[0]}12`, '& .MuiChip-icon': { color: FORM_GRAD[0] }, '&:hover': { bgcolor: `${FORM_GRAD[0]}22` } }}
                    />
                    <Chip
                        label="Patterns"
                        size="small"
                        onClick={() => jumpTo('Patterns')}
                        icon={<Icon sx={{ fontSize: 15 }}>bolt</Icon>}
                        sx={{ fontWeight: 700, color: PATTERN_GRAD[0], bgcolor: `${PATTERN_GRAD[0]}12`, '& .MuiChip-icon': { color: PATTERN_GRAD[0] }, '&:hover': { bgcolor: `${PATTERN_GRAD[0]}22` } }}
                    />
                    {Object.entries(CATEGORIES).map(([category]) => {
                        const meta = CATEGORY_META[category];
                        return (
                            <Chip
                                key={category}
                                label={category}
                                size="small"
                                onClick={() => jumpTo(category)}
                                icon={<Icon sx={{ fontSize: 15 }}>{meta.icon}</Icon>}
                                sx={{ fontWeight: 700, color: meta.grad[0], bgcolor: `${meta.grad[0]}12`, '& .MuiChip-icon': { color: meta.grad[0] }, '&:hover': { bgcolor: `${meta.grad[0]}22` } }}
                            />
                        );
                    })}
                </Box>
            </Box>

            {/* Scrollable body — the single scroll region for the demo tab */}
            <Box ref={bodyRef} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', p: { xs: 2, md: 4 } }}>
                <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                    {!search.trim() && (
                        <AccentSection
                            id="Forms" title="Real-World Forms" icon="description" grad={FORM_GRAD} count={DEMO_FORMS.length}
                            open={!collapsed.Forms} onToggle={() => toggle('Forms')}
                            description="Complete water-utility field forms — real examples combining labels, text, selects, multi-select chips, checkboxes/switches, live formulas, conditional fields and subforms. Interact with one, Validate it, or Add to Builder to start from it."
                        >
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 2.5 }}>
                                {DEMO_FORMS.map((f) => <RecipeCard key={f.id} recipe={f} onAddFields={onAddFields} grad={FORM_GRAD} />)}
                            </Box>
                        </AccentSection>
                    )}
                    {!search.trim() && (
                        <AccentSection
                            id="Patterns" title="Practical Patterns" icon="bolt" grad={PATTERN_GRAD} count={DEMO_RECIPES.length}
                            open={!collapsed.Patterns} onToggle={() => toggle('Patterns')}
                            description="Real multi-field examples of the dynamic engine — live formulas, dependent selects, conditional visibility, required/disabled rules, and cross-field validation. Interact with them, hit Validate, or add one to the Builder."
                        >
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2.5 }}>
                                {DEMO_RECIPES.map((r) => <RecipeCard key={r.id} recipe={r} onAddFields={onAddFields} />)}
                            </Box>
                        </AccentSection>
                    )}
                    {sections.map(({ category, meta, types }) => {
                        const open = search.trim() ? true : !collapsed[category];
                        return (
                            <Box key={category} id={`demo-cat-${category}`} sx={{ mb: 3, scrollMarginTop: 16 }}>
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
            </Box>
        </Box>
    );
};
