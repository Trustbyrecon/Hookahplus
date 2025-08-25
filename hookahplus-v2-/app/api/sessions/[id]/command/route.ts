// app/api/sessions/[id]/command/route.ts
import { NextResponse } from "next/server";

// Generate static params for static export
export async function generateStaticParams() {
  // Generate common session IDs for static export
  const sessionIds = ['demo-1', 'demo-2', 'demo-3', 'test-1', 'test-2'];
  return sessionIds.map((id) => ({ id: id }));
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // For static export, return a mock response
  return NextResponse.json({ 
    error: "API routes not available in static export",
    message: "This is a static site. API functionality requires server-side rendering."
  }, { status: 501 });
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  // For static export, return a mock response
  return NextResponse.json({ 
    error: "API routes not available in static export",
    message: "This is a static site. API functionality requires server-side rendering."
  }, { status: 501 });
}
