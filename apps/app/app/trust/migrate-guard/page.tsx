'use client';

import React, { useState } from 'react';
import Link from 'next/link';

type RunResponse = {
  ok?: boolean;
  phase?: string;
  auditLine?: string;
  result?: { stdout?: string; stderr?: string; ok?: boolean };
  verified?: boolean;
  verificationError?: string | null;
  error?: string;
};

export default function MigrateGuardPage() {
  const [loading, setLoading] = useState(false);
  const [last, setLast] = useState<RunResponse | null>(null);

  async function runCustomerMemoryInit() {
    setLoading(true);
    setLast(null);
    try {
      const res = await fetch('/api/trust/migrate-guard/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'add_customer_memory_v1',
          label: 'customer_memory_init',
          description: 'Add CustomerMemory table for H+ Operator CLARK write-back',
          expectedChanges: ['customer_memory table'],
          riskLevel: 'low',
          command: 'db_push',
        }),
      });
      const data = (await res.json()) as RunResponse;
      setLast(data);
    } catch (e) {
      setLast({
        ok: false,
        error: e instanceof Error ? e.message : 'Request failed',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-10 max-w-3xl mx-auto">
      <p className="text-xs text-zinc-500 mb-2">
        <Link href="/fire-session-dashboard" className="text-teal-400 hover:underline">
          ← Dashboard
        </Link>
      </p>
      <h1 className="text-2xl font-semibold text-white mb-1">MigrateGuard</h1>
      <p className="text-sm text-zinc-400 mb-6">
        Server-only Prisma runs with intent metadata, optional post-check, and audit logging. Requires{' '}
        <code className="text-teal-300">ENABLE_MIGRATE_GUARD_WRITE=true</code>, owner/admin role, and
        optional <code className="text-teal-300">MIGRATE_GUARD_SECRET</code> + header{' '}
        <code className="text-teal-300">x-migrate-guard-secret</code> for extra lock (this page cannot send
        that header without a server action — use curl or omit the secret in local dev).
      </p>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 mb-6">
        <h2 className="text-sm font-medium text-white mb-2">CustomerMemory (CLARK write-back)</h2>
        <p className="text-xs text-zinc-500 mb-3">
          Runs <code className="text-zinc-300">npx prisma db push</code> from the app process cwd, then
          verifies <code className="text-zinc-300">SELECT 1 FROM customer_memory</code>.
        </p>
        <button
          type="button"
          disabled={loading}
          onClick={() => void runCustomerMemoryInit()}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-40"
        >
          {loading ? 'Running…' : 'Run customer_memory_init'}
        </button>
      </div>

      {last && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm font-mono text-xs whitespace-pre-wrap break-words">
          <div className={last.ok ? 'text-emerald-400' : 'text-red-400'}>
            {last.auditLine ?? last.error ?? JSON.stringify(last, null, 2)}
          </div>
          {last.result?.stdout ? (
            <div className="mt-3 text-zinc-400">
              <span className="text-zinc-600">stdout</span>
              {'\n'}
              {last.result.stdout}
            </div>
          ) : null}
          {last.result?.stderr ? (
            <div className="mt-2 text-amber-200/90">
              <span className="text-zinc-600">stderr</span>
              {'\n'}
              {last.result.stderr}
            </div>
          ) : null}
          {last.verificationError ? (
            <div className="mt-2 text-red-300">verify: {last.verificationError}</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
