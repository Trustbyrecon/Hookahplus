"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function StepLaunch({
  summary,
  loungeId,
  gptUrl,
  loading,
  error,
  onBack,
  onCreate,
}: {
  summary: { name: string; tableCount: number; basePrice: number; flavorCount: number };
  loungeId: string | null;
  gptUrl: string | null;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onCreate: () => void;
}) {
  const dashboardHref = loungeId
    ? `/fire-session-dashboard?loungeIds=${encodeURIComponent(loungeId)}`
    : "/fire-session-dashboard";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Your lounge is ready</h2>
        <p className="mt-1 text-sm text-zinc-500">
          {loungeId
            ? "Open the operator surface and try a first command."
            : "Review and create your lounge in the database."}
        </p>
      </div>

      <div className="rounded-xl border border-teal-500/20 bg-teal-950/20 px-4 py-3">
        <p className="text-sm font-medium text-teal-100/95">{summary.name}</p>
        <p className="mt-1 text-xs text-zinc-400">
          {summary.tableCount} tables · ${summary.basePrice} base · {summary.flavorCount} flavors
          indexed
        </p>
        {loungeId ? (
          <p className="mt-2 font-mono text-[11px] text-zinc-500 break-all">loungeId: {loungeId}</p>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {!loungeId ? (
        <button
          type="button"
          disabled={loading}
          onClick={onCreate}
          className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-zinc-950 hover:bg-teal-500 disabled:opacity-40"
        >
          {loading ? "Creating…" : "Create lounge"}
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-zinc-300">Try this in H+ Operator GPT:</p>
          <div className="flex flex-wrap gap-2">
            {["Start table 1", "Start table 3 with Blue Mist", "What should I push right now?"].map(
              (t) => (
                <span
                  key={t}
                  className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-400"
                >
                  {t}
                </span>
              )
            )}
          </div>
          {gptUrl ? (
            <a
              href={gptUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-zinc-100 py-2.5 text-sm font-medium text-zinc-900 hover:bg-white"
            >
              Open H+ Operator GPT
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <p className="text-xs text-zinc-500">
              Set <span className="font-mono text-zinc-400">NEXT_PUBLIC_HPLUS_OPERATOR_GPT_URL</span>{" "}
              to deep-link your GPT from this screen.
            </p>
          )}
          <Link
            href={dashboardHref}
            className="flex items-center justify-center rounded-lg border border-zinc-600 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            Open session dashboard
          </Link>
        </div>
      )}

      <button
        type="button"
        onClick={onBack}
        disabled={loading}
        className="w-full rounded-lg border border-zinc-600 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
      >
        Back
      </button>
    </div>
  );
}
