"use client";

import React, { useState } from 'react';
import { Card, Button, Badge, MetricCard } from '@hookahplus/design-system';
import { 
  Flame, 
  Users, 
  Clock, 
  TrendingUp,
  Plus,
  BarChart3,
  Settings,
  ChefHat,
  UserCheck,
  AlertTriangle,
  Crown,
  Folder,
  FileText,
  RefreshCw,
  CheckCircle,
  Flag,
  Pause,
  Zap
} from 'lucide-react';

export default function FireSessionDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSession, setNewSession] = useState({
    tableId: 'T-001',
    customerName: '',
    flavor: 'Blue Mist',
    amount: 3000
  });

  const metrics = [
    {
      title: 'Total Sessions',
      value: '1',
      icon: <Flame className="w-8 h-8 text-orange-400" />,
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'BOH Active',
      value: '1',
      icon: <ChefHat className="w-8 h-8 text-green-400" />,
      change: '+5%',
      changeType: 'positive' as const
    },
    {
      title: 'FOH Active',
      value: '0',
      icon: <Users className="w-8 h-8 text-purple-400" />,
      change: '-2%',
      changeType: 'negative' as const
    },
    {
      title: 'Edge Cases',
      value: '0',
      icon: <AlertTriangle className="w-8 h-8 text-yellow-400" />,
      change: '0%',
      changeType: 'neutral' as const
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview (1)', icon: <BarChart3 className="w-4 h-4" />, count: 1 },
    { id: 'boh', label: 'BOH (1)', icon: <ChefHat className="w-4 h-4" />, count: 1 },
    { id: 'foh', label: 'FOH', icon: <Users className="w-4 h-4" />, count: 0 },
    { id: 'edge', label: '▲ Edge Cases', icon: <AlertTriangle className="w-4 h-4" />, count: 0 }
  ];

  const sampleSession = {
    id: 'session_T-001_1758552685415',
    tableId: 'T-001',
    customerName: 'Anonymous',
    flavor: 'Custom Mix',
    status: 'PREP_IN_PROGRESS',
    amount: 30.00,
    assignedBOH: 'staff_001',
    notes: 'Source: undefined, External Ref: undefined [10:52:39 AM] Prep restarted by BOH staff',
    created: 'Invalid Date'
  };

  const handleCreateSession = () => {
    console.log('Creating session:', newSession);
    setShowCreateModal(false);
    // Reset form
    setNewSession({
      tableId: 'T-001',
      customerName: '',
      flavor: 'Blue Mist',
      amount: 3000
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top Navigation */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo and SESSIONS button */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H+</span>
                </div>
                <span className="text-2xl font-bold text-green-400">HOOKAH+</span>
              </div>
              <Button variant="primary" size="sm" className="bg-green-600 hover:bg-green-700">
                SESSIONS
              </Button>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <button className="flex items-center space-x-2 text-zinc-300 hover:text-white transition-colors">
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <button className="flex items-center space-x-2 text-zinc-300 hover:text-white transition-colors">
                <Flame className="w-4 h-4" />
                <span>Sessions</span>
              </button>
              <button className="flex items-center space-x-2 text-zinc-300 hover:text-white transition-colors">
                <Users className="w-4 h-4" />
                <span>Staff Ops</span>
              </button>
              <button className="flex items-center space-x-2 text-zinc-300 hover:text-white transition-colors">
                <UserCheck className="w-4 h-4" />
                <span>Staff Panel</span>
              </button>
              <button className="flex items-center space-x-2 text-zinc-300 hover:text-white transition-colors">
                <Settings className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>

            {/* Right side status and actions */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-zinc-400">Flow Status</div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold">0</span>
                  <span className="text-sm">😴</span>
                </div>
                <div className="text-xs text-zinc-500">Idle</div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-1 text-zinc-300 hover:text-white transition-colors">
                  <Folder className="w-4 h-4" />
                  <span className="text-sm">Support</span>
                </button>
                <button className="flex items-center space-x-1 text-zinc-300 hover:text-white transition-colors">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Docs</span>
                </button>
              </div>

              <button className="flex items-center space-x-1 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg transition-colors">
                <Crown className="w-4 h-4" />
                <span className="text-sm">Admin</span>
                <span className="text-xs">▼</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Flame className="w-8 h-8 text-orange-400" />
            <h1 className="text-4xl font-bold text-green-400">Fire Session Dashboard</h1>
          </div>
          <p className="text-xl text-zinc-400">
            Complete BOH/FOH workflow management with edge case handling
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index} className="bg-zinc-900 border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold text-white">{metric.value}</div>
                {metric.icon}
              </div>
              <div className="text-sm text-zinc-400 mb-2">{metric.title}</div>
              <div className={`text-sm font-medium ${
                metric.changeType === 'positive' ? 'text-green-400' :
                metric.changeType === 'negative' ? 'text-red-400' : 'text-zinc-400'
              }`}>
                {metric.change}
              </div>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700 relative"
            >
              <span className="absolute -top-2 -left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                NEW
              </span>
              <Plus className="w-5 h-5 mr-2" />
              Create Session
            </Button>
            
            <Button variant="outline" size="lg" className="bg-zinc-800 hover:bg-zinc-700">
              <BarChart3 className="w-5 h-5 mr-2" />
              View All Sessions
            </Button>
          </div>

          <button className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors">
            <Crown className="w-4 h-4" />
            <span>Admin</span>
            <span className="text-xs">▼</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="bg-zinc-600 text-white text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-6">
            <ChefHat className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-semibold">Back of House Prep Room</h2>
          </div>

          {/* Session Card */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">👨‍🍳</div>
                <div>
                  <h3 className="text-2xl font-bold text-blue-400">Table {sampleSession.tableId}</h3>
                  <p className="text-zinc-400">{sampleSession.customerName} - {sampleSession.flavor}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-yellow-500 text-white text-sm font-bold px-3 py-1">
                  {sampleSession.status.replace(/_/g, ' ')}
                </Badge>
                <div className="text-lg font-semibold text-white mt-1">
                  ${sampleSession.amount.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Session Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="text-sm text-zinc-400 block mb-2">Assigned BOH Staff:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={sampleSession.assignedBOH}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    readOnly
                  />
                  <Button variant="outline" size="sm" className="bg-zinc-700 hover:bg-zinc-600">
                    Assign BOH
                    <span className="ml-1">▼</span>
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-400 block mb-2">Session Notes:</label>
                <button className="text-teal-400 text-sm hover:text-teal-300 mb-2">Add Note</button>
                <div className="bg-zinc-800 rounded-lg p-3 text-sm text-zinc-300">
                  {sampleSession.notes}
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-400 block mb-2">Created:</label>
                <div className="text-zinc-300">{sampleSession.created}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button variant="warning" size="sm" className="bg-orange-500 hover:bg-orange-600">
                <Zap className="w-4 h-4 mr-2" />
                Heat Up
              </Button>
              
              <Button variant="success" size="sm" className="bg-green-500 hover:bg-green-600 border-green-400">
                <RefreshCw className="w-4 h-4 mr-2" />
                Restart Prep
              </Button>
              
              <Button variant="info" size="sm" className="bg-teal-500 hover:bg-teal-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Resolve Issue
              </Button>
              
              <Button variant="danger" size="sm" className="bg-red-500 hover:bg-red-600">
                <Flag className="w-4 h-4 mr-2" />
                Flag Manager
              </Button>
              
              <Button variant="warning" size="sm" className="bg-yellow-500 hover:bg-yellow-600">
                <Pause className="w-4 h-4 mr-2" />
                Hold Session
              </Button>
              
              <Button variant="accent" size="sm" className="bg-purple-500 hover:bg-purple-600">
                <Zap className="w-4 h-4 mr-2" />
                Request Refill
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="bg-zinc-900 border-zinc-800 p-8 w-full max-w-md mx-4">
            <h3 className="text-2xl font-bold text-green-400 mb-6">Create New Session</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 block mb-2">Table ID:</label>
                <input
                  type="text"
                  value={newSession.tableId}
                  onChange={(e) => setNewSession({...newSession, tableId: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-zinc-400 block mb-2">Customer Name:</label>
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={newSession.customerName}
                  onChange={(e) => setNewSession({...newSession, customerName: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-zinc-400 block mb-2">Flavor:</label>
                <select
                  value={newSession.flavor}
                  onChange={(e) => setNewSession({...newSession, flavor: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="Blue Mist">Blue Mist</option>
                  <option value="Double Apple">Double Apple</option>
                  <option value="Mint">Mint</option>
                  <option value="Grape">Grape</option>
                  <option value="Custom Mix">Custom Mix</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-zinc-400 block mb-2">Amount (cents):</label>
                <input
                  type="number"
                  value={newSession.amount}
                  onChange={(e) => setNewSession({...newSession, amount: parseInt(e.target.value)})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
            
            <div className="flex space-x-4 mt-8">
              <Button 
                variant="outline" 
                className="flex-1 bg-zinc-800 hover:bg-zinc-700"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleCreateSession}
              >
                Create Session
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
