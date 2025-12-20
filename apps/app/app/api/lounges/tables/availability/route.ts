import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { TableAvailabilityService } from '../../../../../lib/services/TableAvailabilityService';
import { cache, CacheService } from '../../../../../lib/cache';
import { invalidateReservationCache } from '../../../../../lib/cache-invalidation';

const prisma = new PrismaClient();

// Cache TTLs
const AVAILABILITY_CACHE_TTL = 8; // 8 seconds - short TTL for real-time accuracy
const SESSIONS_CACHE_TTL = 5; // 5 seconds - very short for active sessions

// Helper to get or create default venue
async function getDefaultVenueId(): Promise<string> {
  // Try to find an existing venue
  const existingVenue = await prisma.venues.findFirst({
    orderBy: { created_at: 'desc' }
  });
  
  if (existingVenue) {
    return existingVenue.id;
  }
  
  // Create a default venue if none exists
  const newVenue = await prisma.venues.create({
    data: {
      name: 'Default Lounge',
      metadata: { isDefault: true }
    }
  });
  
  return newVenue.id;
}

/**
 * GET /api/lounges/tables/availability
 * Get available tables for a party size
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const partySize = parseInt(searchParams.get('partySize') || '1');
    const tableId = searchParams.get('tableId');
    const requestedTime = searchParams.get('requestedTime');

    // Generate cache key
    const cacheKey = CacheService.generateKey('table-availability', {
      partySize,
      tableId: tableId || 'all',
      requestedTime: requestedTime || 'now'
    });

    // Check cache
    const cached = cache.get<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Get active sessions (with caching)
    const sessionsCacheKey = 'active-sessions';
    let activeSessions = cache.get<Array<{ id: string; tableId: string | null; state: string }>>(sessionsCacheKey);
    
    if (!activeSessions) {
      // Optimized query - only get what we need, exclude null tableIds
      activeSessions = await prisma.session.findMany({
        where: {
          state: { notIn: ['CLOSED', 'CANCELED'] as any },
          tableId: { not: null } // Exclude sessions without tables
        },
        select: {
          id: true,
          tableId: true,
          state: true
        },
        take: 1000 // Limit to prevent huge queries
      });
      
      // Cache active sessions
      cache.set(sessionsCacheKey, activeSessions, SESSIONS_CACHE_TTL);
    }

    // Get active reservations (with caching)
    const venueId = await getDefaultVenueId();
    const reservationsCacheKey = `reservations:${venueId}`;
    let reservations = cache.get<any[]>(reservationsCacheKey);
    
    if (!reservations) {
      reservations = await TableAvailabilityService.getActiveReservationsWithPrisma(prisma, venueId);
      cache.set(reservationsCacheKey, reservations, AVAILABILITY_CACHE_TTL);
    }

    // If specific table requested, check that table
    if (tableId) {
      const check = await TableAvailabilityService.checkTableAvailability(
        {
          tableId,
          partySize,
          requestedTime: requestedTime ? new Date(requestedTime) : undefined
        },
        activeSessions.map(s => ({
          tableId: s.tableId || '',
          status: s.state,
          id: s.id
        })),
        reservations
      );

      const response = {
        success: true,
        ...check
      };

      // Cache the response
      cache.set(cacheKey, response, AVAILABILITY_CACHE_TTL);
      
      return NextResponse.json(response);
    }

    // Get all available tables
    const availableTables = await TableAvailabilityService.getAvailableTables(
      partySize,
      activeSessions.map(s => ({
        tableId: s.tableId || '',
        status: s.state,
        id: s.id
      })),
      requestedTime ? new Date(requestedTime) : undefined,
      reservations
    );

    // Find table combinations for large parties
    let combinations: any[] = [];
    if (partySize > 8) {
      combinations = await TableAvailabilityService.findTableCombinations(
        partySize,
        activeSessions.map(s => ({
          tableId: s.tableId || '',
          status: s.state,
          id: s.id
        }))
      );
    }

    const response = {
      success: true,
      partySize,
      availableTables: availableTables.filter(t => t.canAccommodate),
      occupiedTables: availableTables.filter(t => t.status === 'occupied'),
      reservedTables: availableTables.filter(t => t.status === 'reserved'),
      combinations: combinations.length > 0 ? combinations : undefined,
      timestamp: new Date().toISOString()
    };

    // Cache the response
    cache.set(cacheKey, response, AVAILABILITY_CACHE_TTL);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Table Availability API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check availability',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lounges/tables/availability
 * Reserve a table temporarily
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, reservedFrom, reservedUntil, partySize, customerName, customerPhone } = body;

    if (!tableId || !reservedFrom || !reservedUntil || !partySize) {
      return NextResponse.json(
        { error: 'Missing required fields: tableId, reservedFrom, reservedUntil, partySize' },
        { status: 400 }
      );
    }

    // Get or create default venue
    const venueId = await getDefaultVenueId();
    
    const result = await TableAvailabilityService.createReservationWithPrisma(
      prisma,
      venueId,
      tableId,
      new Date(reservedFrom),
      new Date(reservedUntil),
      partySize,
      customerName,
      customerPhone
    );

        if (!result.success) {
          return NextResponse.json(
            { error: result.error },
            { status: 400 }
          );
        }

        // Invalidate cache since new reservation affects availability
        try {
          invalidateReservationCache(venueId);
        } catch (cacheError) {
          console.error('[Table Availability API] Cache invalidation error (non-fatal):', cacheError);
        }

        return NextResponse.json({
          success: true,
          reservationId: result.reservationId
        });

  } catch (error) {
    console.error('[Table Reservation API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create reservation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


