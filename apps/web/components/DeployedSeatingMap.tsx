// apps/web/components/DeployedSeatingMap.tsx
"use client";

import { useState, useEffect } from 'react';

interface SeatingNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    zone: string;
    capacity: number;
    available: boolean;
    dim_in: { seat_h: number; ctr_h: number };
    tags: string[];
    stripe_meta: { session_id: string | null; flavor_mix: string | null };
  };
}

interface SeatingMapData {
  lounge_id: string;
  name: string;
  nodes: SeatingNode[];
  edges: any[];
  metadata: {
    total_capacity: number;
    zones: string[];
    generated_at: string;
    version: string;
  };
}

export default function DeployedSeatingMap() {
  const [seatingMap, setSeatingMap] = useState<SeatingMapData | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loungeName, setLoungeName] = useState<string>('');

  useEffect(() => {
    // Load deployed seating map from localStorage
    const mapData = localStorage.getItem('lounge_seating_map');
    const suggestionsData = localStorage.getItem('lounge_seating_suggestions');
    const nameData = localStorage.getItem('lounge_seating_name');
    const deployed = localStorage.getItem('lounge_seating_deployed');

    if (deployed === 'true' && mapData) {
      setSeatingMap(JSON.parse(mapData));
      setLoungeName(nameData || 'Unknown Lounge');
      
      if (suggestionsData) {
        setSuggestions(JSON.parse(suggestionsData));
      }
    }
  }, []);

  if (!seatingMap) {
    return (
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Seating Map Deployed</h3>
          <p className="text-zinc-400">
            Use the Visual Grounder to create and deploy a seating map for your lounge.
          </p>
        </div>
      </div>
    );
  }

  const getNodeColor = (node: SeatingNode) => {
    switch (node.data.zone) {
      case 'bar_zone_A': return 'bg-blue-500';
      case 'booth_zone_A': return 'bg-purple-500';
      case 'lounge_zone_A': return 'bg-green-500';
      case 'lounge_zone_B': return 'bg-green-600';
      case 'service_zone': return 'bg-orange-500';
      default: return 'bg-zinc-500';
    }
  };

  const getNodeIcon = (node: SeatingNode) => {
    switch (node.type) {
      case 'seat.stool': return '🪑';
      case 'seat.booth_single': return '🛋️';
      case 'table.high': return '🪑';
      case 'seat.sofa': return '🛋️';
      case 'seat.lounge_chair': return '🪑';
      case 'service_counter': return '🏪';
      default: return '🪑';
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-teal-500 p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">🗺️</span>
        <h2 className="text-xl font-semibold text-teal-300">Deployed Seating Map</h2>
        <span className="text-sm text-zinc-400">- {loungeName}</span>
      </div>

      {/* Map Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{seatingMap.metadata.total_capacity}</div>
          <div className="text-sm text-zinc-400">Total Seats</div>
        </div>
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-teal-400">{seatingMap.nodes.length}</div>
          <div className="text-sm text-zinc-400">Seating Elements</div>
        </div>
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{seatingMap.metadata.zones.length}</div>
          <div className="text-sm text-zinc-400">Zones</div>
        </div>
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">✅</div>
          <div className="text-sm text-zinc-400">Deployed</div>
        </div>
      </div>

      {/* Visual Seating Map */}
      <div className="bg-zinc-800 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Seating Layout</h3>
        <div className="relative bg-zinc-900 rounded-lg p-4 min-h-[400px] overflow-auto">
          <div className="relative" style={{ width: '600px', height: '400px' }}>
            {seatingMap.nodes.map((node) => (
              <div
                key={node.id}
                className={`absolute w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg cursor-pointer hover:scale-110 transition-transform ${getNodeColor(node)}`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                }}
                title={`${node.type} - ${node.data.zone} - Capacity: ${node.data.capacity}`}
              >
                {getNodeIcon(node)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zone Legend */}
      <div className="bg-zinc-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Zone Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {seatingMap.metadata.zones.map((zone) => {
            const zoneNodes = seatingMap.nodes.filter(node => node.data.zone === zone);
            const totalCapacity = zoneNodes.reduce((sum, node) => sum + node.data.capacity, 0);
            
            return (
              <div key={zone} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded ${
                  zone === 'bar_zone_A' ? 'bg-blue-500' :
                  zone === 'booth_zone_A' ? 'bg-purple-500' :
                  zone === 'lounge_zone_A' ? 'bg-green-500' :
                  zone === 'lounge_zone_B' ? 'bg-green-600' :
                  zone === 'service_zone' ? 'bg-orange-500' :
                  'bg-zinc-500'
                }`}></div>
                <span className="text-white text-sm">{zone.replace('_', ' ')}</span>
                <span className="text-zinc-400 text-sm">({totalCapacity} seats)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-zinc-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Optimization Suggestions</h3>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-zinc-400 text-sm flex items-start">
                <span className="text-blue-400 mr-2">💡</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-zinc-700">
        <div className="text-sm text-zinc-400">
          Generated: {new Date(seatingMap.metadata.generated_at).toLocaleDateString()}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              // Clear deployed map
              localStorage.removeItem('lounge_seating_map');
              localStorage.removeItem('lounge_seating_suggestions');
              localStorage.removeItem('lounge_seating_deployed');
              localStorage.removeItem('lounge_seating_name');
              setSeatingMap(null);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Remove Map
          </button>
          <button
            onClick={() => {
              // Export seating map
              const dataStr = JSON.stringify(seatingMap, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${loungeName.replace(/\s/g, '_')}_seating_map.json`;
              link.click();
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Export Map
          </button>
        </div>
      </div>
    </div>
  );
}
