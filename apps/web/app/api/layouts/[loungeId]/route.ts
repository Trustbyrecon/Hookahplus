// apps/web/app/api/layouts/[loungeId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Mock data for demonstration
const MOCK_SEATING_MAP = {
  "lounge_id": "atl-demo-001",
  "name": "Grove Park Demo Lounge",
  "version": "v1-api",
  "canvas": { "width": 1400, "height": 900 },
  "zones": [
    { "id": "zone_bar_A", "type": "bar_zone", "label": "Main Bar", "bounds": [60, 120, 520, 210] },
    { "id": "zone_booths_W", "type": "booth_zone", "label": "West Booth Wall", "bounds": [80, 260, 540, 380] },
    { "id": "zone_lounge_NE", "type": "lounge_zone", "label": "Northeast Lounge", "bounds": [760, 140, 1260, 420] },
    { "id": "zone_vip_SE", "type": "vip_zone", "label": "VIP Alcove (SE)", "bounds": [900, 520, 1260, 820] },
    { "id": "zone_patio_E", "type": "patio_zone", "label": "Patio (Glass Door)", "bounds": [1260, 200, 1380, 520] }
  ],
  "nodes": [
    {"id":"fixture_bar_counter","type":"fixture.bar_counter","position":{"x":80,"y":140},"size":{"w":460,"h":40},"data":{"zone":"zone_bar_A","tags":["service_edge"]}},
    {"id":"seat_stool_01","type":"seat.stool","position":{"x":110,"y":190},"size":{"w":20,"h":20},"data":{"zone":"zone_bar_A","capacity":1,"dim_in":{"seat_h":30,"ctr_h":42},"tags":["bar","stool"],"stripe_meta":{"session_id":null,"flavor_mix":null}}},
    {"id":"seat_stool_02","type":"seat.stool","position":{"x":155,"y":190},"size":{"w":20,"h":20},"data":{"zone":"zone_bar_A","capacity":1,"dim_in":{"seat_h":30,"ctr_h":42},"tags":["bar","stool"],"stripe_meta":{"session_id":null,"flavor_mix":null}}},
    {"id":"seat_stool_03","type":"seat.stool","position":{"x":200,"y":190},"size":{"w":20,"h":20},"data":{"zone":"zone_bar_A","capacity":1,"dim_in":{"seat_h":30,"ctr_h":42},"tags":["bar","stool"],"stripe_meta":{"session_id":null,"flavor_mix":null}}},
    {"id":"seat_stool_04","type":"seat.stool","position":{"x":245,"y":190},"size":{"w":20,"h":20},"data":{"zone":"zone_bar_A","capacity":1,"dim_in":{"seat_h":30,"ctr_h":42},"tags":["bar","stool"],"stripe_meta":{"session_id":null,"flavor_mix":null}}},
    {"id":"seat_stool_05","type":"seat.stool","position":{"x":290,"y":190},"size":{"w":20,"h":20},"data":{"zone":"zone_bar_A","capacity":1,"dim_in":{"seat_h":30,"ctr_h":42},"tags":["bar","stool"],"stripe_meta":{"session_id":null,"flavor_mix":null}}},
    {"id":"seat_stool_06","type":"seat.stool","position":{"x":335,"y":190},"size":{"w":20,"h":20},"data":{"zone":"zone_bar_A","capacity":1,"dim_in":{"seat_h":30,"ctr_h":42},"tags":["bar","stool"],"stripe_meta":{"session_id":null,"flavor_mix":null}}},
    {"id":"seat_stool_07","type":"seat.stool","position":{"x":380,"y":190},"size":{"w":20,"h":20},"data":{"zone":"zone_bar_A","capacity":1,"dim_in":{"seat_h":30,"ctr_h":42},"tags":["bar","stool"],"stripe_meta":{"session_id":null,"flavor_mix":null}}},
    {"id":"seat_stool_08","type":"seat.stool","position":{"x":425,"y":190},"size":{"w":20,"h":20},"data":{"zone":"zone_bar_A","capacity":1,"dim_in":{"seat_h":30,"ctr_h":42},"tags":["bar","stool"],"stripe_meta":{"session_id":null,"flavor_mix":null}}},
    {"id":"seat_stool_09","type":"seat.stool","position":{"x":470,"y":190},"size":{"w":20,"h":20},"data":{"zone":"zone_bar_A","capacity":1,"dim_in":{"seat_h":30,"ctr_h":42},"tags":["bar","stool"],"stripe_meta":{"session_id":null,"flavor_mix":null}}},

    {"id":"seat_booth_pair_01","type":"seat.booth_double","position":{"x":100,"y":300},"size":{"w":90,"h":60},"data":{"zone":"zone_booths_W","capacity":4,"dim_in":{"depth":49,"len_range":[60,90]},"tags":["booth","double"]}},
    {"id":"seat_booth_pair_02","type":"seat.booth_double","position":{"x":210,"y":300},"size":{"w":90,"h":60},"data":{"zone":"zone_booths_W","capacity":4,"dim_in":{"depth":49,"len_range":[60,90]},"tags":["booth","double"]}},
    {"id":"seat_booth_pair_03","type":"seat.booth_double","position":{"x":320,"y":300},"size":{"w":90,"h":60},"data":{"zone":"zone_booths_W","capacity":4,"dim_in":{"depth":49,"len_range":[60,90]},"tags":["booth","double"]}},
    {"id":"seat_booth_pair_04","type":"seat.booth_double","position":{"x":430,"y":300},"size":{"w":90,"h":60},"data":{"zone":"zone_booths_W","capacity":4,"dim_in":{"depth":49,"len_range":[60,90]},"tags":["booth","double"]}},

    // Lounge clusters
    {"id":"table_low_round_1","type":"table.low_round","position":{"x":900,"y":200},"size":{"w":36,"h":36},"data":{"zone":"zone_lounge_NE","tags":["coffee_table"]}},
    {"id":"seat_sofa_1","type":"seat.sofa","position":{"x":860,"y":240},"size":{"w":80,"h":28},"data":{"zone":"zone_lounge_NE","capacity":3,"tags":["sofa"]}},
    {"id":"seat_chair_L_1","type":"seat.lounge_chair","position":{"x":820,"y":190},"size":{"w":26,"h":26},"data":{"zone":"zone_lounge_NE","capacity":1,"tags":["lounge_chair"]}},
    {"id":"seat_chair_R_1","type":"seat.lounge_chair","position":{"x":980,"y":190},"size":{"w":26,"h":26},"data":{"zone":"zone_lounge_NE","capacity":1,"tags":["lounge_chair"]}},

    {"id":"table_low_round_2","type":"table.low_round","position":{"x":1080,"y":260},"size":{"w":36,"h":36},"data":{"zone":"zone_lounge_NE","tags":["coffee_table"]}},
    {"id":"seat_sofa_2","type":"seat.sofa","position":{"x":1040,"y":300},"size":{"w":80,"h":28},"data":{"zone":"zone_lounge_NE","capacity":3,"tags":["sofa"]}},
    {"id":"seat_chair_L_2","type":"seat.lounge_chair","position":{"x":1000,"y":250},"size":{"w":26,"h":26},"data":{"zone":"zone_lounge_NE","capacity":1,"tags":["lounge_chair"]}},
    {"id":"seat_chair_R_2","type":"seat.lounge_chair","position":{"x":1160,"y":250},"size":{"w":26,"h":26},"data":{"zone":"zone_lounge_NE","capacity":1,"tags":["lounge_chair"]}},

    {"id":"table_low_round_3","type":"table.low_round","position":{"x":980,"y":360},"size":{"w":36,"h":36},"data":{"zone":"zone_lounge_NE","tags":["coffee_table"]}},
    {"id":"seat_sofa_3","type":"seat.sofa","position":{"x":940,"y":400},"size":{"w":80,"h":28},"data":{"zone":"zone_lounge_NE","capacity":3,"tags":["sofa"]}},
    {"id":"seat_chair_L_3","type":"seat.lounge_chair","position":{"x":900,"y":350},"size":{"w":26,"h":26},"data":{"zone":"zone_lounge_NE","capacity":1,"tags":["lounge_chair"]}},
    {"id":"seat_chair_R_3","type":"seat.lounge_chair","position":{"x":1060,"y":350},"size":{"w":26,"h":26},"data":{"zone":"zone_lounge_NE","capacity":1,"tags":["lounge_chair"]}},

    // VIP high-tops + stools
    {"id":"table_high_1","type":"table.high_round","position":{"x":960,"y":600},"size":{"w":30,"h":30},"data":{"zone":"zone_vip_SE","tags":["high_top"]}},
    {"id":"seat_vip_stool_1_1","type":"seat.stool","position":{"x":938,"y":574},"size":{"w":18,"h":18},"data":{"zone":"zone_vip_SE","capacity":1,"tags":["stool","vip"]}},
    {"id":"seat_vip_stool_1_2","type":"seat.stool","position":{"x":982,"y":574},"size":{"w":18,"h":18},"data":{"zone":"zone_vip_SE","capacity":1,"tags":["stool","vip"]}},
    {"id":"seat_vip_stool_1_3","type":"seat.stool","position":{"x":938,"y":626},"size":{"w":18,"h":18},"data":{"zone":"zone_vip_SE","capacity":1,"tags":["stool","vip"]}},
    {"id":"seat_vip_stool_1_4","type":"seat.stool","position":{"x":982,"y":626},"size":{"w":18,"h":18},"data":{"zone":"zone_vip_SE","capacity":1,"tags":["stool","vip"]}},

    {"id":"table_high_2","type":"table.high_round","position":{"x":1120,"y":680},"size":{"w":30,"h":30},"data":{"zone":"zone_vip_SE","tags":["high_top"]}},
    {"id":"seat_vip_stool_2_1","type":"seat.stool","position":{"x":1098,"y":654},"size":{"w":18,"h":18},"data":{"zone":"zone_vip_SE","capacity":1,"tags":["stool","vip"]}},
    {"id":"seat_vip_stool_2_2","type":"seat.stool","position":{"x":1142,"y":654},"size":{"w":18,"h":18},"data":{"zone":"zone_vip_SE","capacity":1,"tags":["stool","vip"]}},
    {"id":"seat_vip_stool_2_3","type":"seat.stool","position":{"x":1098,"y":706},"size":{"w":18,"h":18},"data":{"zone":"zone_vip_SE","capacity":1,"tags":["stool","vip"]}},
    {"id":"seat_vip_stool_2_4","type":"seat.stool","position":{"x":1142,"y":706},"size":{"w":18,"h":18},"data":{"zone":"zone_vip_SE","capacity":1,"tags":["stool","vip"]}}
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
