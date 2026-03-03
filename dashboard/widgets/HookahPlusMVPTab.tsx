import React, { useEffect, useMemo, useRef, useState } from "react";

/** ---- Types ---- **/
type StageBreakdown = { stage1: number; stage2: number; stage3: number };
type Source = "live" | "fallback";
type EtaPayload = {
  isoTarget: string;           // e.g. "2025-09-01T17:00:00Z"
  source: Source;              // live if from API/push, fallback otherwise
  progressPct: number;         // 0–100
  stageBreakdown?: StageBreakdown;
  notes?: string;
  updatedAt?: string;
};

/** ---- Constants ---- **/
const FALLBACK_ISO = "2025-09-01T17:00:00Z"; // ~3 weeks from Aug 11, 2025
const STORAGE_KEY = "hookahplus_mvp_eta_v1";

/** ---- Local helpers ---- **/
function readLocal(): Partial<EtaPayload> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocal(data: Partial<EtaPayload>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function useCountdown(targetIso: string) {
  const [now, setNow] = useState<Date>(new Date());
  const target = useMemo(() => new Date(targetIso), [targetIso]);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const ms = Math.max(0, target.getTime() - now.getTime());
  const s = Math.floor(ms / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  return { days, hours, minutes, seconds, remainingMs: ms };
}

function clampPct(n: number | undefined): number {
  const v = Math.round(Number(n ?? 0));
  return Math.max(0, Math.min(100, v));
}

/** ---- Component ---- **/
export default function HookahPlusMVPTab() {
  // seed from local or fallback
  const [eta, setEta] = useState<EtaPayload>(() => {
    const local = readLocal();
    return {
      isoTarget: (local?.isoTarget as string) || FALLBACK_ISO,
      source: "fallback",
      progressPct: clampPct(local?.progressPct as number),
      stageBreakdown: (local?.stageBreakdown as StageBreakdown) || { stage1: 0, stage2: 0, stage3: 0 },
      notes: (local?.notes as string) || "Awaiting first live sync.",
      updatedAt: (local?.updatedAt as string) || new Date().toISOString(),
    };
  });
  const [lastSync, setLastSync] = useState<Date | null>(eta.updatedAt ? new Date(eta.updatedAt) : null);
  const pollingRef = useRef<number | null>(null);

  // 1) Initial live fetch from Netlify Function (CI-updated)
  useEffect(() => {
    const pull = async () => {
      try {
        const r = await fetch("/api/hplus-eta", { cache: "no-store" });
        const j = await r.json();
        const d = j?.data;
        if (d?.isoTarget) {
          const next: EtaPayload = {
            isoTarget: d.isoTarget,
            source: d.source === "fallback" ? "fallback" : "live",
            progressPct: clampPct(d.progressPct),
            stageBreakdown: d.stageBreakdown ?? { stage1: 0, stage2: 0, stage3: 0 },
            notes: d.notes,
            updatedAt: d.updatedAt ?? new Date().toISOString(),
          };
          setEta(next);
          setLastSync(new Date(next.updatedAt!));
          writeLocal(next);
        }
      } catch {
        // keep current state on error
      }
    };
    pull();
  }, []);

  // 2) Background poll every 10 minutes to tighten ETA
  useEffect(() => {
    const poll = async () => {
      try {
        const r = await fetch("/api/hplus-eta", { cache: "no-store" });
        const j = await r.json();
        const d = j?.data;
        if (d?.isoTarget) {
          const next: EtaPayload = {
            isoTarget: d.isoTarget,
            source: d.source === "fallback" ? "fallback" : "live",
            progressPct: clampPct(d.progressPct),
            stageBreakdown: d.stageBreakdown ?? { stage1: 0, stage2: 0, stage3: 0 },
            notes: d.notes,
            updatedAt: d.updatedAt ?? new Date().toISOString(),
          };
          setEta(next);
          setLastSync(new Date(next.updatedAt!));
          writeLocal(next);
        }
      } catch {}
    };
    pollingRef.current = window.setInterval(poll, 10 * 60 * 1000);
    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
    };
  }, []);

  // 3) Optional: instant push updates if you expose etaService.subscribe on window
  useEffect(() => {
    const svc = (window as any)?.etaService;
    const unsub = typeof svc?.subscribe === "function" ? svc.subscribe((d: any) => {
      const next: EtaPayload = {
        isoTarget: d.isoTarget || FALLBACK_ISO,
        source: "live",
        progressPct: clampPct(d.progressPct),
        stageBreakdown: d.stageBreakdown ?? { stage1: 0, stage2: 0, stage3: 0 },
        notes: d.notes,
        updatedAt: new Date().toISOString(),
      };
      setEta(next);
      setLastSync(new Date(next.updatedAt!));
      writeLocal(next);
    }) : null;
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  const { days, hours, minutes, seconds } = useCountdown(eta.isoTarget);
  const stage = eta.stageBreakdown ?? { stage1: 0, stage2: 0, stage3: 0 };

  return (
    <div style={S.wrap}>
      <header style={S.header}>
        <h1 style={S.title}>Hookah+ MVP Countdown</h1>
        <span style={S.badge(eta.source)}>{eta.source.toUpperCase()}</span>
      </header>

      <div style={S.timerBox}>
        <TimeChunk label="days" value={String(days)} />
        <Sep />
        <TimeChunk label="hours" value={hours.toString().padStart(2, "0")} />
        <Sep />
        <TimeChunk label="mins" value={minutes.toString().padStart(2, "0")} />
        <Sep />
        <TimeChunk label="secs" value={seconds.toString().padStart(2, "0")} />
      </div>

      <div style={S.progressWrap}>
        <div style={S.progressLabel}>
          <span>Overall Progress</span>
          <b>{Math.round(eta.progressPct)}%</b>
        </div>
        <div style={S.progressBar}>
          <div style={S.progressFill(eta.progressPct)} />
        </div>

        <div style={S.stageGrid}>
          <StageMeter label="Stage 1 — Critical Path" pct={stage.stage1} />
          <StageMeter label="Stage 2 — Pre-Launch" pct={stage.stage2} />
          <StageMeter label="Stage 3 — Go-Live Prep" pct={stage.stage3} />
        </div>
      </div>

      {eta.notes && <p style={S.notes}>{eta.notes}</p>}

      <footer style={S.footer}>
        <div>Target: <b>{new Date(eta.isoTarget).toUTCString()}</b></div>
        <div>Last sync: {lastSync ? lastSync.toLocaleString() : "—"}</div>
      </footer>
    </div>
  );
}

/** ---- Subcomponents ---- **/
function TimeChunk({ label, value }: { label: string; value: string }) {
  return (
    <div style={S.timerChunk}>
      <strong>{value}</strong>
      <div>{label}</div>
    </div>
  );
}
function Sep() { return <div style={S.sep}>:</div>; }

function StageMeter({ label, pct }: { label: string; pct: number }) {
  const clamped = clampPct(pct);
  const state = clamped >= 75 ? "green" : clamped >= 25 ? "yellow" : "red";
  return (
    <div style={S.stageCard}>
      <div style={S.stageHeader}>
        <span>{label}</span>
        <span style={S.dot(state)} />
      </div>
      <div style={S.stageBar}>
        <div style={S.stageFill(clamped)} />
      </div>
      <div style={S.stagePct}>{clamped}%</div>
    </div>
  );
}

/** ---- Styles ---- **/
const S: any = {
  wrap: { padding: 24, maxWidth: 880, margin: "0 auto" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  title: { margin: 0, fontSize: 24, fontWeight: 700 },
  badge: (src: Source) => ({
    padding: "6px 10px",
    borderRadius: 8,
    fontSize: 12,
    border: "1px solid",
    borderColor: src === "live" ? "#6aa84f" : "#999",
    color: src === "live" ? "#2e7d32" : "#555",
    background: src === "live" ? "rgba(106,168,79,.12)" : "rgba(0,0,0,.04)",
  }),
  timerBox: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 24, borderRadius: 16, border: "1px solid #e5e5e5" },
  timerChunk: { textAlign: "center", minWidth: 90 },
  sep: { fontSize: 24, opacity: .6 },
  progressWrap: { marginTop: 20 },
  progressLabel: { display: "flex", justifyContent: "space-between", marginBottom: 6 },
  progressBar: { height: 10, background: "#eee", borderRadius: 999, overflow: "hidden" },
  progressFill: (pct: number) => ({ width: `${Math.max(0, Math.min(100, pct))}%`, height: "100%", background: "#4a90e2" }),
  stageGrid: { display: "grid", gridTemplateColumns: "1fr", gap: 10, marginTop: 16 },
  stageCard: { border: "1px solid #e5e5e5", borderRadius: 12, padding: 12 },
  stageHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  dot: (state: "green"|"yellow"|"red") => ({
    width: 10, height: 10, borderRadius: "50%",
    background: state === "green" ? "#2e7d32" : state === "yellow" ? "#f9a825" : "#c62828"
  }),
  stageBar: { height: 8, background: "#f1f1f1", borderRadius: 999, overflow: "hidden" },
  stageFill: (pct: number) => ({ width: `${pct}%`, height: "100%", background: "#4a90e2" }),
  stagePct: { marginTop: 6, fontSize: 12, opacity: .7 },
  notes: { marginTop: 12, fontSize: 13, opacity: .8 },
  footer: { display: "flex", justifyContent: "space-between", marginTop: 18, fontSize: 12, opacity: .7 },
};
