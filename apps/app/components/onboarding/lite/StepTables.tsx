"use client";

import React from "react";

export function StepTables({
  tableCount,
  onTableCount,
  onBack,
  onContinue,
}: {
  tableCount: number;
  onTableCount: (n: number) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const preview = Math.min(tableCount, 24);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">How many tables do you have?</h2>
        <p className="mt-1 text-sm text-zinc-500">You can edit this later.</p>
      </div>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={1}
          max={60}
          value={tableCount}
          onChange={(e) => onTableCount(Number(e.target.value))}
          className="flex-1 accent-teal-500"
        />
        <input
          type="number"
          min={1}
          max={200}
          value={tableCount}
          onChange={(e) => onTableCount(Math.min(200, Math.max(1, Number(e.target.value) || 10)))}
          className="w-20 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-center text-sm text-white"
        />
      </div>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          Preview
        </p>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: preview }, (_, i) => (
            <span
              key={i}
              className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-400"
            >
              Table {i + 1}
            </span>
          ))}
          {tableCount > preview ? (
            <span className="self-center text-[11px] text-zinc-600">
              +{tableCount - preview} more
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-lg border border-zinc-600 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-zinc-950 hover:bg-teal-500"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
