import { NextRequest, NextResponse } from "next/server";
import { makePosAdapter } from "@/lib/pos/factory";
import { z } from "zod";

const schema = z.object({
  provider: z.enum(["square", "toast", "clover"]),
  venue_id: z.string(),
  pos_order_id: z.string(),
  items: z.array(z.object({
    sku: z.string(),
    name: z.string(),
    qty: z.number(),
    unit_amount: z.number(),
    tax_code: z.string().optional(),
    notes: z.string().optional()
  }))
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, venue_id, pos_order_id, items } = schema.parse(body);

    // Create POS adapter and upsert items
    const adapter = makePosAdapter(provider, venue_id);
    await adapter.upsertItems(pos_order_id, items);
    
    return NextResponse.json({
      success: true,
      pos_order_id,
      items_count: items.length,
      provider,
      venue_id
    });

  } catch (error) {
    console.error("POS upsert error:", error);
    
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
