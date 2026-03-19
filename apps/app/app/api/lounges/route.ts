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

        // CODIGO: Also save to FloorplanLayout so FSD Floor tab uses saved layout as source of truth
        if (effectiveLoungeId === 'CODIGO') {
          const nodes = tables.map((t: any) => ({
            id: t.id,
            label: t.name || t.id,
            type: (t.seatingType || '').toLowerCase().includes('kiosk') ? 'kiosk' : 'table',
            x: typeof t.x === 'number' ? t.x : t.coordinates?.x ?? 50,
            y: typeof t.y === 'number' ? t.y : t.coordinates?.y ?? 50,
            capacity: t.capacity ?? 4,
          }));
          await prisma.floorplanLayout.upsert({
            where: { loungeId_floorId: { loungeId: effectiveLoungeId, floorId: 'F3' } },
            update: { nodes: nodes as object },
            create: {
              loungeId: effectiveLoungeId,
              floorId: 'F3',
              nodes: nodes as object,
            },
          }).catch((e) => console.warn('[Lounges] FloorplanLayout upsert failed:', e));
        }

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
      { lounge_id: 'CODIGO-Pilot', lounge_name: 'CODIGO Lounge', slug: 'codigo-pilot' },
      { lounge_id: 'YALLA_BY_SPACE', lounge_name: 'Yalla By Space', slug: 'yalla-by-space' },
      { lounge_id: 'DON_TITO', lounge_name: "Don Tito", slug: 'don-tito' },
      { lounge_id: 'OPERA_ULTRA', lounge_name: 'Opera Ultra Lounge', slug: 'opera-ultra-lounge' },
      { lounge_id: 'TAP_MGM', lounge_name: 'Tap MGM', slug: 'tap-mgm' },
      { lounge_id: 'DIABLOS_CANTINA', lounge_name: "Diablo's Cantina", slug: 'diablos-cantina' },
      { lounge_id: 'THE_BULLPEN_DC', lounge_name: 'The Bullpen DC', slug: 'the-bullpen-dc' },
      { lounge_id: 'ABIGAIL_DC', lounge_name: 'Abigail DC', slug: 'abigail-dc' },
      { lounge_id: 'SOCIETY_LOUNGE', lounge_name: 'Society Restaurant & Lounge', slug: 'society-restaurant-lounge' },
      { lounge_id: 'SPACE_DC', lounge_name: 'Space DC', slug: 'space-dc' },
      { lounge_id: 'ST_YVES', lounge_name: 'St Yves', slug: 'st-yves' },
      { lounge_id: 'ARLINGTON_BEER_GARDEN', lounge_name: 'Arlington Beer Garden', slug: 'arlington-beer-garden' },
      { lounge_id: 'FELT_LOUNGE', lounge_name: 'FELT Bar & Lounge', slug: 'felt-bar-lounge' },
    ];

    // If specifically requesting layout data
    if (layoutOnly) {
      try {
        const effectiveLoungeId = loungeId || 'CODIGO';
        const key = layoutKey(effectiveLoungeId);

        // Prefer FloorplanLayout for lounges that use it (e.g. CODIGO operator at /codigo/operator).
        // This ensures table selection in Create Session modal uses the floorplan configured there.
        try {
          const floorplan = await prisma.floorplanLayout.findFirst({
            where: { loungeId: effectiveLoungeId },
            orderBy: { floorId: 'asc' },
          });
          if (floorplan?.nodes && Array.isArray(floorplan.nodes) && (floorplan.nodes as unknown[]).length > 0) {
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
          console.error('[Lounges API] FloorplanLayout read error:', fpError);
        }

        // Fallback: OrgSetting (Lounge Layout Manager)
        const layoutSetting =
          (await prisma.orgSetting.findUnique({ where: { key } })) ||
          (await prisma.orgSetting.findUnique({ where: { key: 'lounge_layout' } }).catch(() => null));

        if (layoutSetting) {
          const layoutData = JSON.parse(layoutSetting.value);
          return NextResponse.json({
            success: true,
            loungeId: layoutData?.loungeId || effectiveLoungeId,
            layoutVersion: layoutData?.layoutVersion || layoutData?.meta?.layoutVersion || null,
            layout: layoutData
          });
        }

        return NextResponse.json({
          success: true,
          layout: null,
          message: 'No layout configured yet'
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
        { lounge_id: 'CODIGO-Pilot', lounge_name: 'CODIGO Lounge', slug: 'codigo-pilot' },
      ],
      total: 1,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

