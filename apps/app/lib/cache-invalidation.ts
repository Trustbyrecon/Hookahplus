/**
 * Cache Invalidation Utilities
 * 
 * Provides helper functions to invalidate cache when data changes.
 * This ensures cache consistency across the application.
 */

import { cache } from './cache';

/**
 * Invalidate cache related to table availability
 * Call this when:
 * - Session is created/updated/deleted
 * - Reservation is created/cancelled
 * - Table layout changes
 */
export function invalidateTableAvailabilityCache(tableId?: string): void {
  // Invalidate all table availability cache entries
  const count = cache.invalidateByPrefix('table-availability');
  console.log(`[Cache] Invalidated ${count} table availability cache entries`);
  
  // Also invalidate active sessions cache
  cache.delete('active-sessions');
  
  // Invalidate reservations cache for all venues
  // Note: In production, you might want to be more specific
  const reservationCount = cache.invalidateByPrefix('reservations');
  console.log(`[Cache] Invalidated ${reservationCount} reservation cache entries`);
}

/**
 * Invalidate cache related to analytics
 * Call this when:
 * - Session is created/updated/deleted
 * - Significant data changes occur
 */
export function invalidateAnalyticsCache(): void {
  // Invalidate lounge analytics
  const loungeCount = cache.invalidateByPrefix('lounge-analytics');
  console.log(`[Cache] Invalidated ${loungeCount} lounge analytics cache entries`);
  
  // Invalidate unified analytics
  const unifiedCount = cache.invalidateByPrefix('unified-analytics');
  console.log(`[Cache] Invalidated ${unifiedCount} unified analytics cache entries`);
}

/**
 * Invalidate all caches related to sessions
 * Call this when:
 * - Session state changes significantly
 * - Multiple sessions are affected
 */
export function invalidateSessionCaches(): void {
  invalidateTableAvailabilityCache();
  invalidateAnalyticsCache();
  
  // Invalidate active sessions cache
  cache.delete('active-sessions');
  console.log(`[Cache] Invalidated all session-related caches`);
}

/**
 * Invalidate cache related to reservations
 * Call this when:
 * - Reservation is created/updated/cancelled
 */
export function invalidateReservationCache(venueId?: string): void {
  if (venueId) {
    // Invalidate specific venue's reservations
    cache.delete(`reservations:${venueId}`);
  } else {
    // Invalidate all reservations
    const count = cache.invalidateByPrefix('reservations');
    console.log(`[Cache] Invalidated ${count} reservation cache entries`);
  }
  
  // Also invalidate table availability since reservations affect it
  invalidateTableAvailabilityCache();
}

/**
 * Invalidate cache related to table layout
 * Call this when:
 * - Table layout is updated
 * - Tables are added/removed
 */
export function invalidateLayoutCache(): void {
  // Invalidate table availability (layout affects availability)
  invalidateTableAvailabilityCache();
  
  // Layout changes might affect analytics
  invalidateAnalyticsCache();
  
  console.log(`[Cache] Invalidated layout-related caches`);
}

