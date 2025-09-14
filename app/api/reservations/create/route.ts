// app/api/reservations/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

interface Reservation {
  id: string;
  tableId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  partySize: number;
  reservationTime: string;
  holdAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'no_show' | 'completed';
  stripePaymentIntentId?: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory reservations (in production, use database)
const reservations: Reservation[] = [];

export async function POST(request: NextRequest) {
  try {
    const { 
      tableId, 
      customerName, 
      customerPhone, 
      customerEmail, 
      partySize, 
      reservationTime,
      holdAmount = 1000 // $10 default hold
    } = await request.json();
    
    if (!tableId || !customerName || !customerPhone || !reservationTime) {
      return NextResponse.json(
        { error: 'Missing required fields: tableId, customerName, customerPhone, reservationTime' },
        { status: 400 }
      );
    }

    // Check if table is already reserved for this time
    const existingReservation = reservations.find(res => 
      res.tableId === tableId && 
      res.reservationTime === reservationTime &&
      ['pending', 'confirmed'].includes(res.status)
    );

    if (existingReservation) {
      return NextResponse.json(
        { error: 'Table is already reserved for this time' },
        { status: 409 }
      );
    }

    // Create reservation
    const reservation: Reservation = {
      id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tableId,
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      partySize: partySize || 2,
      reservationTime,
      holdAmount,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + (2 * 60 * 60 * 1000) // 2 hours from now
    };

    // Create Stripe payment intent for hold (auth only)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: holdAmount,
      currency: 'usd',
      capture_method: 'manual', // Auth only, not captured
      metadata: {
        type: 'reservation_hold',
        reservationId: reservation.id,
        tableId,
        customerName,
        customerPhone,
        reservationTime
      },
      description: `Table reservation hold - ${tableId} at ${reservationTime}`,
    });

    reservation.stripePaymentIntentId = paymentIntent.id;
    reservations.push(reservation);

    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation.id,
        tableId,
        customerName,
        reservationTime,
        holdAmount,
        expiresAt: new Date(reservation.expiresAt).toISOString(),
        clientSecret: paymentIntent.client_secret
      }
    });

  } catch (error: any) {
    console.error('Create reservation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create reservation',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('tableId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    let filteredReservations = reservations;

    if (tableId) {
      filteredReservations = filteredReservations.filter(res => res.tableId === tableId);
    }

    if (status) {
      filteredReservations = filteredReservations.filter(res => res.status === status);
    }

    if (date) {
      const targetDate = new Date(date).toDateString();
      filteredReservations = filteredReservations.filter(res => 
        new Date(res.reservationTime).toDateString() === targetDate
      );
    }

    return NextResponse.json({
      success: true,
      reservations: filteredReservations,
      total: filteredReservations.length
    });

  } catch (error: any) {
    console.error('Get reservations error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get reservations',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { reservationId, status, notes } = await request.json();
    
    if (!reservationId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: reservationId, status' },
        { status: 400 }
      );
    }

    const reservationIndex = reservations.findIndex(res => res.id === reservationId);
    if (reservationIndex === -1) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    const reservation = reservations[reservationIndex];
    
    // Handle status changes
    if (status === 'confirmed' && reservation.stripePaymentIntentId) {
      // Capture the hold payment
      await stripe.paymentIntents.capture(reservation.stripePaymentIntentId);
    } else if (status === 'cancelled' && reservation.stripePaymentIntentId) {
      // Cancel the payment intent
      await stripe.paymentIntents.cancel(reservation.stripePaymentIntentId);
    }

    // Update reservation
    reservations[reservationIndex] = {
      ...reservation,
      status,
      notes: notes || reservation.notes
    };

    return NextResponse.json({
      success: true,
      reservation: reservations[reservationIndex]
    });

  } catch (error: any) {
    console.error('Update reservation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update reservation',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
