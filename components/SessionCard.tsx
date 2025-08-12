import { useEffect, useState } from 'react';

/**
 * SessionCardProps defines the data model for a hookah session card.
 * Copy and behaviour are derived from the Session Card spec.
 */
export interface SessionCardProps {
  sessionId: string;
  zoneLabel?: string;
  tableLabel?: string;
  flavorMix: string;
  qrOrderId?: string;
  payment: {
    base: number;
    addOnsTotal?: number;
    status: 'paid' | 'pending' | 'failed';
  };
  metrics: {
    edr: number;
    shr: number;
    reflexDelta?: number;
    reflexDeltaReason?: string;
  };
  timers: {
    startedAt: string; // ISO timestamp
    now?: string; // optional server sync time
    paused?: boolean;
    lastRefillAt?: string; // ISO timestamp
  };
  state?:
    | 'active'
    | 'due-refill'
    | 'overdue'
    | 'paused'
    | 'completed'
    | 'repairing';
  actions: {
    onRefill(): void;
    onAdd(): void;
    onRepair(): void;
    onClose(): void;
  };
  role?: 'owner' | 'manager' | 'staff';
  accessibility?: { announceChanges: boolean };
  /** Optional analytics hook */
  emitEvent?: (event: string, payload?: Record<string, unknown>) => void;
}

/** Running clock hook; reconciles to server time every tick */
function useRunningClock(startedAtISO: string, paused = false, nowISO?: string) {
  const base = new Date(startedAtISO).getTime();
  const [now, setNow] = useState(nowISO ? new Date(nowISO).getTime() : Date.now());

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [paused]);

  const elapsedMs = Math.max(0, now - base);
  const hh = Math.floor(elapsedMs / 3600000)
    .toString()
    .padStart(2, '0');
  const mm = Math.floor((elapsedMs % 3600000) / 60000)
    .toString()
    .padStart(2, '0');
  const ss = Math.floor((elapsedMs % 60000) / 1000)
    .toString()
    .padStart(2, '0');
  return { now, elapsed: `${hh}:${mm}:${ss}` };
}

/** Determine visual state based on timing thresholds */
function deriveState(timers: SessionCardProps['timers']) {
  if (timers.paused) return 'paused';
  const reference = timers.lastRefillAt ?? timers.startedAt;
  const minutes =
    (Date.now() - new Date(reference).getTime()) / 60000;
  if (minutes > 45) return 'overdue';
  if (minutes > 35) return 'due-refill';
  return 'active';
}

