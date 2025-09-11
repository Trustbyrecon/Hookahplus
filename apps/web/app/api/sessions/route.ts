export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // disable Next caching of this route

import { prisma } from "../../../lib/prisma";
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
      include: { events: true },
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
    const idempotencyKey = req.headers.get("x-idempotency-key") ?? "";
    const { loungeId, source, externalRef, customerPhone, flavorMix } = await req.json();

    if (!loungeId || !source || !externalRef) {
      return Response.json("Missing required fields", { status: 400 });
    }

    const trustSignature = seal({ loungeId, source, externalRef, customerPhone, flavorMix });

    const session = await prisma.session.upsert({
      where: { 
        loungeId_externalRef: { 
          loungeId, 
          externalRef 
        } 
      },
      update: {}, // creation is idempotent—no update on duplicate create
      create: {
        loungeId, 
        source, 
        externalRef, 
        customerPhone, 
        flavorMix, 
        trustSignature,
        events: {
          create: {
            type: "CREATED",
            payloadSeal: trustSignature,
            data: { idempotencyKey, source, customerPhone, flavorMix }
          }
        }
      },
      include: { events: true }
    });

    return Response.json({ session }, { 
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