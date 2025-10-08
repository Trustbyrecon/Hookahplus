import { NextRequest, NextResponse } from 'next/server';
import { EventLogRequest, EventLogResponse, AnalyticsEvent } from '../../../../types/guest';
import { featureFlags } from '../../../../config/flags';
import { createGhostLogEntry, hashGuestEvent } from '../../../../libs/ghostlog/hash';

// Mock data stores
const eventLogs = new Map<string, AnalyticsEvent>();
const ghostLogEntries = new Map<string, any>();

/**
 * POST /api/guest/event/log
 * 
 * Logs events for analytics and GhostLog Lite
 */
export async function POST(req: NextRequest) {
  try {
    const body: EventLogRequest = await req.json();
    const { type, payload, sessionId, guestId } = body;

    // Validate required fields
    if (!type || !payload) {
      return NextResponse.json({
        ok: false,
        error: 'Missing required fields: type, payload'
      }, { status: 400 });
    }

    // Get lounge ID from session or payload
    let loungeId = payload.loungeId;
    if (!loungeId && sessionId) {
      // In production, fetch from session data
      loungeId = 'default';
    }

    // Get feature flags
    const flags = loungeId ? featureFlags.getLoungeFlags(loungeId) : featureFlags.getLoungeFlags('default');

    // Check if GhostLog is enabled
    if (!flags.ghostlog.lite) {
      return NextResponse.json({
        ok: false,
        error: 'Event logging is not enabled'
      }, { status: 403 });
    }

    // Create event ID
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Create trust stamp
    const trustStamp = hashGuestEvent(type, guestId || 'anonymous', loungeId || 'default', sessionId, payload);

    // Create analytics event
    const analyticsEvent: AnalyticsEvent = {
      eventType: type as any,
      guestId: guestId || 'anonymous',
      loungeId: loungeId || 'default',
      sessionId,
      payload,
      timestamp,
      ghostHash: trustStamp.ghostHash
    };

    // Store analytics event
    eventLogs.set(eventId, analyticsEvent);

    // Create GhostLog entry
    const ghostLogEntry = createGhostLogEntry(type, {
      eventId,
      guestId: guestId || 'anonymous',
      loungeId: loungeId || 'default',
      sessionId,
      ...payload,
      timestamp
    });

    // Store GhostLog entry
    ghostLogEntries.set(eventId, ghostLogEntry);

    // Log to console for debugging
    console.log(`Event logged: ${type}`, {
      eventId,
      guestId: guestId || 'anonymous',
      loungeId: loungeId || 'default',
      sessionId,
      ghostHash: trustStamp.ghostHash
    });

    const response: EventLogResponse = {
      ok: true,
      ghostHash: trustStamp.ghostHash,
      eventId
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Event logging error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * GET /api/guest/event/log
 * 
 * Gets event logs for analytics (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guestId = searchParams.get('guestId');
    const loungeId = searchParams.get('loungeId');
    const eventType = searchParams.get('eventType');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // In production, add authentication check here
    // For now, allow access for debugging

    let filteredEvents = Array.from(eventLogs.values());

    // Filter by guest ID
    if (guestId) {
      filteredEvents = filteredEvents.filter(event => event.guestId === guestId);
    }

    // Filter by lounge ID
    if (loungeId) {
      filteredEvents = filteredEvents.filter(event => event.loungeId === loungeId);
    }

    // Filter by event type
    if (eventType) {
      filteredEvents = filteredEvents.filter(event => event.eventType === eventType);
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const paginatedEvents = filteredEvents.slice(offset, offset + limit);

    // Calculate analytics summary
    const summary = {
      totalEvents: filteredEvents.length,
      eventTypes: filteredEvents.reduce((acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      uniqueGuests: new Set(filteredEvents.map(event => event.guestId)).size,
      uniqueLounges: new Set(filteredEvents.map(event => event.loungeId)).size,
      timeRange: {
        earliest: filteredEvents.length > 0 ? filteredEvents[filteredEvents.length - 1].timestamp : null,
        latest: filteredEvents.length > 0 ? filteredEvents[0].timestamp : null
      }
    };

    return NextResponse.json({
      ok: true,
      events: paginatedEvents,
      summary,
      pagination: {
        limit,
        offset,
        total: filteredEvents.length,
        hasMore: offset + limit < filteredEvents.length
      }
    });

  } catch (error) {
    console.error('Get event logs error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/guest/event/log
 * 
 * Clears event logs (admin only)
 */
export async function DELETE(req: NextRequest) {
  try {
    // In production, add authentication check here
    // For now, allow clearing for debugging

    const { searchParams } = new URL(req.url);
    const guestId = searchParams.get('guestId');
    const loungeId = searchParams.get('loungeId');

    if (guestId) {
      // Clear events for specific guest
      for (const [eventId, event] of eventLogs.entries()) {
        if (event.guestId === guestId) {
          eventLogs.delete(eventId);
          ghostLogEntries.delete(eventId);
        }
      }
    } else if (loungeId) {
      // Clear events for specific lounge
      for (const [eventId, event] of eventLogs.entries()) {
        if (event.loungeId === loungeId) {
          eventLogs.delete(eventId);
          ghostLogEntries.delete(eventId);
        }
      }
    } else {
      // Clear all events
      eventLogs.clear();
      ghostLogEntries.clear();
    }

    return NextResponse.json({
      ok: true,
      message: 'Event logs cleared successfully'
    });

  } catch (error) {
    console.error('Clear event logs error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
