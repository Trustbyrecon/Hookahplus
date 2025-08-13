 feat/moodbook-all-in-one
import React from "react";

export type SessionCardProps = {
  title: string;
  flavor?: string;
  startAt?: string | Date;
  status?: "idle" | "active" | "complete";
  href?: string;
  onOpen?: () => void;
  className?: string;
};

function formatWhen(startAt?: string | Date) {
  if (!startAt) return "—";
  const d = typeof startAt === "string" ? new Date(startAt) : startAt;
  try {
    return d.toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(d);
  }

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
 main
}

export default function SessionCard({
  title,
  flavor,
  startAt,
 feat/moodbook-all-in-one
  status = "idle",
  href,
  onOpen,
  className,
}: SessionCardProps) {
  return (
    <div
      className={[
        "bg-surface text-text rounded-2xl border border-text/10 p-6",
        "transition shadow hover:shadow-xl",
        "flex flex-col justify-between",
        "w-full min-h-[220px] md:w-[520px] md:h-[280px] shrink-0",
        className ?? ""
      ].join(" ")}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          <span
            className={[
              "text-xs px-2 py-1 rounded-full border",
              status === "active"
                ? "border-primary/30 text-primary"
                : status === "complete"
                ? "border-text/20 text-text-light"
                : "border-text/20 text-text-light"
            ].join(" ")}
            aria-label={`status: ${status}`}
          >
            {status}
          </span>
        </div>
        {flavor ? (
          <p className="text-sm text-text-light">
            Flavor: <span className="text-text">{flavor}</span>
          </p>
        ) : null}
        <p className="text-xs text-text-light">Start: {formatWhen(startAt)}</p>
      </div>

      <div className="flex items-center gap-3 pt-4">
        {href ? (
          <a
            href={href}
            className="bg-primary hover:bg-primary-dark text-black font-semibold px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Open session
          </a>
        ) : (
          <button
            type="button"
            onClick={onOpen}
            className="bg-primary hover:bg-primary-dark text-black font-semibold px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Open session
          </button>
        )}
        <button
          type="button"
          className="border border-text/30 hover:border-text px-4 py-2 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          View timeline
        </button>

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
 main
      </div>
    </div>
  );
}
