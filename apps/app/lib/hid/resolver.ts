import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { getHIDSalt } from '../env';

// Salt for hashing (store in env in production)
const DEFAULT_HID_SALT = 'hookahplus-network-salt-2025';
const HID_SALT = getHIDSalt();
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && HID_SALT === DEFAULT_HID_SALT && process.env.ALLOW_INSECURE_HID_SALT !== 'true') {
  // Do not throw (to avoid hard outages), but make the risk visible in logs/telemetry.
  // Identity will fragment across environments if this is not set properly.
  // Intentionally does NOT log any PII.
  // eslint-disable-next-line no-console
  console.warn(
    '[HID Resolver] HID_SALT is using the default fallback. Set HID_SALT in production to avoid identity fragmentation.'
  );
}

export interface HIDResolveInput {
  phone?: string;
  email?: string;
  qrToken?: string;
  deviceId?: string;
}

export interface HIDResolveResult {
  hid: string;
  status: 'new' | 'existing' | 'merged';
  profile?: NetworkProfile;
  mergeCandidates?: Array<{ hid: string; reason: string }>;
}

export interface NetworkProfile {
  hid: string;
  consentLevel: string;
  tier?: string;
  badges: Array<{ badgeCode: string; awardedAt: Date }>;
  preferences?: {
    topFlavors?: string[];
    devicePrefs?: Record<string, any>;
  };
}

/**
 * Hash PII for storage (SHA256 + salt)
 */
function hashPII(value: string): string {
  return createHash('sha256')
    .update(value + HID_SALT)
    .digest('hex');
}

function normalizePhone(phone: string): string {
  // Keep it simple: strip whitespace and common separators; preserve leading +
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/[^\d]/g, '');
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Generate a random HID (network root).
 *
 * IMPORTANT:
 * - HID is the identity anchor, not an authentication method.
 * - Resolution happens via hashed links (phone/email/qr/device), not by encoding PII into the HID.
 */
function generateRandomHID(): string {
  // Prefer UUID for readability, but keep the legacy "HID-" prefix.
  // Strip hyphens to keep a compact token.
  const uuid = (typeof randomUUID === 'function' ? randomUUID() : randomBytes(16).toString('hex')).replace(/-/g, '');
  return `HID-${uuid.toUpperCase()}`;
}

/**
 * Resolve or create HID from identifiers
 */
