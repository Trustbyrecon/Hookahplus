"use client";

import React, { useCallback, useState } from "react";
import { ChevronDown, ChevronUp, Send, Sparkles } from "lucide-react";

type ChatLine = { role: "user" | "assistant"; content: string };

type ToolTraceEntry = {
  tool: string;
  ok: boolean;
  status: string;
  message?: string;
  auditLine?: string;
};

type ChatResponse = {
  reply?: string;
  error?: string;
  toolTrace?: ToolTraceEntry[];
  pendingConfirmation?: {
    actionKey: string;
    prompt: string;
    tool: string;
  } | null;
  result?: { ok: boolean; message?: string; status?: string };
};

const QUICK_PROMPTS = [
  "Start table 3 with Blue Mist and Mint for Marcus",
  "What does Marcus usually get?",
  "Move table 3 to table 5",
  "Close out table 4",
  "Summarize tonight’s lounge activity",
];

export function HPlusOperatorPanel({
  loungeId,
  onActionComplete,
  defaultOpen = true,
}: {
  loungeId?: string | null;
  onActionComplete?: () => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatLine[]>([
    {
      role: "assistant",
      content:
        "H+ Operator v2 — resolve by name or table; risky moves/closes need your confirm. Try a quick prompt below.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [lastTrace, setLastTrace] = useState<ToolTraceEntry[] | undefined>(undefined);
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    actionKey: string;
    prompt: string;
    tool: string;
  } | null>(null);

  const runConfirm = useCallback(
    async (actionKey: string) => {
      setLoading(true);
      try {
        const res = await fetch("/api/operator/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            confirmedActionKey: actionKey,
            loungeId: loungeId || undefined,
          }),
        });
        const data = (await res.json()) as ChatResponse;
        if (!res.ok) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: data.error || `Confirm failed (${res.status})`,
            },
          ]);
          return;
        }
        setLastTrace(data.toolTrace);
        setPendingConfirmation(null);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply || data.result?.message || "Done." },
        ]);
        if (data.result?.ok !== false) {
          onActionComplete?.();
        }
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: e instanceof Error ? e.message : "Confirm request failed.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loungeId, onActionComplete]
  );

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatLine[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setLastTrace(undefined);
    setPendingConfirmation(null);

    try {
      const res = await fetch("/api/operator/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          loungeId: loungeId || undefined,
        }),
      });
      const data = (await res.json()) as ChatResponse;
      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || `Request failed (${res.status})`,
          },
        ]);
        return;
      }
      setLastTrace(data.toolTrace);
      if (data.pendingConfirmation) {
        setPendingConfirmation(data.pendingConfirmation);
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "(no reply)" },
      ]);
      const shouldRefresh =
        data.toolTrace?.some(
          (t) =>
            t.ok &&
            t.status === "success" &&
            (t.tool === "start_session" ||
              t.tool === "end_session" ||
              t.tool === "move_table")
        ) ?? false;
      if (shouldRefresh) {
        onActionComplete?.();
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            e instanceof Error ? e.message : "Network error — try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, loungeId, onActionComplete]);

  return (
    <section className="mb-6 rounded-xl border border-teal-500/25 bg-zinc-950/80 shadow-lg shadow-teal-900/20">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-5 w-5 shrink-0 text-teal-400" aria-hidden />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">H+ Operator</div>
            <div className="text-xs text-zinc-500 truncate">
              v2 · resolve · confirm risky actions · CLARK
              {loungeId ? (
                <span className="text-zinc-600"> · {loungeId}</span>
              ) : null}
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
        <div className="border-t border-zinc-800 px-4 pb-4 pt-2">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setInput(q)}
                className="text-[11px] rounded-md border border-zinc-700 bg-zinc-900/80 px-2 py-1 text-zinc-400 hover:text-teal-300 hover:border-teal-800"
              >
                {q.length > 42 ? `${q.slice(0, 40)}…` : q}
              </button>
            ))}
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 mb-3 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-6 rounded-lg bg-zinc-800/80 px-3 py-2 text-zinc-100"
                    : "mr-6 rounded-lg bg-teal-950/40 border border-teal-900/40 px-3 py-2 text-teal-50/95"
                }
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="text-xs text-zinc-500 italic">Running tools…</div>
            )}
          </div>

          {pendingConfirmation && (
            <div className="mb-3 rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-3">
              <p className="text-sm text-amber-100/95">{pendingConfirmation.prompt}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void runConfirm(pendingConfirmation.actionKey)}
                  className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-zinc-950 hover:bg-amber-500 disabled:opacity-40"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setPendingConfirmation(null)}
                  className="rounded-md border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {lastTrace && lastTrace.length > 0 && (
            <div className="mb-2 text-[11px] text-zinc-500 font-mono space-x-2">
              {lastTrace.map((t, i) => (
                <span key={i}>
                  {t.tool}:{t.status}
                  {t.auditLine ? ` (${t.auditLine.slice(0, 48)}…)` : ""}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Operator command…"
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
              disabled={loading}
              aria-label="H+ Operator message"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={loading || !input.trim()}
              className="rounded-lg bg-teal-600 px-3 py-2 text-white hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
