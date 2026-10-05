import { ComponentType } from 'react';
import { ControlProps } from '../types';

/** A control is any component that accepts the standard `ControlProps`
 *  (`attributes`, `rules`, `onChange`, `submitTick`, `messages`, …). */
export type ControlComponent = ComponentType<ControlProps>;

/** Consumer-registered custom controls, keyed by the schema `type` string. */
const registry = new Map<string, ControlComponent>();

/**
 * Register a custom control so `{ type: '<type>' }` in a form schema renders it.
 * The component receives the same props as any built-in control (its value is in
 * `attributes.value`, its id in `attributes.id`; call `onChange({ id, value })` to
 * update the form). Registering an existing type overrides the built-in control.
 *
 * ```tsx
 * registerControl('color-swatch', ({ attributes, onChange }) => (
 *   <input type="color" value={attributes.value ?? '#000'}
 *          onChange={(e) => onChange?.({ id: attributes.id, value: e.target.value })} />
 * ));
 * ```
 */
export function registerControl(type: string, component: ControlComponent): void {
    if (!type || !component) return;
    registry.set(type, component);
}

/** Register several custom controls at once. */
export function registerControls(controls: Record<string, ControlComponent>): void {
    Object.entries(controls || {}).forEach(([type, component]) => registerControl(type, component));
}

/** Remove a previously registered custom control. */
export function unregisterControl(type: string): void {
    registry.delete(type);
}

/** Look up a registered custom control (used by the renderer). */
export function getRegisteredControl(type?: string): ControlComponent | undefined {
    return type ? registry.get(type) : undefined;
}

/** True when a custom control is registered for this type. */
export function hasRegisteredControl(type?: string): boolean {
    return !!type && registry.has(type);
}

/** All registered custom control type names. */
export function registeredControlTypes(): string[] {
    return Array.from(registry.keys());
}