export async function resolveHID(input: HIDResolveInput): Promise<HIDResolveResult> {
  const { phone, email, qrToken, deviceId } = input;
  const normalizedPhone = phone ? normalizePhone(phone) : undefined;
  const normalizedEmail = email ? normalizeEmail(email) : undefined;

  // Step 1: Try to find existing profile by phone/email hash
  let existingProfile = null;
  let hid: string | null = null;

  if (normalizedPhone) {
    const phoneHash = hashPII(normalizedPhone);
    const piiLink = await prisma.networkPIILink.findUnique({
      where: {
        piiType_piiHash: {
          piiType: 'phone',
          piiHash: phoneHash,
        },
      },
      include: {
        profile: {
          include: {
            preferences: true,
            badges: true,
          },
        },
      },
    });

    if (piiLink) {
      existingProfile = piiLink.profile;
      hid = piiLink.profile.hid;
    }
  }

  if (!hid && normalizedEmail) {
    const emailHash = hashPII(normalizedEmail);
    const piiLink = await prisma.networkPIILink.findUnique({
      where: {
        piiType_piiHash: {
          piiType: 'email',
          piiHash: emailHash,
        },
      },
      include: {
        profile: {
          include: {
            preferences: true,
            badges: true,
          },
        },
      },
    });

    if (piiLink) {
      existingProfile = piiLink.profile;
      hid = piiLink.profile.hid;
    }
  }

  if (!hid && qrToken) {
    const qrHash = hashPII(String(qrToken).trim());
    const piiLink = await prisma.networkPIILink.findUnique({
      where: {
        piiType_piiHash: {
          piiType: 'qr_token',
          piiHash: qrHash,
        },
      },
      include: {
        profile: {
          include: {
            preferences: true,
            badges: true,
          },
        },
      },
    });

    if (piiLink) {
      existingProfile = piiLink.profile;
      hid = piiLink.profile.hid;
    }
  }

  if (!hid && deviceId) {
    const deviceHash = hashPII(String(deviceId).trim());
    const piiLink = await prisma.networkPIILink.findUnique({
      where: {
        piiType_piiHash: {
          piiType: 'device_id',
          piiHash: deviceHash,
        },
      },
      include: {
        profile: {
          include: {
            preferences: true,
            badges: true,
          },
        },
      },
    });

    if (piiLink) {
      existingProfile = piiLink.profile;
      hid = piiLink.profile.hid;
    }
  }

  // Step 2: If found, return existing
  if (existingProfile && hid) {
    return {
      hid,
      status: 'existing',
      profile: mapToNetworkProfile(existingProfile),
    };
  }

  // Step 3: Check for merge candidates (fuzzy matching)
  const mergeCandidates = await findMergeCandidates(phone, email, deviceId);

  // Step 4: Create new profile
  hid = generateRandomHID();
  // Extremely defensive: in the unlikely event of a collision, retry a few times.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const existing = await prisma.networkProfile.findUnique({ where: { hid } });
    if (!existing) break;
    hid = generateRandomHID();
  }

  let newProfile: any;
  try {
    // Create profile + hashed resolution links atomically so a new HID is always resolvable.
    await prisma.$transaction(async (tx) => {
      newProfile = await tx.networkProfile.create({
        data: {
          hid,
          phoneHash: normalizedPhone ? hashPII(normalizedPhone) : null,
          emailHash: normalizedEmail ? hashPII(normalizedEmail) : null,
          consentLevel: 'shadow', // Default: unclaimed
        },
        include: {
          preferences: true,
          badges: true,
        },
      });

      const linksToCreate: Array<{ piiType: string; piiHash: string }> = [];
      if (normalizedPhone) linksToCreate.push({ piiType: 'phone', piiHash: hashPII(normalizedPhone) });
      if (normalizedEmail) linksToCreate.push({ piiType: 'email', piiHash: hashPII(normalizedEmail) });
      if (qrToken) linksToCreate.push({ piiType: 'qr_token', piiHash: hashPII(String(qrToken).trim()) });
      if (deviceId) linksToCreate.push({ piiType: 'device_id', piiHash: hashPII(String(deviceId).trim()) });

      for (const link of linksToCreate) {
        await tx.networkPIILink.create({
          data: {
            hid,
            piiType: link.piiType,
            piiHash: link.piiHash,
            verified: false,
          },
        });
      }
    });
  } catch (error: any) {
    // Likely a concurrency race on (piiType, piiHash). Re-read and return the winning profile.
    const isUniqueViolation =
      error?.code === 'P2002' ||
      (typeof error?.message === 'string' && error.message.toLowerCase().includes('unique'));

    if (isUniqueViolation) {
      // Use ternaries (not `&&`) so we don't accidentally union in `string` (e.g. "").
      const winningLink =
        (normalizedPhone
          ? await prisma.networkPIILink.findUnique({
              where: { piiType_piiHash: { piiType: 'phone', piiHash: hashPII(normalizedPhone) } },
              include: { profile: { include: { preferences: true, badges: true } } },
            })
          : null) ??
        (normalizedEmail
          ? await prisma.networkPIILink.findUnique({
              where: { piiType_piiHash: { piiType: 'email', piiHash: hashPII(normalizedEmail) } },
              include: { profile: { include: { preferences: true, badges: true } } },
            })
          : null) ??
        (qrToken
          ? await prisma.networkPIILink.findUnique({
              where: {
                piiType_piiHash: { piiType: 'qr_token', piiHash: hashPII(String(qrToken).trim()) },
              },
              include: { profile: { include: { preferences: true, badges: true } } },
            })
          : null) ??
        (deviceId
          ? await prisma.networkPIILink.findUnique({
              where: {
                piiType_piiHash: { piiType: 'device_id', piiHash: hashPII(String(deviceId).trim()) },
              },
              include: { profile: { include: { preferences: true, badges: true } } },
            })
          : null);

      if (winningLink?.profile?.hid) {
        // Cleanup the orphaned profile we attempted to create.
        try {
          await prisma.networkProfile.delete({ where: { hid } });
        } catch {
          // Non-fatal
        }

        return {
          hid: winningLink.profile.hid,
          status: 'existing',
          profile: mapToNetworkProfile(winningLink.profile),
        };
      }
    }

    throw error;
  }

  return {
    hid,
    status: 'new',
    profile: mapToNetworkProfile(newProfile),
    mergeCandidates: mergeCandidates.length > 0 ? mergeCandidates : undefined,
  };
}

/**
 * Find potential merge candidates (fuzzy matching)
 */
