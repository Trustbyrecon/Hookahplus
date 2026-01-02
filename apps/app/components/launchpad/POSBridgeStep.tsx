'use client';

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, ExternalLink } from 'lucide-react';
import { POSBridgeData } from '../../types/launchpad';

interface POSBridgeStepProps {
  initialData?: POSBridgeData;
  onComplete: (data: POSBridgeData) => void;
  onBack?: () => void;
}

const POS_OPTIONS = [
  { value: 'square', label: 'Square', description: 'Square POS integration' },
  { value: 'clover', label: 'Clover', description: 'Clover POS integration' },
  { value: 'toast', label: 'Toast', description: 'Toast POS integration' },
  { value: 'none', label: 'None yet', description: 'No POS system currently' },
];

export function POSBridgeStep({ initialData, onComplete, onBack }: POSBridgeStepProps) {
  const [posType, setPosType] = useState<POSBridgeData['posType']>(
    initialData?.posType || 'none'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ posType });
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">POS Bridge</h2>
        <p className="text-zinc-400 text-sm">
          We don't replace your POS. We run above it.
        </p>
        <p className="text-zinc-500 text-xs mt-1">
          H+ tracks sessions, memory, and loyalty. Your POS handles payment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* POS Selection */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Which POS do you use? *
          </label>
          <div className="space-y-3">
            {POS_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-4 bg-zinc-800 border border-zinc-600 rounded-lg cursor-pointer hover:border-teal-500 transition-colors"
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
                <div className="flex-1">
                  <div className="font-semibold text-white">{option.label}</div>
                  <div className="text-sm text-zinc-400">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-teal-900/20 border border-teal-600/50 rounded-lg">
          <p className="text-sm text-teal-200">
            After you complete setup, we'll generate a POS-specific guide showing how H+ runs above your POS system. This includes:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-teal-200 list-disc list-inside">
            <li>What staff enters in H+ vs. what stays in POS</li>
            <li>Reconciliation checklist</li>
            <li>Receipt note conventions</li>
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
            Generate POS bridge
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

