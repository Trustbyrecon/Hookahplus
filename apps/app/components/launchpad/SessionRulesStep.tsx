'use client';

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import { SessionRulesData } from '../../types/launchpad';

interface SessionRulesStepProps {
  initialData?: SessionRulesData;
  onComplete: (data: SessionRulesData) => void;
  onBack?: () => void;
}

export function SessionRulesStep({ initialData, onComplete, onBack }: SessionRulesStepProps) {
  const [formData, setFormData] = useState<SessionRulesData>({
    sessionType: initialData?.sessionType || 'flat',
    gracePeriodMinutes: initialData?.gracePeriodMinutes ?? 5,
    extensionPolicy: initialData?.extensionPolicy || 'manual',
    compPolicyEnabled: initialData?.compPolicyEnabled ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Session Rules</h2>
        <p className="text-zinc-400 text-sm">
          This is where money stops leaking.
        </p>
        <p className="text-zinc-500 text-xs mt-1">
          These rules protect your staff from awkward conversations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Session Type */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Session type *
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 bg-zinc-800 border border-zinc-600 rounded-lg cursor-pointer hover:border-teal-500 transition-colors">
              <input
                type="radio"
                name="sessionType"
                value="flat"
                checked={formData.sessionType === 'flat'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sessionType: e.target.value as 'flat' | 'timed',
                  }))
                }
                className="w-4 h-4 text-teal-600 focus:ring-teal-500"
              />
              <div>
                <div className="font-semibold text-white">Flat session</div>
                <div className="text-sm text-zinc-400">Fixed price per session</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-4 bg-zinc-800 border border-zinc-600 rounded-lg cursor-pointer hover:border-teal-500 transition-colors">
              <input
                type="radio"
                name="sessionType"
                value="timed"
                checked={formData.sessionType === 'timed'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sessionType: e.target.value as 'flat' | 'timed',
                  }))
                }
                className="w-4 h-4 text-teal-600 focus:ring-teal-500"
              />
              <div>
                <div className="font-semibold text-white">Timed session</div>
                <div className="text-sm text-zinc-400">Charge based on session duration</div>
              </div>
            </label>
          </div>
        </div>

        {/* Grace Period */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Grace period *
          </label>
          <select
            value={formData.gracePeriodMinutes}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                gracePeriodMinutes: parseInt(e.target.value, 10) as 0 | 5 | 10,
              }))
            }
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
          >
            <option value={0}>None</option>
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
          </select>
          {formData.gracePeriodMinutes > 0 && (
            <p className="mt-2 text-xs text-zinc-400">
              Sessions can extend {formData.gracePeriodMinutes} minutes past the timer without additional charge.
            </p>
          )}
        </div>

        {/* Extensions */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Extensions *
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 bg-zinc-800 border border-zinc-600 rounded-lg cursor-pointer hover:border-teal-500 transition-colors">
              <input
                type="radio"
                name="extensionPolicy"
                value="manual"
                checked={formData.extensionPolicy === 'manual'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    extensionPolicy: e.target.value as 'manual' | 'auto',
                  }))
                }
                className="w-4 h-4 text-teal-600 focus:ring-teal-500"
              />
              <div>
                <div className="font-semibold text-white">Manual only</div>
                <div className="text-sm text-zinc-400">Staff must approve each extension</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-4 bg-zinc-800 border border-zinc-600 rounded-lg cursor-pointer hover:border-teal-500 transition-colors">
              <input
                type="radio"
                name="extensionPolicy"
                value="auto"
                checked={formData.extensionPolicy === 'auto'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    extensionPolicy: e.target.value as 'manual' | 'auto',
                  }))
                }
                className="w-4 h-4 text-teal-600 focus:ring-teal-500"
              />
              <div>
                <div className="font-semibold text-white">Auto-extend with prompt</div>
                <div className="text-sm text-zinc-400">System prompts guest, staff approves payment</div>
              </div>
            </label>
          </div>
        </div>

        {/* Comp Policy */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Comp policy *
          </label>
          <div className="p-4 bg-zinc-800 border border-zinc-600 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.compPolicyEnabled}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    compPolicyEnabled: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-white">
                  {formData.compPolicyEnabled ? 'Manager approval required' : 'Disabled (recommended)'}
                </div>
                <div className="text-sm text-zinc-400">
                  {formData.compPolicyEnabled
                    ? 'All comp requests require manager approval'
                    : 'Comped sessions are disabled. This prevents revenue leakage.'}
                </div>
              </div>
            </label>
          </div>
          {formData.compPolicyEnabled && (
            <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-600/50 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-200">
                Enabling comp policy may lead to awkward conversations with guests. We recommend keeping it disabled unless you have a specific need.
              </p>
            </div>
          )}
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
            Lock session rules
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

