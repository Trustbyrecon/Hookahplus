import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    
    const { tableId, partySize, checkAvailability = true } = body || {};

    if (!tableId) {
      return NextResponse.json(
        { error: 'Missing required field: tableId' },
        { status: 400 }
      );
    }

    // Load layout
    let layoutSetting;
    try {
      layoutSetting = await prisma.orgSetting.findUnique({
        where: { key: 'lounge_layout' }
      });
    } catch (error) {
      console.error('[Table Validation API] Error loading layout:', error);
      // Return 200 with valid=false for missing layout (not a server error)
      return NextResponse.json({
        valid: false,
        error: 'No lounge layout configured. Please set up tables in Lounge Layout Manager first.',
        suggestion: 'Visit /lounge-layout to configure your tables'
      });
    }

    if (!layoutSetting) {
      return NextResponse.json({
        valid: false,
        error: 'No lounge layout configured. Please set up tables in Lounge Layout Manager first.',
        suggestion: 'Visit /lounge-layout to configure your tables'
      });
    }

    let layoutData;
    let tables: any[] = [];
    
    try {
      layoutData = JSON.parse(layoutSetting.value);
      tables = layoutData.tables || [];
    } catch (error) {
      console.error('[Table Validation API] Error parsing layout data:', error);
      return NextResponse.json({
        valid: false,
        error: 'Invalid lounge layout data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    // Find table
    let table = tables.find((t: any) => 
      t.id === tableId || 
      t.name === tableId ||
      t.name?.toLowerCase() === tableId.toLowerCase()
    );

    if (!table) {
      // Suggest similar table names
      const suggestions = tables
        .filter((t: any) => 
          t.name?.toLowerCase().includes(tableId.toLowerCase()) ||
          t.id?.toLowerCase().includes(tableId.toLowerCase())
        )
        .slice(0, 3)
        .map((t: any) => t.name || t.id);

      return NextResponse.json({
        valid: false,
        error: `Table "${tableId}" not found in lounge layout.`,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        availableTables: tables.map((t: any) => ({ id: t.id, name: t.name, capacity: t.capacity }))
      });
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
            tableId: table.id,
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

