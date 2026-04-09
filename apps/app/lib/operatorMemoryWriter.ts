import { prisma } from './db';

function parseFlavorMix(row: unknown): string[] {
  if (Array.isArray(row)) return row.map((x) => String(x));
  if (typeof row === 'string') return row.split(/\s*\+\s*|,/).map((s) => s.trim()).filter(Boolean);
  return [];
}

/**
 * Upsert CLARK-style preference rollup after a session ends (staff-side memory).
 */
export async function writeCustomerMemoryFromSession(
  sessionId: string,
  loungeId?: string
): Promise<{ updated: boolean } | null> {
  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      ...(loungeId ? { loungeId } : {}),
    },
  });

  if (!session?.customerRef || !session.loungeId) {
    return null;
  }

  const flavors = parseFlavorMix(session.flavorMix).slice(0, 8);
  const table = session.tableId ?? undefined;
  const noteParts: string[] = [];
  if (flavors.length) noteParts.push(`Recent flavors: ${flavors.join(', ')}`);
  if (table) noteParts.push(`Last table: ${table}`);
  const note = noteParts.join(' | ') || null;

  await prisma.customerMemory.upsert({
    where: {
      loungeId_customerRef: {
        loungeId: session.loungeId,
        customerRef: session.customerRef,
      },
    },
    update: {
      customerName: session.customerRef,
      lastSeenAt: new Date(),
      lastSessionId: session.id,
      recentFlavors: flavors,
      note,
      sessionCount: { increment: 1 },
      ...(table ? { preferredTable: table } : {}),
    },
    create: {
      loungeId: session.loungeId,
      customerRef: session.customerRef,
      customerName: session.customerRef,
      lastSeenAt: new Date(),
      lastSessionId: session.id,
      recentFlavors: flavors,
      note,
      sessionCount: 1,
      ...(table ? { preferredTable: table } : {}),
    },
  });

  return { updated: true };
}
