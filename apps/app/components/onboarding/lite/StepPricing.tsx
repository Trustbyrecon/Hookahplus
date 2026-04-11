"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export function StepPricing({
  basePrice,
  onBasePrice,
  premiumAddonDollars,
  onPremiumAddonDollars,
  premiumFlavorLine,
  onPremiumFlavorLine,
  onBack,
  onContinue,
}: {
  basePrice: number;
  onBasePrice: (n: number) => void;
  premiumAddonDollars: number;
  onPremiumAddonDollars: (n: number) => void;
  premiumFlavorLine: string;
  onPremiumFlavorLine: (s: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">What&apos;s your base hookah price?</h2>
        <p className="mt-1 text-sm text-zinc-500">Per session, in dollars.</p>
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
          $
        </span>
        <input
          type="number"
          min={0}
          step={1}
          value={basePrice}
          onChange={(e) => onBasePrice(Math.min(500, Math.max(0, Number(e.target.value) || 0)))}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900/80 py-2.5 pl-7 pr-3 text-sm text-white"
        />
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 text-left text-sm text-zinc-400 hover:text-teal-300"
      >
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        Add premium flavors / add-on pricing
      </button>
      {open ? (
        <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
          <label className="block text-xs text-zinc-500">Premium add-on ($)</label>
          <input
            type="number"
            min={0}
            step={1}
            value={premiumAddonDollars}
            onChange={(e) =>
              onPremiumAddonDollars(Math.min(200, Math.max(0, Number(e.target.value) || 0)))
            }
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
          />
          <label className="block text-xs text-zinc-500">Premium flavor names (comma-separated)</label>
          <input
            value={premiumFlavorLine}
            onChange={(e) => onPremiumFlavorLine(e.target.value)}
            placeholder="e.g. Al Fakher Special, Trifecta Dark"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600"
          />
        </div>
      ) : null}
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
