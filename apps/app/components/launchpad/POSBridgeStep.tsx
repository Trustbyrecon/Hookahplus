'use client';

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { POSBridgeData } from '../../types/launchpad';

interface POSBridgeStepProps {
  initialData?: Partial<POSBridgeData>;
  onComplete: (data: POSBridgeData) => void;
  onBack?: () => void;
}

const USAGE_OPTIONS: { value: POSBridgeData['usageMode']; label: string }[] = [
  { value: 'alongside', label: 'Alongside our current POS' },
  { value: 'without_pos', label: 'Without a POS for now' },
  { value: 'not_sure', label: 'Not sure yet' },
];

const POS_OPTIONS: { value: POSBridgeData['posType']; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'clover', label: 'Clover' },
  { value: 'toast', label: 'Toast' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'other', label: 'Other' },
  { value: 'none', label: 'None currently' },
];

export function POSBridgeStep({ initialData, onComplete, onBack }: POSBridgeStepProps) {
  const [usageMode, setUsageMode] = useState<POSBridgeData['usageMode']>(
    (initialData?.usageMode as POSBridgeData['usageMode']) || 'alongside'
  );
  const [posType, setPosType] = useState<POSBridgeData['posType']>(
    (initialData?.posType as POSBridgeData['posType']) || 'none'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ usageMode, posType });
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-8">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold">POS & Checkout Setup</h2>
          <span className="text-[11px] px-2 py-0.5 rounded border bg-teal-900/20 border-teal-600/40 text-teal-200">
            Default: POS-agnostic
          </span>
        </div>
        <p className="text-zinc-400 text-sm">
          H+ works alongside your current checkout process. Your team uses H+ for sessions, memory, and loyalty, while your existing POS continues handling payment and receipts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Usage Mode - Preferred path explicit */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            How will your team use H+? *
          </label>
          <div className="space-y-3">
            {USAGE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors border ${
                  usageMode === option.value
                    ? 'bg-teal-900/20 border-teal-500/50'
                    : 'bg-zinc-800 border-zinc-600 hover:border-teal-500/30'
                }`}
              >
                <input
                  type="radio"
                  name="usageMode"
                  value={option.value}
                  checked={usageMode === option.value}
                  onChange={() => setUsageMode(option.value)}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="font-medium text-white">{option.label}</span>
                {option.value === 'alongside' && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                    Recommended
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* POS Type - For reconciliation mapping, staff instructions, etc. */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Which system do you currently use for payments or receipts? *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {POS_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors border ${
                  posType === option.value
                    ? 'bg-teal-900/20 border-teal-500/50'
                    : 'bg-zinc-800 border-zinc-600 hover:border-teal-500/30'
                }`}
              >
                <input
                  type="radio"
                  name="posType"
                  value={option.value}
                  checked={posType === option.value}
                  onChange={(e) =>
                    setPosType(e.target.value as POSBridgeData['posType'])
                  }
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-white">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-teal-900/20 border border-teal-600/50 rounded-lg">
          <p className="text-sm text-teal-200 font-medium mb-2">
            After setup, we&apos;ll generate a workflow guide for your team, including:
          </p>
          <ul className="space-y-1 text-sm text-teal-200 list-disc list-inside">
            <li>What staff enters in H+</li>
            <li>What stays in your POS</li>
            <li>Reconciliation steps</li>
            <li>Receipt and session matching guidance</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-zinc-700">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white hover:border-teal-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg text-white font-semibold transition-colors"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

