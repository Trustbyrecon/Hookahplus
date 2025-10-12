export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: params.id },
      include: { events: true }
    });

    if (!session) {
      return Response.json("Session not found", { status: 404 });
    }

    return Response.json({ session }, { 
      headers: { "Cache-Control": "no-store" } 
    });
  } catch (error: any) {
    return Response.json({ 
      error: "Failed to fetch session",
      details: error.message 
    }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { expectedVersion, state, flavorMix, note } = await req.json();

    if (expectedVersion === undefined) {
      return Response.json("expectedVersion is required for optimistic concurrency", { status: 400 });
    }

    const current = await prisma.session.findUnique({ 
      where: { id: params.id } 
    });
    
    if (!current) {
      return Response.json("Session not found", { status: 404 });
    }
    
    if (current.version !== expectedVersion) {
      return Response.json("Version conflict", { status: 409 });
    }

    const payloadSeal = crypto.createHash("sha256")
      .update(JSON.stringify({ state, flavorMix, note }))
      .digest("hex");

    const updated = await prisma.session.update({
      where: { id: params.id },
      data: {
        ...(state ? { state } : {}),
        ...(flavorMix ? { flavorMix } : {}),
        version: { increment: 1 },
        events: { 
          create: { 
            type: "UPDATED", 
            payloadSeal, 
            data: JSON.stringify({ state, flavorMix, note })
          } 
        }
      },
      include: { events: true }
    });

    return Response.json({ session: updated }, { 
      headers: { "Cache-Control": "no-store" } 
    });
  } catch (error: any) {
    return Response.json({ 
      error: "Failed to update session",
      details: error.message 
    }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
