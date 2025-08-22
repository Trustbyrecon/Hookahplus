'use client';

import React, { useState, useEffect } from 'react';
import { 
  fireSessionWorkflow, 
  SessionState, 
  SessionStatus, 
  WorkflowEvent 
} from '../lib/fire-session-workflow';

interface HookahRoomDashboardProps {
  staffId: string;
}

export default function HookahRoomDashboard({ 
  staffId 
}: HookahRoomDashboardProps) {
  const [readyForDelivery, setReadyForDelivery] = useState<SessionState[]>([]);
  const [refillRequests, setRefillRequests] = useState<SessionState[]>([]);
  const [coalRequests, setCoalRequests] = useState<SessionState[]>([]);
  const [recentEvents, setRecentEvents] = useState<WorkflowEvent[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  // 🔄 Subscribe to workflow events
  useEffect(() => {
    const unsubscribeEvents = fireSessionWorkflow.subscribeToAgentEvents((event) => {
      // Update recent events
      const events = fireSessionWorkflow.getEventHistory();
      setRecentEvents(events.slice(-10).reverse());

      // Update metrics
      setMetrics(fireSessionWorkflow.getSessionMetrics());
    });

    // Subscribe to special dashboard events
    const unsubscribeReady = fireSessionWorkflow.subscribeToReadyForDelivery((data) => {
      const sessions = fireSessionWorkflow.getReadyForDeliverySessions();
      setReadyForDelivery(sessions);
    });

    const unsubscribeRefills = fireSessionWorkflow.subscribeToRefillRequests((data) => {
      const sessions = fireSessionWorkflow.getRefillRequests();
      setRefillRequests(sessions);
    });

    const unsubscribeCoals = fireSessionWorkflow.subscribeToCoalRequests((data) => {
      const sessions = fireSessionWorkflow.getCoalRequests();
      setCoalRequests(sessions);
    });

    // Load initial data
    setReadyForDelivery(fireSessionWorkflow.getReadyForDeliverySessions());
    setRefillRequests(fireSessionWorkflow.getRefillRequests());
    setCoalRequests(fireSessionWorkflow.getCoalRequests());
    setMetrics(fireSessionWorkflow.getSessionMetrics());

    return () => {
      unsubscribeEvents();
      unsubscribeReady();
      unsubscribeRefills();
      unsubscribeCoals();
    };
  }, []);

  // 🔑 Button press handler
  const handleButtonPress = async (
    sessionId: string,
    button: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const response = await fetch('/api/fire-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'press_button',
          sessionId,
          button,
          staffRole: 'hookah_room',
          staffId,
          metadata
        })
      });

      if (!response.ok) {
        console.error('Failed to press button');
      }
    } catch (error) {
      console.error('Button press error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            🔥 Hookah Room Staff Dashboard
          </h1>
          <div className="text-sm text-gray-500">
            Staff ID: {staffId}
          </div>
        </div>

        {/* Quick Stats */}
        {metrics && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{metrics.totalSessions}</div>
              <div className="text-sm text-blue-700">Total Sessions</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(metrics.refillRate * 100)}%
              </div>
              <div className="text-sm text-purple-700">Refill Rate</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(metrics.coalBurnoutRate * 100)}%
              </div>
              <div className="text-sm text-orange-700">Coal Burnout Rate</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {refillRequests.length + coalRequests.length}
              </div>
              <div className="text-sm text-green-700">Active Requests</div>
            </div>
          </div>
        )}
      </div>

      {/* Ready for Delivery - High Priority */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            🚀 Ready for Delivery ({readyForDelivery.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Sessions ready for front staff pickup
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {readyForDelivery.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No sessions ready for delivery.
            </div>
          ) : (
            readyForDelivery.map((session) => (
              <ReadyForDeliveryCard key={session.sessionId} session={session} />
            ))
          )}
        </div>
      </div>

      {/* Refill Requests */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            🥤 Refill Requests ({refillRequests.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Customers need flavor or water refills
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {refillRequests.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No refill requests pending.
            </div>
          ) : (
            refillRequests.map((session) => (
              <RefillRequestCard key={session.sessionId} session={session} />
            ))
          )}
        </div>
      </div>

      {/* Coal Requests */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            🔥 Coal Requests ({coalRequests.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Tables need new coals due to burnout
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {coalRequests.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No coal requests pending.
            </div>
          ) : (
            coalRequests.map((session) => (
              <CoalRequestCard 
                key={session.sessionId} 
                session={session} 
                onCoalsDelivered={(sessionId) => handleButtonPress(sessionId, 'coals_delivered')}
              />
            ))
          )}
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {recentEvents.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No recent events.
            </div>
          ) : (
            recentEvents.map((event, index) => (
              <EventCard key={index} event={event} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 🚀 Ready for Delivery Card
function ReadyForDeliveryCard({ session }: { session: SessionState }) {
  return (
    <div className="p-6 hover:bg-blue-50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">🚀</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Session {session.sessionId}
          </h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            READY
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Table {session.tableId}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span className="text-sm font-medium text-gray-700">Flavor Mix:</span>
          <div className="text-sm text-gray-900">{session.flavorMix}</div>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">Prep Staff:</span>
          <div className="text-sm text-gray-900">{session.staffAssigned.prep}</div>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">Ready Since:</span>
          <div className="text-sm text-blue-600 font-medium">
            {session.prepStage.readyForDeliveryAt?.toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>Action Required:</strong> Front staff should pick up this hookah for delivery
        </div>
      </div>
    </div>
  );
}

// 🥤 Refill Request Card
function RefillRequestCard({ session }: { session: SessionState }) {
  return (
    <div className="p-6 hover:bg-purple-50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">🥤</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Session {session.sessionId}
          </h3>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
            REFILL NEEDED
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Table {session.tableId}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span className="text-sm font-medium text-gray-700">Flavor Mix:</span>
          <div className="text-sm text-gray-900">{session.flavorMix}</div>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">Refill Type:</span>
          <div className="text-sm text-purple-600 font-medium capitalize">
            {session.refillStage.refillType}
          </div>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">Requested:</span>
          <div className="text-sm text-gray-900">
            {session.refillStage.requestedAt?.toLocaleTimeString()}
          </div>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">Front Staff:</span>
          <div className="text-sm text-gray-900">{session.staffAssigned.front}</div>
        </div>
      </div>

      <div className="bg-purple-50 p-3 rounded-lg">
        <div className="text-sm text-purple-800">
          <strong>Action Required:</strong> Front staff should deliver refill to table
        </div>
      </div>
    </div>
  );
}

// 🔥 Coal Request Card
function CoalRequestCard({ 
  session, 
  onCoalsDelivered 
}: { 
  session: SessionState;
  onCoalsDelivered: (sessionId: string) => void;
}) {
  return (
    <div className="p-6 hover:bg-orange-50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">🔥</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Session {session.sessionId}
          </h3>
          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
            COALS NEEDED
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Table {session.tableId}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span className="text-sm font-medium text-gray-700">Flavor Mix:</span>
          <div className="text-sm text-gray-900">{session.flavorMix}</div>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">Coal Type:</span>
          <div className="text-sm text-orange-600 font-medium capitalize">
            {session.coalStage.coalType.replace('_', ' ')}
          </div>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">Requested:</span>
          <div className="text-sm text-gray-900">
            {session.coalStage.requestedAt?.toLocaleTimeString()}
          </div>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">Front Staff:</span>
          <div className="text-sm text-gray-900">{session.staffAssigned.front}</div>
        </div>
      </div>

      <div className="bg-orange-50 p-3 rounded-lg mb-3">
        <div className="text-sm text-orange-800">
          <strong>Action Required:</strong> Deliver new coals to table
        </div>
      </div>

      <button
        onClick={() => onCoalsDelivered(session.sessionId)}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
      >
        🔥 Mark Coals as Delivered
      </button>
    </div>
  );
}

// 📊 Event Card Component
function EventCard({ event }: { event: WorkflowEvent }) {
  const getButtonColor = (button: string) => {
    if (['prep_started', 'flavor_locked', 'session_timer_armed', 'ready_for_delivery'].includes(button)) {
      return 'bg-blue-100 text-blue-800';
    }
    if (['picked_up', 'delivered', 'customer_confirmed', 'refill_delivered', 'coals_delivered'].includes(button)) {
      return 'bg-green-100 text-green-800';
    }
    if (['hold', 'redo_remix', 'return_to_prep'].includes(button)) {
      return 'bg-red-100 text-red-800';
    }
    if (['swap_charcoal'].includes(button)) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (['refill_requested'].includes(button)) {
      return 'bg-purple-100 text-purple-800';
    }
    if (['coals_burned_out'].includes(button)) {
      return 'bg-orange-100 text-orange-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getButtonColor(event.buttonPressed)}`}>
            {event.buttonPressed.replace('_', ' ').toUpperCase()}
          </span>
          <span className="text-sm font-medium text-gray-900">
            Session {event.sessionId}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {event.timestamp.toLocaleTimeString()}
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        <span className="font-medium">{event.staffRole}</span> staff member pressed{' '}
        <span className="font-medium">{event.buttonPressed.replace('_', ' ')}</span>
      </div>
      
      {event.metadata?.reason && (
        <div className="mt-2 text-xs text-gray-500">
          Reason: {event.metadata.reason}
        </div>
      )}
    </div>
  );
}
