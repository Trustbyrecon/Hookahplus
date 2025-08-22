import { NextResponse } from "next/server";

export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
    services: {
      stripe: process.env.STRIPE_SECRET_KEY ? "configured" : "not_configured",
      analytics: process.env.NEXT_PUBLIC_GA_ID ? "configured" : "not_configured",
      trustlock: process.env.TRUSTLOCK_SECRET ? "configured" : "not_configured",
    },
    uptime: process.uptime(),
  };

  return NextResponse.json(health);
}
