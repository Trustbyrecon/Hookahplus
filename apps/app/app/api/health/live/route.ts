import { NextResponse } from 'next/server';

/**
 * Liveness Check Endpoint
 * 
 * Used by Kubernetes, Docker, and orchestration tools to determine
 * if the application process is running.
 * 
 * This should be fast and not depend on external services.
 * Returns 200 if the server is running, regardless of database/other services.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'hookahplus-app',
    },
    { status: 200 }
  );
}
