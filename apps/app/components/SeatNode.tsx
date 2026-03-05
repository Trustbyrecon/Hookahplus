"use client";

import React from "react";
import type { NodeProps } from "reactflow";

type SeatNodeData = {
  label: string;
  status: "empty" | "active" | "over";
  elapsedLabel?: string;
};

export default function SeatNode({ data }: NodeProps<SeatNodeData>) {
  const badge =
    data.status === "empty" ? "⚪" : data.status === "active" ? "🟢" : "🔴";
  const sub = data.status === "empty" ? "Empty" : data.elapsedLabel ?? "Active";

  return (
    <div
      className={[
        "rounded-xl border px-3 py-2 shadow-sm select-none",
        "bg-zinc-900 border-zinc-700 text-zinc-100",
        "min-w-[92px] text-center",
        data.status === "over" ? "ring-2 ring-red-500" : "",
        data.status === "active" ? "ring-2 ring-emerald-500" : "",
      ].join(" ")}
    >
      <div className="text-sm font-semibold flex items-center justify-center gap-2">
        <span>{badge}</span>
        <span>{data.label}</span>
      </div>
      <div className="text-xs text-zinc-300 mt-1">{sub}</div>
    </div>
  );
}
