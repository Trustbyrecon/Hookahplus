import React, { useEffect, useMemo, useState } from "react";

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
}

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
  status = "idle",
  href,
  onOpen,
  className,
}: SessionCardProps) {
  const [now, setNow] = useState<number>(Date.now());
  const [isHover, setIsHover] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const elapsed = useMemo(() => {
    if (!startAt) return "—";
    const start = typeof startAt === "string" ? new Date(startAt).getTime() : startAt.getTime();
    if (isNaN(start)) return "—";
    const diff = now - start;
    return fmt(Math.max(0, diff));
  }, [startAt, now]);

  const whenText = useMemo(() => formatWhen(startAt), [startAt]);

  const statusClasses = {
    idle: "bg-surface/30 text-text/50",
    active: "bg-accent/20 text-accent",
    complete: "bg-primary/20 text-primary",
  };

  return (
    <div
      className={[
        "bg-surface text-text rounded-2xl border border-text/10 p-6",
        "hover:border-text/20 transition-all duration-300",
        className,
      ].join(" ")}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          
          {flavor && (
            <div className="text-text/70 text-sm mb-2">
              Flavor: <span className="text-accent">{flavor}</span>
            </div>
          )}
          
          <div className="text-text/70 text-sm">
            Started: {whenText}
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
          {status}
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-sm">
        Timer: <strong>{elapsed}</strong>{!startAt && " (no start time)"}
      </div>

      {(href || onOpen) && (
        <div className="mt-4">
          {href ? (
            <a
              href={href}
              className="inline-flex items-center px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg transition-colors"
            >
              Open Session
            </a>
          ) : (
            <button
              onClick={onOpen}
              className="inline-flex items-center px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg transition-colors"
            >
              Open Session
            </button>
          )}
        </div>
      )}
    </div>
  );
}