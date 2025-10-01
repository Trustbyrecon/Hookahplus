"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Move, 
  RotateCcw, 
  Save, 
  Download, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Edit3,
  Lock,
  Unlock,
  Grid,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  type: string;
  capacity: number;
  occupied: number;
  available: number;
  color: string;
  coordinates: { x: number; y: number; width: number; height: number };
  sessions: number;
  aiConfidence?: number;
  features?: string[];
  locked?: boolean;
}

interface InteractiveLayoutEditorProps {
  layout: any;
  onLayoutChange: (layout: any) => void;
  onSave: () => void;
  onExport: () => void;
}

export function InteractiveLayoutEditor({ 
  layout, 
  onLayoutChange, 
  onSave, 
  onExport 
}: InteractiveLayoutEditorProps) {
  const [zones, setZones] = useState<Zone[]>(layout?.zones || []);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [showFeatures, setShowFeatures] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Update zones when layout changes
  useEffect(() => {
    if (layout?.zones) {
      setZones(layout.zones);
    }
  }, [layout]);

  // Handle zone selection
  const handleZoneClick = (zoneId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedZone(zoneId);
  };

  // Handle drag start
  const handleDragStart = (zoneId: string, event: React.MouseEvent) => {
    if (zones.find(z => z.id === zoneId)?.locked) return;
    
    setIsDragging(true);
    setSelectedZone(zoneId);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
  };

  // Handle drag move
  const handleDragMove = useCallback((event: MouseEvent) => {
    if (!isDragging || !selectedZone) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newX = event.clientX - rect.left - dragStart.x;
    const newY = event.clientY - rect.top - dragStart.y;

    setZones(prevZones => 
      prevZones.map(zone => 
        zone.id === selectedZone 
          ? {
              ...zone,
              coordinates: {
                ...zone.coordinates,
                x: Math.max(0, Math.min(newX, 600 - zone.coordinates.width)),
                y: Math.max(0, Math.min(newY, 400 - zone.coordinates.height))
              }
            }
          : zone
      )
    );
  }, [isDragging, selectedZone, dragStart]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onLayoutChange({ ...layout, zones });
    }
  }, [isDragging, layout, zones, onLayoutChange]);

  // Handle resize
  const handleResize = (zoneId: string, event: React.MouseEvent, direction: string) => {
    if (zones.find(z => z.id === zoneId)?.locked) return;
    
    setIsResizing(true);
    setSelectedZone(zoneId);
    event.stopPropagation();
  };

  // Toggle zone lock
  const toggleZoneLock = (zoneId: string) => {
    setZones(prevZones =>
      prevZones.map(zone =>
        zone.id === zoneId
          ? { ...zone, locked: !zone.locked }
          : zone
      )
    );
  };

  // Delete zone
  const deleteZone = (zoneId: string) => {
    setZones(prevZones => prevZones.filter(zone => zone.id !== zoneId));
    if (selectedZone === zoneId) {
      setSelectedZone(null);
    }
  };

  // Duplicate zone
  const duplicateZone = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (zone) {
      const newZone = {
        ...zone,
        id: `${zoneId}_copy_${Date.now()}`,
        name: `${zone.name} Copy`,
        coordinates: {
          ...zone.coordinates,
          x: zone.coordinates.x + 20,
          y: zone.coordinates.y + 20
        }
      };
      setZones(prevZones => [...prevZones, newZone]);
    }
  };

  // Add event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Get zone color
  const getZoneColor = (color: string) => {
    const colors: { [key: string]: string } = {
      orange: '#f97316',
      blue: '#3b82f6',
      green: '#10b981',
      purple: '#8b5cf6',
      gray: '#6b7280',
      pink: '#ec4899',
      teal: '#14b8a6',
      yellow: '#eab308'
    };
    return colors[color] || '#6b7280';
  };

  return (
    <div className="space-y-4">
      {/* Editor Controls */}
      <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isEditing 
                ? 'bg-teal-500 text-white' 
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditing ? 'Editing' : 'Edit Mode'}</span>
          </button>
          
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              showGrid 
                ? 'bg-blue-500 text-white' 
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Grid</span>
          </button>

          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              showFeatures 
                ? 'bg-purple-500 text-white' 
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Features</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onSave}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Layout</span>
          </button>
          
          <button
            onClick={onExport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Layout Canvas */}
      <div 
        ref={canvasRef}
        className="relative w-full h-96 bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden"
        style={{
          backgroundImage: showGrid 
            ? `radial-gradient(circle, #374151 1px, transparent 1px)` 
            : 'none',
          backgroundSize: '20px 20px'
        }}
      >
        {zones.map((zone) => (
          <div
            key={zone.id}
            className={`absolute border-2 rounded-lg cursor-move transition-all duration-200 ${
              selectedZone === zone.id 
                ? 'ring-2 ring-teal-400 ring-opacity-50' 
                : 'hover:ring-1 hover:ring-white hover:ring-opacity-30'
            } ${zone.locked ? 'opacity-60' : ''}`}
            style={{
              left: zone.coordinates.x,
              top: zone.coordinates.y,
              width: zone.coordinates.width,
              height: zone.coordinates.height,
              backgroundColor: getZoneColor(zone.color) + '20',
              borderColor: getZoneColor(zone.color),
            }}
            onClick={(e) => handleZoneClick(zone.id, e)}
            onMouseDown={(e) => isEditing && handleDragStart(zone.id, e)}
          >
            {/* Zone Content */}
            <div className="p-2 h-full flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-white truncate">
                  {zone.name}
                </span>
                <div className="flex items-center space-x-1">
                  {zone.locked && <Lock className="w-3 h-3 text-zinc-400" />}
                  {zone.aiConfidence && (
                    <span className="text-xs bg-teal-500/20 text-teal-400 px-1 py-0.5 rounded">
                      {(zone.aiConfidence * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-xs text-zinc-300 mb-1">
                {zone.type}
              </div>
              
              <div className="text-xs text-zinc-400 mb-2">
                {zone.available}/{zone.capacity} seats
              </div>

              {/* Features */}
              {showFeatures && zone.features && zone.features.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {zone.features.slice(0, 2).map((feature, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-zinc-700 text-zinc-300 px-1 py-0.5 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                  {zone.features.length > 2 && (
                    <span className="text-xs text-zinc-500">
                      +{zone.features.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Resize Handle */}
              {isEditing && !zone.locked && (
                <div 
                  className="absolute bottom-0 right-0 w-3 h-3 bg-teal-400 cursor-se-resize"
                  onMouseDown={(e) => handleResize(zone.id, e, 'se')}
                />
              )}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {zones.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
            <div className="text-center">
              <Grid className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No zones to display</p>
              <p className="text-sm">Generate a layout first</p>
            </div>
          </div>
        )}
      </div>

      {/* Zone Actions */}
      {selectedZone && (
        <div className="p-4 bg-zinc-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">
              {zones.find(z => z.id === selectedZone)?.name}
            </h3>
            <button
              onClick={() => setSelectedZone(null)}
              className="text-zinc-400 hover:text-white"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => toggleZoneLock(selectedZone)}
              className="flex items-center space-x-2 px-3 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors"
            >
              {zones.find(z => z.id === selectedZone)?.locked ? (
                <Unlock className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>{zones.find(z => z.id === selectedZone)?.locked ? 'Unlock' : 'Lock'}</span>
            </button>
            
            <button
              onClick={() => duplicateZone(selectedZone)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Duplicate</span>
            </button>
            
            <button
              onClick={() => deleteZone(selectedZone)}
              className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
            
            <button
              onClick={() => {
                // Reset zone position
                setZones(prevZones =>
                  prevZones.map(zone =>
                    zone.id === selectedZone
                      ? {
                          ...zone,
                          coordinates: {
                            ...zone.coordinates,
                            x: 50,
                            y: 50
                          }
                        }
                      : zone
                  )
                );
              }}
              className="flex items-center space-x-2 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
