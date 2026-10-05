import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AITextAssist, { useAIAssist } from './AITextAssist';
import type { AssistAction } from '../types';

function makeClient(result = 'Improved text.') {
    return { assistText: vi.fn().mockResolvedValue(result) } as any;
}

describe('AITextAssist', () => {
    it('renders the trigger icon button', () => {
        render(
            <AITextAssist client={makeClient()} text="hello" onResult={() => {}} />,
        );
        expect(screen.getByRole('button', { name: /ai assist/i })).toBeInTheDocument();
    });

    it('opens a menu listing the action items when clicked', () => {
        render(
            <AITextAssist client={makeClient()} text="hello" onResult={() => {}} />,
        );
        fireEvent.click(screen.getByRole('button', { name: /ai assist/i }));

        expect(screen.getByRole('menu')).toBeInTheDocument();
        expect(screen.getByText('Improve writing')).toBeInTheDocument();
        expect(screen.getByText('Summarize')).toBeInTheDocument();
        expect(screen.getByText('Translate')).toBeInTheDocument();
    });

    it('only renders the actions passed via the `actions` prop', () => {
        render(
            <AITextAssist
                client={makeClient()}
                text="hello"
                actions={['summarize']}
                onResult={() => {}}
            />,
        );
        fireEvent.click(screen.getByRole('button', { name: /ai assist/i }));

        expect(screen.getByText('Summarize')).toBeInTheDocument();
        expect(screen.queryByText('Improve writing')).not.toBeInTheDocument();
    });

    it('runs the selected action and forwards the result to onResult', async () => {
        const client = makeClient('Improved text.');
        const onResult = vi.fn();
        render(
            <AITextAssist
                client={client}
                text="hello world"
                onResult={onResult}
                targetLanguage="es"
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: /ai assist/i }));
        fireEvent.click(screen.getByText('Improve writing'));

        await waitFor(() => {
            expect(client.assistText).toHaveBeenCalledWith('hello world', 'improve', 'es');
        });
        await waitFor(() => {
            expect(onResult).toHaveBeenCalledWith('Improved text.');
        });
    });
});

/** Tiny harness that drives the hook directly. */
function HookHarness({ client, action }: { client: any; action: AssistAction }) {
    const { run, loading, error } = useAIAssist(client);
    return (
        <div>
            <button onClick={() => run('some text', action).catch(() => {})}>go</button>
            <span data-testid="loading">{loading ? 'yes' : 'no'}</span>
            <span data-testid="error">{error ?? ''}</span>
        </div>
    );
}

describe('useAIAssist', () => {
    it('calls assistText and toggles loading back off', async () => {
        const client = makeClient('done');
        render(<HookHarness client={client} action="summarize" />);

        fireEvent.click(screen.getByText('go'));

        await waitFor(() => {
            expect(client.assistText).toHaveBeenCalledWith('some text', 'summarize', undefined);
        });
        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('no');
        });
    });

    it('captures an error message when the client rejects', async () => {
        const client = { assistText: vi.fn().mockRejectedValue(new Error('boom')) } as any;
        render(<HookHarness client={client} action="improve" />);

        fireEvent.click(screen.getByText('go'));

        await waitFor(() => {
            expect(screen.getByTestId('error')).toHaveTextContent('boom');
        });
    });
});
