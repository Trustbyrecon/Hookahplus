"use client";

import React, { useCallback, useState } from "react";
import { ChevronDown, ChevronUp, Send, Sparkles } from "lucide-react";

type ChatLine = { role: "user" | "assistant"; content: string };

type ChatResponse = {
  reply?: string;
  error?: string;
  toolTrace?: Array<{ tool: string; ok: boolean; summary?: string }>;
};

export function HPlusOperatorPanel({
  loungeId,
  onActionComplete,
  defaultOpen = true,
}: {
  loungeId?: string | null;
  onActionComplete?: () => void;
  /** Collapse on small screens by default in CODIGO-style floor views */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatLine[]>([
    {
      role: "assistant",
      content:
        "H+ Operator ready. Try: “Start table 3 with Blue Mist and Mint for Marcus” or “What does Marcus usually get?”",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [lastTrace, setLastTrace] = useState<ChatResponse["toolTrace"]>(undefined);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatLine[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setLastTrace(undefined);

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
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "(no reply)" },
      ]);
      if (data.toolTrace?.some((t) => t.ok)) {
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
              Session commands · CLARK lite · upsells
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

          {lastTrace && lastTrace.length > 0 && (
            <div className="mb-2 text-[11px] text-zinc-500 font-mono">
              {lastTrace.map((t, i) => (
                <span key={i} className="mr-2">
                  {t.tool}:{t.ok ? "ok" : "fail"}
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
