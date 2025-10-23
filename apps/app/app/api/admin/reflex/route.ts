import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || undefined;
  const q = searchParams.get("q") || undefined;

  const where: any = {};
  if (type) where.type = { contains: type };
  if (q) {
    where.OR = [
      { sessionId: { contains: q } },
      { paymentIntent: { contains: q } },
      { ip: { contains: q } },
    ];
  }

  const items = await prisma.reflexEvent.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { 
      id: true, 
      type: true, 
      source: true,
      sessionId: true, 
      paymentIntent: true, 
      ip: true, 
      createdAt: true,
      payload: true
    }
  });
  
  return NextResponse.json({ items });
}
