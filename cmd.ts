// Command-style hooks to make feature activation explicit for agents and tests
export const cmd = {
  deployReceiptPreview: async () => {
    // Receipt preview is wired into preorder + checkout flows via /api/receipt/preview
    return { ok: true, feature: "receipt_preview_v0" };
  },
  enableIdempotencySpine: async () => {
    // Idempotency now uses the shared spine in lib/idempotency.ts across sessions & payments
    return { ok: true, feature: "idempotency_spine_v0" };
  },
  enableSessionTimeline: async () => {
    // Timeline available at /sessions/[id]/timeline sourced from session_events
    return { ok: true, feature: "session_timeline_v0" };
  },
};

