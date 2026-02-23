"use client";

import React, { useMemo, useState } from "react";
import GlobalNavigation from "../../../components/GlobalNavigation";
import Breadcrumbs from "../../../components/Breadcrumbs";
import PageHero from "../../../components/PageHero";
import Button from "../../../components/Button";
import { Badge } from "../../../components";
import { Building2, CheckCircle, AlertTriangle, Copy, Target } from "lucide-react";

type VenueIdentity = "casino_velocity" | "sports_momentum" | "luxury_memory";

const IDENTITY_LABELS: Record<VenueIdentity, { label: string; primaryKpi: string; guardrails: string[] }> = {
  casino_velocity: {
    label: "Casino Velocity",
    primaryKpi: "Session Setup Time (SST)",
    guardrails: ["Order modification rate", "Add-on reversal rate", "Order accuracy"],
  },
  sports_momentum: {
    label: "Sports Momentum",
    primaryKpi: "Halftime Refill Conversion Rate (HRCR)",
    guardrails: ["Repeat velocity stability", "Voluntary add-ons", "Staff friction"],
  },
  luxury_memory: {
    label: "Luxury Memory",
    primaryKpi: "VIP Return Velocity",
    guardrails: ["Profile correction rate", "Over-personalization friction"],
  },
};

export default function VenueIdentityAdminPage() {
  const [loungeId, setLoungeId] = useState("");
  const [venueIdentity, setVenueIdentity] = useState<VenueIdentity>("sports_momentum");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const trimmedLoungeId = loungeId.trim();
  const identityMeta = IDENTITY_LABELS[venueIdentity];

  const curlCommand = useMemo(() => {
    const id = trimmedLoungeId || "{loungeId}";
    return [
      "curl -X POST \\",
      `  \"{{APP_URL}}/api/lounges/${encodeURIComponent(id)}/venue-identity\" \\`,
      "  -H \"Content-Type: application/json\" \\",
      `  -d '{\"venueIdentity\":\"${venueIdentity}\"}'`,
    ].join("\n");
  }, [trimmedLoungeId, venueIdentity]);

  async function submit() {
    const id = trimmedLoungeId;
    if (!id) {
      setError("loungeId is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const resp = await fetch(`/api/lounges/${encodeURIComponent(id)}/venue-identity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueIdentity }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.success) {
        throw new Error(data?.error || `HTTP ${resp.status}`);
      }
      setResult(data);
    } catch (e: any) {
      setError(e?.message || "Failed to set venue identity");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs className="mb-6" />

        <PageHero
          headline="Venue Identity"
          subheadline="Set stable venue identity per location (never auto-switch). Behavior can adapt only within identity; guardrails remain enforced."
          benefit={{
            value: identityMeta.label,
            description: `Primary KPI: ${identityMeta.primaryKpi}`,
            icon: <Target className="w-5 h-5 text-teal-400" />,
          }}
          trustIndicators={[
            { icon: <Building2 className="w-4 h-4" />, text: "Stable per location" },
            { icon: <AlertTriangle className="w-4 h-4" />, text: "Guardrails + throttle-back" },
          ]}
        />

        <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="block text-sm text-zinc-300 mb-2">Lounge ID</label>
              <input
                value={loungeId}
                onChange={(e) => setLoungeId(e.target.value)}
                placeholder="e.g. DIABLOS_MGM or a loungeId UUID/slug"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-teal-500"
              />
              <p className="mt-2 text-xs text-zinc-500">
                This writes `LoungeConfig.configData.venue_identity` and increments config version.
              </p>
            </div>

            <div>
              <label className="block text-sm text-zinc-300 mb-2">Identity</label>
              <select
                value={venueIdentity}
                onChange={(e) => setVenueIdentity(e.target.value as VenueIdentity)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
              >
                <option value="casino_velocity">casino_velocity</option>
                <option value="sports_momentum">sports_momentum</option>
                <option value="luxury_memory">luxury_memory</option>
              </select>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge className="bg-zinc-800 text-zinc-200 border border-zinc-700">
                  Primary: {identityMeta.primaryKpi}
                </Badge>
                {identityMeta.guardrails.slice(0, 2).map((g) => (
                  <Badge key={g} className="bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Guardrail: {g}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Button onClick={submit} disabled={submitting || !trimmedLoungeId}>
              {submitting ? "Setting..." : "Set Venue Identity"}
            </Button>
            <Button
              variant="outline"
              onClick={() => copyToClipboard(curlCommand)}
              className="gap-2"
              title="Copy cURL command"
            >
              <Copy className="w-4 h-4" />
              Copy cURL
            </Button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {result?.success && (
            <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Venue identity set
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3 text-xs text-zinc-200">
                <div>
                  <span className="text-zinc-400">loungeId:</span> {result.loungeId}
                </div>
                <div>
                  <span className="text-zinc-400">venueIdentity:</span> {result.venueIdentity}
                </div>
                <div>
                  <span className="text-zinc-400">version:</span> {result.version}
                </div>
              </div>
              {result.effectiveAt && (
                <div className="mt-2 text-xs text-zinc-400">effectiveAt: {result.effectiveAt}</div>
              )}
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">API reference (for auditing)</h3>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(curlCommand)} className="gap-2">
                <Copy className="w-4 h-4" />
                Copy
              </Button>
            </div>
            <pre className="mt-2 bg-zinc-950/50 border border-zinc-800 rounded p-3 text-xs text-zinc-200 overflow-x-auto">
              {curlCommand}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

