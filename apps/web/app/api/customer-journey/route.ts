export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "../../../lib/prisma";
import crypto from "crypto";

// Helper function to create idempotency key
const createIdempotencyKey = () => crypto.randomUUID();

export async function POST(req: Request) {
  try {
    const { action, data } = await req.json();

    switch (action) {
      case 'create-booking':
        return await handleCreateBooking(data);
      case 'active':
        return await handleGetActiveSessions();
      default:
        return Response.json({ 
          success: false, 
          error: `Unknown action: ${action}` 
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Customer journey API error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

async function handleCreateBooking(data: any) {
  try {
    const { 
      reservationId, 
      customerName, 
      customerEmail, 
      customerPhone, 
      partySize, 
      tableId, 
      tableType, 
      zone, 
      position, 
      flavorMix, 
      basePrice, 
      totalPrice, 
      status, 
      currentStage, 
      seatNumber, 
      sequence, 
      metadata 
    } = data;

    // Determine source and external ref based on metadata
    let source: "QR" | "RESERVE" | "WALK_IN" = "WALK_IN";
    let externalRef = `walkin:${Date.now()}`;
    
    if (metadata?.source === 'reservation_hold') {
      source = "RESERVE";
      externalRef = `res:${reservationId}`;
    } else if (metadata?.source === 'qr_checkin') {
      source = "QR";
      externalRef = `qr:${metadata.qrCode}`;
    }

    // Create session using durable sessions API
    const sessionData = {
      loungeId: "layout-preview-lounge",
      source,
      externalRef,
      customerPhone: customerPhone || undefined,
      flavorMix: {
        flavors: flavorMix === 'TBD' ? ['Custom Mix'] : [flavorMix],
        strength: "medium",
        buildTest: false
      }
    };

    // Create the session
    const session = await prisma.session.upsert({
      where: {
        loungeId_externalRef: {
          loungeId: sessionData.loungeId,
          externalRef: sessionData.externalRef
        }
      },
      update: {},
      create: {
        loungeId: sessionData.loungeId,
        source: sessionData.source,
        externalRef: sessionData.externalRef,
        customerPhone: sessionData.customerPhone,
        flavorMix: sessionData.flavorMix,
        trustSignature: crypto.createHash("sha256")
          .update(JSON.stringify(sessionData))
          .digest("hex"),
        events: {
          create: {
            type: "CREATED",
            payloadSeal: crypto.createHash("sha256")
              .update(JSON.stringify({ action: 'create-booking', data }))
              .digest("hex"),
            data: {
              action: 'create-booking',
              originalData: data,
              idempotencyKey: createIdempotencyKey()
            }
          }
        }
      },
      include: { events: true }
    });

    // Return success response in the format expected by the frontend
    return Response.json({
      success: true,
      data: {
        id: session.id,
        reservationId: reservationId,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        partySize: partySize,
        tableId: tableId,
        tableType: tableType,
        zone: zone,
        position: position,
        flavorMix: flavorMix,
        basePrice: basePrice,
        totalPrice: totalPrice,
        status: status,
        currentStage: currentStage,
        seatNumber: seatNumber,
        sequence: sequence,
        metadata: metadata,
        sessionId: session.id,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    }, {
      status: 201,
      headers: { "Cache-Control": "no-store" }
    });

  } catch (error: any) {
    console.error('Create booking error:', error);
    return Response.json({ 
      success: false, 
      error: `Failed to create booking: ${error.message}` 
    }, { status: 500 });
  }
}

async function handleGetActiveSessions() {
  try {
    // Get active sessions from durable sessions
    const sessions = await prisma.session.findMany({
      where: {
        state: "ACTIVE"
      },
      include: { events: true },
      orderBy: { createdAt: 'desc' }
    });

    // Convert to customer journey format
    const bookings = sessions.map(session => ({
      id: session.id,
      tableId: session.externalRef || 'T-001',
      customerName: session.customerPhone ? `Customer ${session.customerPhone}` : 'Anonymous',
      flavorMix: (session.flavorMix as any)?.flavors?.join(' + ') || 'Custom Mix',
      totalPrice: 30.00, // Default price
      status: 'active',
      currentStage: 'service',
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      sessionStartTime: session.state === 'ACTIVE' ? session.createdAt : null,
      actualSessionTime: session.state === 'ACTIVE' ? 
        Math.floor((Date.now() - new Date(session.createdAt).getTime()) / 1000) : 0,
      prepStaffId: 'staff_001',
      deliveryStaffId: 'staff_002',
      customerPreferences: {
        notes: `Source: ${session.source}, External Ref: ${session.externalRef}`
      }
    }));

    return Response.json({
      success: true,
      data: bookings
    });

  } catch (error: any) {
    console.error('Get active sessions error:', error);
    return Response.json({ 
      success: false, 
      error: `Failed to get active sessions: ${error.message}` 
    }, { status: 500 });
  }
}
