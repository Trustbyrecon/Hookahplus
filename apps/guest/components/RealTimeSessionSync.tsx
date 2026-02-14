'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, Clock, Users, CreditCard } from 'lucide-react';

interface SessionMetadata {
  sessionId: string;
  tableId: string;
  customerId: string;
  startTime: Date;
  duration: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  totalAmount: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  staffAssigned: {
    foh: string | null;
    boh: string | null;
  };
  notes: string[];
  lastUpdated: Date;
}

interface RealTimeSessionSyncProps {
  sessionId?: string;
  onSessionUpdate?: (metadata: SessionMetadata) => void;
}

export const RealTimeSessionSync: React.FC<RealTimeSessionSyncProps> = ({
  sessionId,
  onSessionUpdate
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionMetadata, setSessionMetadata] = useState<SessionMetadata | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Simulate real-time connection
  useEffect(() => {
    const connectToSession = () => {
      setIsConnected(true);
      
      // Simulate receiving session metadata
      const mockMetadata: SessionMetadata = {
        sessionId: sessionId || 'session_001',
        tableId: 'T-001',
        customerId: 'customer_001',
        startTime: new Date(),
        duration: 60, // minutes
        status: 'active',
        paymentStatus: 'completed',
        totalAmount: 6400, // cents
        items: [
          { id: '1', name: 'Blue Mist Hookah', quantity: 2, price: 3200 }
        ],
        staffAssigned: {
          foh: 'Sarah Johnson',
          boh: 'Mike Chen'
        },
        notes: ['Customer prefers strong flavor', 'VIP table'],
        lastUpdated: new Date()
      };

      setSessionMetadata(mockMetadata);
      setLastSync(new Date());
      
      if (onSessionUpdate) {
        onSessionUpdate(mockMetadata);
      }
    };

    // Simulate connection delay
    const timer = setTimeout(connectToSession, 1000);

    return () => clearTimeout(timer);
  }, [sessionId, onSessionUpdate]);

  // Simulate periodic updates
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      if (sessionMetadata) {
        const updatedMetadata = {
          ...sessionMetadata,
          lastUpdated: new Date(),
          duration: sessionMetadata.duration + 1 // Simulate time passing
        };
        setSessionMetadata(updatedMetadata);
        setLastSync(new Date());
        
        if (onSessionUpdate) {
          onSessionUpdate(updatedMetadata);
        }
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isConnected, sessionMetadata, onSessionUpdate]);

  if (!isConnected) {
    return (
      <div className="bg-zinc-800 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <WifiOff className="w-4 h-4 text-zinc-400" />
          <span className="text-sm text-zinc-400">Connecting to session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Wifi className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400">Live Session Sync</span>
        </div>
        <div className="text-xs text-zinc-400">
          {lastSync?.toLocaleTimeString()}
        </div>
      </div>

      {sessionMetadata && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-300">
                {sessionMetadata.duration} min
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-300">
                ${(sessionMetadata.totalAmount / 100).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-zinc-400">Staff Assigned:</div>
            <div className="text-sm text-zinc-300">
              FOH: {sessionMetadata.staffAssigned.foh || 'Not assigned'}
            </div>
            <div className="text-sm text-zinc-300">
              BOH: {sessionMetadata.staffAssigned.boh || 'Not assigned'}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-zinc-400">Session Items:</div>
            {sessionMetadata.items.map((item, index) => (
              <div key={index} className="text-sm text-zinc-300">
                {item.quantity}x {item.name}
              </div>
            ))}
          </div>

          {sessionMetadata.notes.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-zinc-400">Notes:</div>
              {sessionMetadata.notes.map((note, index) => (
                <div key={index} className="text-sm text-zinc-300 bg-zinc-700 p-2 rounded">
                  {note}
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-zinc-700">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-primary-400" />
              <span className="text-xs text-zinc-400">
                Metadata synced with BOH dashboard
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeSessionSync;
