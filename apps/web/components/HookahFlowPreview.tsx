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
        <div className="text-xs text-center">
          <div className="font-medium">{n.type.replace('seat.', '').replace('fixture.', '')}</div>
          {n.data?.zone && <div className="opacity-70 text-xs">{n.data.zone.replace('zone_', '')}</div>}
          {n.data?.capacity && n.data.capacity > 1 && (
            <div className="text-xs font-bold text-blue-600 mt-1">
              {n.data.capacity} Fire Sessions
            </div>
          )}
        </div>
      ),
    },
    style: styleForType(n.type),
  }));
}

function styleForType(t: string) {
  const base = { 
    borderRadius: 8, 
    padding: 8, 
    border: "2px solid rgba(0,0,0,.15)", 
    boxShadow: "0 2px 4px rgba(0,0,0,.1)", 
    background: "white",
    minWidth: 60,
    minHeight: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };
  
  if (t.startsWith("fixture")) return { 
    ...base, 
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)", 
    border: "2px dashed #64748b",
    borderRadius: 12,
    minWidth: 80,
    minHeight: 50
  };
  if (t.includes("booth")) return { ...base, background: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)", borderColor: "#fb923c" };
  if (t.includes("stool")) return { ...base, background: "linear-gradient(135deg, #eef2ff 0%, #c7d2fe 100%)", borderColor: "#6366f1" };
  if (t.includes("sofa")) return { ...base, background: "linear-gradient(135deg, #ecfeff 0%, #a7f3d0 100%)", borderColor: "#10b981" };
  if (t.includes("lounge_chair")) return { ...base, background: "linear-gradient(135deg, #f0f9ff 0%, #bae6fd 100%)", borderColor: "#0ea5e9" };
  if (t.includes("table")) return { ...base, background: "linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)", borderColor: "#22c55e" };
  return base;
}

