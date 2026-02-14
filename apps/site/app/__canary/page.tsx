export const dynamic = 'force-dynamic';

function Card({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="text-lg font-semibold">{title}</div>
      <div className="text-sm text-zinc-400">{subtitle}</div>
    </div>
  );
}

export default function CanaryPretty() {
  const enabled = process.env.HPLUS_PRETTY_THEME === '1';
  if (!enabled) {
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <div className="text-center">
          <div className="text-2xl font-semibold">Canary disabled</div>
          <div className="text-zinc-400">Set HPLUS_PRETTY_THEME=1 to enable preview</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Welcome to HookahPlus</h1>
        <p className="mt-3 text-zinc-400">A cleaner, faster, prettier experience — this is the canary.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Preorder" subtitle="Reserve a table and pay in advance" />
          <Card title="Extend" subtitle="Add 20 minutes with one tap" />
          <Card title="Refill" subtitle="Signal staff for a quick refill" />
        </div>
      </section>
    </main>
  );
}


