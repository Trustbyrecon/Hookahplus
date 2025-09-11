// apps/web/app/api/layouts/[loungeId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Mock data for demonstration
const MOCK_SEATING_MAP = {
  "lounge_id": "atl-demo-001",
  "name": "Grove Park Demo Lounge",
  "version": "v1-api",
  "canvas": { "width": 1400, "height": 900 },
  "zones": [
    { "id": "zone_bar_A", "type": "bar_zone", "label": "Main Bar", "bounds": [400, 120, 900, 320] },
    { "id": "zone_booths_W", "type": "booth_zone", "label": "West Booth Wall", "bounds": [80, 140, 340, 300] },
    { "id": "zone_lounge_NE", "type": "lounge_zone", "label": "Northeast Lounge", "bounds": [740, 90, 900, 250] },
    { "id": "zone_vip_SE", "type": "vip_zone", "label": "VIP Alcove (SE)", "bounds": [80, 340, 140, 430] },
    { "id": "zone_patio_E", "type": "patio_zone", "label": "Patio (Glass Door)", "bounds": [1260, 200, 1380, 520] }
  ],
  "nodes": [
    // POS Terminal (Bar Counter) - Central position with better spacing
    {"id":"fixture_bar_counter","type":"fixture.bar_counter","position":{"x":400,"y":200},"size":{"w":500,"h":50},"data":{"zone":"zone_bar_A","tags":["pos_terminal","service_edge"],"pos_terminal":true,"sequence":0}},
    
    // Bar Area - Stools (sequenced 1-8, arranged above and below counter with better spacing)
    {"id":"seat_stool_01","type":"seat.stool","position":{"x":420,"y":140},"size":{"w":30,"h":30},"data":{"zone":"zone_bar_A","capacity":1,"status":"idle","sequence":1,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["bar","stool","pos_connected"]}},
    {"id":"seat_stool_02","type":"seat.stool","position":{"x":470,"y":140},"size":{"w":30,"h":30},"data":{"zone":"zone_bar_A","capacity":1,"status":"idle","sequence":2,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["bar","stool","pos_connected"]}},
    {"id":"seat_stool_03","type":"seat.stool","position":{"x":520,"y":140},"size":{"w":30,"h":30},"data":{"zone":"zone_bar_A","capacity":1,"status":"idle","sequence":3,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["bar","stool","pos_connected"]}},
    {"id":"seat_stool_04","type":"seat.stool","position":{"x":570,"y":140},"size":{"w":30,"h":30},"data":{"zone":"zone_bar_A","capacity":1,"status":"idle","sequence":4,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["bar","stool","pos_connected"]}},
    {"id":"seat_stool_05","type":"seat.stool","position":{"x":420,"y":270},"size":{"w":30,"h":30},"data":{"zone":"zone_bar_A","capacity":1,"status":"idle","sequence":5,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["bar","stool","pos_connected"]}},
    {"id":"seat_stool_06","type":"seat.stool","position":{"x":470,"y":270},"size":{"w":30,"h":30},"data":{"zone":"zone_bar_A","capacity":1,"status":"idle","sequence":6,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["bar","stool","pos_connected"]}},
    {"id":"seat_stool_07","type":"seat.stool","position":{"x":520,"y":270},"size":{"w":30,"h":30},"data":{"zone":"zone_bar_A","capacity":1,"status":"idle","sequence":7,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["bar","stool","pos_connected"]}},
    {"id":"seat_stool_08","type":"seat.stool","position":{"x":570,"y":270},"size":{"w":30,"h":30},"data":{"zone":"zone_bar_A","capacity":1,"status":"idle","sequence":8,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["bar","stool","pos_connected"]}},

    // Booth Area - Left Side (better organized in 2x2 grid)
    {"id":"seat_booth_pair_01","type":"seat.booth_double","position":{"x":100,"y":150},"size":{"w":100,"h":60},"data":{"zone":"zone_booths_W","capacity":4,"status":"idle","sequence":9,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["booth","double"]}},
    {"id":"seat_booth_pair_02","type":"seat.booth_double","position":{"x":220,"y":150},"size":{"w":100,"h":60},"data":{"zone":"zone_booths_W","capacity":4,"status":"idle","sequence":10,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["booth","double"]}},
    {"id":"seat_booth_pair_03","type":"seat.booth_double","position":{"x":100,"y":230},"size":{"w":100,"h":60},"data":{"zone":"zone_booths_W","capacity":4,"status":"idle","sequence":11,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["booth","double"]}},
    {"id":"seat_booth_pair_04","type":"seat.booth_double","position":{"x":220,"y":230},"size":{"w":100,"h":60},"data":{"zone":"zone_booths_W","capacity":4,"status":"idle","sequence":12,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["booth","double"]}},

    // Lounge Area - Top Right (3 columns as shown in second image for better clarity)
    // Top Row - Lounge Chairs
    {"id":"seat_lounge_chair_01","type":"seat.lounge_chair","position":{"x":750,"y":100},"size":{"w":35,"h":35},"data":{"zone":"zone_lounge_NE","capacity":1,"status":"idle","sequence":13,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["lounge","chair"]}},
    {"id":"seat_lounge_chair_02","type":"seat.lounge_chair","position":{"x":800,"y":100},"size":{"w":35,"h":35},"data":{"zone":"zone_lounge_NE","capacity":1,"status":"idle","sequence":14,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["lounge","chair"]}},
    {"id":"seat_lounge_chair_03","type":"seat.lounge_chair","position":{"x":850,"y":100},"size":{"w":35,"h":35},"data":{"zone":"zone_lounge_NE","capacity":1,"status":"idle","sequence":15,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["lounge","chair"]}},
    
    // Middle Row - Sofas
    {"id":"seat_sofa_01","type":"seat.sofa","position":{"x":750,"y":150},"size":{"w":45,"h":35},"data":{"zone":"zone_lounge_NE","capacity":3,"status":"idle","sequence":16,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["lounge","sofa"]}},
    {"id":"seat_sofa_02","type":"seat.sofa","position":{"x":800,"y":150},"size":{"w":45,"h":35},"data":{"zone":"zone_lounge_NE","capacity":3,"status":"idle","sequence":17,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["lounge","sofa"]}},
    {"id":"seat_sofa_03","type":"seat.sofa","position":{"x":850,"y":150},"size":{"w":45,"h":35},"data":{"zone":"zone_lounge_NE","capacity":3,"status":"idle","sequence":18,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["lounge","sofa"]}},
    
    // Bottom Row - Tables
    {"id":"table_low_round_01","type":"table.low_round","position":{"x":750,"y":200},"size":{"w":35,"h":35},"data":{"zone":"zone_lounge_NE","capacity":4,"status":"idle","sequence":19,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["lounge","table"]}},
    {"id":"table_low_round_02","type":"table.low_round","position":{"x":800,"y":200},"size":{"w":35,"h":35},"data":{"zone":"zone_lounge_NE","capacity":4,"status":"idle","sequence":20,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["lounge","table"]}},
    {"id":"table_low_round_03","type":"table.low_round","position":{"x":850,"y":200},"size":{"w":35,"h":35},"data":{"zone":"zone_lounge_NE","capacity":4,"status":"idle","sequence":21,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["lounge","table"]}},

    // VIP Area - Bottom Left (as shown in second image for better clarity)
    {"id":"seat_stool_09","type":"seat.stool","position":{"x":100,"y":350},"size":{"w":30,"h":30},"data":{"zone":"zone_vip_SE","capacity":1,"status":"idle","sequence":22,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["vip","stool"]}},
    {"id":"seat_stool_10","type":"seat.stool","position":{"x":100,"y":390},"size":{"w":30,"h":30},"data":{"zone":"zone_vip_SE","capacity":1,"status":"idle","sequence":23,"session":{"session_id":null,"started_at":null,"assigned_staff":null},"stripe_meta":{"flavor_mix":null,"price_cents":null},"tags":["vip","stool"]}},
  ],
  "edges": [],
  "meta": { "notes": "API mock derived from public Atlanta lounge photos; positions approximate for demo.", "source": "api_mock", "generated_at": "2025-09-03" }
};

