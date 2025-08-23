import { NextRequest, NextResponse } from "next/server";
import { makePosAdapter } from "@/lib/pos/factory";
import { z } from "zod";

const schema = z.object({
  provider: z.enum(["square", "toast", "clover"]),
  venue_id: z.string(),
  pos_order_id: z.string(),
  tender: z.object({
    provider: z.literal("stripe"),
    reference: z.string(),
    amount: z.number(),
    currency: z.literal("USD")
  }).optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, venue_id, pos_order_id, tender } = schema.parse(body);

    // Create POS adapter and close order
    const adapter = makePosAdapter(provider, venue_id);
    await adapter.closeOrder(pos_order_id, tender);
    
    return NextResponse.json({
      success: true,
      pos_order_id,
      closed: true,
      external_tender: !!tender,
      provider,
      venue_id
    });

  } catch (error) {
    console.error("POS close error:", error);
    
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
