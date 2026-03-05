/**
 * Hook: Lounge Layout Mode — Foundation for POS-mirrored UI
 *
 * Returns layoutMode from lounge config. Use useFloorPlan = (mode === 'floor')
 * to drive Floor tab, compact hero, etc. Reduces cognitive switching cost
 * when UI mirrors the POS (Toast, etc.) used by the lounge.
 */

import { useState, useEffect } from 'react';

export type LayoutMode = 'floor' | 'classic';

export function useLoungeLayoutMode(loungeId: string | null | undefined): {
  layoutMode: LayoutMode;
  useFloorPlan: boolean;
  loading: boolean;
} {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('classic');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loungeId?.trim()) {
      setLayoutMode('classic');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/lounges/${encodeURIComponent(loungeId.trim())}/config`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        const mode = data?.config?.layoutMode;
        setLayoutMode(mode === 'floor' || mode === 'classic' ? mode : 'classic');
      })
      .catch(() => {
        if (!cancelled) setLayoutMode('classic');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loungeId]);

  return {
    layoutMode,
    useFloorPlan: layoutMode === 'floor',
    loading,
  };
}
