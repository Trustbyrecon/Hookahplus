"use client";

import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, CheckCircle, DollarSign } from 'lucide-react';

const SHIFT_START_KEY = 'h+_shift_started_at';
const SHIFT_END_KEY = 'h+_shift_ended_at';
const TIP_GOAL_KEY = 'h+_tip_goal_cents';
const TIPS_ENTERED_KEY = 'h+_tips_entered_cents';

const START_CHECKLIST = [
  'Check prep station and coals',
  'Review today’s sessions',
  'Confirm tablet/device is charged',
];

export default function ShiftGuide() {
  const [shiftStartedAt, setShiftStartedAt] = useState<string | null>(null);
  const [shiftEndedAt, setShiftEndedAt] = useState<string | null>(null);
  const [showStartGuide, setShowStartGuide] = useState(false);
  const [showEndGuide, setShowEndGuide] = useState(false);
  const [showSetGoal, setShowSetGoal] = useState(false);
  const [startChecks, setStartChecks] = useState<Record<number, boolean>>({});
  const [tipGoalCents, setTipGoalCents] = useState<number>(0);
  const [tipsEnteredCents, setTipsEnteredCents] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    setShiftStartedAt(localStorage.getItem(SHIFT_START_KEY));
    setShiftEndedAt(localStorage.getItem(SHIFT_END_KEY));
    const goal = localStorage.getItem(TIP_GOAL_KEY);
    if (goal) setTipGoalCents(parseInt(goal, 10) || 0);
    const tips = localStorage.getItem(TIPS_ENTERED_KEY);
    if (tips) setTipsEnteredCents(parseInt(tips, 10) || 0);
  }, [mounted]);

  const handleStartShift = () => {
    const now = new Date().toISOString();
    localStorage.setItem(SHIFT_START_KEY, now);
    setShiftStartedAt(now);
    setShowStartGuide(false);
    window.dispatchEvent(new CustomEvent('shiftStarted', { detail: { at: now } }));
  };

  const handleEndShift = () => {
    const now = new Date().toISOString();
    localStorage.setItem(SHIFT_END_KEY, now);
    setShiftEndedAt(now);
    setShowEndGuide(false);
    setTipsEnteredCents(0);
    localStorage.removeItem(TIPS_ENTERED_KEY);
    window.dispatchEvent(new CustomEvent('shiftEnded', { detail: { at: now } }));
  };

  const allStartChecksDone = START_CHECKLIST.every((_, i) => startChecks[i]);

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Start shift */}
      {!shiftStartedAt ? (
        <button
          type="button"
          onClick={() => setShowStartGuide(true)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-900/40 border border-teal-600/50 text-teal-200 hover:bg-teal-800/50 transition-colors text-sm"
        >
          <LogIn className="w-4 h-4" />
          Start shift
        </button>
      ) : !shiftEndedAt && (
        <>
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-600/50 text-zinc-300 text-sm">
            <Clock className="w-4 h-4 text-teal-400" />
            Shift started {formatTime(shiftStartedAt)}
          </span>
          {tipGoalCents > 0 ? (
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-900/30 border border-amber-600/40 text-amber-200 text-sm">
              <DollarSign className="w-4 h-4" />
              Tip goal: ${(tipGoalCents / 100).toFixed(0)} — ${(tipsEnteredCents / 100).toFixed(0)} so far
              <button type="button" onClick={() => setShowSetGoal(true)} className="text-amber-400 hover:text-amber-300 text-xs underline">Edit</button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setShowSetGoal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-900/30 border border-amber-600/40 text-amber-200 hover:bg-amber-800/40 text-sm transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              Set tip goal
            </button>
          )}
        </>
      )}

      {/* End shift / closeout */}
      {shiftStartedAt && !shiftEndedAt && (
        <button
          type="button"
          onClick={() => setShowEndGuide(true)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-900/40 border border-amber-600/50 text-amber-200 hover:bg-amber-800/50 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          End shift
        </button>
      )}

      {shiftEndedAt && (
        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 text-zinc-400 text-sm">
          Shift ended {formatTime(shiftEndedAt)}. Start a new shift above when ready.
        </span>
      )}

      {/* Set tip goal (during shift) */}
      {showSetGoal && shiftStartedAt && !shiftEndedAt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowSetGoal(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-xs w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              Tip goal today
            </h3>
            <input
              type="number"
              min={0}
              step={1}
              value={tipGoalCents ? tipGoalCents / 100 : ''}
              onChange={e => {
                const v = Math.round(parseFloat(e.target.value || '0') * 100);
                setTipGoalCents(v);
                localStorage.setItem(TIP_GOAL_KEY, String(v));
              }}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-600 text-white text-sm mb-4"
              placeholder="0"
              autoFocus
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowSetGoal(false)} className="flex-1 py-2 rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-800 text-sm">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Start-shift guide modal */}
      {showStartGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowStartGuide(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <LogIn className="w-5 h-5 text-teal-400" />
              Start shift
            </h3>
            <ul className="space-y-2 mb-6">
              {START_CHECKLIST.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStartChecks(prev => ({ ...prev, [i]: !prev[i] }))}
                    className="rounded border border-zinc-600 w-5 h-5 flex items-center justify-center text-teal-400"
                  >
                    {startChecks[i] ? <CheckCircle className="w-4 h-4" /> : null}
                  </button>
                  <span className="text-zinc-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowStartGuide(false)}
                className="flex-1 py-2 rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-800 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartShift}
                disabled={!allStartChecksDone}
                className="flex-1 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                Start shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End-shift / closeout guide modal */}
      {showEndGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowEndGuide(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <LogOut className="w-5 h-5 text-amber-400" />
              End shift — closeout
            </h3>
            <p className="text-zinc-400 text-sm mb-4">
              Enter tips for today and confirm shift end.
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Tip goal today ($)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={tipGoalCents ? tipGoalCents / 100 : ''}
                  onChange={e => {
                    const v = Math.round(parseFloat(e.target.value || '0') * 100);
                    setTipGoalCents(v);
                    localStorage.setItem(TIP_GOAL_KEY, String(v));
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-600 text-white text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Tips entered ($)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={tipsEnteredCents ? tipsEnteredCents / 100 : ''}
                  onChange={e => {
                    const v = Math.round(parseFloat(e.target.value || '0') * 100);
                    setTipsEnteredCents(v);
                    localStorage.setItem(TIPS_ENTERED_KEY, String(v));
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-600 text-white text-sm"
                  placeholder="0"
                />
              </div>
              {tipGoalCents > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span className="text-zinc-400">Progress:</span>
                  <span className={tipsEnteredCents >= tipGoalCents ? 'text-teal-400' : 'text-amber-400'}>
                    ${(tipsEnteredCents / 100).toFixed(2)} / ${(tipGoalCents / 100).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowEndGuide(false)}
                className="flex-1 py-2 rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-800 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEndShift}
                className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
              >
                End shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
