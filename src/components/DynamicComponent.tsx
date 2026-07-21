import React, { Suspense } from 'react';
import * as Controls from './controls/index';
// eslint-disable-next-line import/no-cycle
import { ControlProps } from '../types';
import { getRegisteredControl } from '../util/registry';

interface DynamicComponentProps extends ControlProps {
    /** Schema `type` — checked against the custom-control registry first. */
    type?: string;
    map?: string;
    option?: string;
    control?: any;
    currentStep?: number;
    patch?: any;
    onStepUpdate?: any;
    [key: string]: any;
}

/** Isolates a single control: a lazy control that fails to load (e.g. its
 *  optional peer isn't installed) degrades to a small message instead of
 *  crashing the whole form. */
class ControlBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { failed: false };
    }

    static getDerivedStateFromError() {
        return { failed: true };
    }

    render() {
        if (this.state.failed) {
            return (
                <div style={{ padding: '8px 12px', fontSize: 13, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8 }}>
                    This field couldn’t be loaded. Charts and data grids need their optional peer
                    installed (<code>@mui/x-charts</code> / <code>@mui/x-data-grid</code>).
                </div>
            );
        }
        return this.props.children;
    }
}

/** Minimal placeholder while a lazy control's chunk loads — sized to reduce layout shift. */
const ControlFallback = () => <div style={{ minHeight: 40 }} aria-busy="true" />;

export default function DynamicComponent(props: DynamicComponentProps) {
    const { map, type } = props;

    // A consumer-registered custom control for this `type` wins over the built-in
    // map (so custom types render, and existing types can be overridden).
    const registered = getRegisteredControl(type);
    // @ts-ignore — built-in map is keyed by the resolved `map` name
    const builtIn = map ? Controls.default[map] : undefined;
    const CustomComponent = registered || builtIn;
    if (!CustomComponent) return <div />;

    // Suspense is required for the lazy (chart / data-grid) controls; eager
    // controls render synchronously and never show the fallback.
    return (
        <ControlBoundary>
            <Suspense fallback={<ControlFallback />}>
                {/* Resolving the control by type/map IS this component's purpose;
                    the resolved reference is stable (registry entry or built-in). */}
                {/* eslint-disable-next-line react-hooks/static-components */}
                <CustomComponent {...props} />
            </Suspense>
        </ControlBoundary>
    );
}
