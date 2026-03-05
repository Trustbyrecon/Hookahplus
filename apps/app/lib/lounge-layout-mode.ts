/**
 * Lounge Layout Mode — Foundation for POS-mirrored UI
 *
 * Each lounge can have a layout; the UI mirrors the POS to reduce cognitive switching cost.
 * - layoutMode: 'floor' = Floor plan UI (Toast/CODIGO style)
 * - layoutMode: 'classic' = Traditional tabs
 *
 * Derived from: FloorplanLayout existence, or configData.layoutMode override.
 */

import { prisma } from './db';

export type LayoutMode = 'floor' | 'classic';

export async function getLoungeLayoutMode(loungeId: string): Promise<LayoutMode> {
  if (!loungeId?.trim()) return 'classic';

  const trimmed = loungeId.trim();

  // 1. Check PilotConfig first for layoutMode (e.g. CODIGO) — pilot config takes precedence
  const pilotConfig = await prisma.pilotConfig.findUnique({
    where: { loungeId: trimmed },
  });
  if (pilotConfig?.configData && typeof pilotConfig.configData === 'object') {
    const config = pilotConfig.configData as Record<string, unknown>;
    const mode = config?.layoutMode as string | undefined;
    if (mode === 'floor' || mode === 'classic') return mode as LayoutMode;
  }

  // 2. Check LoungeConfig for explicit layoutMode override
  const loungeConfig = await prisma.loungeConfig.findFirst({
    where: { loungeId: trimmed },
    orderBy: { version: 'desc' },
  });
  if (loungeConfig?.configData) {
    try {
      const parsed = JSON.parse(loungeConfig.configData) as Record<string, unknown>;
      const mode = parsed?.layoutMode as string | undefined;
      if (mode === 'floor' || mode === 'classic') return mode as LayoutMode;
    } catch {
      // ignore
    }
  }

  // 3. If FloorplanLayout exists for lounge, use floor mode (POS-mirrored)
  const floorplan = await prisma.floorplanLayout.findFirst({
    where: { loungeId: trimmed },
  });
  if (floorplan?.nodes && Array.isArray(floorplan.nodes) && floorplan.nodes.length > 0) {
    return 'floor';
  }

  return 'classic';
}

export function useFloorPlanLayout(mode: LayoutMode): boolean {
  return mode === 'floor';
}
