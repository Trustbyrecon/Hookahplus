import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/lounges - Save lounge layout
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, tables } = body;

    // Handle save_layout action
    if (action === 'save_layout' && tables) {
      try {
        // Store layout data in OrgSetting as JSON
        // This allows the app build to access table configurations for:
        // - Session creation (validate tableId exists)
        // - Table assignment (match session to table configuration)
        // - Capacity management (check if table can accommodate party size)
        // - Zone/area routing (assign staff based on table zones)
        // - QR code generation (use table coordinates and metadata)
        
        const layoutData = {
          tables: tables.map((table: any) => ({
            id: table.id,
            name: table.name,
            seatingType: table.seatingType || 'Booth',
            capacity: table.capacity || 4,
            coordinates: {
              x: table.x || 0,
              y: table.y || 0
            },
            zone: table.seatingType === 'VIP' ? 'VIP' : 
                  table.seatingType === 'Outdoor' ? 'Outdoor' :
                  table.seatingType === 'Private Room' ? 'Private' : 'Main'
          })),
          updatedAt: new Date().toISOString()
        };

        // Upsert layout setting
        await prisma.orgSetting.upsert({
          where: { key: 'lounge_layout' },
          update: {
            value: JSON.stringify(layoutData),
            updatedAt: new Date()
          },
          create: {
            key: 'lounge_layout',
            value: JSON.stringify(layoutData),
            description: 'Lounge floor plan layout with table configurations',
            category: 'ui',
            isActive: true
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Lounge layout saved successfully',
          tables: tables.length,
          usage: 'Layout data will be used for: table validation, capacity management, zone routing, QR code generation, and session assignment'
        });
      } catch (error) {
        console.error('Error saving layout:', error);
        return NextResponse.json({ 
          error: 'Failed to save layout',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      error: 'Invalid action or missing tables data' 
    }, { status: 400 });

  } catch (error) {
    console.error('Error in lounges API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/lounges - Retrieve lounge layout and list of available lounges
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const layoutOnly = searchParams.get('layout') === 'true'; // For layout data specifically

    // Default: Return lounge list (for QR generator dropdown)
    // This is what the QR generator expects: { success: true, lounges: [...] }
    const lounges = [
      {
        lounge_id: 'HOPE_GLOBAL_FORUM',
        lounge_name: 'Hope Global Forum',
        slug: 'hope-global-forum',
      },
      // Add other lounges here as needed
    ];

    // If specifically requesting layout data
    if (layoutOnly) {
      const layoutSetting = await prisma.orgSetting.findUnique({
        where: { key: 'lounge_layout' }
      });

      if (!layoutSetting) {
        return NextResponse.json({
          success: true,
          layout: null,
          message: 'No layout configured yet'
        });
      }

      const layoutData = JSON.parse(layoutSetting.value);
      
      return NextResponse.json({
        success: true,
        layout: layoutData
      });
    }

    // Default: Return lounge list for QR generator
    return NextResponse.json({
      success: true,
      lounges,
      total: lounges.length,
    });
  } catch (error) {
    console.error('Error retrieving lounges:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve lounges',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

