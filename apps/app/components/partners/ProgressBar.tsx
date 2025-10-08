import React from "react";

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full">
      {label && <div className="mb-1 text-xs text-neutral-400">{label}</div>}
      <div className="w-full h-2 rounded bg-neutral-700">
        <div className="h-2 rounded bg-green-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
