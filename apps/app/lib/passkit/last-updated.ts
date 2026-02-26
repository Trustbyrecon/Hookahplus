import { prisma } from '../db';

export async function getCodigoPassLastUpdatedAt(hid: string): Promise<Date> {
  const [profile, prefs, session] = await Promise.all([
    prisma.networkProfile.findUnique({ where: { hid }, select: { updatedAt: true } }),
    prisma.networkPreference.findUnique({ where: { hid }, select: { updatedAt: true } }),
    prisma.session.findFirst({
      where: { hid },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    }),
  ]);

  const candidates = [profile?.updatedAt, prefs?.updatedAt, session?.updatedAt].filter(Boolean) as Date[];
  if (candidates.length === 0) return new Date(0);
  return new Date(Math.max(...candidates.map((d) => d.getTime())));
}

