import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ZoneRoutingService, ZoneStaffAssignment } from '../../../../lib/services/ZoneRoutingService';
import { TableLayoutService } from '../../../../lib/services/TableLayoutService';

const prisma = new PrismaClient();

/**
 * GET /api/staff/zones
 * Get zone assignments, workload, and routing information
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tableId = searchParams.get('tableId');
    const zone = searchParams.get('zone');

    // Get active sessions
    const activeSessions = await prisma.session.findMany({
      where: {
        state: { notIn: ['CLOSED', 'CANCELED'] as any }
      },
      select: {
        id: true,
        tableId: true,
        state: true,
        assignedBOHId: true,
        assignedFOHId: true,
        priceCents: true,
        startedAt: true,
        createdAt: true
      }
    });

    // Get tables from layout
    const tables = await TableLayoutService.loadTables();

    // Get staff members (simplified - in production would come from staff table)
    // For now, extract from sessions
    const staffMap = new Map<string, { id: string; name: string; role: string; currentLoad: number }>();
    
    activeSessions.forEach(session => {
      // Count FOH assignments
      if (session.assignedFOHId) {
        const existing = staffMap.get(session.assignedFOHId);
        if (existing) {
          existing.currentLoad++;
        } else {
          staffMap.set(session.assignedFOHId, {
            id: session.assignedFOHId,
            name: session.assignedFOHId, // Would be resolved from staff table
            role: 'FOH',
            currentLoad: 1
          });
        }
      }
      
      // Count BOH assignments
      if (session.assignedBOHId) {
        const existing = staffMap.get(session.assignedBOHId);
        if (existing) {
          existing.currentLoad++;
        } else {
          staffMap.set(session.assignedBOHId, {
            id: session.assignedBOHId,
            name: session.assignedBOHId,
            role: 'BOH',
            currentLoad: 1
          });
        }
      }
    });

    const availableStaff = Array.from(staffMap.values());

    // If specific table requested, get routing decision
    if (tableId) {
      const tableZone = await ZoneRoutingService.getTableZone(tableId) || 'Main';
      const routing = ZoneRoutingService.routeSessionToStaff(
        tableId,
        tableZone,
        availableStaff,
        activeSessions.map(s => ({
          tableId: s.tableId || '',
          assignedStaff: {
            foh: s.assignedFOHId || undefined,
            boh: s.assignedBOHId || undefined
          }
        }))
      );

      return NextResponse.json({
        success: true,
        routing
      });
    }

    // Get zone workloads
    const zoneMap = new Map<string, ZoneStaffAssignment[]>();
    
    // Group staff by zone
    for (const table of tables) {
      const tableZone = table.zone || 'Main';
      if (!zoneMap.has(tableZone)) {
        const zoneStaff = ZoneRoutingService.assignStaffToZone(tableZone, availableStaff);
        zoneMap.set(tableZone, zoneStaff);
      }
    }

    const zoneWorkloads = ZoneRoutingService.calculateZoneWorkload(
      tables,
      activeSessions.map(s => ({
        tableId: s.tableId || '',
        status: s.state
      })),
      zoneMap
    );

    // Get zone metrics
    const zoneMetrics = zoneWorkloads.map(workload => {
      const zoneStaff = zoneMap.get(workload.zone) || [];
      return ZoneRoutingService.calculateZoneMetrics(
        workload.zone,
        activeSessions.map(s => ({
          tableId: s.tableId || '',
          priceCents: s.priceCents || undefined,
          status: s.state,
          startedAt: s.startedAt || undefined,
          createdAt: s.createdAt || undefined
        })),
        zoneStaff
      );
    });

    // Filter by zone if specified
    const filteredWorkloads = zone ? zoneWorkloads.filter(w => w.zone === zone) : zoneWorkloads;
    const filteredMetrics = zone ? zoneMetrics.filter(m => m.zone === zone) : zoneMetrics;

    return NextResponse.json({
      success: true,
      zones: filteredWorkloads,
      metrics: filteredMetrics,
      staffAssignments: Array.from(zoneMap.entries()).map(([zone, staff]) => ({
        zone,
        staff
      }))
    });

  } catch (error) {
    console.error('[Zone Routing API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get zone routing information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/staff/zones/route
 * Get routing recommendation for a new session
 * Note: This endpoint is at /api/staff/zones/route (not /api/staff/zones/route.ts)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId } = body;

    if (!tableId) {
      return NextResponse.json(
        { error: 'tableId is required' },
        { status: 400 }
      );
    }

    // Get table zone
    const tableZone = await ZoneRoutingService.getTableZone(tableId);
    
    if (!tableZone) {
      return NextResponse.json(
        { error: `Table ${tableId} not found in layout` },
        { status: 404 }
      );
    }

    // Get active sessions
    const activeSessions = await prisma.session.findMany({
      where: {
        state: { notIn: ['CLOSED', 'CANCELED'] as any }
      },
      select: {
        id: true,
        tableId: true,
        state: true,
        assignedBOHId: true,
        assignedFOHId: true
      }
    });

    // Get staff members
    const staffMap = new Map<string, { id: string; name: string; role: string; currentLoad: number }>();
    
    activeSessions.forEach(session => {
      if (session.assignedFOHId) {
        const existing = staffMap.get(session.assignedFOHId);
        if (existing) {
          existing.currentLoad++;
        } else {
          staffMap.set(session.assignedFOHId, {
            id: session.assignedFOHId,
            name: session.assignedFOHId,
            role: 'FOH',
            currentLoad: 1
          });
        }
      }
    });

    const availableStaff = Array.from(staffMap.values());

    // Get routing decision
    const routing = ZoneRoutingService.routeSessionToStaff(
      tableId,
      tableZone,
      availableStaff,
      activeSessions.map(s => ({
        tableId: s.tableId || '',
        assignedStaff: {
          foh: s.assignedFOHId || undefined,
          boh: s.assignedBOHId || undefined
        }
      }))
    );

    return NextResponse.json({
      success: true,
      routing
    });

  } catch (error) {
    console.error('[Zone Routing POST API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get routing recommendation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