async function findMergeCandidates(
  phone?: string,
  email?: string,
  deviceId?: string
): Promise<Array<{ hid: string; reason: string }>> {
  const candidates: Array<{ hid: string; reason: string }> = [];

  // TODO: Implement fuzzy matching logic
  // - Last 4 digits of phone
  // - Device fingerprint
  // - Similar email domains

  return candidates;
}

/**
 * Map database profile to API format
 */
function mapToNetworkProfile(profile: any): NetworkProfile {
  return {
    hid: profile.hid,
    consentLevel: profile.consentLevel,
    tier: profile.tier || undefined,
    badges: profile.badges.map((b: any) => ({
      badgeCode: b.badgeCode,
      awardedAt: b.awardedAt,
    })),
    preferences: profile.preferences
      ? {
          topFlavors: (profile.preferences.topFlavors as any) || undefined,
          devicePrefs: (profile.preferences.devicePrefs as any) || undefined,
        }
      : undefined,
  };
}

/**
 * Merge two HID profiles
 */
export async function mergeProfiles(
  primaryHID: string,
  secondaryHID: string,
  verified: boolean = false
): Promise<{ hid: string; merged: boolean }> {
  // Verify both profiles exist
  const primary = await prisma.networkProfile.findUnique({
    where: { hid: primaryHID },
  });
  const secondary = await prisma.networkProfile.findUnique({
    where: { hid: secondaryHID },
  });

  if (!primary || !secondary) {
    throw new Error('One or both profiles not found');
  }

  // Merge strategy:
  // 1. Keep primary HID
  // 2. Move all secondary data to primary
  // 3. Update all references
  // 4. Delete secondary profile

  await prisma.$transaction(async (tx) => {
    // Update all network sessions
    await tx.networkSession.updateMany({
      where: { hid: secondaryHID },
      data: { hid: primaryHID },
    });

    // Update all network notes
    await tx.networkSessionNote.updateMany({
      where: { hid: secondaryHID },
      data: { hid: primaryHID },
    });

    // Update all badges (avoid duplicates)
    const primaryBadges = await tx.networkBadge.findMany({
      where: { hid: primaryHID },
      select: { badgeCode: true },
    });
    const primaryBadgeCodes = new Set(primaryBadges.map((b) => b.badgeCode));

    const secondaryBadges = await tx.networkBadge.findMany({
      where: { hid: secondaryHID },
    });

    for (const badge of secondaryBadges) {
      if (!primaryBadgeCodes.has(badge.badgeCode)) {
        await tx.networkBadge.create({
          data: {
            hid: primaryHID,
            badgeCode: badge.badgeCode,
            awardedAt: badge.awardedAt,
            meta: badge.meta === null ? Prisma.JsonNull : badge.meta,
          },
        });
      }
    }

    // Merge preferences (keep most recent)
    const secondaryPrefs = await tx.networkPreference.findUnique({
      where: { hid: secondaryHID },
    });

    if (secondaryPrefs) {
      await tx.networkPreference.upsert({
        where: { hid: primaryHID },
        create: {
          hid: primaryHID,
          topFlavors: secondaryPrefs.topFlavors === null ? Prisma.JsonNull : secondaryPrefs.topFlavors,
          flavorVector: secondaryPrefs.flavorVector, // String field, can be null
          devicePrefs: secondaryPrefs.devicePrefs === null ? Prisma.JsonNull : secondaryPrefs.devicePrefs,
        },
        update: {
          topFlavors: secondaryPrefs.topFlavors === null ? Prisma.JsonNull : secondaryPrefs.topFlavors,
          flavorVector: secondaryPrefs.flavorVector, // String field, can be null
          devicePrefs: secondaryPrefs.devicePrefs === null ? Prisma.JsonNull : secondaryPrefs.devicePrefs,
        },
      });
    }

    // Move PII links
    await tx.networkPIILink.updateMany({
      where: { hid: secondaryHID },
      data: { hid: primaryHID, verified },
    });

    // Delete secondary profile (cascade will clean up)
    await tx.networkProfile.delete({
      where: { hid: secondaryHID },
    });
  });

  return { hid: primaryHID, merged: true };
}

/**
 * Get profile by HID
 */
export async function getProfileByHID(
  hid: string,
  scope: 'lounge' | 'network' = 'network'
): Promise<NetworkProfile | null> {
  const profile = await prisma.networkProfile.findUnique({
    where: { hid },
    include: {
      preferences: true,
      badges: {
        orderBy: { awardedAt: 'desc' },
      },
    },
  });

  if (!profile) return null;

  return mapToNetworkProfile(profile);
}

