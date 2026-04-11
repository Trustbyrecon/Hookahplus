"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Sparkles } from "lucide-react";

export function HPlusOperatorPanel({
  loungeId,
  defaultOpen = true,
}: {
  loungeId?: string | null;
  /** @deprecated No in-app chat refresh; kept for call-site compatibility. */
  onActionComplete?: () => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const gptUrl = (() => {
    const u = process.env.NEXT_PUBLIC_HPLUS_OPERATOR_GPT_URL;
    return u && u.startsWith("http") ? u : null;
  })();

  return (
    <section className="mb-6 rounded-xl border border-teal-500/25 bg-zinc-950/80 shadow-lg shadow-teal-900/20">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles className="h-5 w-5 shrink-0 text-teal-400" aria-hidden />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">H+ Operator</div>
            <div className="truncate text-xs text-zinc-500">
              GPT + Actions · this app is the trust-governed action engine
              {loungeId ? <span className="text-zinc-600"> · {loungeId}</span> : null}
            </div>
          </div>
        </div>
        {open ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-zinc-500" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-zinc-500" />
        )}
      </button>

      {open && (
        <div className="border-t border-zinc-800 px-4 pb-4 pt-3 text-sm text-zinc-300">
          <p className="text-zinc-400">
            Chat and model orchestration live in <strong className="font-medium text-zinc-200">H+ Operator GPT</strong>.
            Hookah+ runs actions, confirmations, CLARK memory, and traces for that GPT via OpenAI Actions.
          </p>
          {gptUrl ? (
            <a
              href={gptUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-teal-500"
            >
              Open H+ Operator GPT
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <p className="mt-3 text-xs text-zinc-500">
              Set <span className="font-mono text-zinc-400">NEXT_PUBLIC_HPLUS_OPERATOR_GPT_URL</span>{" "}
              to show a launch button here.
            </p>
          )}
          <p className="mt-3 text-[11px] text-zinc-600">
            Pending risky actions: POST{" "}
            <span className="font-mono text-zinc-500">/api/operator/confirm</span> with{" "}
            <span className="font-mono text-zinc-500">actionKey</span> (or the GPT confirm action).
          </p>
        </div>
      )}
    </section>
  );
}
