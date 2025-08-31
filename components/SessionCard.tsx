import React from "react";
import Link from "next/link";

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
      </div>
    </div>
  );
}
