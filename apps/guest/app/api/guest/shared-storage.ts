/**
 * Shared Storage for Guest API Routes
 * 
 * In production, this would be replaced with a database (e.g., Supabase, PostgreSQL)
 * For now, using in-memory Maps that are shared across API routes
 */

import { GuestProfile } from '@guest-types';

// Shared in-memory storage (in production, use database)
export const sharedGuestProfiles = new Map<string, GuestProfile>();
export const sharedSessions = new Map<string, any>();
export const sharedLoyaltyEvents = new Map<string, any>();
export const sharedReceipts = new Map<string, any>();

/**
 * Get guest profile from shared storage
 */
export function getGuestProfile(guestId: string): GuestProfile | undefined {
  return sharedGuestProfiles.get(guestId);
}

/**
 * Set guest profile in shared storage
 */
export function setGuestProfile(guestId: string, profile: GuestProfile): void {
  sharedGuestProfiles.set(guestId, profile);
}

/**
 * Check if guest exists in shared storage
 */
export function guestExists(guestId: string): boolean {
  return sharedGuestProfiles.has(guestId);
}

