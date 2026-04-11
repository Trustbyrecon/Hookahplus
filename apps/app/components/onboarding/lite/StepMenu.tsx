"use client";

import React from "react";

export function StepMenu({
  flavorsText,
  onFlavorsText,
  onBack,
  onContinue,
}: {
  flavorsText: string;
  onFlavorsText: (s: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Your flavors</h2>
        <p className="mt-1 text-sm text-zinc-500">
          We&apos;ll use this for mixes and upsells. One per line or comma-separated.
        </p>
      </div>
      <textarea
        value={flavorsText}
        onChange={(e) => onFlavorsText(e.target.value)}
        rows={8}
        placeholder={
          "Blue Mist\nMint\nDouble Apple\nLove 66\nPeach"
        }
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
      />
      <p className="text-[11px] text-zinc-600">
        Menu photo / PDF upload can plug in here later; typing your top sellers is fastest for now.
      </p>
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
