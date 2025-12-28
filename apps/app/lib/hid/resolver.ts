import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

// Salt for hashing (store in env in production)
const HID_SALT = process.env.HID_SALT || 'hookahplus-network-salt-2025';

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

/**
 * Generate deterministic HID from phone/email
 */
function generateHID(phone?: string, email?: string): string {
  if (phone) {
    return `HID-${hashPII(phone).substring(0, 16).toUpperCase()}`;
  }
  if (email) {
    return `HID-${hashPII(email.toLowerCase()).substring(0, 16).toUpperCase()}`;
  }
  // Guest/anonymous: use random bytes
  return `HID-GUEST-${randomBytes(8).toString('hex').toUpperCase()}`;
}

/**
 * Resolve or create HID from identifiers
 */
export async function resolveHID(input: HIDResolveInput): Promise<HIDResolveResult> {
  const { phone, email, qrToken, deviceId } = input;

  // Step 1: Try to find existing profile by phone/email hash
  let existingProfile = null;
  let hid: string | null = null;

  if (phone) {
    const phoneHash = hashPII(phone);
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

  if (!hid && email) {
    const emailHash = hashPII(email.toLowerCase());
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
  hid = generateHID(phone, email);

  // Check if HID already exists (collision handling)
  const existingHID = await prisma.networkProfile.findUnique({
    where: { hid },
  });

  if (existingHID) {
    // Collision: append random suffix
    hid = `${hid}-${randomBytes(4).toString('hex').toUpperCase()}`;
  }

  const newProfile = await prisma.networkProfile.create({
    data: {
      hid,
      phoneHash: phone ? hashPII(phone) : null,
      emailHash: email ? hashPII(email.toLowerCase()) : null,
      consentLevel: 'shadow', // Default: unclaimed
    },
    include: {
      preferences: true,
      badges: true,
    },
  });

  // Create PII links
  if (phone) {
    await prisma.networkPIILink.create({
      data: {
        hid,
        piiType: 'phone',
        piiHash: hashPII(phone),
        verified: false,
      },
    });
  }

  if (email) {
    await prisma.networkPIILink.create({
      data: {
        hid,
        piiType: 'email',
        piiHash: hashPII(email.toLowerCase()),
        verified: false,
      },
    });
  }

  if (qrToken) {
    await prisma.networkPIILink.create({
      data: {
        hid,
        piiType: 'qr_token',
        piiHash: hashPII(qrToken),
        verified: false,
      },
    });
  }

  return {
    hid,
    status: mergeCandidates.length > 0 ? 'merged' : 'new',
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

