import { prisma } from '../prisma';
import { resolveHID } from '../hid/resolver';

export interface NetworkProfileData {
  hid: string;
  preferences?: {
    topFlavors?: string[];
    devicePrefs?: Record<string, any>;
  };
  badges?: Array<{ badgeCode: string; meta?: any }>;
  notes?: Array<{
    noteId: string;
    loungeId: string;
    shareScope: 'lounge' | 'network';
    noteText?: string;
    staffId?: string | null;
    tags?: any;
    createdAt?: string;
  }>;
}

/**
 * Sync session to network profile
 */
export async function syncSessionToNetwork(
  sessionId: string,
  hid: string,
  loungeId: string,
  items?: any[],
  spendCents?: number,
  posRef?: string
): Promise<void> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  // Create or update network session
  await prisma.networkSession.upsert({
    where: {
      id: `NS-${sessionId}`, // Use session ID as unique key
    },
    create: {
      id: `NS-${sessionId}`,
      hid,
      sessionId,
      loungeId,
      startTs: session.startedAt,
      endTs: session.endedAt,
      items: items ? (items as any) : null,
      spendCents: spendCents || null,
      posRef: posRef || null,
    },
    update: {
      startTs: session.startedAt,
      endTs: session.endedAt,
      items: items ? (items as any) : null,
      spendCents: spendCents || null,
      posRef: posRef || null,
    },
  });

  // Update session with HID link
  await prisma.session.update({
    where: { id: sessionId },
    data: { hid },
  });
}

/**
 * Sync session note to network
 */
export async function syncNoteToNetwork(
  noteId: string,
  hid: string,
  loungeId: string,
  staffId: string,
  noteText: string,
  shareScope: 'lounge' | 'network'
): Promise<void> {
  // Only sync if shareScope is 'network'
  if (shareScope !== 'network') {
    return;
  }

  await prisma.networkSessionNote.upsert({
    where: { noteId },
    create: {
      id: `NSN-${noteId}`,
      hid,
      noteId,
      loungeId,
      staffId,
      noteText,
      shareScope,
    },
    update: {
      noteText,
      shareScope,
    },
  });
}

/**
 * Get network profile with all data
 */
export async function getNetworkProfile(
  hid: string,
  loungeId?: string
): Promise<NetworkProfileData | null> {
  const profile = await prisma.networkProfile.findUnique({
    where: { hid },
    include: {
      preferences: true,
      badges: {
        orderBy: { awardedAt: 'desc' },
      },
      notes: loungeId
        ? {
            where: {
              OR: [
                { shareScope: 'network' },
                { loungeId },
              ],
            },
          }
        : {
            where: { shareScope: 'network' },
          },
    },
  });

  if (!profile) return null;

  return {
    hid: profile.hid,
    preferences: profile.preferences
      ? {
          topFlavors: (profile.preferences.topFlavors as any) || undefined,
          devicePrefs: (profile.preferences.devicePrefs as any) || undefined,
        }
      : undefined,
    badges: profile.badges.map((b) => ({
      badgeCode: b.badgeCode,
      meta: (b.meta as any) || undefined,
    })),
    notes: profile.notes.map((n) => ({
      noteId: n.noteId,
      loungeId: n.loungeId,
      shareScope: n.shareScope as 'lounge' | 'network',
      noteText: n.noteText,
      staffId: n.staffId || null,
      tags: (n.tags as any) || undefined,
      createdAt: n.createdAt?.toISOString?.() || undefined,
    })),
  };
}