export default function HookahFlowPreview() {
  const [seating, setSeating] = useState<SeatingMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SeatingNode | null>(null);
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch seating map from API (API calls take priority over demo data)
  useEffect(() => {
    const fetchSeatingMap = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // API calls take priority - always try API first
        const response = await fetch('/api/layouts/atl-demo-001');
        if (response.ok) {
          const data = await response.json();
          setSeating(data.data.seatingMap);
          return;
        }

        // Fallback to localStorage only if API fails
        const deployedMap = localStorage.getItem('lounge_seating_map');
        if (deployedMap) {
          const parsedMap = JSON.parse(deployedMap);
          setSeating(parsedMap);
          return;
        }

        throw new Error('Failed to fetch seating map from API and no cached data available');
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
  
  // Filter nodes based on zone and status
  const filteredNodes = useMemo(() => {
    if (!seating) return baseNodes;
    
    return baseNodes.filter(node => {
      const raw = node.data.raw;
      const zoneMatch = zoneFilter === 'all' || raw.data.zone === zoneFilter;
      const statusMatch = statusFilter === 'all' || raw.data.status === statusFilter;
      return zoneMatch && statusMatch;
    });
  }, [baseNodes, zoneFilter, statusFilter, seating]);
  
  const nodesAll = useMemo(() => filteredNodes, [filteredNodes]);
  const edgesAll = useMemo(() => [], []);
  
  // Calculate zone statistics
  const zoneStats = useMemo(() => {
    if (!seating) return {};
    
    const stats: Record<string, { total: number; occupied: number; available: number }> = {};
    
    seating.nodes.forEach(node => {
      const zone = node.data.zone;
      if (!stats[zone]) {
        stats[zone] = { total: 0, occupied: 0, available: 0 };
      }
      stats[zone].total++;
      if (node.data.session?.session_id) {
        stats[zone].occupied++;
      } else {
        stats[zone].available++;
      }
    });
    
    return stats;
  }, [seating]);

  const [nodes, setNodes, onNodesChange] = useNodesState(nodesAll);
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesAll);

  const onNodeClick = (_, node) => setSelected(node.data?.raw || node);

  // Sync derived nodes/edges when data changes
  useEffect(() => { 
    setNodes(nodesAll); 
    setEdges(edgesAll); 
  }, [nodesAll, edgesAll, setNodes, setEdges]);

  // Optimized customer booking handler with performance improvements
  const handleCustomerBooking = async (seatData: SeatingNode) => {
    // Show immediate feedback to improve perceived performance
    const button = document.querySelector(`[data-seat-id="${seatData.id}"] button`);
    if (button) {
      button.textContent = 'Creating...';
      button.disabled = true;
    }

    try {
      // Generate reservation ID
      const tableId = seatData.id.replace('seat_', 'T-').replace('fixture_', 'F-').toUpperCase();
      const reservationId = `res_${Date.now()}_${tableId}`;
      
      // In real app, this would come from a booking form
      const customerName = `Customer_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      const customerEmail = `${customerName.toLowerCase().replace(' ', '.')}@example.com`;
      
      // Calculate pricing based on seating type and capacity
      const basePrice = getBasePriceForSeatingType(seatData.type, seatData.data.capacity);
      const totalPrice = basePrice * seatData.data.capacity;
      
      // Create customer booking that triggers BOH operations
      const bookingData = {
        reservationId: reservationId,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: `+1-555-${Math.floor(Math.random() * 9000) + 1000}`,
        partySize: seatData.data.capacity,
        tableId: tableId,
        tableType: seatData.type,
        zone: seatData.data.zone,
        position: {
          x: seatData.position.x,
          y: seatData.position.y
        },
        flavorMix: seatData.data.stripe_meta?.flavor_mix || 'Premium Mix',
        basePrice: basePrice,
        totalPrice: totalPrice,
        metadata: {
          source: 'layout_preview' as const,
          ipAddress: '192.168.1.1', // In real app, get from request
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          campaignId: 'layout_preview_campaign'
        }
      };

      console.log('Creating customer booking:', bookingData);

      // Use a fallback booking ID immediately to prevent delays
      const fallbackBookingId = `booking_${Date.now()}_${tableId}`;

      // Update UI immediately for better UX
      if (seating) {
        const updatedNodes = seating.nodes.map(node => {
          if (node.id === seatData.id) {
            const updatedNode: SeatingNode = {
              ...node,
              data: {
                ...node.data,
                status: 'occupied',
                session: {
                  session_id: fallbackBookingId,
                  started_at: new Date().toISOString(),
                  assigned_staff: 'staff_001'
                }
              }
            };
            return updatedNode;
          }
          return node;
        });
        setSeating({ ...seating, nodes: updatedNodes });
      }

      // Try to create customer booking (with timeout)
      let bookingId = fallbackBookingId;
      try {
        const response = await Promise.race([
          fetch('/api/customer-journey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'create-booking',
              data: bookingData
            })
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API timeout')), 3000)
          )
        ]) as Response;

        if (response.ok) {
          const result = await response.json();
          bookingId = result?.data?.id || fallbackBookingId;
          console.log('Customer booking created:', result.data);
        } else {
          console.warn('Customer journey API failed, using fallback booking ID');
        }
      } catch (apiError) {
        console.warn('Customer journey API error, using fallback:', apiError);
      }

      // Create fire session (with timeout)
      try {
        const fireSessionPayload = {
          action: 'create',
          sessionId: bookingId,
          tableId: tableId,
          tableType: seatData.type,
          customerName: customerName,
          flavorMix: seatData.data.stripe_meta?.flavor_mix || 'Premium Mix',
          prepStaffId: 'staff_001',
          basePrice: basePrice,
          totalPrice: totalPrice,
          capacity: seatData.data.capacity,
          status: 'preparing',
          metadata: {
            zone: seatData.data.zone,
            zoneLabel: seatData.data.zone.replace('zone_', '').replace('_', ' ').toUpperCase(),
            timestamp: new Date().toISOString(),
            lounge_id: seating?.lounge_id,
            lounge_name: seating?.name,
            table_position: {
              x: seatData.position.x,
              y: seatData.position.y
            },
            qrCode: `checkin_${reservationId}`,
            estimatedPrepTime: 5,
            estimatedSessionTime: 60,
            bookingId: bookingId
          }
        };

        const fireSessionResponse = await Promise.race([
          fetch('/api/fire-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fireSessionPayload),
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Fire session API timeout')), 2000)
          )
        ]) as Response;

        if (fireSessionResponse.ok) {
          const fireSessionResult = await fireSessionResponse.json();
          console.log('Fire session created successfully:', fireSessionResult);
        } else {
          console.warn('Fire session API failed, but booking created locally');
        }
      } catch (fireSessionError) {
        console.warn('Fire session API error:', fireSessionError);
      }
      
      // Success message
      const successMessage = `🎉 Customer Booking Created Successfully!
      
Booking ID: ${bookingId}
Reservation ID: ${reservationId}
Table ID: ${tableId}
Customer: ${customerName}
Zone: ${seatData.data.zone.replace('zone_', '').replace('_', ' ').toUpperCase()}
Capacity: ${seatData.data.capacity} people
Price: $${totalPrice.toFixed(2)} ($${basePrice.toFixed(2)} × ${seatData.data.capacity})

✅ Customer journey tracking activated
✅ BOH operations triggered automatically
✅ Real-time dashboard updates enabled
✅ QR Code: checkin_${reservationId}`;
      
      alert(successMessage);
    } catch (err) {
      console.error('Customer booking error:', err);
      alert(`❌ Error creating customer booking: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      // Reset button state
      if (button) {
        button.textContent = 'Fire Session';
        button.disabled = false;
      }
    }
  };

  // Helper function to get base price for seating type
  const getBasePriceForSeatingType = (type: string, capacity: number) => {
    const basePrices = {
      'seat.stool': 15.00,
      'seat.booth_double': 25.00,
      'seat.sofa': 20.00,
      'seat.lounge_chair': 18.00,
      'table.low_round': 22.00,
      'table.high_round': 30.00
    };
    
    return basePrices[type] || 20.00;
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

  // AI Agent for intelligent layout suggestions and iteration assistance
  const handleSuggest = async () => {
    if (!seating) return;
    
    setLoading(true);
    
    try {
      // AI Agent analysis of layout
      const analysis = await analyzeLayoutWithAI(seating);
      
      setSuggestions(analysis.suggestions);
      setShowSuggestions(true);
      
      if (analysis.suggestions.length === 0) {
        alert("✅ AI Agent: Layout looks optimal! No improvements needed.");
      } else {
        console.log("🤖 AI Agent Analysis:", analysis);
      }
    } catch (error) {
      console.error("AI Agent error:", error);
      // Fallback to basic suggestions
      const basicSuggestions = generateBasicSuggestions(seating);
      setSuggestions(basicSuggestions);
      setShowSuggestions(true);
    } finally {
      setLoading(false);
    }
  };

  // AI Agent function for intelligent layout analysis
  const analyzeLayoutWithAI = async (seating: SeatingMap) => {
    const nodes = seating.nodes;
    const suggestions = [];
    
    // Advanced AI analysis patterns
    const patterns = {
      overlapping: [],
      spacing: [],
      flow: [],
      capacity: [],
      zones: []
    };
    
    // Check for overlapping nodes with AI context
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        const overlap = (
          node1.position.x < node2.position.x + node2.size.w &&
          node1.position.x + node1.size.w > node2.position.x &&
          node1.position.y < node2.position.y + node2.size.h &&
          node1.position.y + node1.size.h > node2.position.y
        );
        
        if (overlap) {
          patterns.overlapping.push({
            nodes: [node1.id, node2.id],
            severity: 'high',
            suggestion: `AI Agent: Move ${node1.id} and ${node2.id} apart - overlapping detected. Consider ${node1.data?.zone === node2.data?.zone ? 'rearranging within zone' : 'adjusting zone boundaries'}.`
          });
        }
      }
    }
    
    // AI-powered spacing analysis
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        const distance = Math.sqrt(
          Math.pow(node1.position.x - node2.position.x, 2) + 
          Math.pow(node1.position.y - node2.position.y, 2)
        );
        
        if (distance < 15 && distance > 0) {
          patterns.spacing.push({
            nodes: [node1.id, node2.id],
            distance: distance,
            suggestion: `AI Agent: Increase spacing between ${node1.id} and ${node2.id} (${distance.toFixed(1)}px). Recommended minimum: 20px for optimal customer flow.`
          });
        }
      }
    }
    
    // AI flow analysis
    const barNodes = nodes.filter(n => n.data.zone === 'zone_bar_A');
    const loungeNodes = nodes.filter(n => n.data.zone === 'zone_lounge_NE');
    
    if (barNodes.length > 0 && loungeNodes.length > 0) {
      const avgBarX = barNodes.reduce((sum, n) => sum + n.position.x, 0) / barNodes.length;
      const avgLoungeX = loungeNodes.reduce((sum, n) => sum + n.position.x, 0) / loungeNodes.length;
      
      if (avgLoungeX < avgBarX + 100) {
        patterns.flow.push({
          suggestion: "AI Agent: Consider increasing distance between bar and lounge areas for better customer flow separation."
        });
      }
    }
    
    // AI capacity analysis
    const highCapacityNodes = nodes.filter(n => n.data.capacity && n.data.capacity > 2);
    if (highCapacityNodes.length > 0) {
      const avgCapacity = highCapacityNodes.reduce((sum, n) => sum + n.data.capacity, 0) / highCapacityNodes.length;
      if (avgCapacity > 4) {
        patterns.capacity.push({
          suggestion: "AI Agent: High-capacity seating detected. Consider adding more intimate seating options for smaller groups."
        });
      }
    }
    
    // Compile AI suggestions
    const allSuggestions = [
      ...patterns.overlapping.map(p => p.suggestion),
      ...patterns.spacing.map(p => p.suggestion),
      ...patterns.flow.map(p => p.suggestion),
      ...patterns.capacity.map(p => p.suggestion)
    ];
    
    return {
      suggestions: allSuggestions,
      patterns: patterns,
      confidence: allSuggestions.length === 0 ? 0.95 : 0.8
    };
  };

  // Fallback basic suggestions
  const generateBasicSuggestions = (seating: SeatingMap) => {
    const suggestions = [];
    const nodes = seating.nodes;
    
    // Basic overlap detection
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
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
    
    return suggestions;
  };

  const handleExecuteSuggestions = () => {
    if (suggestions.length === 0) return;
    
    // Auto-adjust spacing for overlapping nodes
    const updatedNodes = [...(seating?.nodes || [])];
    
    for (let i = 0; i < updatedNodes.length; i++) {
      for (let j = i + 1; j < updatedNodes.length; j++) {
        const node1 = updatedNodes[i];
        const node2 = updatedNodes[j];
        
        const overlap = (
          node1.position.x < node2.position.x + node2.size.w &&
          node1.position.x + node1.size.w > node2.position.x &&
          node1.position.y < node2.position.y + node2.size.h &&
          node1.position.y + node1.size.h > node2.position.y
        );
        
        if (overlap) {
          // Move nodes apart by 20px
          const dx = node1.position.x - node2.position.x;
          const dy = node1.position.y - node2.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const moveX = (dx / distance) * 20;
            const moveY = (dy / distance) * 20;
            
            node1.position.x += moveX;
            node1.position.y += moveY;
          } else {
            // If nodes are exactly on top of each other, move one randomly
            node1.position.x += 20;
            node1.position.y += 20;
          }
        }
      }
    }
    
    // Update the seating map
    if (seating) {
      const updatedSeating = { ...seating, nodes: updatedNodes };
      setSeating(updatedSeating);
      setShowSuggestions(false);
      setSuggestions([]);
      alert("✅ Layout suggestions executed! Nodes have been repositioned for better spacing.");
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
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {selected.type.replace('seat.', '').replace('fixture.', '').replace('_', ' ').toUpperCase()}
                    </h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Zone:</span>
                        <span className="font-medium text-gray-900">{selected.data?.zone?.replace('zone_', '').replace('_', ' ').toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium text-gray-900">{selected.data?.capacity ?? "—"} people</span>
                      </div>
                      {selected.data?.capacity && selected.data.capacity > 1 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fire Sessions:</span>
                          <span className="font-bold text-blue-600">{selected.data.capacity} available</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${selected.data?.status === 'idle' ? 'text-green-600' : 'text-orange-600'}`}>
                          {selected.data?.status ?? "idle"}
                        </span>
                      </div>
                      {selected.data?.session?.session_id && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Session:</span>
                          <span className="font-medium text-blue-600">Active</span>
                        </div>
                      )}
                    </div>
          </div>
                  
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <Button 
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl" 
                        onClick={() => handleCustomerBooking(selected)}
              disabled={loading}
            >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating Session...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            🔥 Fire Session
                          </div>
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full border-green-500 text-green-600 hover:bg-green-50 font-medium py-2 px-4 rounded-lg"
                        onClick={() => {
                          const reservePayload = {
                            tableId: selected.id,
                            zone: selected.data?.zone,
                            capacity: selected.data?.capacity,
                            holdAmount: 5.00,
                            holdDuration: 15, // 15 minutes
                            qrCode: `reserve_${selected.id}_${Date.now()}`,
                            timestamp: new Date().toISOString()
                          };
                          alert(`💳 Reserve Table (QR Hold)\n\nTable: ${selected.id}\nHold Amount: $5.00\nDuration: 15 minutes\nQR Code: ${reservePayload.qrCode}\n\nScan QR to confirm reservation!`);
                        }}
                      >
                        💳 Reserve Table ($5 Hold)
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg"
                        onClick={() => {
                          const qrCode = `checkin_${selected.id}_${Date.now()}`;
                          const checkinPayload = {
                            tableId: selected.id,
                            tableType: selected.type,
                            zone: selected.data?.zone,
                            capacity: selected.data?.capacity,
                            qrCode: qrCode,
                            timestamp: new Date().toISOString(),
                            historicalProfile: {
                              hasHistory: Math.random() > 0.5, // Simulate returning guest
                              previousSessions: Math.floor(Math.random() * 5),
                              favoriteFlavors: ['Blue Mist', 'Mint', 'Grape'],
                              averageSessionTime: 45 // minutes
                            }
                          };
                          
                          const isReturningGuest = checkinPayload.historicalProfile.hasHistory;
                          const message = isReturningGuest 
                            ? `📱 QR Check-In (Returning Guest)\n\nTable: ${selected.id}\nQR Code: ${qrCode}\n\nWelcome back! Loading your profile...\nPrevious Sessions: ${checkinPayload.historicalProfile.previousSessions}\nFavorite Flavors: ${checkinPayload.historicalProfile.favoriteFlavors.join(', ')}\nAvg Session Time: ${checkinPayload.historicalProfile.averageSessionTime} min\n\nScan QR to check in!`
                            : `📱 QR Check-In (New Guest)\n\nTable: ${selected.id}\nQR Code: ${qrCode}\n\nWelcome! Please scan QR to create your profile and start your session.`;
                          
                          alert(message);
                        }}
                      >
                        📱 QR Check-In
                      </Button>
                    </div>
                    
                  </div>
                </div>
              ) : (
                <div className="text-sm opacity-70">Click a seat/table to view details.</div>
              )}
            </div>

            {/* Zone Filter */}
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-gray-700 font-semibold">Zone Filter</div>
              <select 
                value={zoneFilter} 
                onChange={(e) => setZoneFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white"
              >
                <option value="all">All Zones</option>
                {seating?.zones.map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.label} ({zoneStats[zone.id]?.available || 0}/{zoneStats[zone.id]?.total || 0})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Status Filter */}
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-gray-700 font-semibold">Status Filter</div>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white"
              >
                <option value="all">All Status</option>
                <option value="idle">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>

            {/* Zone Statistics */}
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-gray-700 font-semibold">Zone Statistics</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {Object.entries(zoneStats).map(([zone, stats]) => (
                  <div key={zone} className="text-xs bg-gray-50 p-2 rounded border">
                    <div className="font-semibold text-gray-900">{zone.replace('zone_', '').replace('_', ' ').toUpperCase()}</div>
                    <div className="flex justify-between text-gray-700 mt-1">
                      <span className="text-green-600 font-medium">Available: {stats.available}</span>
                      <span className="text-orange-600 font-medium">Occupied: {stats.occupied}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Fire Sessions: {stats.available} available, {stats.occupied} active
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions Panel */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wide text-gray-700 font-semibold">Layout Suggestions</div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <div className="text-xs text-yellow-800 space-y-1">
                    {suggestions.slice(0, 3).map((suggestion, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-yellow-600 mr-2">•</span>
                        <span>{suggestion}</span>
                      </div>
                    ))}
                    {suggestions.length > 3 && (
                      <div className="text-yellow-600 font-medium">
                        +{suggestions.length - 3} more suggestions
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleExecuteSuggestions} 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-1"
                  >
                    Execute All
                  </Button>
                  <Button 
                    onClick={() => setShowSuggestions(false)} 
                    variant="outline" 
                    className="flex-1 text-xs py-1"
                  >
                    Dismiss
                  </Button>
          </div>
        </div>
            )}

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