import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/lounges/[loungeId]/layout
 * Returns zones, seats, and stations for the lounge
 * 
 * Response:
 * {
 *   zones: Zone[],
 *   seats: Seat[],
 *   stations: Station[],
 *   layout: { zones, seats, stations }
 * }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { loungeId: string } }
) {
  try {
    const { loungeId } = params;
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Get zones
    const zones = await prisma.zone.findMany({
      where: {
        loungeId
      },
      orderBy: { displayOrder: 'asc' }
    });

    // Get seats
    const seats = await prisma.seat.findMany({
      where: {
        loungeId,
        ...(includeInactive ? {} : { status: 'ACTIVE' })
      },
      include: {
        zone: {
          select: {
            id: true,
            name: true,
            zoneType: true
          }
        }
      },
      orderBy: { tableId: 'asc' }
    });

    // Get stations
    const stations = await prisma.station.findMany({
      where: {
        loungeId,
        ...(includeInactive ? {} : { isActive: true })
      },
      orderBy: { name: 'asc' }
    });

    // Parse metadata JSON fields
    const zonesWithMetadata = zones.map(zone => ({
      id: zone.id,
      name: zone.name,
      zoneType: zone.zoneType,
      displayOrder: zone.displayOrder,
      metadata: zone.metadata ? JSON.parse(zone.metadata) : null,
      createdAt: zone.createdAt.toISOString(),
      updatedAt: zone.updatedAt.toISOString()
    }));

    const seatsWithMetadata = seats.map(seat => {
      // Parse coordinates which may contain seatingType metadata
      const coords = seat.coordinates ? JSON.parse(seat.coordinates) : null;
      // Extract seatingType from coordinates metadata, or derive from zoneType
      let seatingType = coords?.seatingType;
      if (!seatingType) {
        // Derive from zoneType as fallback
        const zoneType = seat.zone?.zoneType;
        if (zoneType === 'VIP') seatingType = 'VIP';
        else if (zoneType === 'OUTDOOR') seatingType = 'Outdoor';
        else if (zoneType === 'PRIVATE') seatingType = 'Private Room';
        else seatingType = 'Booth'; // Default
      }
      
      return {
        id: seat.tableId, // Use tableId as the primary identifier, not the UUID
        tableId: seat.tableId, // Also include tableId explicitly
        name: seat.name,
        capacity: seat.capacity,
        coordinates: coords ? { x: coords.x || 0, y: coords.y || 0 } : null,
        seatingType: seatingType,
        qrEnabled: seat.qrEnabled,
        status: seat.status,
        priceMultiplier: seat.priceMultiplier,
        zone: {
          id: seat.zone.id,
          name: seat.zone.name,
          zoneType: seat.zone.zoneType
        },
        createdAt: seat.createdAt.toISOString(),
        updatedAt: seat.updatedAt.toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      layout: {
        zones: zonesWithMetadata,
        seats: seatsWithMetadata,
        stations: stations.map(station => ({
          id: station.id,
          name: station.name,
          stationType: station.stationType,
          zoneId: station.zoneId,
          isActive: station.isActive,
          createdAt: station.createdAt.toISOString()
        })),
        summary: {
          totalZones: zones.length,
          totalSeats: seats.length,
          totalStations: stations.length,
          activeSeats: seats.filter(s => s.status === 'ACTIVE').length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching lounge layout:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch lounge layout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lounges/[loungeId]/layout
 * Create or update zones, seats, or stations
 * 
 * Body:
 * {
 *   zones?: Zone[],
 *   seats?: Seat[],
 *   stations?: Station[]
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { loungeId: string } }
) {
  try {
    const { loungeId } = params;
    const body = await req.json();
    const { zones, seats, stations } = body;

    const results: any = {};

    // Upsert zones
    if (zones && Array.isArray(zones)) {
      const zoneResults = await Promise.all(
        zones.map(async (zone: any) => {
          return prisma.zone.upsert({
            where: { id: zone.id || 'new' },
            update: {
              name: zone.name,
              zoneType: zone.zoneType,
              displayOrder: zone.displayOrder || 0,
              metadata: zone.metadata ? JSON.stringify(zone.metadata) : null
            },
            create: {
              id: zone.id,
              loungeId,
              name: zone.name,
              zoneType: zone.zoneType,
              displayOrder: zone.displayOrder || 0,
              metadata: zone.metadata ? JSON.stringify(zone.metadata) : null
            }
          });
        })
      );
      results.zones = zoneResults.length;
    }

    // Upsert seats
    if (seats && Array.isArray(seats)) {
      const seatResults = await Promise.all(
        seats.map(async (seat: any) => {
          if (!seat.zoneId) {
            throw new Error(`Seat ${seat.tableId} requires zoneId`);
          }
          // Preserve seatingType in coordinates metadata
          let coordinatesData = seat.coordinates || { x: 0, y: 0 };
          if (seat.seatingType) {
            coordinatesData = {
              ...coordinatesData,
              seatingType: seat.seatingType
            };
          }
          
          return prisma.seat.upsert({
            where: { tableId: seat.tableId },
            update: {
              name: seat.name,
              capacity: seat.capacity,
              coordinates: JSON.stringify(coordinatesData),
              qrEnabled: seat.qrEnabled !== undefined ? seat.qrEnabled : true,
              status: seat.status || 'ACTIVE',
              priceMultiplier: seat.priceMultiplier || 1.0,
              zoneId: seat.zoneId
            },
            create: {
              loungeId,
              zoneId: seat.zoneId,
              tableId: seat.tableId,
              name: seat.name,
              capacity: seat.capacity,
              coordinates: JSON.stringify(coordinatesData),
              qrEnabled: seat.qrEnabled !== undefined ? seat.qrEnabled : true,
              status: seat.status || 'ACTIVE',
              priceMultiplier: seat.priceMultiplier || 1.0
            }
          });
        })
      );
      results.seats = seatResults.length;
    }

    // Upsert stations
    if (stations && Array.isArray(stations)) {
      const stationResults = await Promise.all(
        stations.map(async (station: any) => {
          return prisma.station.upsert({
            where: { id: station.id || 'new' },
            update: {
              name: station.name,
              stationType: station.stationType,
              zoneId: station.zoneId,
              isActive: station.isActive !== undefined ? station.isActive : true
            },
            create: {
              id: station.id,
              loungeId,
              name: station.name,
              stationType: station.stationType,
              zoneId: station.zoneId,
              isActive: station.isActive !== undefined ? station.isActive : true
            }
          });
        })
      );
      results.stations = stationResults.length;
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        loungeId,
        action: 'LAYOUT_UPDATED',
        entityType: 'Layout',
        changes: JSON.stringify(results)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Layout updated successfully',
      results
    });

  } catch (error) {
    console.error('Error updating lounge layout:', error);
    return NextResponse.json(
      {
        error: 'Failed to update lounge layout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

