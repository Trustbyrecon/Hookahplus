"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GlobalNavigation from '../../components/GlobalNavigation';

interface FireSession {
  id: string;
  tableId: string;
  customerName: string;
  flavor: string;
  amount: number;
  status: 'NEW' | 'PAID_CONFIRMED' | 'PREP_IN_PROGRESS' | 'HEAT_UP' | 'READY_FOR_DELIVERY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'ACTIVE' | 'CLOSE_PENDING' | 'CLOSED' | 'STAFF_HOLD' | 'STOCK_BLOCKED' | 'REMAKE';
  currentStage: 'BOH' | 'FOH' | 'CUSTOMER';
  assignedStaff: {
    boh?: string;
    foh?: string;
  };
  createdAt: number;
  updatedAt: number;
  sessionStartTime?: number;
  sessionDuration: number;
  coalStatus: 'active' | 'needs_refill' | 'burnt_out';
  refillStatus: 'none' | 'requested' | 'delivered';
  notes: string;
  edgeCase: string | null;
}

export default function FireSessionDashboard() {
  const [sessions, setSessions] = useState<FireSession[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'boh' | 'foh' | 'edge-cases'>('overview');
  const [currentUser, setCurrentUser] = useState({ role: 'admin', id: 'user-1' });
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Generate demo sessions
  useEffect(() => {
    const demoSessions: FireSession[] = [
      {
        id: 'session-1',
        tableId: 'T-001',
        customerName: 'Alex Johnson',
        flavor: 'Blue Mist + Mint',
        amount: 3000,
        status: 'ACTIVE',
        currentStage: 'CUSTOMER',
        assignedStaff: { boh: 'Chef Mike', foh: 'Sarah Chen' },
        createdAt: Date.now() - 3600000,
        updatedAt: Date.now(),
        sessionStartTime: Date.now() - 1800000,
        sessionDuration: 1800000,
        coalStatus: 'needs_refill',
        refillStatus: 'requested',
        notes: 'Customer requested extra mint',
        edgeCase: null
      },
      {
        id: 'session-2',
        tableId: 'T-003',
        customerName: 'Emily Davis',
        flavor: 'Double Apple',
        amount: 3200,
        status: 'READY_FOR_DELIVERY',
        currentStage: 'BOH',
        assignedStaff: { boh: 'Chef Mike' },
        createdAt: Date.now() - 900000,
        updatedAt: Date.now(),
        sessionDuration: 0,
        coalStatus: 'active',
        refillStatus: 'none',
        notes: 'Ready for pickup',
        edgeCase: null
      },
      {
        id: 'session-3',
        tableId: 'Bar-1',
        customerName: 'Mike Rodriguez',
        flavor: 'Peach Wave',
        amount: 2800,
        status: 'STAFF_HOLD',
        currentStage: 'BOH',
        assignedStaff: { boh: 'Chef Sarah' },
        createdAt: Date.now() - 600000,
        updatedAt: Date.now(),
        sessionDuration: 0,
        coalStatus: 'active',
        refillStatus: 'none',
        notes: 'Waiting for flavor restock',
        edgeCase: 'STOCK_BLOCKED'
      }
    ];
    setSessions(demoSessions);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'text-blue-400';
      case 'PAID_CONFIRMED': return 'text-green-400';
      case 'PREP_IN_PROGRESS': return 'text-yellow-400';
      case 'HEAT_UP': return 'text-orange-400';
      case 'READY_FOR_DELIVERY': return 'text-purple-400';
      case 'OUT_FOR_DELIVERY': return 'text-indigo-400';
      case 'DELIVERED': return 'text-teal-400';
      case 'ACTIVE': return 'text-green-400';
      case 'CLOSE_PENDING': return 'text-red-400';
      case 'CLOSED': return 'text-gray-400';
      case 'STAFF_HOLD': return 'text-yellow-400';
      case 'STOCK_BLOCKED': return 'text-red-400';
      case 'REMAKE': return 'text-pink-400';
      default: return 'text-zinc-400';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'BOH': return 'bg-blue-600/20 border-blue-500/50';
      case 'FOH': return 'bg-green-600/20 border-green-500/50';
      case 'CUSTOMER': return 'bg-purple-600/20 border-purple-500/50';
      default: return 'bg-zinc-600/20 border-zinc-500/50';
    }
  };

            const canPerformAction = (userRole: string, action: string, session: FireSession) => {
            if (userRole === 'admin') return true;

            switch (action) {
              case 'claim_prep':
                return userRole === 'boh' && session.status === 'PAID_CONFIRMED';
              case 'heat_up':
                return userRole === 'boh' && session.status === 'PREP_IN_PROGRESS';
              case 'ready_for_delivery':
                return userRole === 'boh' && session.status === 'HEAT_UP';
              case 'deliver_now':
                return userRole === 'foh' && session.status === 'READY_FOR_DELIVERY';
              case 'mark_delivered':
                return userRole === 'foh' && session.status === 'OUT_FOR_DELIVERY';
              case 'start_active':
                return userRole === 'foh' && session.status === 'DELIVERED';
              case 'handle_edge_case':
                return true;
              case 'restart_prep':
                return userRole === 'boh' && (session.status === 'STAFF_HOLD' || session.status === 'STOCK_BLOCKED' || session.status === 'REMAKE');
              case 'resolve_issue':
                return userRole === 'boh' && session.edgeCase !== null;
              case 'flag_manager':
                return userRole === 'boh' && session.edgeCase !== null;
              case 'process_payment':
                return userRole === 'foh' && session.status === 'ACTIVE';
              case 'close_session':
                return userRole === 'foh' && session.status === 'ACTIVE';
              default:
                return false;
            }
          };

  const handleAction = async (sessionId: string, action: string) => {
    try {
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      if (sessionIndex === -1) return;

      const session = sessions[sessionIndex];
      if (!canPerformAction(currentUser.role, action, session)) {
        alert('Insufficient permissions for this action');
        return;
      }

      const updatedSession = { ...session };
      
                    // Apply action logic
              switch (action) {
                case 'claim_prep':
                  updatedSession.status = 'PREP_IN_PROGRESS';
                  updatedSession.currentStage = 'BOH';
                  updatedSession.assignedStaff.boh = currentUser.id;
                  break;
                case 'heat_up':
                  updatedSession.status = 'HEAT_UP';
                  break;
                case 'ready_for_delivery':
                  updatedSession.status = 'READY_FOR_DELIVERY';
                  updatedSession.currentStage = 'FOH';
                  break;
                case 'deliver_now':
                  updatedSession.status = 'OUT_FOR_DELIVERY';
                  updatedSession.assignedStaff.foh = currentUser.id;
                  break;
                case 'mark_delivered':
                  updatedSession.status = 'DELIVERED';
                  break;
                case 'start_active':
                  updatedSession.status = 'ACTIVE';
                  updatedSession.currentStage = 'CUSTOMER';
                  updatedSession.sessionStartTime = Date.now();
                  break;
                case 'handle_edge_case':
                  updatedSession.status = 'STAFF_HOLD';
                  updatedSession.edgeCase = 'MANUAL_INTERVENTION';
                  break;
                case 'restart_prep':
                  updatedSession.status = 'PREP_IN_PROGRESS';
                  updatedSession.currentStage = 'BOH';
                  updatedSession.edgeCase = null;
                  updatedSession.notes = `${updatedSession.notes}\n[${new Date().toLocaleTimeString()}] Prep restarted by BOH staff`;
                  break;
                case 'resolve_issue':
                  updatedSession.edgeCase = null;
                  updatedSession.status = 'PREP_IN_PROGRESS';
                  updatedSession.notes = `${updatedSession.notes}\n[${new Date().toLocaleTimeString()}] Issue resolved by BOH staff`;
                  break;
                case 'flag_manager':
                  updatedSession.notes = `${updatedSession.notes}\n[${new Date().toLocaleTimeString()}] FLAGGED FOR MANAGER REVIEW - ${updatedSession.edgeCase}`;
                  break;
                case 'process_payment':
                  // Redirect to Stripe checkout
                  window.open(`/checkout?sessionId=${sessionId}&amount=${updatedSession.amount}`, '_blank');
                  break;
                case 'close_session':
                  updatedSession.status = 'CLOSED';
                  updatedSession.currentStage = 'BOH';
                  updatedSession.notes = `${updatedSession.notes}\n[${new Date().toLocaleTimeString()}] Session closed by FOH staff`;
                  break;
              }

      updatedSession.updatedAt = Date.now();
      
      // Update sessions
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? updatedSession : s
      ));

      // In production, this would call the API
      console.log(`Action ${action} performed on session ${sessionId}`);
      
    } catch (error) {
      console.error('Action failed:', error);
      alert('Action failed. Please try again.');
    }
  };

  const createNewSession = () => {
    const newSession: FireSession = {
      id: `session-${Date.now()}`,
      tableId: `T-${Math.floor(Math.random() * 20) + 1}`,
      customerName: `Customer ${Math.floor(Math.random() * 100) + 1}`,
      flavor: ['Blue Mist', 'Double Apple', 'Peach Wave', 'Mint Fresh'][Math.floor(Math.random() * 4)],
      amount: 2500 + Math.floor(Math.random() * 1000),
      status: 'NEW',
      currentStage: 'BOH',
      assignedStaff: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sessionDuration: 0,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'New session created',
      edgeCase: null
    };

    setSessions(prev => [newSession, ...prev]);
    setIsCreatingSession(false);
  };

  const activeSessions = sessions.filter(s => s.status === 'ACTIVE');
  const bohSessions = sessions.filter(s => s.currentStage === 'BOH');
  const fohSessions = sessions.filter(s => s.currentStage === 'FOH');
  const edgeCaseSessions = sessions.filter(s => s.edgeCase || s.status === 'STAFF_HOLD' || s.status === 'STOCK_BLOCKED');

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-teal-300 mb-2">🔥 Fire Session Dashboard</h1>
          <p className="text-zinc-400">Complete BOH/FOH workflow management with edge case handling</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-white">{sessions.length}</div>
            <div className="text-sm text-zinc-400">Total Sessions</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">👨‍🍳</div>
            <div className="text-2xl font-bold text-white">{bohSessions.length}</div>
            <div className="text-sm text-zinc-400">BOH Active</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-white">{fohSessions.length}</div>
            <div className="text-sm text-zinc-400">FOH Active</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">⚠️</div>
            <div className="text-2xl font-bold text-white">{edgeCaseSessions.length}</div>
            <div className="text-sm text-zinc-400">Edge Cases</div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setIsCreatingSession(true)}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
            >
              🆕 Create Session
            </button>
            <Link
              href="/sessions"
              className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors"
            >
              📊 View All Sessions
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={currentUser.role}
              onChange={(e) => setCurrentUser(prev => ({ ...prev, role: e.target.value }))}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            >
              <option value="admin">👑 Admin</option>
              <option value="boh">👨‍🍳 BOH Staff</option>
              <option value="foh">👥 FOH Staff</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'overview', label: '📊 Overview', count: sessions.length },
            { id: 'boh', label: '👨‍🍳 BOH', count: bohSessions.length },
            { id: 'foh', label: '👥 FOH', count: fohSessions.length },
            { id: 'edge-cases', label: '⚠️ Edge Cases', count: edgeCaseSessions.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Session Flow Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">👨‍🍳</div>
                  <div className="text-2xl font-bold text-blue-400">{bohSessions.length}</div>
                  <div className="text-zinc-400">Back of House</div>
                  <div className="text-sm text-zinc-500">Prep & Assembly</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">👥</div>
                  <div className="text-2xl font-bold text-green-400">{fohSessions.length}</div>
                  <div className="text-zinc-400">Front of House</div>
                  <div className="text-sm text-zinc-500">Delivery & Service</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-2xl font-bold text-purple-400">{activeSessions.length}</div>
                  <div className="text-zinc-400">Active Customers</div>
                  <div className="text-sm text-zinc-500">Live Sessions</div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Recent Sessions</h3>
              <div className="space-y-3">
                {sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getStageColor(session.currentStage)}`}>
                        {session.currentStage}
                      </div>
                      <div>
                        <div className="font-medium text-white">Table {session.tableId}</div>
                        <div className="text-sm text-zinc-400">{session.customerName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getStatusColor(session.status)}`}>
                        {session.status.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-zinc-500">{session.flavor}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BOH Tab */}
        {activeTab === 'boh' && (
          <div className="space-y-6">
            {bohSessions.map((session) => (
              <div key={session.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">👨‍🍳</div>
                    <div>
                      <h3 className="text-xl font-semibold text-blue-300">Table {session.tableId}</h3>
                      <p className="text-zinc-400">{session.customerName} - {session.flavor}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${getStatusColor(session.status)}`}>
                      {session.status.replace(/_/g, ' ')}
                    </div>
                    <div className="text-zinc-400">${(session.amount / 100).toFixed(2)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-zinc-400">Assigned Staff:</span>
                    <div className="text-blue-300 font-medium">{session.assignedStaff.boh || 'Unassigned'}</div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Notes:</span>
                    <div className="text-zinc-300 font-medium">{session.notes}</div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Created:</span>
                    <div className="text-zinc-300 font-medium">
                      {new Date(session.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                                        <div className="flex gap-2 flex-wrap">
                          {session.status === 'PAID_CONFIRMED' && (
                            <button
                              onClick={() => handleAction(session.id, 'claim_prep')}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              🚀 Claim Prep
                            </button>
                          )}
                          {session.status === 'PREP_IN_PROGRESS' && (
                            <button
                              onClick={() => handleAction(session.id, 'heat_up')}
                              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              🔥 Heat Up
                            </button>
                          )}
                          {session.status === 'HEAT_UP' && (
                            <button
                              onClick={() => handleAction(session.id, 'ready_for_delivery')}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              ✅ Ready for Delivery
                            </button>
                          )}
                          {canPerformAction(currentUser.role, 'restart_prep', session) && (
                            <button
                              onClick={() => handleAction(session.id, 'restart_prep')}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              🔄 Restart Prep
                            </button>
                          )}
                          {canPerformAction(currentUser.role, 'resolve_issue', session) && (
                            <button
                              onClick={() => handleAction(session.id, 'resolve_issue')}
                              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              ✅ Resolve Issue
                            </button>
                          )}
                          {canPerformAction(currentUser.role, 'flag_manager', session) && (
                            <button
                              onClick={() => handleAction(session.id, 'flag_manager')}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              🚨 Flag Manager
                            </button>
                          )}
                          <button
                            onClick={() => handleAction(session.id, 'handle_edge_case')}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            ⚠️ Hold Session
                          </button>
                        </div>
              </div>
            ))}
          </div>
        )}

        {/* FOH Tab */}
        {activeTab === 'foh' && (
          <div className="space-y-6">
            {fohSessions.map((session) => (
              <div key={session.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">👥</div>
                    <div>
                      <h3 className="text-xl font-semibold text-green-300">Table {session.tableId}</h3>
                      <p className="text-zinc-400">{session.customerName} - {session.flavor}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${getStatusColor(session.status)}`}>
                      {session.status.replace(/_/g, ' ')}
                    </div>
                    <div className="text-zinc-400">${(session.amount / 100).toFixed(2)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-zinc-400">Assigned Staff:</span>
                    <div className="text-green-300 font-medium">{session.assignedStaff.foh || 'Unassigned'}</div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Notes:</span>
                    <div className="text-zinc-300 font-medium">{session.notes}</div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Status:</span>
                    <div className="text-zinc-300 font-medium">
                      {session.status === 'READY_FOR_DELIVERY' ? 'Ready for Pickup' : 'In Progress'}
                    </div>
                  </div>
                </div>

                                        <div className="flex gap-2 flex-wrap">
                          {session.status === 'READY_FOR_DELIVERY' && (
                            <button
                              onClick={() => handleAction(session.id, 'deliver_now')}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              🚚 Pick Up & Deliver
                            </button>
                          )}
                          {session.status === 'OUT_FOR_DELIVERY' && (
                            <button
                              onClick={() => handleAction(session.id, 'mark_delivered')}
                              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              ✅ Mark Delivered
                            </button>
                          )}
                          {session.status === 'DELIVERED' && (
                            <button
                              onClick={() => handleAction(session.id, 'start_active')}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              🎯 Start Active Session
                            </button>
                          )}
                          {canPerformAction(currentUser.role, 'process_payment', session) && (
                            <button
                              onClick={() => handleAction(session.id, 'process_payment')}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              💳 Process Payment
                            </button>
                          )}
                          {canPerformAction(currentUser.role, 'close_session', session) && (
                            <button
                              onClick={() => handleAction(session.id, 'close_session')}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              🔚 Close Session
                            </button>
                          )}
                        </div>
              </div>
            ))}
          </div>
        )}

        {/* Edge Cases Tab */}
        {activeTab === 'edge-cases' && (
          <div className="space-y-6">
            {edgeCaseSessions.map((session) => (
              <div key={session.id} className="bg-zinc-900 rounded-xl border border-yellow-500/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">⚠️</div>
                    <div>
                      <h3 className="text-xl font-semibold text-yellow-300">Table {session.tableId}</h3>
                      <p className="text-zinc-400">{session.customerName} - {session.flavor}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-yellow-400">
                      {session.edgeCase || session.status}
                    </div>
                    <div className="text-zinc-400">${(session.amount / 100).toFixed(2)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-zinc-400">Issue Type:</span>
                    <div className="text-yellow-300 font-medium">
                      {session.edgeCase || session.status.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Current Stage:</span>
                    <div className={`text-sm font-medium px-2 py-1 rounded ${getStageColor(session.currentStage)}`}>
                      {session.currentStage}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Notes:</span>
                    <div className="text-zinc-300 font-medium">{session.notes}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(session.id, 'handle_edge_case')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    🔧 Resolve Issue
                  </button>
                  <button
                    onClick={() => handleAction(session.id, 'claim_prep')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    🔄 Restart Prep
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {isCreatingSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-teal-300 mb-4">Create New Session</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Table ID</label>
                <input
                  type="text"
                  placeholder="T-001"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Customer Name</label>
                <input
                  type="text"
                  placeholder="Customer Name"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Flavor</label>
                <select className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white">
                  <option>Blue Mist</option>
                  <option>Double Apple</option>
                  <option>Peach Wave</option>
                  <option>Mint Fresh</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Amount (cents)</label>
                <input
                  type="number"
                  placeholder="3000"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsCreatingSession(false)}
                className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNewSession}
                className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
              >
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
