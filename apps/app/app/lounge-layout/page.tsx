'use client';

import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import GlobalNavigation from '../../components/GlobalNavigation';
import { 
  LayoutGrid,
  Plus,
  Trash2,
  Save,
  MapPin,
} from 'lucide-react';

interface Table {
  id: string;
  name: string;
  x: number;
  y: number;
  capacity: number;
  seatingType: string;
}

export default function LoungeLayoutPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const seatingTypes = [
    'Booth',
    'Couch',
    'Bar Seating',
    'Outdoor',
    'VIP',
    'Private Room'
  ];

  const handleAddTable = () => {
    const newTable: Table = {
      id: `table-${Date.now()}`,
      name: `T-${tables.length + 1}`,
      x: 50,
      y: 50,
      capacity: 4,
      seatingType: 'Booth'
    };
    setTables([...tables, newTable]);
    setSelectedTable(newTable.id);
  };

  const handleDeleteTable = (id: string) => {
    setTables(tables.filter(table => table.id !== id));
    if (selectedTable === id) {
      setSelectedTable(null);
    }
  };

  const handleTableClick = (table: Table, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTable(table.id);
  };

  const handleTableDragStart = (table: Table, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setSelectedTable(table.id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2
    });
  };

  const handleTableDrag = (tableId: string, e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTables(tables.map(t => 
      t.id === tableId 
        ? { ...t, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
        : t
    ));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/lounges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save_layout',
          tables: tables
        }),
      });

      if (response.ok) {
        alert('Lounge layout saved successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save layout' }));
        alert(`Failed to save layout: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving layout:', error);
      alert('Failed to save layout. Please try again.');
    }
  };

  const selectedTableData = tables.find(t => t.id === selectedTable);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      {/* Header */}
      <div className="bg-zinc-950 border-b border-teal-500/50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Physical Lounge Digitization</h1>
              <p className="text-zinc-400 mt-1">Lounge Layout Manager</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleAddTable}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Table
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={tables.length === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Layout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Layout Canvas */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Lounge Floor Plan</h2>
                <div className="text-sm text-zinc-400">
                  {tables.length} table{tables.length !== 1 ? 's' : ''} configured
                </div>
              </div>
              
              <div
                className="relative w-full h-[600px] bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-lg overflow-hidden"
                onMouseMove={(e) => {
                  if (isDragging && selectedTable) {
                    handleTableDrag(selectedTable, e);
                  }
                }}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => setSelectedTable(null)}
              >
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className={`absolute cursor-move transform -translate-x-1/2 -translate-y-1/2 ${
                      selectedTable === table.id ? 'ring-2 ring-teal-500' : ''
                    }`}
                    style={{
                      left: `${table.x}%`,
                      top: `${table.y}%`
                    }}
                    onClick={(e) => handleTableClick(table, e)}
                    onMouseDown={(e) => handleTableDragStart(table, e)}
                  >
                    {/* Distinctive shapes based on seating type */}
                    {table.seatingType === 'Booth' && (
                      <div className={`w-20 h-12 rounded-lg flex flex-col items-center justify-center border-2 ${
                        selectedTable === table.id
                          ? 'bg-teal-500 text-white border-teal-300'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 border-zinc-500'
                      } transition-colors`}>
                        <div className="text-xs font-semibold">{table.name}</div>
                        <div className="text-xs">{table.capacity} • {table.seatingType}</div>
                      </div>
                    )}
                    {table.seatingType === 'Couch' && (
                      <div className={`w-24 h-16 rounded-xl flex flex-col items-center justify-center border-2 ${
                        selectedTable === table.id
                          ? 'bg-purple-500 text-white border-purple-300'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 border-purple-500'
                      } transition-colors`}>
                        <div className="text-xs font-semibold">{table.name}</div>
                        <div className="text-xs">{table.capacity} • {table.seatingType}</div>
                      </div>
                    )}
                    {table.seatingType === 'Bar Seating' && (
                      <div className={`w-16 h-8 rounded-full flex flex-col items-center justify-center border-2 ${
                        selectedTable === table.id
                          ? 'bg-blue-500 text-white border-blue-300'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 border-blue-500'
                      } transition-colors`}>
                        <div className="text-xs font-semibold">{table.name}</div>
                        <div className="text-xs">{table.capacity} • {table.seatingType}</div>
                      </div>
                    )}
                    {table.seatingType === 'Outdoor' && (
                      <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-2 border-dashed ${
                        selectedTable === table.id
                          ? 'bg-green-500 text-white border-green-300'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 border-green-500'
                      } transition-colors`}>
                        <div className="text-xs font-semibold">{table.name}</div>
                        <div className="text-xs">{table.capacity} • {table.seatingType}</div>
                      </div>
                    )}
                    {table.seatingType === 'VIP' && (
                      <div className={`w-20 h-20 rounded-lg flex flex-col items-center justify-center border-2 ${
                        selectedTable === table.id
                          ? 'bg-yellow-500 text-white border-yellow-300'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 border-yellow-500'
                      } transition-colors`}>
                        <div className="text-xs font-semibold">{table.name}</div>
                        <div className="text-xs">{table.capacity} • {table.seatingType}</div>
                      </div>
                    )}
                    {table.seatingType === 'Private Room' && (
                      <div className={`w-24 h-20 rounded-lg flex flex-col items-center justify-center border-2 ${
                        selectedTable === table.id
                          ? 'bg-red-500 text-white border-red-300'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 border-red-500'
                      } transition-colors`}>
                        <div className="text-xs font-semibold">{table.name}</div>
                        <div className="text-xs">{table.capacity} • {table.seatingType}</div>
                      </div>
                    )}
                    {!['Booth', 'Couch', 'Bar Seating', 'Outdoor', 'VIP', 'Private Room'].includes(table.seatingType) && (
                      <div className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center ${
                        selectedTable === table.id
                          ? 'bg-teal-500 text-white'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      } transition-colors`}>
                        <div className="text-xs font-semibold">{table.name}</div>
                        <div className="text-xs">{table.capacity} • {table.seatingType}</div>
                      </div>
                    )}
                  </div>
                ))}
                
                {tables.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <LayoutGrid className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                      <p className="text-zinc-400 mb-4">No tables configured yet</p>
                      <Button
                        variant="outline"
                        onClick={handleAddTable}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Table
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {selectedTableData ? (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Table Details</h3>
                  <button
                    onClick={() => handleDeleteTable(selectedTableData.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Table Name
                    </label>
                    <input
                      type="text"
                      value={selectedTableData.name}
                      onChange={(e) => {
                        setTables(tables.map(t =>
                          t.id === selectedTableData.id
                            ? { ...t, name: e.target.value }
                            : t
                        ));
                      }}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Capacity
                    </label>
                    <input
                      type="number"
                      value={selectedTableData.capacity}
                      onChange={(e) => {
                        setTables(tables.map(t =>
                          t.id === selectedTableData.id
                            ? { ...t, capacity: parseInt(e.target.value) || 0 }
                            : t
                        ));
                      }}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Seating Type
                    </label>
                    <select
                      value={selectedTableData.seatingType}
                      onChange={(e) => {
                        setTables(tables.map(t =>
                          t.id === selectedTableData.id
                            ? { ...t, seatingType: e.target.value }
                            : t
                        ));
                      }}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                    >
                      {seatingTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <p className="text-xs text-zinc-400 mt-1">
                      Current: {selectedTableData.seatingType}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-zinc-700">
                    <div className="text-sm text-zinc-400 mb-1">Position</div>
                    <div className="text-xs text-zinc-500">
                      X: {selectedTableData.x.toFixed(1)}% | Y: {selectedTableData.y.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <div className="text-center text-zinc-400">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                  <p className="text-sm">Select a table to edit its details</p>
                </div>
              </Card>
            )}

            {/* Instructions */}
            <Card className="p-6 bg-zinc-900/50">
              <h3 className="text-sm font-semibold mb-3">Instructions</h3>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-teal-400">•</span>
                  <span>Click "Add Table" to place tables on your floor plan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400">•</span>
                  <span>Drag tables to reposition them</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400">•</span>
                  <span>Click a table to edit its details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400">•</span>
                  <span>Save your layout when finished</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

