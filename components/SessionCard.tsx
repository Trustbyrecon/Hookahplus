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
      hour12: true,
    });
  } catch (e) {
    return "Invalid date";
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
  return (
    <div
      className={[
        "bg-surface text-text rounded-2xl border border-text/10 p-6",
        "transition shadow hover:shadow-xl",
        "flex flex-col justify-between",
        "w-full min-h-[200px] md:w-[400px] md:h-[240px] shrink-0",
        className ?? ""
      ].join(" ")}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <span
            className={[
              "text-xs px-2 py-1 rounded-full border",
              status === "active"
                ? "border-green-500/30 text-green-500"
                : status === "complete"
                ? "border-blue-500/30 text-blue-500"
                : "border-text/30 text-text"
            ].join(" ")}
          >
            {status}
          </span>
        </div>
        
        {flavor && (
          <p className="text-sm text-text-light">
            <span className="text-accent">Flavor:</span> {flavor}
          </p>
        )}
        
        <p className="text-sm text-text-light">
          <span className="text-accent">Started:</span> {formatWhen(startAt)}
        </p>
      </div>

      <div className="pt-4">
        {href ? (
          <a
            href={href}
            className="inline-block bg-primary hover:bg-primary-dark text-black font-semibold px-4 py-2 rounded-lg"
          >
            View Session
          </a>
        ) : (
          <button
            onClick={onOpen}
            className="bg-primary hover:bg-primary-dark text-black font-semibold px-4 py-2 rounded-lg"
          >
            Open
          </button>
        )}
      </div>
    </div>
  );
}