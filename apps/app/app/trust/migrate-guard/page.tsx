import Link from 'next/link';
import { MigrateGuardRunCard } from './MigrateGuardRunCard';

export default function MigrateGuardPage() {
  const writesEnabled = process.env.ENABLE_MIGRATE_GUARD_WRITE === 'true';
  const secretConfigured = Boolean(
    process.env.MIGRATE_GUARD_SECRET && process.env.MIGRATE_GUARD_SECRET.trim()
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-10 max-w-3xl mx-auto space-y-6">
      <p className="text-xs text-zinc-500">
        <Link href="/fire-session-dashboard" className="text-teal-400 hover:underline">
          ← Dashboard
        </Link>
      </p>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">MigrateGuard</h1>
        <p className="text-sm text-zinc-400">
          Guarded schema operations for trust-scoped admin workflows. Same execution core as{' '}
          <code className="text-zinc-300">POST /api/trust/migrate-guard/run</code> (curl / automation).
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm space-y-2">
        <div>
          <strong className="text-zinc-200">Writes enabled:</strong>{' '}
          <span className={writesEnabled ? 'text-emerald-400' : 'text-amber-400'}>
            {writesEnabled ? 'Yes' : 'No'}
          </span>
        </div>
        <div>
          <strong className="text-zinc-200">Shared secret configured (API route):</strong>{' '}
          {secretConfigured ? 'Yes' : 'No'}
        </div>
        <p className="text-zinc-500 text-xs leading-relaxed">
          This UI uses a <strong className="text-zinc-400">server action</strong>, so it does not send{' '}
          <code className="text-zinc-300">x-migrate-guard-secret</code>. The API route still requires that
          header when <code className="text-zinc-300">MIGRATE_GUARD_SECRET</code> is set — use curl or ops
          scripts for that path.
        </p>
      </div>

      <MigrateGuardRunCard />

      <p className="text-xs text-zinc-600">
        Each run is appended to <code className="text-zinc-400">migrate_guard_runs</code> (intent, actor,
        phase, audit, stdout/stderr, timestamps). Query:{' '}
        <code className="text-zinc-500 break-all">
          SELECT * FROM migrate_guard_runs ORDER BY finished_at DESC LIMIT 10;
        </code>
      </p>
    </div>
  );
}
