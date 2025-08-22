import React, { useState } from 'react';

interface TablePosition {
  x: number;
  y: number;
}

interface Session {
  id: string;
  tableId?: string;
  tableType?: "high_boy" | "table" | "2x_booth" | "4x_booth" | "8x_sectional" | "4x_sofa";
  tablePosition?: TablePosition;
  coalStatus?: "active" | "needs_refill" | "burnt_out";
  customerName?: string;
  flavor?: string;
  amount: number;
}

interface LoungeLayoutProps {
  sessions: Session[];
  onTableClick: (session: Session) => void;
}

export default function LoungeLayout({ sessions, onTableClick }: LoungeLayoutProps) {
  const [hoveredTable, setHoveredTable] = useState<Session | null>(null);

  // Bar position (top of the layout)
  const barPosition = { x: 400, y: 50, width: 200, height: 40 };

  // Function to get table color based on status
  function getTableColor(status?: string) {
    switch (status) {
      case 'active': return '#10b981'; // green
      case 'needs_refill': return '#f59e0b'; // yellow
      case 'burnt_out': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  }

  // Function to get table size based on type
  function getTableSize(tableType?: string) {
    switch (tableType) {
      case 'high_boy': return { width: 30, height: 30 };
      case 'table': return { width: 40, height: 40 };
      case '2x_booth': return { width: 35, height: 25 };
      case '4x_booth': return { width: 45, height: 35 };
      case '8x_sectional': return { width: 60, height: 45 };
      case '4x_sofa': return { width: 50, height: 35 };
      default: return { width: 40, height: 40 };
    }
  }

  // Function to get table label
  function getTableLabel(tableType?: string) {
    switch (tableType) {
      case 'high_boy': return '🍺';
      case 'table': return '🪑';
      case '2x_booth': return '🛋️';
      case '4x_booth': return '🛋️';
      case '8x_sectional': return '🪑';
      case '4x_sofa': return '🛋️';
      default: return '🪑';
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-teal-300 mb-4">Lounge Layout (ScreenCoder Integration)</h3>
      
      <div className="relative bg-zinc-800 rounded-lg p-4" style={{ height: '500px' }}>
        {/* Bar Area */}
        <div
          className="absolute bg-gradient-to-r from-amber-900 to-amber-800 border-2 border-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{
            left: barPosition.x,
            top: barPosition.y,
            width: barPosition.width,
            height: barPosition.height
          }}
        >
          🍺 BAR
        </div>
        
        {/* Windows (Left Wall) */}
        <div className="absolute left-2 top-20 w-2 h-32 bg-blue-400 bg-opacity-30 rounded"></div>
        <div className="absolute left-2 top-170 w-2 h-32 bg-blue-400 bg-opacity-30 rounded"></div>
        <div className="absolute left-2 top-320 w-2 h-32 bg-blue-400 bg-opacity-30 rounded"></div>
        
        {/* Track Lighting */}
        <div className="absolute top-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60"></div>
        <div className="absolute top-2 left-1/4 w-1 h-1 bg-yellow-400 rounded-full"></div>
        <div className="absolute top-2 left-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
        <div className="absolute top-2 left-3/4 w-1 h-1 bg-yellow-400 rounded-full"></div>

        {/* Tables */}
        {sessions.map((session) => {
          if (!session.tablePosition) return null;
          
          const size = getTableSize(session.tableType);
          const color = getTableColor(session.coalStatus);
          
          return (
            <div
              key={session.id}
              className="absolute cursor-pointer transition-all duration-200 hover:scale-110"
              style={{
                left: session.tablePosition.x,
                top: session.tablePosition.y,
                width: size.width,
                height: size.height
              }}
              onMouseEnter={() => setHoveredTable(session)}
              onMouseLeave={() => setHoveredTable(null)}
              onClick={() => onTableClick(session)}
            >
              {/* Table */}
              <div
                className="rounded-lg border-2 border-white flex items-center justify-center text-white font-bold text-xs shadow-lg"
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: color
                }}
              >
                {getTableLabel(session.tableType)}
              </div>
              
              {/* Table ID */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-zinc-300 font-mono">
                {session.tableId}
              </div>
            </div>
          );
        })}

        {/* Hover Info */}
        {hoveredTable && (
          <div
            className="absolute bg-black bg-opacity-90 text-white p-3 rounded-lg text-sm z-10 max-w-xs"
            style={{
              left: (hoveredTable.tablePosition?.x || 0) + 50,
              top: (hoveredTable.tablePosition?.y || 0) - 20
            }}
          >
            <div className="font-bold mb-2">{hoveredTable.tableId}</div>
            <div className="text-zinc-300 mb-1">
              Type: {hoveredTable.tableType?.replace('_', ' ').toUpperCase()}
            </div>
            <div className="text-zinc-300 mb-1">
              Status: <span className={`font-bold ${
                hoveredTable.coalStatus === 'active' ? 'text-green-400' :
                hoveredTable.coalStatus === 'needs_refill' ? 'text-yellow-400' :
                hoveredTable.coalStatus === 'burnt_out' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {hoveredTable.coalStatus?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
            <div className="text-zinc-300 mb-1">
              Customer: {hoveredTable.customerName || 'Staff Customer'}
            </div>
            <div className="text-zinc-300 mb-1">
              Flavor: {hoveredTable.flavor || 'Not set'}
            </div>
            <div className="text-zinc-300">
              Amount: ${(hoveredTable.amount / 100).toFixed(2)}
            </div>
            <div className="text-xs text-blue-400 mt-2">
              Click to view session details
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-zinc-700 bg-opacity-90 p-3 rounded-lg text-xs">
          <div className="text-white font-bold mb-2">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-zinc-300">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-500"></div>
              <span className="text-zinc-300">Needs Refill</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span className="text-zinc-300">Burnt Out</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-500"></div>
              <span className="text-zinc-300">Inactive</span>
            </div>
          </div>
        </div>

        {/* Table Type Legend */}
        <div className="absolute bottom-4 right-4 bg-zinc-700 bg-opacity-90 p-3 rounded-lg text-xs">
          <div className="text-white font-bold mb-2">Table Types</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span>🍺</span>
              <span className="text-zinc-300">Bar High Boy</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🪑</span>
              <span className="text-zinc-300">Standard Table</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🛋️</span>
              <span className="text-zinc-300">Booth/Sofa</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-zinc-400">
        Hover over tables to see session details • Click to view full session information
      </div>
    </div>
  );
}
