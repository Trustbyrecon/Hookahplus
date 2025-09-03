// apps/web/components/HookahFlowPreview.tsx
"use client";

import React, { useMemo, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

// --- MOCK DATA (inline for preview) ----------------------------------------
const MOCK_SEATING_MAP = {
  "lounge_id": "atl-demo-001",
  "name": "Grove Park Demo Lounge",
  "version": "v1-mock",
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
  "meta": { "notes": "Mock derived from public Atlanta lounge photos; positions approximate for demo.", "source": "internet_photos_demo", "generated_at": "2025-09-03" }
};

const MOCK_ROUTES = {
  "lounge_id": "atl-demo-001",
  "version": "v1-mock",
  "routes": [
    { "id": "route_main", "label": "Main Circulation", "polyline": [[70,240],[620,240],[740,240],[900,240],[1080,260],[1250,300]], "weight": 1.0, "notes": "Primary path along bar to lounge and patio door" },
    { "id": "route_branch_vip", "label": "VIP Branch", "polyline": [[1080,260],[1080,560],[1120,680]], "weight": 0.8, "notes": "Branch to VIP alcove high-tops" },
    { "id": "route_booth_loop", "label": "Booth Loop", "polyline": [[120,340],[260,340],[380,340],[500,340]], "weight": 0.6, "notes": "Local pass in front of booth wall" }
  ],
  "meta": { "notes": "Mock routes inferred from demo seating; edit freely in Dashboard.", "generated_at": "2025-09-03" }
};

// --- HELPERS ---------------------------------------------------------------
function toFlowNodes(seatingMap: any) {
  return seatingMap.nodes.map((n: any) => ({
    id: n.id,
    type: "default",
    position: { x: n.position.x, y: n.position.y },
    data: {
      label: (
        <div className="text-xs">
          <div className="font-medium">{n.type}</div>
          {n.data?.zone && <div className="opacity-70">{n.data.zone}</div>}
        </div>
      ),
    },
    style: styleForType(n.type),
  }));
}

function styleForType(t: string) {
  const base = { borderRadius: 12, padding: 6, border: "1px solid rgba(0,0,0,.1)", boxShadow: "0 1px 2px rgba(0,0,0,.1)", background: "white" };
  if (t.startsWith("fixture")) return { ...base, background: "#f9fafb", border: "1px dashed rgba(0,0,0,.2)" };
  if (t.includes("booth")) return { ...base, background: "#fff7ed" };
  if (t.includes("stool")) return { ...base, background: "#eef2ff" };
  if (t.includes("sofa") || t.includes("lounge_chair")) return { ...base, background: "#ecfeff" };
  if (t.includes("table")) return { ...base, background: "#f0fdf4" };
  return base;
}

function toRouteEdges(routes: any) {
  // Represent each polyline segment as a separate edge for clarity
  const edges: any[] = [];
  routes.routes.forEach((r: any) => {
    for (let i = 0; i < r.polyline.length - 1; i++) {
      const id = `${r.id}-${i}`;
      // Fake nodes for route points (not displayed as nodes); we'll connect via edges using special ids
      edges.push({
        id,
        source: `${r.id}-p${i}`,
        target: `${r.id}-p${i + 1}`,
        animated: true,
        style: { strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { label: r.label },
      });
    }
  });
  return edges;
}

function routePointNodes(routes: any) {
  const nodes: any[] = [];
  routes.routes.forEach((r: any) => {
    r.polyline.forEach((pt: number[], idx: number) => {
      nodes.push({
        id: `${r.id}-p${idx}`,
        type: "default",
        position: { x: pt[0], y: pt[1] },
        data: { label: idx === 0 ? <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{r.label}</span> : null },
        style: { width: 6, height: 6, borderRadius: 999, background: "#111827", border: "1px solid #9ca3af" },
      })
    })
  })
  return nodes;
}

export default function HookahFlowPreview() {
  const [seating, setSeating] = useState(MOCK_SEATING_MAP);
  const [routes, setRoutes] = useState(MOCK_ROUTES);
  const [showRoutes, setShowRoutes] = useState(true);
  const [loading, setLoading] = useState(false);

  const baseNodes = useMemo(() => toFlowNodes(seating), [seating]);
  const routeNodes = useMemo(() => routePointNodes(routes), [routes]);
  const routeEdges = useMemo(() => toRouteEdges(routes), [routes]);

  const nodesAll = useMemo(() => showRoutes ? [...baseNodes, ...routeNodes] : baseNodes, [baseNodes, routeNodes, showRoutes]);
  const edgesAll = useMemo(() => showRoutes ? routeEdges : [], [routeEdges, showRoutes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(nodesAll);
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesAll);

  // Sync derived nodes/edges when toggling routes
  useEffect(() => { setNodes(nodesAll); setEdges(edgesAll); }, [nodesAll, edgesAll, setNodes, setEdges]);

  // [cursor-agent] Wire this to file picker or sandbox fetch
  const handleLoadJson = async () => {
    setLoading(true);
    try {
      // Try to load from deployed seating map first
      const deployedMap = localStorage.getItem('lounge_seating_map');
      if (deployedMap) {
        const parsedMap = JSON.parse(deployedMap);
        setSeating(parsedMap);
        alert("✅ Loaded deployed seating map from Visual Grounder!");
      } else {
        // Fallback to API fetch
        const response = await fetch('/api/layouts/atl-demo-001');
        if (response.ok) {
          const data = await response.json();
          setSeating(data.seatingMap);
          setRoutes(data.routes);
          alert("✅ Loaded layout from API!");
        } else {
          alert("No deployed map found. Use Visual Grounder to create one first.");
        }
      }
    } catch (error) {
      console.error('Load error:', error);
      alert("Failed to load layout. Using mock data.");
    } finally {
      setLoading(false);
    }
  };

  // [cursor-agent] Auto-suggest minor seat spacing tweaks
  const handleSuggest = () => {
    alert("💡 Suggestion: Move 2 stools ~10px apart near Main Bar to reduce clustering.");
  };

  // [cursor-agent] Export current layout
  const handleExport = () => {
    const dataStr = JSON.stringify({ seatingMap: seating, routes }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${seating.name.replace(/\s/g, '_')}_layout.json`;
    link.click();
  };

  return (
    <div className="w-full h-[88vh] p-4 grid grid-cols-12 gap-4">
      <div className="col-span-9">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 h-full">
          <div className="p-4 border-b border-zinc-700">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🗺️</span>
              <h2 className="text-xl font-semibold text-teal-300">Hookah+ Layout Preview</h2>
              <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded">{seating.name}</span>
            </div>
          </div>
          <div className="h-[78vh] p-4">
            <div className="w-full h-full rounded-2xl overflow-hidden border border-zinc-700">
              <ReactFlow 
                nodes={nodes} 
                edges={edges} 
                onNodesChange={onNodesChange} 
                onEdgesChange={onEdgesChange} 
                fitView
                className="bg-zinc-800"
              >
                <Background color="#374151" gap={20} />
                <Controls className="bg-zinc-800 border-zinc-700" />
                <MiniMap 
                  zoomable 
                  pannable 
                  className="bg-zinc-800 border-zinc-700"
                  nodeColor="#10b981"
                />
              </ReactFlow>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-3">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 h-full">
          <div className="p-4 border-b border-zinc-700">
            <h3 className="text-lg font-semibold text-white">Cursor Agent Panel</h3>
          </div>
          <div className="p-4 space-y-3">
            <button
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors"
              onClick={handleLoadJson}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load JSON'}
            </button>
            
            <button
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors"
              onClick={() => setShowRoutes((s) => !s)}
            >
              {showRoutes ? "Hide" : "Show"} Routes
            </button>
            
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              onClick={handleSuggest}
            >
              Suggest Adjustments
            </button>

            <button
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              onClick={handleExport}
            >
              Export Layout
            </button>

            <div className="pt-4 text-sm text-zinc-400">
              <div className="font-medium mb-2 text-white">Session/Stripe Hooks</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Each node carries <code className="bg-zinc-800 px-1 rounded">data.tags</code> for pricing and metadata</li>
                <li>Cursor can inject <code className="bg-zinc-800 px-1 rounded">stripe_meta</code> per seat</li>
                <li>Zone IDs map to dashboard filters</li>
              </ul>
            </div>
            
            <div className="pt-4 text-sm text-zinc-400">
              <div className="font-medium mb-2 text-white">How to integrate</div>
              <ol className="list-decimal list-inside space-y-1">
                <li>Replace MOCK_* with fetch to <code className="bg-zinc-800 px-1 rounded">/api/layouts/:lounge_id</code></li>
                <li>Bind Load JSON → file picker or sandbox path</li>
                <li>Wire Suggest Adjustments → Grounder service</li>
              </ol>
            </div>

            <div className="pt-4 text-sm text-zinc-400">
              <div className="font-medium mb-2 text-white">Stats</div>
              <div className="space-y-1">
                <div>Nodes: {seating.nodes.length}</div>
                <div>Zones: {seating.zones.length}</div>
                <div>Routes: {routes.routes.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
