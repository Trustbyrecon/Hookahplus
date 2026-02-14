import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logger } from '../../../../lib/logger';
import { cache } from '../../../../lib/cache';

const prisma = new PrismaClient();

/**
 * Readiness Check Endpoint
 * 
 * Used by Kubernetes, Docker, and orchestration tools to determine
 * if the application is ready to serve traffic.
 * 
 * Checks:
 * - Database connectivity
 * - Cache service availability
 * - Critical dependencies
 * 
 * Returns 200 if ready, 503 if not ready.
 */
export async function GET() {
  const checks: Record<string, { status: 'ok' | 'degraded' | 'down'; message?: string }> = {};
  let overallStatus: 'ok' | 'degraded' | 'down' = 'ok';

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'ok' };
    logger.debug('Readiness check: Database OK', { component: 'health' });
  } catch (error) {
    checks.database = {
      status: 'down',
      message: error instanceof Error ? error.message : 'Database connection failed',
    };
    overallStatus = 'down';
    logger.error('Readiness check: Database failed', { component: 'health' }, error instanceof Error ? error : new Error(String(error)));
  }

  // Check cache service
  try {
    const stats = cache.getStats();
    // Cache service is OK if it's working, even if empty (empty is normal on startup)
    checks.cache = {
      status: 'ok',
      message: stats.size === 0 && stats.hits === 0 ? 'Cache service initialized (empty cache is normal)' : undefined,
    };
  } catch (error) {
    checks.cache = {
      status: 'down',
      message: error instanceof Error ? error.message : 'Cache service unavailable',
    };
    overallStatus = 'down';
  }

  // Check environment variables
  const requiredEnvVars = ['DATABASE_URL'];
  const missingEnvVars: string[] = [];
  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingEnvVars.push(varName);
    }
  });

  if (missingEnvVars.length > 0) {
    checks.environment = {
      status: 'down',
      message: `Missing required environment variables: ${missingEnvVars.join(', ')}`,
    };
    overallStatus = 'down';
  } else {
    checks.environment = { status: 'ok' };
  }

  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks,
    service: 'hookahplus-app',
    version: process.env.APP_VERSION || '1.0.5',
    environment: process.env.NODE_ENV || 'development',
  };

  const statusCode = overallStatus === 'down' ? 503 : 200;
  return NextResponse.json(response, { status: statusCode });
}
