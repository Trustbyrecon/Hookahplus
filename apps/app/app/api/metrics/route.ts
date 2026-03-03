import { NextRequest, NextResponse } from 'next/server';
import { cache } from '../../../lib/cache';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Prometheus-Compatible Metrics Endpoint
 * 
 * Returns metrics in Prometheus text format for monitoring.
 * 
 * Metrics included:
 * - Cache statistics (hits, misses, size, evictions)
 * - Database connection status
 * - Application uptime
 * - Request counts (if available)
 */
export async function GET(request: NextRequest) {
  try {
    const format = request.nextUrl.searchParams.get('format') || 'prometheus';
    
    if (format === 'json') {
      // Return JSON format for easier parsing
      const cacheStats = cache.getStats();
      
      // Check database connection
      let dbStatus = 'unknown';
      let dbResponseTime = 0;
      try {
        const start = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        dbResponseTime = Date.now() - start;
        dbStatus = 'connected';
      } catch (error) {
        dbStatus = 'disconnected';
      }

      return NextResponse.json({
        cache: {
          size: cacheStats.size ?? 0,
          hits: cacheStats.hits ?? 0,
          misses: cacheStats.misses ?? 0,
          hitRate: cacheStats.hitRate ?? 0,
          evictions: cacheStats.evictions ?? 0,
        },
        database: {
          status: dbStatus,
          responseTimeMs: dbResponseTime,
        },
        application: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.env.APP_VERSION || '1.0.5',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Prometheus text format
    const cacheStats = cache.getStats();
    const uptime = process.uptime();
    const memory = process.memoryUsage();

    // Check database
    let dbStatus = 0; // 0 = down, 1 = up
    let dbResponseTime = 0;
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbResponseTime = Date.now() - start;
      dbStatus = 1;
    } catch (error) {
      dbStatus = 0;
    }

    // Get cache stats with fallback to legacy properties
    const cacheSize = cacheStats.size ?? cacheStats.totalEntries ?? 0;
    const cacheHits = cacheStats.hits ?? 0;
    const cacheMisses = cacheStats.misses ?? 0;
    const cacheHitRate = cacheStats.hitRate ?? 0;
    const cacheEvictions = cacheStats.evictions ?? 0;

    const metrics = [
      '# HELP cache_size Current number of cache entries',
      '# TYPE cache_size gauge',
      `cache_size ${cacheSize}`,
      '',
      '# HELP cache_hits_total Total number of cache hits',
      '# TYPE cache_hits_total counter',
      `cache_hits_total ${cacheHits}`,
      '',
      '# HELP cache_misses_total Total number of cache misses',
      '# TYPE cache_misses_total counter',
      `cache_misses_total ${cacheMisses}`,
      '',
      '# HELP cache_hit_rate Cache hit rate (0-1)',
      '# TYPE cache_hit_rate gauge',
      `cache_hit_rate ${cacheHitRate}`,
      '',
      '# HELP cache_evictions_total Total number of cache evictions',
      '# TYPE cache_evictions_total counter',
      `cache_evictions_total ${cacheEvictions}`,
      '',
      '# HELP database_status Database connection status (1=up, 0=down)',
      '# TYPE database_status gauge',
      `database_status ${dbStatus}`,
      '',
      '# HELP database_response_time_ms Database query response time in milliseconds',
      '# TYPE database_response_time_ms gauge',
      `database_response_time_ms ${dbResponseTime}`,
      '',
      '# HELP application_uptime_seconds Application uptime in seconds',
      '# TYPE application_uptime_seconds gauge',
      `application_uptime_seconds ${uptime}`,
      '',
      '# HELP application_memory_heap_used_bytes Heap memory used in bytes',
      '# TYPE application_memory_heap_used_bytes gauge',
      `application_memory_heap_used_bytes ${memory.heapUsed}`,
      '',
      '# HELP application_memory_heap_total_bytes Total heap memory in bytes',
      '# TYPE application_memory_heap_total_bytes gauge',
      `application_memory_heap_total_bytes ${memory.heapTotal}`,
      '',
      '# HELP application_memory_rss_bytes Resident set size in bytes',
      '# TYPE application_memory_rss_bytes gauge',
      `application_memory_rss_bytes ${memory.rss}`,
      '',
    ].join('\n');

    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

