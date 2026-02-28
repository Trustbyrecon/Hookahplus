"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GlobalNavigation from "@/components/GlobalNavigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Building2, RefreshCw } from "lucide-react";

export default function LoungeSettingsPage() {
  const params = useParams();
  const loungeId = (params?.loungeId as string) || "";
  const [softLaunchEnabled, setSoftLaunchEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loungeId) {
      setLoading(false);
      return;
    }
    async function fetchStatus() {
      try {
        const res = await fetch(`/api/lounges/${encodeURIComponent(loungeId)}/soft-launch`);
        if (res.ok) {
          const data = await res.json();
          setSoftLaunchEnabled(Boolean(data?.softLaunchEnabled));
        } else {
          const err = await res.json().catch(() => ({}));
          setError(err?.error || `HTTP ${res.status}`);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, [loungeId]);

  const handleToggle = async () => {
    if (!loungeId || toggling) return;
    const next = !softLaunchEnabled;
    setToggling(true);
    setError(null);
    try {
      const res = await fetch(`/api/lounges/${encodeURIComponent(loungeId)}/soft-launch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ softLaunchEnabled: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      setSoftLaunchEnabled(Boolean(data?.softLaunchEnabled));
    } catch (e: any) {
      setError(e?.message || "Failed to update");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs className="mb-6" />

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-teal-400" />
            <h1 className="text-3xl font-bold text-white">Lounge Settings</h1>
          </div>
          <p className="text-zinc-400">
            {loungeId ? `Configure settings for ${loungeId}` : "Select a lounge"}
          </p>
        </div>

        {!loungeId ? (
          <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-6 text-zinc-400">
            No lounge selected. Use a URL like /admin/lounges/YOUR_LOUNGE_ID/settings
          </div>
        ) : loading ? (
          <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-6 flex items-center gap-2 text-zinc-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading...
          </div>
        ) : (
          <div className="card-pretty p-6">
            <h3 className="text-lg font-semibold text-white mb-4">CODIGO</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Soft Launch (baseline only)</div>
                <div className="text-sm text-zinc-400">
                  Disable optimization surfaces; baseline tracking only.
                </div>
              </div>
              <label
                className={`relative inline-flex items-center cursor-pointer ${toggling ? "pointer-events-none opacity-60" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={softLaunchEnabled}
                  onChange={handleToggle}
                  disabled={toggling}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                {toggling && (
                  <RefreshCw className="w-4 h-4 ml-2 animate-spin text-zinc-400" />
                )}
              </label>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
