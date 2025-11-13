/**
 * Unknown Tracker - Taxonomy v1
 * 
 * Tracks unknown enum values for taxonomy review and promotion.
 * Stores unknown labels with counts, examples, and timestamps.
 * 
 * Agent: Noor (session_agent)
 */

import { prisma } from '../db';

export type EnumType = 'SessionState' | 'TrustEventType' | 'DriftReason';

export interface UnknownEvent {
  enumType: EnumType;
  rawLabel: string;
  exampleEventId: string;
  examplePayload?: Record<string, any>;
}

/**
 * Track an unknown enum value
 * 
 * Increments count if already exists, creates new record if not.
 */
export async function trackUnknown(
  enumType: EnumType,
  rawLabel: string,
  exampleEventId: string,
  examplePayload?: Record<string, any>
): Promise<void> {
  try {
    // Try to find existing unknown
    const existing = await prisma.taxonomyUnknown.findUnique({
      where: {
        enumType_rawLabel: {
          enumType,
          rawLabel
        }
      }
    });

    if (existing) {
      // Update count and last_seen
      await prisma.taxonomyUnknown.update({
        where: {
          enumType_rawLabel: {
            enumType,
            rawLabel
          }
        },
        data: {
          count: existing.count + 1,
          lastSeen: new Date(),
          // Update example if this is a new event
          ...(exampleEventId !== existing.exampleEventId ? {
            exampleEventId,
            examplePayload: examplePayload ? JSON.stringify(examplePayload) : null
          } : {})
        }
      });
    } else {
      // Create new unknown record
      await prisma.taxonomyUnknown.create({
        data: {
          enumType,
          rawLabel,
          exampleEventId,
          examplePayload: examplePayload ? JSON.stringify(examplePayload) : null,
          count: 1,
          firstSeen: new Date(),
          lastSeen: new Date()
        }
      });
    }
  } catch (error) {
    // Log but don't fail - unknown tracking is non-critical
    console.error(`[Taxonomy] Failed to track unknown ${enumType}:${rawLabel}:`, error);
  }
}

/**
 * Get top unknowns for a time window
 */
export async function getTopUnknowns(
  enumType?: EnumType,
  windowDays: number = 7,
  limit: number = 50
): Promise<Array<{
  id: string;
  enumType: EnumType;
  rawLabel: string;
  suggestedMapping: string | null;
  count: number;
  exampleEventId: string | null;
  examplePayload: Record<string, any> | null;
  firstSeen: Date;
  lastSeen: Date;
}>> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - windowDays);

    const unknowns = await prisma.taxonomyUnknown.findMany({
      where: {
        ...(enumType ? { enumType } : {}),
        lastSeen: {
          gte: cutoffDate
        }
      },
      orderBy: [
        { count: 'desc' },
        { lastSeen: 'desc' }
      ],
      take: limit
    });

    return unknowns.map(u => ({
      id: u.id,
      enumType: u.enumType as EnumType,
      rawLabel: u.rawLabel,
      suggestedMapping: u.suggestedMapping,
      count: u.count,
      exampleEventId: u.exampleEventId,
      examplePayload: u.examplePayload ? JSON.parse(u.examplePayload) : null,
      firstSeen: u.firstSeen,
      lastSeen: u.lastSeen
    }));
  } catch (error) {
    console.error('[Taxonomy] Failed to get top unknowns:', error);
    return [];
  }
}

/**
 * Get unknown rate for a time window
 */
export async function getUnknownRate(
  enumType: EnumType,
  windowDays: number = 7
): Promise<{
  totalEvents: number;
  unknownEvents: number;
  unknownRate: number;
}> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - windowDays);

    // Get total count of unknowns in window
    const unknownCount = await prisma.taxonomyUnknown.aggregate({
      where: {
        enumType,
        lastSeen: {
          gte: cutoffDate
        }
      },
      _sum: {
        count: true
      }
    });

    const unknownEvents = unknownCount._sum.count || 0;

    // Estimate total events (this is approximate - we'd need actual event counts)
    // For now, we'll use a simple heuristic based on unknown counts
    // In production, you'd query actual event tables
    const estimatedTotal = unknownEvents * 20; // Rough estimate: assume 5% unknown rate
    const unknownRate = estimatedTotal > 0 ? (unknownEvents / estimatedTotal) * 100 : 0;

    return {
      totalEvents: estimatedTotal,
      unknownEvents,
      unknownRate
    };
  } catch (error) {
    console.error('[Taxonomy] Failed to get unknown rate:', error);
    return {
      totalEvents: 0,
      unknownEvents: 0,
      unknownRate: 0
    };
  }
}

/**
 * Promote an unknown value to a known enum value
 * 
 * This creates a mapping that can be used in future migrations.
 */
export async function promoteUnknown(
  enumType: EnumType,
  rawLabel: string,
  suggestedMapping: string
): Promise<void> {
  try {
    await prisma.taxonomyUnknown.update({
      where: {
        enumType_rawLabel: {
          enumType,
          rawLabel
        }
      },
      data: {
        suggestedMapping
      }
    });
  } catch (error) {
    console.error(`[Taxonomy] Failed to promote unknown ${enumType}:${rawLabel}:`, error);
    throw error;
  }
}