export default function SessionCard(props: SessionCardProps) {
  const {
    sessionId,
    zoneLabel,
    tableLabel,
    flavorMix,
    qrOrderId,
    payment,
    metrics,
    timers,
    actions,
    role = 'staff',
    accessibility,
    emitEvent,
  } = props;

  const { elapsed } = useRunningClock(
    timers.startedAt,
    timers.paused,
    timers.now
  );

  const state = props.state ?? deriveState(timers);
  const [showReflex, setShowReflex] = useState(
    metrics.reflexDelta !== undefined && metrics.reflexDelta !== 0
  );

  // auto hide reflex banner
  useEffect(() => {
    if (metrics.reflexDelta === undefined || metrics.reflexDelta === 0) {
      setShowReflex(false);
      return;
    }
    setShowReflex(true);
    const id = setTimeout(() => setShowReflex(false), 90000);
    return () => clearTimeout(id);
  }, [metrics.reflexDelta]);

  // initial events
  useEffect(() => {
    emitEvent?.('SessionStarted', { sessionId });
  }, [emitEvent, sessionId]);

  const handle = (action: keyof SessionCardProps['actions']) => {
    const map = {
      onRefill: 'RefillPerformed',
      onAdd: 'AddPerformed',
      onRepair: 'RepairApplied',
      onClose: 'SessionClosed',
    } as const;
    actions[action]();
    emitEvent?.(map[action], { sessionId });
  };

  let ring = 'ring-deepMoss';
  let pulse = '';
  if (state === 'due-refill') {
    ring = 'ring-mystic';
    pulse = 'animate-pulse';
  } else if (state === 'overdue') {
    ring = 'ring-ember';
    pulse = 'animate-pulse';
  } else if (state === 'paused') {
    ring = 'ring-charcoal';
  }

  const started = new Date(timers.startedAt).toLocaleTimeString();

  const edrTip =
    'Event Detection Reliability: confidence all signals are captured and consistent for this session (QR, Stripe, timer, refills, repairs). 90%+ is excellent; investigate if <80%.';
  const shrTip =
    'Session Health Rating: service timing and risk. Penalties for overdue refills/alerts, bonuses for on-time actions. Aim for 85%+';

  const overdueMinutes = (() => {
    if (state !== 'overdue') return 0;
    const ref = timers.lastRefillAt ?? timers.startedAt;
    const diff = (Date.now() - new Date(ref).getTime()) / 60000 - 45;
    return Math.floor(diff);
  })();

  const statusTooltip =
    state === 'overdue'
      ? `Overdue by ${overdueMinutes}m; SHR penalty accruing.`
      : undefined;

  return (
    <div
      className={`p-4 rounded-xl bg-charcoal/30 text-goldLumen ring-2 ${ring} ${pulse}`}
      aria-live={accessibility?.announceChanges ? 'polite' : undefined}
      title={statusTooltip}
    >
      <header className="flex justify-between items-center mb-2">
        <div className="font-display font-bold text-lg">
          Session {sessionId}
          {zoneLabel || tableLabel ? (
            <span className="ml-1 text-mystic text-sm">
              — {zoneLabel || tableLabel}
            </span>
          ) : null}
        </div>
        <div className="flex space-x-2 text-sm">
          {(role === 'owner' || role === 'manager') && (
            <span className="cursor-help" title={edrTip}>
              EDR {metrics.edr}%
            </span>
          )}
          <span className="cursor-help" title={shrTip}>
            SHR {metrics.shr}%
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
        <div>
          <div className="text-sm text-mystic">Flavor Mix</div>
          <div>{flavorMix}</div>
        </div>
        <div>
          <div className="text-sm text-mystic">QR Preorder</div>
          <div>
            {payment.status} {qrOrderId && `• #${qrOrderId}`}
          </div>
        </div>
        <div>
          <div className="text-sm text-mystic">Stripe</div>
          <div>
            ${payment.base}{payment.addOnsTotal ? ` + ${payment.addOnsTotal}` : ''}
          </div>
        </div>
      </div>

      <div className="min-h-6 mb-2">
        {showReflex && metrics.reflexDelta !== undefined && metrics.reflexDelta !== 0 ? (
          <div
            className={`px-2 py-1 rounded text-charcoal text-sm ${
              metrics.reflexDelta > 0
                ? 'bg-deepMoss'
                : metrics.reflexDelta < 0
                ? 'bg-ember'
                : 'bg-mystic'
            }`}
          >
            Reflex Δ {metrics.reflexDelta > 0 ? '+' : ''}
            {metrics.reflexDelta.toFixed(2)} {metrics.reflexDeltaReason || ''}
          </div>
        ) : metrics.reflexDelta !== undefined ? (
          <button
            className="text-xs text-mystic underline"
            onClick={() => emitEvent?.('ReflexLogOpened', { sessionId })}
          >
            View Log
          </button>
        ) : null}
      </div>

      <div className="font-mono text-sm mb-2">
        Started {started} • Running {elapsed}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => handle('onRefill')}
          className="bg-deepMoss/40 px-3 py-1 rounded hover:bg-deepMoss/60 transition-colors"
        >
          Refill
        </button>
        <button
          onClick={() => handle('onAdd')}
          className="bg-deepMoss/40 px-3 py-1 rounded hover:bg-deepMoss/60 transition-colors"
        >
          Add
        </button>
        <button
          onClick={() => handle('onRepair')}
          className="bg-mystic/40 px-3 py-1 rounded hover:bg-mystic/60 transition-colors"
        >
          Repair
        </button>
        <button
          onClick={() => handle('onClose')}
          className="bg-ember/40 px-3 py-1 rounded hover:bg-ember/60 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

