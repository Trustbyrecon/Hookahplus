import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { TableAvailabilityService } from '../../../../../../lib/services/TableAvailabilityService';

const prisma = new PrismaClient();

/**
 * DELETE /api/lounges/tables/reservations/[id]
 * Cancel a reservation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await TableAvailabilityService.cancelReservationWithPrisma(prisma, id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Reservation cancelled'
    });

  } catch (error) {
    console.error('[Reservation Cancellation API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to cancel reservation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/lounges/tables/reservations/[id]
 * Get reservation details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reservation = await prisma.reservations.findUnique({
      where: { id }
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // Calculate reservedUntil from created_at + window_minutes
    const reservedFrom = reservation.created_at ? new Date(reservation.created_at) : new Date();
    const windowMinutes = reservation.window_minutes || 15;
    const reservedUntil = new Date(reservedFrom.getTime() + windowMinutes * 60 * 1000);

    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation.id,
        tableId: reservation.table_id,
        reservedFrom: reservedFrom.toISOString(),
        reservedUntil: reservedUntil.toISOString(),
        status: reservation.status,
        windowMinutes: reservation.window_minutes
      }
    });

  } catch (error) {
    console.error('[Reservation GET API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch reservation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

