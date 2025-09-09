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

// Simple UI components - replace with your preferred UI library
const Button = ({ children, className = "", onClick, disabled = false, variant = "default", ...props }) => (
  <button
    className={`px-4 py-2 rounded-md font-medium transition-colors ${
      variant === "outline" 
        ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50" 
        : "bg-blue-600 text-white hover:bg-blue-700"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

const Badge = ({ children, variant = "default", className = "" }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    variant === "secondary" 
      ? "bg-gray-100 text-gray-800" 
      : "bg-blue-100 text-blue-800"
  } ${className}`}>
    {children}
  </span>
);

/**
 * Hookah+ Operator Dashboard – React Flow Preview
 * Agent-ready scaffold for "cursor agent" to wire in file I/O and actions.
 *
 * How to use:
 * - Drop into your dashboard route.
 * - Replace MOCK_* with runtime fetch to your artifacts endpoint or sandbox files.
 * - Cursor agent hooks are marked with // [cursor-agent] comments.
 */

// --- TYPES ----------------------------------------------------------------
interface SeatingNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  data: {
    zone: string;
    capacity?: number;
    status: string;
    session: {
      session_id: string | null;
      started_at: string | null;
      assigned_staff: string | null;
    };
    stripe_meta: {
      flavor_mix: string | null;
      price_cents: number | null;
    };
    tags: string[];
  };
}

interface SeatingMap {
  lounge_id: string;
  name: string;
  version: string;
  canvas: { width: number; height: number };
  zones: Array<{
    id: string;
    label: string;
    ops_role: string;
    type: string;
  }>;
  nodes: SeatingNode[];
  edges: any[];
  ops: {
    filters: { FOH: string[]; BOH: string[] };
    actions: {
      fire_session: {
        target: string;
        payload_template: Record<string, string>;
      };
    };
  };
}

