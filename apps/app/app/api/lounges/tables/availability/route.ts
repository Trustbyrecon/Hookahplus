import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { TableAvailabilityService } from '../../../../../lib/services/TableAvailabilityService';

const prisma = new PrismaClient();

/**
 * GET /api/lounges/tables/availability
 * Get available tables for a party size
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const partySize = parseInt(searchParams.get('partySize') || '1');
    const tableId = searchParams.get('tableId');
    const requestedTime = searchParams.get('requestedTime');

    // Get active sessions
    const activeSessions = await prisma.session.findMany({
      where: {
        state: { notIn: ['CLOSED', 'CANCELED'] as any }
      },
      select: {
        id: true,
        tableId: true,
        state: true
      }
    });

    // If specific table requested, check that table
    if (tableId) {
      const check = await TableAvailabilityService.checkTableAvailability(
        {
          tableId,
          partySize,
          requestedTime: requestedTime ? new Date(requestedTime) : undefined
        },
        activeSessions.map(s => ({
          tableId: s.tableId || '',
          status: s.state,
          id: s.id
        }))
      );

      return NextResponse.json({
        success: true,
        ...check
      });
    }

    // Get all available tables
    const availableTables = await TableAvailabilityService.getAvailableTables(
      partySize,
      activeSessions.map(s => ({
        tableId: s.tableId || '',
        status: s.state,
        id: s.id
      })),
      requestedTime ? new Date(requestedTime) : undefined
    );

    // Find table combinations for large parties
    let combinations: any[] = [];
    if (partySize > 8) {
      combinations = await TableAvailabilityService.findTableCombinations(
        partySize,
        activeSessions.map(s => ({
          tableId: s.tableId || '',
          status: s.state,
          id: s.id
        }))
      );
    }

    return NextResponse.json({
      success: true,
      partySize,
      availableTables: availableTables.filter(t => t.canAccommodate),
      occupiedTables: availableTables.filter(t => t.status === 'occupied'),
      reservedTables: availableTables.filter(t => t.status === 'reserved'),
      combinations
    });

  } catch (error) {
    console.error('[Table Availability API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check availability',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lounges/tables/availability
 * Reserve a table temporarily
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, reservedFrom, reservedUntil, partySize, customerName, customerPhone } = body;

    if (!tableId || !reservedFrom || !reservedUntil || !partySize) {
      return NextResponse.json(
        { error: 'Missing required fields: tableId, reservedFrom, reservedUntil, partySize' },
        { status: 400 }
      );
    }

    const result = await TableAvailabilityService.createReservation(
      tableId,
      new Date(reservedFrom),
      new Date(reservedUntil),
      partySize,
      customerName,
      customerPhone
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      reservationId: result.reservationId
    });

  } catch (error) {
    console.error('[Table Reservation API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create reservation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

