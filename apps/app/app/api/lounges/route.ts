import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

type LayoutProvenance = {
  source?: 'manual' | 'ai_photos';
  sourceRef?: string;
  confidence?: number;
  confidenceSummary?: 'low' | 'medium' | 'high';
};

function layoutKey(loungeId: string) {
  return `lounge_layout:${loungeId}`;
}

// POST /api/lounges - Save lounge layout
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, tables, loungeId, provenance } = body as {
      action?: string;
      tables?: any[];
      loungeId?: string;
      provenance?: LayoutProvenance;
    };

    // Handle save_layout action
    if (action === 'save_layout' && tables) {
      try {
        const effectiveLoungeId = String(loungeId || '').trim();
        if (!effectiveLoungeId) {
          return NextResponse.json({ error: 'Missing required field: loungeId' }, { status: 400 });
        }

        const key = layoutKey(effectiveLoungeId);

        // Determine next layout version
        const prior = await prisma.orgSetting
          .findUnique({ where: { key }, select: { value: true } })
          .catch(() => null);
        let nextVersion = 1;
        if (prior?.value) {
          try {
            const parsed = JSON.parse(prior.value);
            const prev = Number(parsed?.layoutVersion || parsed?.meta?.layoutVersion || 0);
            if (Number.isFinite(prev) && prev > 0) nextVersion = prev + 1;
          } catch {
            // ignore
          }
        }

        // Store layout data in OrgSetting as JSON
        // This allows the app build to access table configurations for:
        // - Session creation (validate tableId exists)
        // - Table assignment (match session to table configuration)
        // - Capacity management (check if table can accommodate party size)
        // - Zone/area routing (assign staff based on table zones)
        // - QR code generation (use table coordinates and metadata)
        
        const layoutData = {
          loungeId: effectiveLoungeId,
          layoutVersion: nextVersion,
          meta: {
            loungeId: effectiveLoungeId,
            layoutVersion: nextVersion,
            source: provenance?.source || 'manual',
            sourceRef: provenance?.sourceRef || null,
            confidence: typeof provenance?.confidence === 'number' ? provenance.confidence : null,
            confidenceSummary: provenance?.confidenceSummary || null,
          },
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

        await prisma.orgSetting.upsert({
          where: { key },
          update: {
            value: JSON.stringify(layoutData),
            isActive: true,
          },
          create: {
            key,
            value: JSON.stringify(layoutData),
            description: `Lounge floor plan layout for ${effectiveLoungeId}`,
            category: 'ui',
            isActive: true,
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Lounge layout saved successfully',
          tables: tables.length,
          loungeId: effectiveLoungeId,
          layoutVersion: nextVersion,
          updatedAt: layoutData.updatedAt,
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
    const loungeId = (searchParams.get('loungeId') || '').trim();

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
      try {
        const effectiveLoungeId = loungeId || 'HOPE_GLOBAL_FORUM';
        const key = layoutKey(effectiveLoungeId);

        // Backward compatible read: try scoped key first, then legacy global key.
        const layoutSetting =
          (await prisma.orgSetting.findUnique({ where: { key } })) ||
          (await prisma.orgSetting.findUnique({ where: { key: 'lounge_layout' } }).catch(() => null));

        if (!layoutSetting) {
          // Fallback: FloorplanLayout (e.g. CODIGO pilot) when no OrgSetting
          if (effectiveLoungeId === 'CODIGO') {
            try {
              const floorplan = await prisma.floorplanLayout.findFirst({
                where: { loungeId: effectiveLoungeId },
                orderBy: { floorId: 'asc' },
              });
              if (floorplan?.nodes && Array.isArray(floorplan.nodes)) {
                const nodes = floorplan.nodes as Array<{ id?: string; label?: string; type?: string; x?: number; y?: number; capacity?: number }>;
                const tables = nodes.map((n) => ({
                  id: n.id || '',
                  name: n.label || n.id || '',
                  seatingType: n.type === 'kiosk' ? 'Kiosk' : 'Booth',
                  capacity: n.capacity ?? 4,
                  coordinates: { x: n.x ?? 0, y: n.y ?? 0 },
                  zone: 'Main Floor',
                }));
                return NextResponse.json({
                  success: true,
                  loungeId: effectiveLoungeId,
                  layoutVersion: 1,
                  layout: {
                    loungeId: effectiveLoungeId,
                    tables,
                    meta: { source: 'floorplan_layout' },
                    updatedAt: floorplan.updatedAt.toISOString(),
                  },
                });
              }
            } catch (fpError) {
              console.error('[Lounges API] FloorplanLayout fallback error:', fpError);
            }
          }
          return NextResponse.json({
            success: true,
            layout: null,
            message: 'No layout configured yet'
          });
        }

        const layoutData = JSON.parse(layoutSetting.value);
        
        return NextResponse.json({
          success: true,
          loungeId: layoutData?.loungeId || effectiveLoungeId,
          layoutVersion: layoutData?.layoutVersion || layoutData?.meta?.layoutVersion || null,
          layout: layoutData
        });
      } catch (dbError) {
        console.error('[Lounges API] Database error when fetching layout (non-blocking):', dbError);
        // Fall through to return lounge list even if layout fetch fails
      }
    }

    // Default: Return lounge list for QR generator
    console.log('[Lounges API] Returning lounge list:', JSON.stringify(lounges, null, 2));
    const response = {
      success: true,
      lounges,
      total: lounges.length,
    };
    console.log('[Lounges API] Response object:', JSON.stringify(response, null, 2));
    return NextResponse.json(response);
  } catch (error) {
    console.error('[Lounges API] Error retrieving lounges:', error);
    // Even on error, return at least Hope Global Forum
    return NextResponse.json({ 
      success: true,
      lounges: [
        {
          lounge_id: 'HOPE_GLOBAL_FORUM',
          lounge_name: 'Hope Global Forum',
          slug: 'hope-global-forum',
        },
      ],
      total: 1,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

