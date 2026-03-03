'use client';

import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';

interface SoftLaunchBannerProps {
  loungeId: string;
}

/**
 * Subtle banner shown in the session console when softLaunchEnabled is true.
 * Does not block workflow. Staff/admin views only.
 */
export function SoftLaunchBanner({ loungeId }: SoftLaunchBannerProps) {
  const [softLaunchEnabled, setSoftLaunchEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loungeId) {
      setLoading(false);
      return;
    }
    async function fetchStatus() {
      try {
        const res = await fetch(`/api/lounges/${encodeURIComponent(loungeId)}/aliethia/policy`);
        if (res.ok) {
          const data = await res.json();
          setSoftLaunchEnabled(Boolean(data?.softLaunchEnabled));
        }
      } catch {
        // Silent fail - banner simply won't show
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, [loungeId]);

  if (loading || !softLaunchEnabled) {
    return null;
  }

  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-zinc-700/80 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-300">
      <Info className="h-4 w-4 flex-shrink-0 text-zinc-500" />
      <span>
        Soft Launch: baseline tracking only (no optimizations).
      </span>
    </div>
  );
}
