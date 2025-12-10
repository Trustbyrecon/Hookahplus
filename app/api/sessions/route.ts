export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // disable Next caching of this route

import { prisma } from "@/lib/prisma";
import { extractIdempotencyKey, withIdempotency } from "@/lib/idempotency";
import { getOrCreateCustomerByPhone } from "@/lib/wallet";
import crypto from "crypto";

const seal = (o: unknown) =>
  crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex");

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get('state');
    const loungeId = searchParams.get('loungeId');
    const customerPhone = searchParams.get('customerPhone');

    let whereClause: any = {};
    
    if (state) {
      whereClause.state = state;
    }
    
    if (loungeId) {
      whereClause.loungeId = loungeId;
    }
    
    if (customerPhone) {
      whereClause.customerPhone = customerPhone;
    }

    const sessions = await prisma.session.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return Response.json({ 
      success: true,
      sessions,
      count: sessions.length
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(req: Request) {
  try {
    const idempotencyKey = extractIdempotencyKey(req);
    const { loungeId, source, externalRef, customerPhone, flavorMix } = await req.json();

    if (!loungeId || !source || !externalRef) {
      return Response.json("Missing required fields", { status: 400 });
    }

    const trustSignature = seal({ loungeId, source, externalRef, customerPhone, flavorMix });

    // Link customer if phone provided
    let customerId: string | null = null;
    if (customerPhone) {
      try {
        const { customer } = await getOrCreateCustomerByPhone(customerPhone);
        customerId = customer.id;
      } catch (error) {
        // Continue without customer link if lookup fails
        console.warn("Failed to link customer:", error);
      }
    }

    const { result: session, cached } = await withIdempotency({
      key: idempotencyKey,
      eventType: "session_started",
      payload: { loungeId, source, externalRef, customerPhone, flavorMix, trustSignature, customerId },
      sessionIdFromResult: (s) => (s as any)?.id,
      handler: async () =>
        prisma.session.upsert({
      where: { 
        loungeId_externalRef: { 
          loungeId, 
              externalRef,
            },
      },
      update: {}, // creation is idempotent—no update on duplicate create
      create: {
        loungeId, 
        source, 
        externalRef, 
        customerPhone, 
        customerId,
        flavorMix, 
        trustSignature,
          },
        }),
    });

    return Response.json({ session, idempotent: cached }, { 
      status: 201, 
      headers: { "Cache-Control": "no-store" } 
    });
  } catch (error: any) {
    return Response.json({ 
      error: "Failed to create session",
      details: error.message 
    }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}