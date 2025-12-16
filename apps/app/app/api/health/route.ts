import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Legacy Health Check Endpoint
 * 
 * This endpoint is kept for backward compatibility.
 * For new deployments, use:
 * - /api/health/live - Liveness check (server running)
 * - /api/health/ready - Readiness check (can serve traffic)
 * 
 * This endpoint now uses readiness logic.
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  const firstLightMode = process.env.FIRST_LIGHT_MODE === 'true';
  
  // Check DATABASE_URL exists
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  
  // Test database connection
  let databaseStatus: 'connected' | 'disconnected' = 'disconnected';
  let databaseError: string | null = null;
  
  if (hasDatabaseUrl) {
    try {
      // Simple connection test
      await prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'connected';
    } catch (error) {
      databaseStatus = 'disconnected';
      databaseError = error instanceof Error ? error.message : 'Unknown database error';
      console.error('[Health Check] Database connection failed:', databaseError);
    }
  } else {
    databaseError = 'DATABASE_URL environment variable is not set';
  }
  
  // Determine overall status (readiness logic)
  let status: 'ok' | 'degraded' | 'down' = 'ok';
  if (databaseStatus === 'disconnected') {
    status = 'down';
  }
  
  // Auth status
  const authStatus = firstLightMode ? 'bypassed' : 'enabled';
  
  const healthData = {
    status,
    database: databaseStatus,
    auth: authStatus,
    timestamp,
    firstLightMode,
    ...(databaseError && { databaseError }),
    version: '1.0.5',
    app: 'hookahplus-app',
    env: process.env.NODE_ENV || 'development',
    // Deprecation notice
    deprecated: true,
    message: 'This endpoint is deprecated. Use /api/health/live for liveness and /api/health/ready for readiness checks.',
    newEndpoints: {
      live: '/api/health/live',
      ready: '/api/health/ready',
    },
  };
  
  // Return 503 if down, 200 otherwise
  const statusCode = status === 'down' ? 503 : 200;
  
  return NextResponse.json(healthData, { status: statusCode });
}
