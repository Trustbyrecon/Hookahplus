import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Database Health Check Endpoint
 * 
 * Checks:
 * - Database connection
 * - Query performance
 * - Connection pool status
 * - Database size
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Test basic connection
    await prisma.$queryRaw`SELECT 1 as test`;
    
    // Get database stats
    const stats = await prisma.$queryRaw`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        version() as postgres_version,
        pg_database_size(current_database()) as database_size_bytes
    `;
    
    // Get table counts
    const tableCounts = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes
      FROM pg_stat_user_tables 
      ORDER BY n_tup_ins DESC
      LIMIT 10
    `;
    
    // Get connection info
    const connectionInfo = await prisma.$queryRaw`
      SELECT 
        count(*) as active_connections,
        state
      FROM pg_stat_activity 
      WHERE state IS NOT NULL
      GROUP BY state
    `;
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: {
        ...stats[0],
        size_mb: Math.round(Number(stats[0].database_size_bytes) / 1024 / 1024)
      },
      tables: tableCounts,
      connections: connectionInfo,
      checks: {
        connection: 'ok',
        query_performance: responseTime < 1000 ? 'good' : 'slow',
        response_time: responseTime
      }
    });
    
  } catch (error) {
    console.error('[DB Health] Database check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {
        connection: 'failed',
        query_performance: 'failed',
        response_time: Date.now() - startTime
      }
    }, { status: 500 });
    
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Database Performance Test
 * 
 * Runs a series of queries to test database performance
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const results = [];
  
  try {
    // Test 1: Simple query
    const test1Start = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    results.push({
      test: 'simple_query',
      duration: Date.now() - test1Start,
      status: 'passed'
    });
    
    // Test 2: Count query
    const test2Start = Date.now();
    const sessionCount = await prisma.session.count();
    results.push({
      test: 'count_query',
      duration: Date.now() - test2Start,
      status: 'passed',
      result: sessionCount
    });
    
    // Test 3: Complex query
    const test3Start = Date.now();
    const complexQuery = await prisma.$queryRaw`
      SELECT 
        status,
        COUNT(*) as count,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_duration_seconds
      FROM sessions 
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY status
    `;
    results.push({
      test: 'complex_query',
      duration: Date.now() - test3Start,
      status: 'passed',
      result: complexQuery
    });
    
    const totalTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      total_duration: `${totalTime}ms`,
      tests: results,
      performance: {
        overall: totalTime < 2000 ? 'good' : 'needs_optimization',
        average_query_time: Math.round(totalTime / results.length)
      }
    });
    
  } catch (error) {
    console.error('[DB Health] Performance test failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      tests: results,
      performance: {
        overall: 'failed'
      }
    }, { status: 500 });
    
  } finally {
    await prisma.$disconnect();
  }
}
