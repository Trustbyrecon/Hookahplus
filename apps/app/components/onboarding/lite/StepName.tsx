"use client";

import React from "react";

export function StepName({
  name,
  city,
  onName,
  onCity,
  onContinue,
}: {
  name: string;
  city: string;
  onName: (v: string) => void;
  onCity: (v: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Run your lounge with AI in seconds.
        </h1>
        <p className="mt-2 text-sm text-zinc-400">Let&apos;s set up your floor.</p>
      </div>
      <div className="space-y-3">
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Lounge name
        </label>
        <input
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="Horizon Lounge"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          City <span className="text-zinc-600 normal-case">(optional)</span>
        </label>
        <input
          value={city}
          onChange={(e) => onCity(e.target.value)}
          placeholder="Las Vegas"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
      </div>
      <button
        type="button"
        onClick={onContinue}
        disabled={!name.trim()}
        className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-zinc-950 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
}
