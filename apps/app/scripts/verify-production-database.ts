/**
 * Production Database Verification Script
 * 
 * Verifies production database connection and configuration.
 * 
 * Usage:
 *   npx tsx scripts/verify-production-database.ts
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

interface VerificationResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

async function verifyDatabaseUrl(): Promise<VerificationResult> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return {
      check: 'DATABASE_URL Configuration',
      status: 'fail',
      message: 'DATABASE_URL not found in environment variables',
      details: 'Add DATABASE_URL to Vercel Production environment variables'
    };
  }

  // Check if using connection pooler (recommended for Vercel)
  const isPooler = databaseUrl.includes('pooler.supabase.com') || databaseUrl.includes('pooler');
  const isDirect = databaseUrl.includes('.supabase.co:5432');

  if (isDirect && !isPooler) {
    return {
      check: 'DATABASE_URL Configuration',
      status: 'warning',
      message: 'Using direct connection (port 5432) - consider using connection pooler for better performance',
      details: 'For Vercel serverless, use pooler: aws-0-us-east-2.pooler.supabase.com:6543'
    };
  }

  if (isPooler) {
    return {
      check: 'DATABASE_URL Configuration',
      status: 'pass',
      message: 'Using connection pooler (recommended for Vercel)',
      details: databaseUrl.replace(/:[^:@]+@/, ':****@') // Mask password
    };
  }

  return {
    check: 'DATABASE_URL Configuration',
    status: 'pass',
    message: 'DATABASE_URL configured',
    details: databaseUrl.replace(/:[^:@]+@/, ':****@') // Mask password
  };
}

async function verifyDatabaseConnection(): Promise<VerificationResult> {
  try {
    // Test basic connection
    await prisma.$queryRaw`SELECT 1 as test`;
    
    return {
      check: 'Database Connection',
      status: 'pass',
      message: 'Successfully connected to database'
    };
  } catch (error: any) {
    return {
      check: 'Database Connection',
      status: 'fail',
      message: 'Failed to connect to database',
      details: error.message || 'Unknown error'
    };
  }
}

async function verifySessionTable(): Promise<VerificationResult> {
  try {
    // Check if Session table exists and is accessible
    const count = await prisma.session.count();
    
    return {
      check: 'Session Table Access',
      status: 'pass',
      message: `Session table accessible (${count} sessions found)`
    };
  } catch (error: any) {
    if (error.message?.includes('does not exist')) {
      return {
        check: 'Session Table Access',
        status: 'fail',
        message: 'Session table does not exist',
        details: 'Run database migrations: npx prisma migrate deploy'
      };
    }
    
    return {
      check: 'Session Table Access',
      status: 'fail',
      message: 'Cannot access Session table',
      details: error.message || 'Unknown error'
    };
  }
}

async function verifyConnectionPooling(): Promise<VerificationResult> {
  const databaseUrl = process.env.DATABASE_URL || '';
  
  // Check for connection pool parameters
  const hasConnectionLimit = databaseUrl.includes('connection_limit');
  const hasPoolTimeout = databaseUrl.includes('pool_timeout');
  const hasPgBouncer = databaseUrl.includes('pgbouncer=true');

  if (!hasConnectionLimit && !hasPoolTimeout) {
    return {
      check: 'Connection Pooling',
      status: 'warning',
      message: 'Connection pool limits not configured',
      details: 'Add connection_limit=30&pool_timeout=10&pgbouncer=true to DATABASE_URL for better performance'
    };
  }

  return {
    check: 'Connection Pooling',
    status: 'pass',
    message: 'Connection pool parameters configured'
  };
}

async function runVerification(): Promise<void> {
  console.log('🔍 Production Database Verification\n');
  console.log('='.repeat(60));
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60));
  console.log('');

  const results: VerificationResult[] = [];

  // Run all checks
  results.push(await verifyDatabaseUrl());
  results.push(await verifyDatabaseConnection());
  results.push(await verifySessionTable());
  results.push(await verifyConnectionPooling());

  // Display results
  console.log('📋 Verification Results:\n');

  let passed = 0;
  let failed = 0;
  let warnings = 0;

  results.forEach((result) => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.check}: ${result.message}`);
    
    if (result.details) {
      console.log(`   → ${result.details}`);
    }
    console.log('');

    if (result.status === 'pass') passed++;
    else if (result.status === 'fail') failed++;
    else warnings++;
  });

  // Summary
  console.log('='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ⚠️  Warnings: ${warnings}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log('');

  if (failed === 0 && warnings === 0) {
    console.log('🎉 All database checks passed! Ready for production! 🚀');
  } else if (failed === 0) {
    console.log('✅ Core checks passed! Address warnings for optimal setup.');
  } else {
    console.log('⚠️  Some checks failed. Fix issues before going live.');
  }

  console.log('');

  // Cleanup
  await prisma.$disconnect();

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run verification
runVerification().catch(async (error) => {
  console.error('❌ Verification failed:', error);
  await prisma.$disconnect();
  process.exit(1);
});

