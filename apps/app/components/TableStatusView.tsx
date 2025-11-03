'use client';

import React, { useEffect, useState } from 'react';

interface Table {
  id: string;
  number: string;
  section?: string;
  capacity: number;
  status: 'available' | 'active' | 'needs_attention' | 'reserved';
  sessionId?: number;
}

export default function TableStatusView() {
  const [tables, setTables] = useState<Table[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionsRes = await fetch('/api/sessions');
        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          setSessions(sessionsData);

          // Generate table status from sessions
          // In production, this would come from database
          const defaultTables: Table[] = [
            { id: 'A1', number: 'A1', section: 'VIP', capacity: 4, status: 'available' },
            { id: 'A2', number: 'A2', section: 'VIP', capacity: 4, status: 'available' },
            { id: 'B1', number: 'B1', section: 'Main', capacity: 6, status: 'available' },
            { id: 'B2', number: 'B2', section: 'Main', capacity: 6, status: 'available' },
            { id: 'C1', number: 'C1', section: 'Bar', capacity: 2, status: 'available' },
            { id: 'C2', number: 'C2', section: 'Bar', capacity: 2, status: 'available' },
          ];

          // Map sessions to tables
          const activeSessions = sessionsData.filter((s: any) => !s.endTime);
          const tablesWithStatus = defaultTables.map(table => {
            const session = activeSessions.find((s: any) => s.table === table.number);
            if (session) {
              const duration = Date.now() - session.startTime;
              const hours = duration / (1000 * 60 * 60);
              return {
                ...table,
                status: hours > 2 ? 'needs_attention' : 'active',
                sessionId: session.id,
              };
            }
            return table;
          });

          setTables(tablesWithStatus);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 border-green-500/30 text-green-400';
      case 'active':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      case 'needs_attention':
        return 'bg-red-500/20 border-red-500/30 text-red-400';
      case 'reserved':
        return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'active':
        return 'Active';
      case 'needs_attention':
        return 'Needs Attention';
      case 'reserved':
        return 'Reserved';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-400">
        Loading table status...
      </div>
    );
  }

  const statusCounts = tables.reduce((acc, table) => {
    acc[table.status] = (acc[table.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Table Status</h2>
        <div className="flex gap-4 text-sm">
          <span className="text-green-400">Available: {statusCounts.available || 0}</span>
          <span className="text-yellow-400">Active: {statusCounts.active || 0}</span>
          <span className="text-red-400">Attention: {statusCounts.needs_attention || 0}</span>
        </div>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => {
          const session = sessions.find((s: any) => s.id === table.sessionId && !s.endTime);
          const duration = session ? Date.now() - session.startTime : 0;
          const hours = Math.floor(duration / (1000 * 60 * 60));
          const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

          return (
            <div
              key={table.id}
              className={`
                rounded-lg p-4 border-2 transition-all cursor-pointer
                ${getStatusColor(table.status)}
                hover:scale-105
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-lg">{table.number}</div>
                <span className="text-xs px-2 py-1 rounded-full border">
                  {getStatusLabel(table.status)}
                </span>
              </div>

              {table.section && (
                <div className="text-xs text-gray-400 mb-1">{table.section}</div>
              )}

              <div className="text-xs text-gray-300">
                Capacity: {table.capacity}
              </div>

              {session && (
                <div className="mt-2 pt-2 border-t border-current/20">
                  <div className="text-xs">
                    <div>Duration: {hours}h {minutes}m</div>
                    <div>Flavors: {session.flavors?.join(', ') || 'None'}</div>
                    <div>Refills: {session.refills || 0}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
        <h3 className="text-sm font-semibold text-white mb-2">Status Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-300">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-300">Active Session</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-300">Needs Attention</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span className="text-gray-300">Reserved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
