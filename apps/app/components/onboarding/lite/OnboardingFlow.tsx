"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StepName } from "./StepName";
import { StepTables } from "./StepTables";
import { StepPricing } from "./StepPricing";
import { StepMenu } from "./StepMenu";
import { StepLaunch } from "./StepLaunch";

const STORAGE_KEY = "hplus_lite_onboarding_v1";

type Draft = {
  step: number;
  name: string;
  city: string;
  tableCount: number;
  basePrice: number;
  premiumAddonDollars: number;
  premiumFlavorLine: string;
  flavorsText: string;
  loungeId: string | null;
};

const defaultDraft: Draft = {
  step: 0,
  name: "",
  city: "",
  tableCount: 10,
  basePrice: 30,
  premiumAddonDollars: 5,
  premiumFlavorLine: "",
  flavorsText: "",
  loungeId: null,
};

function parseFlavors(text: string): string[] {
  const parts = text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const p of parts) {
    if (!out.includes(p)) out.push(p);
  }
  return out;
}

export function OnboardingFlow() {
  const [draft, setDraft] = useState<Draft>(defaultDraft);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Draft>;
        setDraft((d) => ({ ...d, ...parsed }));
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      /* ignore */
    }
  }, [draft, hydrated]);

  const gptUrl = useMemo(() => {
    const u = process.env.NEXT_PUBLIC_HPLUS_OPERATOR_GPT_URL;
    return u && u.startsWith("http") ? u : null;
  }, []);

  const flavorList = useMemo(() => parseFlavors(draft.flavorsText), [draft.flavorsText]);

  const setStep = (step: number) => setDraft((d) => ({ ...d, step }));

  const createLounge = useCallback(async () => {
    setLoading(true);
    setError(null);
    const premiumFlavors = draft.premiumFlavorLine
      .split(/[,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const res = await fetch("/api/onboarding/create-lounge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name.trim(),
          city: draft.city.trim() || undefined,
          tableCount: draft.tableCount,
          basePrice: draft.basePrice,
          flavors: flavorList,
          premiumFlavors: premiumFlavors.length ? premiumFlavors : undefined,
          premiumAddonDollars: draft.premiumAddonDollars,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.details || `HTTP ${res.status}`);
      }
      const loungeId = typeof data.loungeId === "string" ? data.loungeId : null;
      if (loungeId && typeof window !== "undefined") {
        try {
          localStorage.setItem("active_lounge", loungeId);
        } catch {
          /* ignore */
        }
      }
      setDraft((d) => ({ ...d, loungeId, step: 4 }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setLoading(false);
    }
  }, [draft, flavorList]);

  if (!hydrated) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-teal-500" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 shadow-xl shadow-black/40">
      {draft.step === 0 ? (
        <StepName
          name={draft.name}
          city={draft.city}
          onName={(name) => setDraft((d) => ({ ...d, name }))}
          onCity={(city) => setDraft((d) => ({ ...d, city }))}
          onContinue={() => setStep(1)}
        />
      ) : null}
      {draft.step === 1 ? (
        <StepTables
          tableCount={draft.tableCount}
          onTableCount={(tableCount) => setDraft((d) => ({ ...d, tableCount }))}
          onBack={() => setStep(0)}
          onContinue={() => setStep(2)}
        />
      ) : null}
      {draft.step === 2 ? (
        <StepPricing
          basePrice={draft.basePrice}
          onBasePrice={(basePrice) => setDraft((d) => ({ ...d, basePrice }))}
          premiumAddonDollars={draft.premiumAddonDollars}
          onPremiumAddonDollars={(premiumAddonDollars) =>
            setDraft((d) => ({ ...d, premiumAddonDollars }))
          }
          premiumFlavorLine={draft.premiumFlavorLine}
          onPremiumFlavorLine={(premiumFlavorLine) =>
            setDraft((d) => ({ ...d, premiumFlavorLine }))
          }
          onBack={() => setStep(1)}
          onContinue={() => setStep(3)}
        />
      ) : null}
      {draft.step === 3 ? (
        <StepMenu
          flavorsText={draft.flavorsText}
          onFlavorsText={(flavorsText) => setDraft((d) => ({ ...d, flavorsText }))}
          onBack={() => setStep(2)}
          onContinue={() => {
            setError(null);
            setStep(4);
          }}
        />
      ) : null}
      {draft.step === 4 ? (
        <StepLaunch
          summary={{
            name: draft.name.trim() || "My Lounge",
            tableCount: draft.tableCount,
            basePrice: draft.basePrice,
            flavorCount: flavorList.length,
          }}
          loungeId={draft.loungeId}
          gptUrl={gptUrl}
          loading={loading}
          error={error}
          onBack={() => {
            setError(null);
            setDraft((d) => ({ ...d, step: 3, loungeId: null }));
          }}
          onCreate={() => void createLounge()}
        />
      ) : null}
    </div>
  );
}
