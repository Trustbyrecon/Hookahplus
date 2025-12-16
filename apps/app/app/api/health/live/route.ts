import { NextResponse } from 'next/server';

/**
 * Liveness Health Check Endpoint
 * 
 * Simple check to verify the server is running.
 * Used by Kubernetes/Vercel to determine if the container should be restarted.
 * 
 * This endpoint:
 * - Returns 200 immediately if server responds
 * - Has no external dependencies
 * - Should be fast (< 100ms)
 */
export async function GET() {
  return NextResponse.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