const MOCK_ROUTES = {
  "lounge_id": "atl-demo-001",
  "version": "v1-api",
  "routes": [
    { "id": "route_main", "label": "Main Circulation", "polyline": [[70,240],[620,240],[740,240],[900,240],[1080,260],[1250,300]], "weight": 1.0, "notes": "Primary path along bar to lounge and patio door" },
    { "id": "route_branch_vip", "label": "VIP Branch", "polyline": [[1080,260],[1080,560],[1120,680]], "weight": 0.8, "notes": "Branch to VIP alcove high-tops" },
    { "id": "route_booth_loop", "label": "Booth Loop", "polyline": [[120,340],[260,340],[380,340],[500,340]], "weight": 0.6, "notes": "Local pass in front of booth wall" }
  ],
  "meta": { "notes": "API mock routes inferred from demo seating; edit freely in Dashboard.", "generated_at": "2025-09-03" }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { loungeId: string } }
) {
  try {
    const { loungeId } = params;

    // In production, this would fetch from a database or file system
    // For now, return mock data based on lounge ID
    if (loungeId === 'atl-demo-001') {
      return NextResponse.json({
        success: true,
        data: {
          seatingMap: MOCK_SEATING_MAP,
          routes: MOCK_ROUTES
        }
      });
    }

    // Check if there's a deployed seating map in localStorage (this won't work server-side)
    // In a real implementation, you'd store this in a database
    if (loungeId === 'deployed') {
      // This is a placeholder - in production, you'd fetch from your database
      return NextResponse.json({
        success: true,
        data: {
          seatingMap: MOCK_SEATING_MAP,
          routes: MOCK_ROUTES
        }
      });
    }

    // Return 404 for unknown lounge IDs
    return NextResponse.json(
      { success: false, error: `Lounge ${loungeId} not found` },
      { status: 404 }
    );

  } catch (error) {
    console.error('Layout API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch layout' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { loungeId: string } }
) {
  try {
    const { loungeId } = params;
    const body = await request.json();

    // In production, this would save to a database or file system
    console.log(`Saving layout for lounge ${loungeId}:`, body);

    return NextResponse.json({
      success: true,
      message: `Layout saved for lounge ${loungeId}`,
      data: { loungeId, ...body }
    });

  } catch (error) {
    console.error('Layout save error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save layout' },
      { status: 500 }
    );
  }
}
