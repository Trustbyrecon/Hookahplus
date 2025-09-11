import React, { useState, useEffect } from 'react';
import ActiveSessionTimer from './ActiveSessionTimer';

interface FireSession {
  id: string;
  tableId: string;
  tableType: string;
  customerName: string;
  flavorMix: string;
  basePrice: number;
  totalPrice: number;
  capacity: number;
  status: 'preparing' | 'delivered' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
  qrCode: string;
  metadata: {
    zone: string;
    zoneLabel: string;
    estimatedPrepTime: number;
    estimatedSessionTime: number;
  };
}

export const FireSessionDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<FireSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<FireSession | null>(null);

  // Fetch sessions from API
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/fire-session');
        if (response.ok) {
          const data = await response.json();
          setSessions(data.sessions || []);
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (sessionId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/fire-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_status',
          sessionId: sessionId,
          newStatus: newStatus
        }),
      });

      if (response.ok) {
        // Update local state
        setSessions(prev => prev.map(session => 
          session.id === sessionId 
            ? { ...session, status: newStatus as any, updatedAt: new Date().toISOString() }
            : session
        ));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing': return '🔧';
      case 'delivered': return '✅';
      case 'active': return '🔥';
      case 'completed': return '✅';
      default: return '❓';
    }
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const preparingSessions = sessions.filter(s => s.status === 'preparing');
  const deliveredSessions = sessions.filter(s => s.status === 'delivered');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Fire Sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fire Session Dashboard</h1>
          <p className="text-gray-600">Real-time session management and monitoring</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🔥</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activeSessions.length}</div>
                <div className="text-sm text-gray-500">Active Sessions</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🔧</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{preparingSessions.length}</div>
                <div className="text-sm text-gray-500">Preparing</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">✅</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{deliveredSessions.length}</div>
                <div className="text-sm text-gray-500">Ready for Delivery</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">💰</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  ${sessions.reduce((sum, s) => sum + s.totalPrice, 0).toFixed(0)}
                </div>
                <div className="text-sm text-gray-500">Total Revenue</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">All Sessions</h2>
                <p className="text-sm text-gray-500">{sessions.length} total sessions</p>
              </div>
              <div className="p-6">
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🍃</div>
                    <p>No active sessions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          selectedSession?.id === session.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getStatusIcon(session.status)}</span>
                            <div>
                              <div className="font-medium text-gray-900">
                                Table {session.tableId}
                              </div>
                              <div className="text-sm text-gray-500">
                                {session.customerName} • {session.flavorMix}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                              {session.status}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              ${session.totalPrice.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-600">
                          <div>Zone: {session.metadata.zoneLabel}</div>
                          <div>Capacity: {session.capacity} people</div>
                          <div>QR: {session.qrCode}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Session Details & Timer */}
          <div className="lg:col-span-1">
            {selectedSession ? (
              <div className="space-y-6">
                {/* Session Details */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Session Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Table ID:</span>
                      <span className="font-medium">{selectedSession.tableId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium">{selectedSession.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Flavor:</span>
                      <span className="font-medium">{selectedSession.flavorMix}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">${selectedSession.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Zone:</span>
                      <span className="font-medium">{selectedSession.metadata.zoneLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">{selectedSession.capacity} people</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${getStatusColor(selectedSession.status)}`}>
                        {selectedSession.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active Session Timer */}
                {selectedSession.status === 'active' && (
                  <ActiveSessionTimer
                    sessionId={selectedSession.id}
                    startTime={selectedSession.updatedAt}
                    isActive={true}
                    onStatusUpdate={handleStatusUpdate}
                  />
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  {selectedSession.status === 'delivered' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedSession.id, 'active')}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold"
                    >
                      🔥 Start Active Session
                    </button>
                  )}
                  
                  {selectedSession.status === 'preparing' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedSession.id, 'delivered')}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      ✅ Mark as Delivered
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <div className="text-gray-500">
                  <div className="text-4xl mb-2">👆</div>
                  <p>Select a session to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FireSessionDashboard;