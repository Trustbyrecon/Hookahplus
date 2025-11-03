import React, { useEffect, useMemo, useState } from 'react';

export type SessionCardProps = {
  title: string;
  flavor?: string;
  startAt?: string | Date;
  status?: 'idle' | 'active' | 'complete';
  href?: string;
  onOpen?: () => void;
  className?: string;
};

function formatWhen(startAt?: string | Date) {
  if (!startAt) return '—';
  const d = typeof startAt === 'string' ? new Date(startAt) : startAt;
  try {
    return d.toLocaleString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return String(d);
  }
}

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function SessionCard({
  title,
  flavor,
  startAt,
  status = 'idle',
  href,
  onOpen,
  className,
}: SessionCardProps) {
  const start = useMemo(() => (startAt ? new Date(startAt) : undefined), [startAt]);
  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    if (!start) return;
    const tick = () => setElapsed(fmt(Date.now() - start.getTime()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [start]);

  return (
    <div
      className={[
        'bg-gray-900/50 text-white rounded-xl border border-gray-800 p-6',
        'transition shadow hover:shadow-xl',
        'flex flex-col justify-between',
        'w-full min-h-[220px]',
        className ?? '',
      ].join(' ')}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          <span
            className={[
              'text-xs px-2 py-1 rounded-full border',
              status === 'active'
                ? 'border-green-500/30 text-green-400 bg-green-500/10'
                : status === 'complete'
                ? 'border-gray-500/30 text-gray-400'
                : 'border-gray-500/30 text-gray-400',
            ].join(' ')}
            aria-label={`status: ${status}`}
          >
            {status}
          </span>
        </div>
        {flavor ? (
          <p className="text-sm text-gray-300">
            Flavor: <span className="text-white">{flavor}</span>
          </p>
        ) : null}
        <p className="text-xs text-gray-400">Start: {formatWhen(startAt)}</p>
      </div>

      <div className="mt-4 flex items-center gap-3">
        {href ? (
          <a
            href={href}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Open session
          </a>
        ) : (
          <button
            type="button"
            onClick={onOpen}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Open session
          </button>
        )}
        <div className="text-sm text-gray-400">
          Timer: <strong className="text-white">{elapsed}</strong>
          {!start && ' (no start time)'}
        </div>
      </div>
    </div>
  );
}
