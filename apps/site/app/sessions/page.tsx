'use client';

import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  Flame, Users, Clock, TrendingUp, BarChart3, Settings, UserCheck, Brain, Shield, CreditCard, 
  ArrowRight, Play, CheckCircle, Zap, Activity, Heart, Star, Package, Truck, Home, Coffee, 
  Timer, Zap as ZapIcon, DollarSign, X, RotateCcw, CreditCard as CreditCardIcon, Ban, 
  AlertTriangle, MoreVertical, Info, ArrowLeft, RefreshCw, Eye, EyeOff, Lock, Unlock
} from 'lucide-react';
import { 
  mockSiteData, getActiveSessions, getBohSessions, getFohSessions, getEdgeCaseSessions,
  formatDuration, formatCurrency, getStatusColor, getStageIcon
} from '../../lib/mockData';

export default function SessionsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'boh' | 'foh' | 'waitlist' | 'edge'>('overview');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showIntelligence, setShowIntelligence] = useState(false);
  
  // Use mock data
  const sessions = mockSiteData.sessions;
  const activeSessions = getActiveSessions();
  const bohSessions = getBohSessions();
  const fohSessions = getFohSessions();
  const edgeCaseSessions = getEdgeCaseSessions();

  const metrics = [
    {
      title: 'Active Sessions',
      value: activeSessions.length.toString(),
      icon: <Flame className="w-6 h-6" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(sessions.reduce((sum, s) => sum + s.amount, 0)),
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      change: '+5%',
      changeType: 'positive' as const
    },
    {
      title: 'Avg Session Time',
      value: formatDuration(Math.floor(sessions.reduce((sum, s) => sum + s.sessionDuration, 0) / sessions.length)),
      icon: <Clock className="w-6 h-6" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      change: '+3m',
      changeType: 'positive' as const
    },
    {
      title: 'Guest Satisfaction',
      value: '94%',
      icon: <Star className="w-6 h-6" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      change: '+2%',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-teal-500/50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Fire Session Management</h1>
              <p className="text-zinc-400 mt-2">Real-time session monitoring and control</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="primary" 
                className="flex items-center gap-2"
                onClick={() => {
                  console.log('Starting new session');
                  alert('Starting new session - Opening session creation interface');
                }}
              >
                <Play className="w-4 h-4" />
                Start New Session
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowIntelligence(!showIntelligence)}
              >
                <Brain className="w-4 h-4" />
                {showIntelligence ? 'Hide' : 'Show'} Intelligence
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${metric.bgColor} mb-3`}>
                <div className={metric.color}>
                  {metric.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-teal-400 mb-1">{metric.value}</div>
              <div className="text-sm text-zinc-400">{metric.title}</div>
              <div className="text-xs text-zinc-500 mt-1">{metric.change}</div>
            </div>
          ))}
        </div>

        {/* Intelligence Panel */}
        {showIntelligence && (
          <div className="mb-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Guest Intelligence Dashboard
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowIntelligence(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-400 mb-2">Trust Score</h4>
                <div className="text-2xl font-bold text-white">{mockSiteData.trustMetrics.averageTrustScore}%</div>
                <div className="text-xs text-zinc-400">Average across all guests</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Flavor Preferences</h4>
                <div className="text-sm text-white">
                  {Object.entries(mockSiteData.trustMetrics.flavorPreferences)
                    .slice(0, 3)
                    .map(([flavor, count]) => (
                      <div key={flavor} className="flex justify-between">
                        <span>{flavor}</span>
                        <span className="text-zinc-400">{count}%</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Loyalty Tiers</h4>
                <div className="text-sm text-white">
                  {Object.entries(mockSiteData.trustMetrics.loyaltyTiers)
                    .map(([tier, count]) => (
                      <div key={tier} className="flex justify-between">
                        <span className="capitalize">{tier}</span>
                        <span className="text-zinc-400">{count}%</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'overview', label: 'OVERVIEW', icon: '📊' },
            { id: 'boh', label: 'BOH', icon: '👨‍🍳' },
            { id: 'foh', label: 'FOH', icon: '👨‍💼' },
            { id: 'waitlist', label: 'WAITLIST', icon: '⏰' },
            { id: 'edge', label: 'EDGE CASES', icon: '⚠️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Active Sessions */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-400" />
                Active Sessions ({activeSessions.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeSessions.map((session) => (
                  <Card key={session.id} className="hover:border-teal-500/50 transition-colors">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{session.tableId}</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-400">Active</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Customer:</span>
                          <span className="text-white">{session.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Flavor:</span>
                          <span className="text-teal-400">{session.flavor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Duration:</span>
                          <span className="text-white">{formatDuration(session.sessionTimer?.remaining || 0)} remaining</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Revenue:</span>
                          <span className="text-green-400 font-semibold">{formatCurrency(session.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Staff:</span>
                          <span className="text-white">{session.assignedStaff.foh}</span>
                        </div>
                      </div>
                      
                      {/* Session Notes */}
                      {session.notes && (
                        <div className="mt-3 p-2 bg-blue-900/20 border border-blue-600/30 rounded text-xs">
                          <div className="flex items-center space-x-1 mb-1">
                            <span className="text-blue-400">📝</span>
                            <span className="font-medium text-blue-300">Session Notes:</span>
                          </div>
                          <p className="text-blue-200">{session.notes}</p>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-zinc-700">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setSelectedSession(session.id)}
                          >
                            View Details
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              console.log(`Managing session ${session.id}`);
                              alert(`Managing ${session.tableId} - ${session.flavor}`);
                            }}
                          >
                            Manage
                          </Button>
                        </div>
                        
                        {/* Intelligence Button */}
                        <div className="mt-3 pt-3 border-t border-zinc-700">
                          <button
                            onClick={() => {
                              console.log(`Opening intelligence for session ${session.id}`);
                              alert(`Opening Guest Intelligence for ${session.customerName} at ${session.tableId}`);
                            }}
                            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors w-full justify-center"
                          >
                            <Brain className="w-4 h-4" />
                            <span className="text-sm font-medium">View Intelligence</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Workflow State Breakdown */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Workflow State Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{activeSessions.length}</div>
                  <div className="text-sm text-zinc-400">Active Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{bohSessions.length}</div>
                  <div className="text-sm text-zinc-400">BOH Prep</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-400">{fohSessions.length}</div>
                  <div className="text-sm text-zinc-400">FOH Delivery</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{edgeCaseSessions.length}</div>
                  <div className="text-sm text-zinc-400">Edge Cases</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOH Tab */}
        {activeTab === 'boh' && (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Package className="w-5 h-5 text-orange-400" />
                <span>Back of House Operations</span>
              </h3>
              <div className="space-y-3">
                {bohSessions.map((session) => (
                  <div key={session.id} className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{session.tableId}</h4>
                        <p className="text-sm text-zinc-400">{session.flavor}</p>
                        <p className="text-xs text-zinc-500">{session.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getStatusColor(session.status)}`}>
                          {session.status.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-zinc-500">BOH Stage</p>
                      </div>
                    </div>
                    {session.notes && (
                      <div className="mt-2 p-2 bg-blue-900/20 border border-blue-600/30 rounded text-xs">
                        <span className="text-blue-400">📝</span>
                        <span className="text-blue-200 ml-1">{session.notes}</span>
                      </div>
                    )}
                  </div>
                ))}
                {bohSessions.length === 0 && (
                  <p className="text-zinc-400 text-center py-8">No BOH sessions in progress</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FOH Tab */}
        {activeTab === 'foh' && (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Truck className="w-5 h-5 text-teal-400" />
                <span>Front of House Operations</span>
              </h3>
              <div className="space-y-3">
                {fohSessions.map((session) => (
                  <div key={session.id} className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{session.tableId}</h4>
                        <p className="text-sm text-zinc-400">{session.customerName}</p>
                        <p className="text-xs text-zinc-500">{session.flavor}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getStatusColor(session.status)}`}>
                          {session.status.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-zinc-500">FOH Stage</p>
                      </div>
                    </div>
                    {session.notes && (
                      <div className="mt-2 p-2 bg-blue-900/20 border border-blue-600/30 rounded text-xs">
                        <span className="text-blue-400">📝</span>
                        <span className="text-blue-200 ml-1">{session.notes}</span>
                      </div>
                    )}
                  </div>
                ))}
                {fohSessions.length === 0 && (
                  <p className="text-zinc-400 text-center py-8">No FOH sessions in progress</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Waitlist Tab */}
        {activeTab === 'waitlist' && (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span>Customer Waitlist</span>
                </h3>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Add to Waitlist</span>
                </button>
              </div>
              
              {/* Search and Filters */}
              <div className="flex space-x-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search customers..."
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <select className="px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-yellow-500">
                  <option value="waiting">Waiting</option>
                  <option value="seated">Seated</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select className="px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-yellow-500">
                  <option value="all">All Priority</option>
                  <option value="vip">VIP</option>
                  <option value="normal">Normal</option>
                </select>
              </div>

              {/* Waitlist Entries */}
              <div className="space-y-3">
                {/* Sample waitlist entries */}
                <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Sarah Johnson</h4>
                        <p className="text-sm text-zinc-400">4 people • +1-555-0123 • 25m wait</p>
                        <p className="text-xs text-zinc-500">Booth preferred • Regular customer</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">NORMAL</span>
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">WAITING</span>
                      <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                        Seat
                      </button>
                      <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Mike Chen</h4>
                        <p className="text-sm text-zinc-400">2 people • +1-555-0456 • 15m wait</p>
                        <p className="text-xs text-zinc-500">VIP member</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">VIP</span>
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">WAITING</span>
                      <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                        Seat
                      </button>
                      <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Alex Rodriguez</h4>
                        <p className="text-sm text-zinc-400">6 people • +1-555-0789 • 45m wait</p>
                        <p className="text-xs text-zinc-500">Large table needed • Birthday party</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">NORMAL</span>
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">WAITING</span>
                      <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                        Seat
                      </button>
                      <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edge Cases Tab */}
        {activeTab === 'edge' && (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span>Edge Cases & Escalations</span>
              </h3>
              <div className="space-y-3">
                {edgeCaseSessions.map((session) => (
                  <div key={session.id} className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{session.tableId}</h4>
                        <p className="text-sm text-zinc-400">{session.customerName}</p>
                        {session.notes && (
                          <p className="text-sm text-yellow-400 mt-1">📝 {session.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-red-400 font-medium">
                          {session.status.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-zinc-500">Requires Attention</p>
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors">
                        Escalate
                      </button>
                      <button className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors">
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
                {edgeCaseSessions.length === 0 && (
                  <p className="text-zinc-400 text-center py-8">No edge cases requiring attention</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
