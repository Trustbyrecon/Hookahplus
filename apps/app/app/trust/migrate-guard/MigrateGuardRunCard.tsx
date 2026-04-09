'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import {
  runCustomerMemoryMigrationAction,
  type RunCustomerMemoryMigrationActionState,
} from './actions';

const initialState: RunCustomerMemoryMigrationActionState = {
  ok: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-50"
    >
      {pending ? 'Running guarded migration…' : 'Run CustomerMemory migration'}
    </button>
  );
}

export function MigrateGuardRunCard() {
  const [state, formAction] = useFormState(runCustomerMemoryMigrationAction, initialState);

  useEffect(() => {
    if (state.message) {
      console.log('[MigrateGuard UI]', state);
    }
  }, [state]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">CustomerMemory migration</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Server action → <code className="text-zinc-300">executeGuardedMigration</code> (same core as the
          API route). No browser secret required.
        </p>
      </div>

      <form action={formAction}>
        <SubmitButton />
      </form>

      {state.message ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 text-sm text-zinc-200 space-y-2">
          <div>
            <strong className="text-zinc-200">Status:</strong>{' '}
            <span className={state.ok ? 'text-emerald-400' : 'text-red-400'}>
              {state.ok ? 'Success' : 'Failed'}
            </span>
          </div>
          {state.phase ? (
            <div>
              <strong className="text-zinc-200">Phase:</strong> {state.phase}
            </div>
          ) : null}
          <div>
            <strong className="text-zinc-200">Message:</strong> {state.message}
          </div>
          {state.auditLine ? (
            <div>
              <strong className="text-zinc-200">Audit:</strong>{' '}
              <span className="text-zinc-400 font-mono text-xs">{state.auditLine}</span>
            </div>
          ) : null}
          {state.verificationError ? (
            <div className="text-red-300 text-xs">Verify: {state.verificationError}</div>
          ) : null}
          {state.stderr ? (
            <details className="text-xs">
              <summary className="cursor-pointer text-zinc-500">stderr</summary>
              <pre className="mt-2 whitespace-pre-wrap text-amber-200/90 font-mono">{state.stderr}</pre>
            </details>
          ) : null}
          {state.stdout ? (
            <details className="text-xs">
              <summary className="cursor-pointer text-zinc-500">stdout</summary>
              <pre className="mt-2 whitespace-pre-wrap text-zinc-400 font-mono">{state.stdout}</pre>
            </details>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
