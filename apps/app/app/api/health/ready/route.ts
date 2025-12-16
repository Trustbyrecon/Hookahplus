import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import Stripe from 'stripe';

/**
 * Readiness Health Check Endpoint
 * 
 * Checks if the application can serve traffic by verifying:
 * - Database connection
 * - Stripe connectivity (lightweight check)
 * - Critical environment variables
 * 
 * Used by Kubernetes/Vercel to determine if traffic should be routed to this instance.
 * Returns 200 if ready, 503 if not ready.
 */

interface HealthCheck {
  name: string;
  status: 'ok' | 'error';
  message?: string;
  duration?: number;
}

async function checkDatabase(): Promise<HealthCheck> {
  const startTime = Date.now();
  try {
    // Simple connection test
    await prisma.$queryRaw`SELECT 1`;
    return {
      name: 'database',
      status: 'ok',
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: 'database',
      status: 'error',
      message: error instanceof Error ? error.message : 'Database connection failed',
      duration: Date.now() - startTime,
    };
  }
}

async function checkStripe(): Promise<HealthCheck> {
  const startTime = Date.now();
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        name: 'stripe',
        status: 'error',
        message: 'STRIPE_SECRET_KEY not configured',
        duration: Date.now() - startTime,
      };
    }

    // Lightweight check: just verify we can create a Stripe instance
    // Don't make an actual API call to avoid rate limits
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil' as any,
    });
    
    // Verify key format (test or live)
    const keyPrefix = process.env.STRIPE_SECRET_KEY.substring(0, 7);
    const isValidKey = keyPrefix === 'sk_test' || keyPrefix === 'sk_live';
    
    return {
      name: 'stripe',
      status: isValidKey ? 'ok' : 'error',
      message: isValidKey ? 'Stripe key configured' : 'Invalid Stripe key format',
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: 'stripe',
      status: 'error',
      message: error instanceof Error ? error.message : 'Stripe check failed',
      duration: Date.now() - startTime,
    };
  }
}

function checkEnvironmentVariables(): HealthCheck {
  const startTime = Date.now();
  const required = ['DATABASE_URL'];
  const optional = ['STRIPE_SECRET_KEY', 'NEXT_PUBLIC_APP_URL'];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    return {
      name: 'environment',
      status: 'error',
      message: `Missing required environment variables: ${missing.join(', ')}`,
      duration: Date.now() - startTime,
    };
  }
  
  const missingOptional = optional.filter(key => !process.env[key]);
  const hasWarnings = missingOptional.length > 0;
  
  return {
    name: 'environment',
    status: hasWarnings ? 'ok' : 'ok',
    message: hasWarnings 
      ? `Optional variables missing: ${missingOptional.join(', ')}`
      : 'All environment variables configured',
    duration: Date.now() - startTime,
  };
}

export async function GET() {
  const startTime = Date.now();
  
  // Run all checks in parallel
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkStripe(),
    Promise.resolve(checkEnvironmentVariables()),
  ]);
  
  // Extract results
  const results: HealthCheck[] = checks.map((check, index) => {
    if (check.status === 'fulfilled') {
      return check.value;
    } else {
      const names = ['database', 'stripe', 'environment'];
      return {
        name: names[index],
        status: 'error' as const,
        message: check.reason?.message || 'Check failed',
      };
    }
  });
  
  // Determine overall readiness
  const allOk = results.every(check => check.status === 'ok');
  const criticalChecks = results.filter(check => 
    check.name === 'database' || check.name === 'environment'
  );
  const criticalOk = criticalChecks.every(check => check.status === 'ok');
  
  // Ready if all checks pass, or if critical checks pass (Stripe can be optional)
  const ready = allOk || criticalOk;
  
  const statusCode = ready ? 200 : 503;
  const overallStatus = ready ? 'ready' : 'not_ready';
  
  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results.reduce((acc, check) => {
        acc[check.name] = {
          status: check.status,
          ...(check.message && { message: check.message }),
          ...(check.duration && { duration: `${check.duration}ms` }),
        };
        return acc;
      }, {} as Record<string, any>),
      summary: {
        total: results.length,
        ok: results.filter(c => c.status === 'ok').length,
        errors: results.filter(c => c.status === 'error').length,
      },
      duration: `${Date.now() - startTime}ms`,
    },
    { status: statusCode }
  );
}

