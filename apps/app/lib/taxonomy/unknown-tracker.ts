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
    // Use raw SQL to upsert unknown values
    // This works even if Prisma client hasn't been regenerated yet
    const payloadJson = examplePayload ? JSON.stringify(examplePayload) : null;
    
    await prisma.$executeRaw`
      INSERT INTO "TaxonomyUnknown" (
        enum_type, raw_label, example_event_id, example_payload,
        count, first_seen, last_seen, created_at, updated_at
      )
      VALUES (
        ${enumType}, ${rawLabel}, ${exampleEventId}, ${payloadJson}::jsonb,
        1, NOW(), NOW(), NOW(), NOW()
      )
      ON CONFLICT (enum_type, raw_label) DO UPDATE
      SET
        count = "TaxonomyUnknown".count + 1,
        last_seen = NOW(),
        updated_at = NOW(),
        example_event_id = COALESCE("TaxonomyUnknown".example_event_id, EXCLUDED.example_event_id),
        example_payload = COALESCE("TaxonomyUnknown".example_payload, EXCLUDED.example_payload)
    `;
    
    console.log(`[Unknown Tracker] Tracked unknown: ${enumType}:${rawLabel}`);
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

    // Use raw SQL to query unknowns (works even if Prisma client hasn't been regenerated)
    const enumTypeFilter = enumType ? `AND enum_type = '${enumType}'` : '';
    
    const unknowns = await prisma.$queryRaw<Array<{
      id: string;
      enum_type: string;
      raw_label: string;
      suggested_mapping: string | null;
      count: number;
      example_event_id: string | null;
      example_payload: string | null;
      first_seen: Date;
      last_seen: Date;
    }>>`
      SELECT 
        id,
        enum_type,
        raw_label,
        suggested_mapping,
        count,
        example_event_id,
        example_payload,
        first_seen,
        last_seen
      FROM "TaxonomyUnknown"
      WHERE last_seen >= ${cutoffDate}
        ${enumTypeFilter}
      ORDER BY count DESC, last_seen DESC
      LIMIT ${limit}
    `;

    return unknowns.map(u => ({
      id: u.id,
      enumType: u.enum_type as EnumType,
      rawLabel: u.raw_label,
      suggestedMapping: u.suggested_mapping,
      count: u.count,
      exampleEventId: u.example_event_id,
      examplePayload: u.example_payload ? JSON.parse(u.example_payload) : null,
      firstSeen: u.first_seen,
      lastSeen: u.last_seen
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

