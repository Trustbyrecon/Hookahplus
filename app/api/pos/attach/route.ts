import { NextRequest, NextResponse } from "next/server";
import { makePosAdapter } from "@/lib/pos/factory";
import { verifyTrust } from "@/lib/trustlock";
import { z } from "zod";

const schema = z.object({
  provider: z.enum(["square", "toast", "clover"]),
  venue_id: z.string(),
  hp_order: z.any()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, venue_id, hp_order } = schema.parse(body);

    // Verify trust-lock signature
    if (!verifyTrust(hp_order.hp_order_id, hp_order.trust_lock.sig)) {
      return NextResponse.json({ error: "Invalid trust signature" }, { status: 401 });
    }

    // Create POS adapter and attach order
    const adapter = makePosAdapter(provider, venue_id);
    const result = await adapter.attachOrder(hp_order);
    
    return NextResponse.json({
      success: true,
      pos_order_id: result.pos_order_id,
      created: result.created,
      provider,
      venue_id
    });

  } catch (error) {
    console.error("POS attach error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid request data", 
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
