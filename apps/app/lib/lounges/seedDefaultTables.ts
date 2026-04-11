import { prisma } from '../db';

/**
 * Ensures a default zone and numbered seats exist for a new lounge (LaunchPad + H+ Lite).
 */
export async function seedDefaultTables(loungeId: string, tablesCount: number): Promise<void> {
  if (tablesCount <= 0) return;

  let defaultZone = await prisma.zone.findFirst({
    where: { loungeId, name: 'Main Floor' },
  });

  if (!defaultZone) {
    defaultZone = await prisma.zone.create({
      data: {
        loungeId,
        name: 'Main Floor',
        zoneType: 'MAIN',
        displayOrder: 0,
      },
    });
  }

  const existingSeats = await prisma.seat.findMany({ where: { loungeId } });
  if (existingSeats.length > 0) return;

  const seatsToCreate = [];
  for (let i = 1; i <= tablesCount; i++) {
    const tableNum = i.toString().padStart(3, '0');
    const coordinates = JSON.stringify({ x: 0, y: 0, seatingType: 'Booth' });
    seatsToCreate.push({
      loungeId,
      zoneId: defaultZone.id,
      tableId: `table-${tableNum}`,
      name: `T-${tableNum}`,
      capacity: 4,
      coordinates,
      qrEnabled: true,
      status: 'ACTIVE',
      priceMultiplier: 1.0,
    });
  }

  await prisma.seat.createMany({ data: seatsToCreate });
}
