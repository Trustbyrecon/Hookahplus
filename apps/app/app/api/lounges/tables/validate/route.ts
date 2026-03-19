import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { CODIGO_SEATS } from '../../../../../lib/codigoSeats';

function layoutKey(loungeId: string) {
  return `lounge_layout:${loungeId}`;
}

/**
 * POST /api/lounges/tables/validate
 * Validate tableId, capacity, and availability
 */
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { tableId, partySize, checkAvailability = true, loungeId } = body || {};
    const effectiveLoungeId = typeof loungeId === 'string' ? loungeId.trim() : '';

    if (!tableId) {
      return NextResponse.json(
        { error: 'Missing required field: tableId' },
        { status: 400 }
      );
    }

    let tableExists = false;
    let tables: any[] = [];
    let table: any = null;

    // CODIGO: Use source-of-truth CODIGO_SEATS first — no DB
    if (effectiveLoungeId === 'CODIGO') {
      const tid = String(tableId || '').trim().toLowerCase();
      const seat = CODIGO_SEATS.find(
        (s) =>
          s.id.toLowerCase() === tid ||
          s.label.toLowerCase() === tid ||
          s.id.replace(/^seat-/, '').toLowerCase() === tid
      );
      if (seat) {
        tableExists = true;
        table = {
          id: seat.id,
          name: seat.label,
          capacity: 2,
          seatingType: seat.id.startsWith('seat-kb') ? 'Bar Seating' : 'Booth',
          zone: seat.id.startsWith('seat-5') ? 'VIP' : 'Main Floor',
        };
        tables = CODIGO_SEATS.map((s) => ({
          id: s.id,
          name: s.label,
          capacity: 2,
          seatingType: s.id.startsWith('seat-kb') ? 'Bar Seating' : 'Booth',
          zone: s.id.startsWith('seat-5') ? 'VIP' : 'Main Floor',
        }));
      }
    }

    // Check Seat table first (new system) if loungeId provided
    if (!tableExists && effectiveLoungeId) {
      try {
        const seats = await prisma.seat.findMany({
          where: { 
            loungeId: effectiveLoungeId,
            status: 'ACTIVE'
          },
          include: {
            zone: true
          }
        });

        if (seats.length > 0) {
          tables = seats.map(seat => ({
            id: seat.tableId,
            name: seat.name || seat.tableId,
            capacity: seat.capacity || 4,
            seatingType: seat.zone?.zoneType === 'VIP' ? 'VIP' : 
                        seat.zone?.zoneType === 'OUTDOOR' ? 'Outdoor' : 'Booth',
            zone: seat.zone?.name || 'Main Floor'
          }));

          table = seats.find(seat => 
            seat.tableId === tableId ||
            seat.name === tableId ||
            seat.name?.toLowerCase() === tableId.toLowerCase() ||
            seat.tableId?.toLowerCase() === tableId.toLowerCase()
          );

          if (table) {
            tableExists = true;
            table = {
              id: table.tableId,
              name: table.name || table.tableId,
              capacity: table.capacity || 4,
              seatingType: table.zone?.zoneType === 'VIP' ? 'VIP' : 
                          table.zone?.zoneType === 'OUTDOOR' ? 'Outdoor' : 'Booth',
              zone: table.zone?.name || 'Main Floor'
            };
          }
        }
      } catch (error) {
        console.error('[Table Validation API] Error loading seats:', error);
      }
    }

    // Fallback to FloorplanLayout (e.g. CODIGO pilot) if no seats found
    if (!tableExists && effectiveLoungeId) {
      try {
        const floorplan = await prisma.floorplanLayout.findFirst({
          where: { loungeId: effectiveLoungeId },
          orderBy: { floorId: 'asc' },
        });
        if (floorplan?.nodes && Array.isArray(floorplan.nodes)) {
          const nodes = floorplan.nodes as Array<{ id?: string; label?: string; type?: string; capacity?: number }>;
          tables = nodes.map((node) => ({
            id: node.id || '',
            name: node.label || node.id || '',
            capacity: node.capacity ?? 4,
            seatingType: node.type === 'kiosk' ? 'Kiosk' : 'Booth',
            zone: 'Main Floor',
          }));
          table = tables.find(
            (t) =>
              t.id === tableId ||
              t.name === tableId ||
              (t.id && t.id.toLowerCase() === tableId?.toLowerCase()) ||
              (t.name && t.name.toLowerCase() === tableId?.toLowerCase())
          );
          if (table) {
            tableExists = true;
          }
        }
      } catch (error) {
        console.error('[Table Validation API] Error loading floorplan:', error);
      }
    }

    // Fallback to orgSetting if no seats found
    if (!tableExists) {
      let layoutSetting;
      try {
        // Backward compatible read: try scoped key first (if loungeId present), then legacy global key.
        layoutSetting =
          (effectiveLoungeId ? await prisma.orgSetting.findUnique({ where: { key: layoutKey(effectiveLoungeId) } }) : null) ||
          (await prisma.orgSetting.findUnique({ where: { key: 'lounge_layout' } }).catch(() => null));
      } catch (error) {
        console.error('[Table Validation API] Error loading layout:', error);
        return NextResponse.json({
          valid: false,
          error: 'No lounge layout configured. Please set up tables in Lounge Layout Manager first.',
          suggestion: 'Visit /lounge-layout to configure your tables'
        });
      }

      if (layoutSetting) {
        try {
          const layoutData = JSON.parse(layoutSetting.value);
          tables = layoutData.tables || [];
          
          table = tables.find((t: any) => 
            t.id === tableId || 
            t.name === tableId ||
            t.name?.toLowerCase() === tableId.toLowerCase()
          );

          if (table) {
            tableExists = true;
          }
        } catch (error) {
          console.error('[Table Validation API] Error parsing layout data:', error);
          return NextResponse.json({
            valid: false,
            error: 'Invalid lounge layout data',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 });
        }
      }
    }

    if (!tableExists || !table) {
      // Graceful fallback: Use demo table data for demo/onboarding flows
      // This reduces friction and allows sessions to be created without lounge layout setup
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          {
            valid: false,
            error: `Table "${tableId}" not found and no canonical lounge layout is configured.`,
            next: 'CONFIGURE_LOUNGE_LAYOUT',
            suggestion: 'Visit /lounge-layout to configure your tables, then retry the QR/table selection.',
          },
          { status: 404 }
        );
      }

      const demoTables = [
        { id: 'table-001', name: 'T-001', capacity: 4, seatingType: 'Booth', zone: 'Main Floor' },
        { id: 'table-002', name: 'T-002', capacity: 4, seatingType: 'Booth', zone: 'Main Floor' },
        { id: 'table-003', name: 'T-003', capacity: 6, seatingType: 'Couch', zone: 'Main Floor' },
        { id: 'table-004', name: 'T-004', capacity: 2, seatingType: 'Bar Seating', zone: 'Main Floor' },
        { id: 'table-005', name: 'T-005', capacity: 6, seatingType: 'Couch', zone: 'Main Floor' },
        { id: 'table-006', name: 'T-006', capacity: 8, seatingType: 'Outdoor', zone: 'Main Floor' },
        { id: 'table-007', name: 'T-007', capacity: 4, seatingType: 'Booth', zone: 'Main Floor' },
        { id: 'table-008', name: 'T-008', capacity: 10, seatingType: 'VIP', zone: 'VIP Section' },
        { id: 'table-009', name: 'T-009', capacity: 6, seatingType: 'Couch', zone: 'Main Floor' },
        { id: 'table-010', name: 'T-010', capacity: 8, seatingType: 'Private Room', zone: 'Private Section' }
      ];

      // Try to find in demo tables
      const demoTable = demoTables.find(t => 
        t.id === tableId || 
        t.name === tableId ||
        t.id.toLowerCase() === tableId.toLowerCase() ||
        t.name.toLowerCase() === tableId.toLowerCase()
      );

      if (demoTable) {
        // Return demo table as valid (graceful fallback for demo/onboarding)
        console.log(`[Table Validation API] Using demo table fallback for: ${tableId}`);
        table = demoTable;
        tableExists = true;
      } else {
        // Suggest similar table names (from actual tables or demo tables)
        const allTables = [...tables, ...demoTables];
        const suggestions = allTables
          .filter((t: any) => 
            t.name?.toLowerCase().includes(tableId.toLowerCase()) ||
            t.id?.toLowerCase().includes(tableId.toLowerCase())
          )
          .slice(0, 3)
          .map((t: any) => t.name || t.id);

        return NextResponse.json({
          valid: false,
          error: `Table "${tableId}" not found. Using demo mode - table will be created automatically.`,
          suggestions: suggestions.length > 0 ? suggestions : undefined,
          availableTables: allTables.map((t: any) => ({ id: t.id, name: t.name, capacity: t.capacity || 4 })),
          isDemoFallback: true
        });
      }
    }

    const result: any = {
      valid: true,
      table: {
        id: table.id,
        name: table.name,
        capacity: table.capacity || 4,
        seatingType: table.seatingType || 'Booth',
        zone: table.zone || 'Main'
      }
    };

    // Validate capacity if partySize provided
    if (partySize !== undefined && partySize !== null) {
      const capacity = table.capacity || 4;
      if (partySize > capacity) {
        result.valid = false;
        result.capacityError = `Table "${table.name}" has capacity of ${capacity} but party size is ${partySize}.`;
        
        // Suggest larger tables
        const largerTables = tables
          .filter((t: any) => (t.capacity || 4) >= partySize)
          .sort((a: any, b: any) => (a.capacity || 4) - (b.capacity || 4))
          .slice(0, 3)
          .map((t: any) => ({ id: t.id, name: t.name, capacity: t.capacity || 4 }));

        result.suggestions = largerTables;
      } else {
        result.capacityValid = true;
      }
    }

    // Check availability if requested
    if (checkAvailability) {
      try {
        const activeSession = await prisma.session.findFirst({
          where: {
            OR: [
              { tableId: table.id },
              { tableId: table.name },
              { tableId: String(tableId).trim() },
            ],
            state: { notIn: ['CLOSED', 'CANCELED'] as any }
          },
          select: {
            id: true,
            tableId: true,
            state: true,
            customerRef: true
          }
        });

        if (activeSession) {
          result.available = false;
          result.hasActiveSession = true;
          result.activeSessionId = activeSession.id;
          result.error = `Table "${table.name}" is currently occupied by an active session.`;
        } else {
          result.available = true;
          result.hasActiveSession = false;
        }
      } catch (error) {
        console.error('[Table Validation API] Error checking availability:', error);
        // Don't fail validation if availability check fails
        result.available = undefined;
        result.availabilityCheckError = 'Could not check availability';
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('[Table Validation API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to validate table',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