// --- HELPERS ---------------------------------------------------------------
function toFlowNodes(seatingMap: SeatingMap) {
  return seatingMap.nodes.map((n) => ({
    id: n.id,
    type: "default",
    position: { x: n.position.x, y: n.position.y },
    data: {
      raw: n,
      label: (
        <div className="text-xs">
          <div className="font-medium">{n.type}</div>
          {n.data?.sequence && <div className="text-blue-600 font-bold">#{n.data.sequence}</div>}
          {n.data?.zone && <div className="opacity-70">{n.data.zone}</div>}
        </div>
      ),
    },
    style: styleForType(n.type),
  }));
}

function styleForType(t: string) {
  const base = { 
    borderRadius: 12, 
    padding: 6, 
    border: "1px solid rgba(0,0,0,.1)", 
    boxShadow: "0 1px 2px rgba(0,0,0,.1)", 
    background: "white" 
  };
  if (t.startsWith("fixture")) return { ...base, background: "#f9fafb", border: "1px dashed rgba(0,0,0,.2)" };
  if (t.includes("booth")) return { ...base, background: "#fff7ed" };
  if (t.includes("stool")) return { ...base, background: "#eef2ff" };
  if (t.includes("sofa") || t.includes("lounge_chair")) return { ...base, background: "#ecfeff" };
  if (t.includes("table")) return { ...base, background: "#f0fdf4" };
  return base;
}

export default function HookahFlowPreview() {
  const [seating, setSeating] = useState<SeatingMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SeatingNode | null>(null);

  // Fetch seating map from hosted JSON
  useEffect(() => {
    const fetchSeatingMap = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to load from deployed seating map first
        const deployedMap = localStorage.getItem('lounge_seating_map');
        if (deployedMap) {
          const parsedMap = JSON.parse(deployedMap);
          setSeating(parsedMap);
          return;
        }

        // Fallback to API fetch
        const response = await fetch('/api/layouts/atl-demo-001');
        if (response.ok) {
          const data = await response.json();
          setSeating(data.data.seatingMap);
        } else {
          throw new Error('Failed to fetch seating map');
        }
      } catch (err) {
        console.error('Load error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load seating map');
      } finally {
        setLoading(false);
      }
    };

    fetchSeatingMap();
  }, []);

  const baseNodes = useMemo(() => seating ? toFlowNodes(seating) : [], [seating]);
  const nodesAll = useMemo(() => baseNodes, [baseNodes]);
  const edgesAll = useMemo(() => [], []);

  const [nodes, setNodes, onNodesChange] = useNodesState(nodesAll);
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesAll);

  const onNodeClick = (_, node) => setSelected(node.data?.raw || node);

  // Sync derived nodes/edges when data changes
  useEffect(() => { 
    setNodes(nodesAll); 
    setEdges(edgesAll); 
  }, [nodesAll, edgesAll, setNodes, setEdges]);

  // Fire Session handler - calls real API
  const handleFireSession = async (seatData: SeatingNode) => {
    try {
      const payload = {
        action: 'create',
        sessionId: `session_${Date.now()}`,
        tableId: seatData.id,
        flavorMix: seatData.data.stripe_meta?.flavor_mix || 'Default Mix',
        prepStaffId: 'staff_001', // Default staff ID
        metadata: {
          zone: seatData.data.zone,
          capacity: seatData.data.capacity,
          timestamp: new Date().toISOString(),
          lounge_id: seating?.lounge_id
        }
      };

      console.log('Creating fire session with payload:', payload);

      const response = await fetch('/api/fire-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Fire session response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Fire session created successfully:', result);
        alert(`✅ Fire Session Created!\nSession ID: ${result.session?.id || result.id}\nTable: ${seatData.id}\nZone: ${seatData.data.zone}`);
      } else {
        let errorMessage = 'Unknown error';
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || 'Unknown error';
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        alert(`❌ Failed to create session: ${errorMessage}`);
      }
    } catch (err) {
      console.error('Fire session error:', err);
      alert(`❌ Error creating fire session: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // [cursor-agent] Wire this to file picker or sandbox fetch
  const handleLoadJson = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load from deployed seating map first
      const deployedMap = localStorage.getItem('lounge_seating_map');
      if (deployedMap) {
        const parsedMap = JSON.parse(deployedMap);
        setSeating(parsedMap);
        alert("✅ Loaded deployed seating map from Visual Grounder!");
        return;
      }

      // Fallback to API fetch
      const response = await fetch('/api/layouts/atl-demo-001');
      if (response.ok) {
        const data = await response.json();
        setSeating(data.data.seatingMap);
        alert("✅ Loaded layout from API!");
      } else {
        alert("No deployed map found. Use Visual Grounder to create one first.");
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
    if (!seating) return;
    
    const suggestions = [];
    const nodes = seating.nodes;
    
    // Check for overlapping nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        // Calculate if nodes overlap
        const overlap = (
          node1.position.x < node2.position.x + node2.size.w &&
          node1.position.x + node1.size.w > node2.position.x &&
          node1.position.y < node2.position.y + node2.size.h &&
          node1.position.y + node1.size.h > node2.position.y
        );
        
        if (overlap) {
          suggestions.push(`Move ${node1.id} and ${node2.id} apart to prevent overlap`);
        }
      }
    }
    
    // Check for nodes too close together (less than 10px apart)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        const distance = Math.sqrt(
          Math.pow(node1.position.x - node2.position.x, 2) + 
          Math.pow(node1.position.y - node2.position.y, 2)
        );
        
        if (distance < 10 && distance > 0) {
          suggestions.push(`Increase spacing between ${node1.id} and ${node2.id} (currently ${distance.toFixed(1)}px)`);
        }
      }
    }
    
    if (suggestions.length === 0) {
      alert("✅ Layout looks good! No spacing issues detected.");
    } else {
      alert(`💡 Suggestions:\n\n${suggestions.slice(0, 5).join('\n')}${suggestions.length > 5 ? '\n...and more' : ''}`);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[88vh] p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading seating map...</p>
        </div>
      </div>
    );
  }

  if (error || !seating) {
    return (
      <div className="w-full h-[88vh] p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4">Failed to load seating map</p>
          <p className="text-zinc-400 text-sm mb-4">{error}</p>
          <Button onClick={handleLoadJson} variant="outline">
            Retry Load
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[88vh] p-4 grid grid-cols-12 gap-4">
      <div className="col-span-9">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              Hookah+ Layout Preview <Badge variant="secondary">{seating.name}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[78vh]">
            <div className="w-full h-full rounded-2xl overflow-hidden border">
              <ReactFlow 
                nodes={nodes} 
                edges={edges} 
                onNodesChange={onNodesChange} 
                onEdgesChange={onEdgesChange} 
                onNodeClick={onNodeClick}
                fitView
              >
                <Background />
                <Controls />
                <MiniMap zoomable pannable />
              </ReactFlow>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-3">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle>FOH/BOH Control Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm opacity-80">FOH/BOH seating-only mode. No routes or flow nodes.</div>
            
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide opacity-60">Selected Seat/Table</div>
              {selected ? (
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">ID:</span> {selected.id}</div>
                  <div><span className="font-medium">Type:</span> {selected.type}</div>
                  {selected.data?.sequence && <div><span className="font-medium">Sequence:</span> #{selected.data.sequence}</div>}
                  <div><span className="font-medium">Zone:</span> {selected.data?.zone}</div>
                  <div><span className="font-medium">Capacity:</span> {selected.data?.capacity ?? "—"}</div>
                  <div><span className="font-medium">Status:</span> {selected.data?.status ?? "idle"}</div>
                  <div><span className="font-medium">Session:</span> {selected.data?.session?.session_id ? "Active" : "None"}</div>
                  <div><span className="font-medium">Flavor:</span> {selected.data?.stripe_meta?.flavor_mix || "—"}</div>
                  {selected.data?.pos_terminal && <div className="text-blue-600 font-medium">🎯 POS Terminal</div>}
                  <Button 
                    className="w-full mt-2" 
                    onClick={() => handleFireSession(selected)}
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Fire Session"}
                  </Button>
                </div>
              ) : (
                <div className="text-sm opacity-70">Click a seat/table to view details.</div>
              )}
            </div>

            <div className="pt-2 text-sm opacity-80">
              <div className="font-medium mb-1">Session/Stripe Hooks</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Nodes include <code>status</code>, <code>session</code>, and <code>stripe_meta</code></li>
                <li><strong>Fire Session</strong> creates real session via API</li>
                <li>Use <code>ops.filters</code> to show FOH/BOH subsets</li>
              </ul>
            </div>

            <div className="pt-2 space-y-2">
              <Button onClick={handleLoadJson} variant="outline" className="w-full">
                Reload Layout
              </Button>
              <Button onClick={handleSuggest} variant="outline" className="w-full">
                Suggest Improvements
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}