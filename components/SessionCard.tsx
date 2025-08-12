// components/SessionCard.tsx
import React, { useEffect, useMemo, useState } from "react";

type SessionCardProps = {
  title: string;
  flavor?: string;
  startAt?: string | Date;  // when the session started
  edrPct?: number;          // Equipment Duty Ratio (utilization %)
  shrPct?: number;          // Session Health Rating (%)
  reflexDelta?: number;     // Reflex score delta (+/-)
  payment?: string;         // e.g., "Stripe $30 base + add-ons"
  note?: string;            // freeform line
};

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const mm = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function SessionCard({
  title,
  flavor,
  startAt,
  edrPct,
  shrPct,
  reflexDelta,
  payment,
  note,
}: SessionCardProps) {
  const start = useMemo(() => (startAt ? new Date(startAt) : undefined), [startAt]);
  const [elapsed, setElapsed] = useState("00:00");

  useEffect(() => {
    if (!start) return;
    const tick = () => setElapsed(fmt(Date.now() - start.getTime()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [start]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-white/90">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex gap-4 text-sm">
          {typeof edrPct === "number" && (
            <span title="EDR — Equipment Duty Ratio (utilization during session)">
              EDR <strong>{Math.round(edrPct)}%</strong>
            </span>
          )}
          {typeof shrPct === "number" && (
            <span title="SHR — Session Health Rating (composite of heat/airflow/downtime)">
              SHR <strong>{Math.round(shrPct)}%</strong>
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 grid gap-2 text-sm">
        {flavor && <div>Flavor Mix: <span className="opacity-90">{flavor}</span></div>}
        {payment && <div>Payment: <span className="opacity-90">{payment}</span></div>}
        {typeof reflexDelta === "number" && (
          <div title="Reflex: quick recovery metric after repair or refill">
            Reflex Δ <span className={reflexDelta >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {reflexDelta >= 0 ? "+" : ""}
              {reflexDelta.toFixed(2)}
            </span>
          </div>
        )}
        {note && <div className="rounded-md bg-white/5 px-3 py-2">{note}</div>}
      </div>

      <div className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-sm">
        Timer: <strong>{elapsed}</strong>{!start && " (no start time)"}
      </div>
    </div>
  );
}
