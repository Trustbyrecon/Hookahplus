import { prisma } from "./db";
import type { Award, EventType } from "./badgeTypes";

export type EventRecord = {
  id: string;
  ts: number;
  type: EventType;
  profileId: string;
  venueId?: string | null;
  comboHash?: string | null;
  staffId?: string | null;
};

export async function addEvent(e: EventRecord) {
  await prisma.event.create({
    data: {
      id: e.id,
      ts: new Date(e.ts),
      type: e.type,
      profileId: e.profileId,
      venueId: e.venueId ?? null,
      comboHash: e.comboHash ?? null,
      staffId: e.staffId ?? null,
    },
  });
}

export async function listEvents(profileId: string) {
  const rows = await prisma.event.findMany({
    where: { profileId },
    orderBy: { ts: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    ts: r.ts.getTime(),
    type: r.type as EventType,
    profileId: r.profileId,
    venueId: r.venueId,
    comboHash: r.comboHash,
    staffId: r.staffId,
  }));
}

export async function listEventsAtVenue(profileId: string, venueId?: string | null) {
  const rows = await prisma.event.findMany({
    where: { profileId, venueId: venueId ?? null },
    orderBy: { ts: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    ts: r.ts.getTime(),
    type: r.type as EventType,
    profileId: r.profileId,
    venueId: r.venueId,
    comboHash: r.comboHash,
    staffId: r.staffId,
  }));
}

export async function listAwards(profileId: string) {
  const rows = await prisma.award.findMany({
    where: { profileId, revoked: false },
    orderBy: { awardedAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    profileId: r.profileId,
    badgeId: r.badgeId,
    venueId: r.venueId,
    progress: r.progress,
    awardedAt: r.awardedAt.getTime(),
    awardedBy: r.awardedBy ?? undefined,
    revoked: r.revoked,
  })) as Award[];
}

export async function alreadyAwarded(profileId: string, badgeId: string, venueId?: string | null) {
  const row = await prisma.award.findFirst({
    where: { profileId, badgeId, venueId: venueId ?? null, revoked: false },
    select: { id: true },
  });
  return Boolean(row);
}

export async function putAward(a: Award) {
  await prisma.award.create({
    data: {
      id: a.id,
      profileId: a.profileId,
      badgeId: a.badgeId,
      venueId: a.venueId ?? null,
      progress: a.progress,
      awardedAt: new Date(a.awardedAt),
      awardedBy: a.awardedBy,
      revoked: a.revoked ?? false,
    },
  });
}
