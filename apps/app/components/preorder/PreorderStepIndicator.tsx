'use client';

import React from 'react';
import { Check } from 'lucide-react';
import type { PreorderStage } from '../../lib/preorder/types';

const STEP_ORDER: PreorderStage[] = ['welcome', 'flavors', 'options', 'guest', 'review'];

export interface PreorderStepIndicatorProps {
  current: PreorderStage;
  /** When true, "options" step is skipped in numbering */
  skipOptions: boolean;
  className?: string;
}

function visibleSteps(skipOptions: boolean): PreorderStage[] {
  if (skipOptions) {
    return ['welcome', 'flavors', 'guest', 'review'];
  }
  return STEP_ORDER;
}

export default function PreorderStepIndicator({
  current,
  skipOptions,
  className = '',
}: PreorderStepIndicatorProps) {
  const steps = visibleSteps(skipOptions);
  const labels: Record<PreorderStage, string> = {
    welcome: 'Start',
    flavors: 'Blend',
    options: 'Session',
    guest: 'You',
    review: 'Confirm',
    submitting: '',
  };

  const idx = steps.indexOf(current === 'submitting' ? 'review' : current);
  const activeIndex = idx < 0 ? 0 : idx;

  return (
    <nav
      aria-label="Pre-order steps"
      className={`w-full ${className}`}
    >
      <ol className="flex items-center justify-between gap-1 sm:gap-2">
        {steps.map((key, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          return (
            <li key={key} className="flex flex-1 items-center min-w-0">
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={`
                    flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all
                    ${done ? 'bg-teal-500/30 text-teal-300 ring-1 ring-teal-500/50' : ''}
                    ${active && !done ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/25' : ''}
                    ${!active && !done ? 'bg-zinc-800 text-zinc-500 ring-1 ring-zinc-700' : ''}
                  `}
                >
                  {done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : i + 1}
                </div>
                <span
                  className={`mt-1.5 hidden sm:block text-[10px] sm:text-xs font-medium truncate max-w-[4.5rem] md:max-w-none text-center ${
                    active ? 'text-teal-300' : done ? 'text-zinc-400' : 'text-zinc-600'
                  }`}
                >
                  {labels[key]}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-px flex-1 mx-0.5 sm:mx-1 min-w-[8px] ${
                    i < activeIndex ? 'bg-teal-500/40' : 'bg-zinc-800'
                  }`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
