import { describe, it, expect } from 'vitest';
import { migrateFormData, migrateFormField } from './helper';

describe('migrateFormData', () => {
    it('migrates TextField InputProps → slotProps.input', () => {
        const input = [
            {
                type: 'textfield',
                props: {
                    id: 'name',
                    MuiAttributes: {
                        InputProps: { startAdornment: 'X' },
                    },
                },
            },
        ];
        const out = migrateFormData(input);
        expect(out[0].props.MuiAttributes.InputProps).toBeUndefined();
        expect(out[0].props.MuiAttributes.slotProps.input.startAdornment).toBe('X');
    });

    it('migrates TextField inputProps → slotProps.htmlInput', () => {
        const input = [
            {
                type: 'textfield',
                props: {
                    MuiAttributes: { inputProps: { min: 0, max: 10 } },
                },
            },
        ];
        const out = migrateFormData(input);
        expect(out[0].props.MuiAttributes.inputProps).toBeUndefined();
        expect(out[0].props.MuiAttributes.slotProps.htmlInput).toEqual({ min: 0, max: 10 });
    });

    it('preserves existing slotProps when merging', () => {
        const input = [
            {
                type: 'textfield',
                props: {
                    MuiAttributes: {
                        InputProps: { startAdornment: 'X' },
                        slotProps: { input: { endAdornment: 'Y' } },
                    },
                },
            },
        ];
        const out = migrateFormData(input);
        expect(out[0].props.MuiAttributes.slotProps.input).toEqual({
            startAdornment: 'X',
            endAdornment: 'Y',
        });
    });

    it('migrates primaryTypographyProps → slotProps.primary with sx', () => {
        const input = [
            {
                type: 'list',
                props: {
                    MuiAttributes: {
                        primaryTypographyProps: { fontWeight: 500, fontSize: '0.875rem', color: 'primary' },
                    },
                },
            },
        ];
        const out = migrateFormData(input);
        expect(out[0].props.MuiAttributes.primaryTypographyProps).toBeUndefined();
        expect(out[0].props.MuiAttributes.slotProps.primary.sx).toEqual({
            fontWeight: 500,
            fontSize: '0.875rem',
        });
        expect(out[0].props.MuiAttributes.slotProps.primary.color).toBe('primary');
    });

    it('migrates Typography fontWeight → sx.fontWeight', () => {
        const input = [
            {
                type: 'typography',
                props: {
                    MuiAttributes: { fontWeight: 700, variant: 'h6' },
                },
            },
        ];
        const out = migrateFormData(input);
        expect(out[0].props.MuiAttributes.fontWeight).toBeUndefined();
        expect(out[0].props.MuiAttributes.sx.fontWeight).toBe(700);
        expect(out[0].props.MuiAttributes.variant).toBe('h6');
    });

    it('converts Typography paragraph → sx.mb', () => {
        const input = [
            { type: 'typography', props: { MuiAttributes: { paragraph: true } } },
        ];
        const out = migrateFormData(input);
        expect(out[0].props.MuiAttributes.paragraph).toBeUndefined();
        expect(out[0].props.MuiAttributes.sx.mb).toBe(2);
    });

    it('is a no-op on already-migrated JSON', () => {
        const input = [
            {
                type: 'textfield',
                props: {
                    MuiAttributes: {
                        slotProps: { input: { startAdornment: 'X' } },
                    },
                },
            },
        ];
        const out = migrateFormData(input);
        expect(out[0].props.MuiAttributes.slotProps.input.startAdornment).toBe('X');
    });

    it('recurses into stepper MuiSteps.components', () => {
        const input = [
            {
                type: 'stepper',
                props: {
                    MuiSteps: [
                        {
                            label: 'Step 1',
                            components: [
                                {
                                    type: 'textfield',
                                    props: {
                                        MuiAttributes: { InputProps: { startAdornment: 'X' } },
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
        ];
        const out = migrateFormData(input);
        const step0comp0 = out[0].props.MuiSteps[0].components[0];
        expect(step0comp0.props.MuiAttributes.InputProps).toBeUndefined();
        expect(step0comp0.props.MuiAttributes.slotProps.input.startAdornment).toBe('X');
    });

    it('recurses into subforms', () => {
        const input = [
            {
                type: 'radio',
                props: { id: 'r1' },
                subforms: [
                    {
                        conditionValue: 'yes',
                        data: [
                            {
                                type: 'textfield',
                                props: { MuiAttributes: { inputProps: { min: 0 } } },
                            },
                        ],
                    },
                ],
            },
        ];
        const out = migrateFormData(input);
        const nested = out[0].subforms[0].data[0];
        expect(nested.props.MuiAttributes.inputProps).toBeUndefined();
        expect(nested.props.MuiAttributes.slotProps.htmlInput.min).toBe(0);
    });

    it('migrateFormField handles a single field', () => {
        const field = {
            type: 'textfield',
            props: { MuiAttributes: { InputProps: { startAdornment: 'X' } } },
        };
        const out = migrateFormField(field);
        expect(out.props.MuiAttributes.InputProps).toBeUndefined();
        expect(out.props.MuiAttributes.slotProps.input.startAdornment).toBe('X');
    });

    it('returns non-array input unchanged', () => {
        expect(migrateFormData(null as any)).toBe(null);
        expect(migrateFormData(undefined as any)).toBe(undefined);
    });

    it('does not mutate the input', () => {
        const input = [
            {
                type: 'textfield',
                props: { MuiAttributes: { InputProps: { startAdornment: 'X' } } },
            },
        ];
        const original = JSON.parse(JSON.stringify(input));
        migrateFormData(input);
        expect(input).toEqual(original);
    });
});
