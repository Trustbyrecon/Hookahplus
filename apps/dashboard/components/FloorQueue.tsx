// apps/dashboard/components/FloorQueue.tsx
"use client";

import { useState, useEffect } from 'react';

interface QueueItem {
  id: string;
  tableId: string;
  customerName: string;
  partySize: number;
  flavor: string;
  status: 'waiting' | 'preparing' | 'ready' | 'served';
  estimatedWait: number;
  createdAt: string;
  priority: 'normal' | 'high';
}

interface ActiveSession {
  id: string;
  tableId: string;
  customerName: string;
  partySize: number;
  flavor: string;
  status: 'prep' | 'active' | 'refill' | 'coals_needed' | 'completed';
  startTime: string;
  estimatedEndTime: string;
  staffAssigned: {
    prep: string;
    front: string;
    hookah_room: string;
  };
}

interface FloorQueueData {
  floorQueue: QueueItem[];
  activeSessions: ActiveSession[];
  alerts: any[];
  stats: {
    totalInQueue: number;
    activeSessions: number;
    pendingAlerts: number;
    averageWaitTime: number;
  };
}

export default function FloorQueue() {
  const [data, setData] = useState<FloorQueueData | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [newTableId, setNewTableId] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newPartySize, setNewPartySize] = useState(2);
  const [newFlavor, setNewFlavor] = useState('');

  const fetchData = async () => {
    try {
      const response = await fetch('/api/floor-queue');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch floor queue data:', error);
    }
  };

  const startDemo = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/floor-queue?action=start-demo');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
          setDemoMode(true);
        }
      }
    } catch (error) {
      console.error('Failed to start demo:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopDemo = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/floor-queue?action=stop-demo');
      if (response.ok) {
        setData(null);
        setDemoMode(false);
      }
    } catch (error) {
      console.error('Failed to stop demo:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToQueue = async () => {
    if (!newTableId) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/floor-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-to-queue',
          tableId: newTableId,
          customerName: newCustomerName,
          partySize: newPartySize,
          flavor: newFlavor
        })
      });
      
      if (response.ok) {
        await fetchData();
        setNewTableId('');
        setNewCustomerName('');
        setNewPartySize(2);
        setNewFlavor('');
      }
    } catch (error) {
      console.error('Failed to add to queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const fireSession = async (tableId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/floor-queue?action=fire-session&tableId=${tableId}`);
      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to fire session:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (demoMode) {
      const interval = setInterval(fetchData, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [demoMode]);

  return (
    <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-teal-300">Floor Queue</h2>
        <div className="flex gap-2">
          {!demoMode ? (
            <button
              onClick={startDemo}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Start Demo'}
            </button>
          ) : (
            <button
              onClick={stopDemo}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Stopping...' : 'Stop Demo'}
            </button>
          )}
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Queue Stats */}
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-300 mb-4">Queue Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{data.stats.totalInQueue}</div>
                <div className="text-sm text-zinc-400">In Queue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{data.stats.activeSessions}</div>
                <div className="text-sm text-zinc-400">Active Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{data.stats.pendingAlerts}</div>
                <div className="text-sm text-zinc-400">Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{data.stats.averageWaitTime}m</div>
                <div className="text-sm text-zinc-400">Avg Wait</div>
              </div>
            </div>
          </div>

          {/* Add to Queue */}
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">Add to Queue</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Table ID (e.g., T-001)"
                value={newTableId}
                onChange={(e) => setNewTableId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-700 text-white rounded-md border border-zinc-600 focus:border-teal-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Customer Name"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-700 text-white rounded-md border border-zinc-600 focus:border-teal-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Party Size"
                  value={newPartySize}
                  onChange={(e) => setNewPartySize(parseInt(e.target.value) || 2)}
                  className="flex-1 px-3 py-2 bg-zinc-700 text-white rounded-md border border-zinc-600 focus:border-teal-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Flavor"
                  value={newFlavor}
                  onChange={(e) => setNewFlavor(e.target.value)}
                  className="flex-1 px-3 py-2 bg-zinc-700 text-white rounded-md border border-zinc-600 focus:border-teal-500 focus:outline-none"
                />
              </div>
              <button
                onClick={addToQueue}
                disabled={loading || !newTableId}
                className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add to Queue'}
              </button>
            </div>
          </div>

          {/* Queue Items */}
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-300 mb-4">Queue ({data.floorQueue.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {data.floorQueue.length === 0 ? (
                <p className="text-zinc-400 text-center py-4">No items in queue</p>
              ) : (
                data.floorQueue.map((item) => (
                  <div key={item.id} className="bg-zinc-700 rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{item.tableId} - {item.customerName}</div>
                        <div className="text-sm text-zinc-300">{item.flavor} • Party of {item.partySize}</div>
                        <div className="text-xs text-zinc-400">
                          Wait: {item.estimatedWait}m • {item.status}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.priority === 'high' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                        }`}>
                          {item.priority}
                        </span>
                        <button
                          onClick={() => fireSession(item.tableId)}
                          disabled={loading}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          Fire
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-300 mb-4">Active Sessions ({data.activeSessions.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {data.activeSessions.length === 0 ? (
                <p className="text-zinc-400 text-center py-4">No active sessions</p>
              ) : (
                data.activeSessions.map((session) => (
                  <div key={session.id} className="bg-zinc-700 rounded-md p-3">
                    <div className="font-medium text-white">{session.tableId} - {session.customerName}</div>
                    <div className="text-sm text-zinc-300">{session.flavor} • Party of {session.partySize}</div>
                    <div className="text-xs text-zinc-400">
                      Status: {session.status} • Started: {new Date(session.startTime).toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      Staff: {session.staffAssigned.prep} (Prep), {session.staffAssigned.front} (Front)
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {!data && !loading && (
        <div className="text-center py-8">
          <p className="text-zinc-400 mb-4">Floor queue is not operationalized</p>
          <button
            onClick={startDemo}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
          >
            Start Demo Mode
          </button>
        </div>
      )}
    </div>
  );
}
