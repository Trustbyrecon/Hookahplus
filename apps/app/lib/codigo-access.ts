/**
 * CODIGO access control: time-boxed entitlement with 14-day auto-expiry.
 * Single source of truth for expiry duration and entitlement checks.
 */

import { prisma } from './db';

/** Expiry duration in days. Centralized for easy config. */
export const CODIGO_ACCESS_DURATION_DAYS = 14;

/**
 * Check if a user has valid CODIGO access (active and not expired).
 * Admin/owner roles bypass expiry for internal override.
 */
export async function hasCodigoAccess(
  userId: string | null,
  isAdminOrOwner: boolean = false
): Promise<boolean> {
  if (!userId) return false;
  if (isAdminOrOwner) return true; // Admin override

  const access = await prisma.codigoAccess.findUnique({
    where: { userId },
  });

  if (!access || access.status !== 'active') return false;
  return new Date() < access.expiresAt;
}

/**
 * Get CODIGO access record for a user (for display, renewal, etc.).
 */
export async function getCodigoAccess(userId: string) {
  return prisma.codigoAccess.findUnique({
    where: { userId },
  });
}

/**
 * Get days remaining until expiry. Returns 0 if expired or no access.
 */
export async function getCodigoAccessDaysRemaining(userId: string): Promise<number> {
  const access = await getCodigoAccess(userId);
  if (!access || access.status !== 'active') return 0;
  const now = new Date();
  if (now >= access.expiresAt) return 0;
  const ms = access.expiresAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

/**
 * Grant CODIGO access to a user. Sets grantedAt = now, expiresAt = now + 14 days.
 */
export async function grantCodigoAccess(
  userId: string,
  grantedBy?: string
): Promise<{ grantedAt: Date; expiresAt: Date }> {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + CODIGO_ACCESS_DURATION_DAYS);

  await prisma.codigoAccess.upsert({
    where: { userId },
    update: {
      grantedAt: now,
      expiresAt,
      status: 'active',
      grantedBy: grantedBy ?? null,
      updatedAt: now,
    },
    create: {
      userId,
      grantedAt: now,
      expiresAt,
      status: 'active',
      grantedBy: grantedBy ?? null,
    },
  });

  return { grantedAt: now, expiresAt };
}

/**
 * Extend CODIGO access by 14 days from current expiry (or from now if already expired).
 */
export async function extendCodigoAccess(
  userId: string,
  grantedBy?: string
): Promise<{ expiresAt: Date }> {
  const existing = await getCodigoAccess(userId);
  const now = new Date();
  const base = existing && existing.status === 'active' && existing.expiresAt > now
    ? existing.expiresAt
    : now;
  const expiresAt = new Date(base);
  expiresAt.setDate(expiresAt.getDate() + CODIGO_ACCESS_DURATION_DAYS);

  await prisma.codigoAccess.upsert({
    where: { userId },
    update: {
      expiresAt,
      status: 'active',
      grantedBy: grantedBy ?? undefined,
      updatedAt: now,
    },
    create: {
      userId,
      grantedAt: now,
      expiresAt,
      status: 'active',
      grantedBy: grantedBy ?? null,
    },
  });

  return { expiresAt };
}

/**
 * Revoke CODIGO access early.
 */
export async function revokeCodigoAccess(userId: string): Promise<void> {
  await prisma.codigoAccess.update({
    where: { userId },
    data: { status: 'revoked', updatedAt: new Date() },
  });
}

/**
 * End entitlement immediately (Option A): set `expiresAt` in the past.
 * Keeps `status` = `active`; `hasCodigoAccess` returns false because `now >= expiresAt`.
 */
export async function expireCodigoAccessNow(userId: string): Promise<{ expiresAt: Date }> {
  const past = new Date();
  past.setMinutes(past.getMinutes() - 1);
  const row = await prisma.codigoAccess.update({
    where: { userId },
    data: { expiresAt: past },
  });
  return { expiresAt: row.expiresAt };
}
