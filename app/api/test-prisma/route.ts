// Test API route to debug Prisma issues
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    console.log("Testing Prisma connection...");
    const sessions = await prisma.session.findMany();
    console.log("Sessions found:", sessions.length);
    
    return Response.json({ 
      success: true,
      sessions,
      count: sessions.length,
      message: "Prisma connection successful"
    });
  } catch (error: any) {
    console.error("Prisma error:", error);
    return Response.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
