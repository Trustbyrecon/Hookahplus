import { prisma } from "@/lib/prisma";

type FlavorUsage = {
  flavorId: string;
  count: number;
};

/**
 * Calculate flavor popularity from completed sessions
 */
export async function calculateFlavorPopularity(
  period: "7d" | "30d" = "30d",
  loungeId?: string
): Promise<FlavorUsage[]> {
  const days = period === "7d" ? 7 : 30;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Get all completed sessions within the period
  const sessions = await prisma.session.findMany({
    where: {
      state: "CLOSED",
      endedAt: { gte: cutoffDate },
      ...(loungeId && { loungeId }),
      flavorMix: { not: null },
    },
    select: {
      flavorMix: true,
    },
  });

  // Count flavor usage
  const flavorCounts = new Map<string, number>();

  for (const session of sessions) {
    if (!session.flavorMix) continue;

    try {
      const mix = JSON.parse(session.flavorMix);
      // Handle different mix formats
      const flavors = Array.isArray(mix)
        ? mix
        : mix.flavors
        ? mix.flavors
        : mix.flavorIds
        ? mix.flavorIds
        : [];

      for (const flavor of flavors) {
        const flavorId = typeof flavor === "string" ? flavor : flavor.id || flavor.name;
        if (flavorId) {
          flavorCounts.set(flavorId, (flavorCounts.get(flavorId) || 0) + 1);
        }
      }
    } catch {
      // Skip invalid JSON
      continue;
    }
  }

  // Convert to array and sort by count
  const popularity: FlavorUsage[] = Array.from(flavorCounts.entries())
    .map(([flavorId, count]) => ({ flavorId, count }))
    .sort((a, b) => b.count - a.count);

  // Update FlavorPopularity table
  for (const item of popularity) {
    await prisma.flavorPopularity.upsert({
      where: {
        flavorId_period: {
          flavorId: item.flavorId,
          period,
        },
      },
      update: {
        count: item.count,
        lastUpdated: new Date(),
      },
      create: {
        flavorId: item.flavorId,
        count: item.count,
        period,
        lastUpdated: new Date(),
      },
    });
  }

  return popularity;
}

/**
 * Get sorted flavors by popularity
 */
export async function getSortedFlavors(
  allFlavors: Array<{ id: string; [key: string]: any }>,
  period: "7d" | "30d" = "30d",
  loungeId?: string
): Promise<Array<{ id: string; [key: string]: any; popularity?: number }>> {
  // Get popularity data
  const popularity = await calculateFlavorPopularity(period, loungeId);
  const popularityMap = new Map(
    popularity.map((p) => [p.flavorId, p.count])
  );

  // Sort flavors by popularity (most popular first)
  return allFlavors
    .map((flavor) => ({
      ...flavor,
      popularity: popularityMap.get(flavor.id) || 0,
    }))
    .sort((a, b) => {
      // Sort by popularity first, then by original order
      if (b.popularity !== a.popularity) {
        return b.popularity - a.popularity;
      }
      return 0;
    });
}

/**
 * Update popularity when a session is completed
 */
export async function updatePopularityOnSessionComplete(
  sessionId: string,
  loungeId?: string
): Promise<void> {
  // Recalculate for both periods
  await calculateFlavorPopularity("7d", loungeId);
  await calculateFlavorPopularity("30d", loungeId);
}

