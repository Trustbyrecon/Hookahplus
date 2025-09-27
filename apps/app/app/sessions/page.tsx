"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '../../components';
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
  Zap,
  Trash2,
  Edit3,
  Menu,
  X,
  DollarSign,
  Activity,
  TrendingDown,
  Star,
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock3,
  User,
  Phone,
  MapPin,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Zap as Lightning,
  Heart,
  Coffee,
  Wind,
  Sparkles,
  Brain,
  Lock,
  CreditCard,
  Smartphone,
  QrCode,
  Play,
  Save,
  Eye,
  EyeOff,
  ShoppingCart,
  Star as StarIcon
} from 'lucide-react';

export default function SessionsPage() {
  const [isPrettyTheme] = useState(process.env.NEXT_PUBLIC_PRETTY_THEME === '1');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock session data
  const sessions = [
    {
      id: 'session_T-007_1758552685415',
      tableId: 'T-007',
      customerName: '15551234556',
      flavor: 'Watermelon + Mint',
      status: 'PREP_IN_PROGRESS',
      statusColor: 'bg-green-500',
      statusIcon: '🔄',
      amount: 35.00,
      assignedBOH: 'Mike Rodriguez',
      notes: 'Source: WALK IN, External Ref: T-007',
      created: '1:39:07 PM',
      team: 'BOH'
    },
    {
      id: 'session_T-008_1758552685416',
      tableId: 'T-008',
      customerName: '15551234557',
      flavor: 'Blue Mist',
      status: 'HEAT_UP',
      statusColor: 'bg-orange-500',
      statusIcon: '🔥',
      amount: 30.00,
      assignedBOH: 'Mike Rodriguez',
      notes: 'Source: RESERVE, External Ref: T-008',
      created: '1:34:07 PM',
      team: 'BOH'
    },
    {
      id: 'session_T-011_1758552685417',
      tableId: 'T-011',
      customerName: '15551234560',
      flavor: 'Custom Mix',
      status: 'STAFF_HOLD',
      statusColor: 'bg-yellow-500',
      statusIcon: '⚠️',
      amount: 45.00,
      assignedBOH: 'Sarah Chen',
      notes: 'Source: WALK IN, External Ref: T-011. Edge Case: Equipment malfunction - hookah base cracked',
      created: '1:19:07 PM',
      team: 'EDGE'
    }
  ];

  const metrics = [
    {
      title: 'Active Sessions',
      value: '3',
      icon: <Flame className="w-6 h-6 text-orange-400" />,
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Revenue',
      value: '$110',
      icon: <DollarSign className="w-6 h-6 text-green-400" />,
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Avg Duration',
      value: '45min',
      icon: <Clock className="w-6 h-6 text-blue-400" />,
      change: '-5%',
      changeType: 'negative' as const
    },
    {
      title: 'Alerts',
      value: '1',
      icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
      change: '0%',
      changeType: 'neutral' as const
    },
    {
      title: 'Staff Assigned',
      value: '2',
      icon: <Users className="w-6 h-6 text-purple-400" />,
      change: '+2%',
      changeType: 'positive' as const
    },
    {
      title: 'Total Sessions',
      value: '7',
      icon: <BarChart3 className="w-6 h-6 text-cyan-400" />,
      change: '+15%',
      changeType: 'positive' as const
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview (3)', count: 3 },
    { id: 'boh', label: 'BOH (2)', count: 2 },
    { id: 'foh', label: 'FOH (0)', count: 0 },
    { id: 'edge', label: 'Edge Cases (1)', count: 1 }
  ];

  const getStatusBadge = (status: string, statusColor: string, statusIcon: string) => {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-lg">{statusIcon}</span>
        <Badge className={`${statusColor} text-white text-sm font-bold px-3 py-1`}>
          {status.replace(/_/g, ' ')}
        </Badge>
      </div>
    );
  };

  if (!isPrettyTheme) {
    // Fallback to original solid design
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Sessions</h1>
            <p className="text-zinc-400 mb-8">Manage your hookah sessions</p>
            <div className="flex justify-center space-x-4">
              <Link href="/fire-session-dashboard">
                <Button variant="primary" size="lg">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pretty Theme Design
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="status-bar">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H+</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  HOOKAH+
                </span>
              </div>
              <div className="text-sm text-zinc-400">
                Sessions Management
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-zinc-400">Live</span>
              </div>
              <Link href="/fire-session-dashboard">
                <Button className="btn-pretty-secondary">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Sessions
            </h1>
          </div>
          <p className="text-xl text-zinc-400">
            Manage and monitor all active hookah sessions
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="metric-card">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-white">
                  {metric.value}
                </div>
                <div className="text-zinc-400">
                  {metric.icon}
                </div>
              </div>
              <div className="text-sm text-zinc-400 mb-1">{metric.title}</div>
              <div className={`text-xs font-medium ${
                metric.changeType === 'positive' ? 'text-green-400' :
                metric.changeType === 'negative' ? 'text-red-400' : 'text-zinc-400'
              }`}>
                {metric.change}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/preorder/T-001">
              <Button className="btn-pretty-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Session
              </Button>
            </Link>
            <Button className="btn-pretty-secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button className="btn-pretty-secondary">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="btn-pretty-secondary">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <div key={session.id} className="session-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">
                    {session.team === 'BOH' ? '👨‍🍳' : session.team === 'FOH' ? '🚚' : '⚠️'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-400">
                      Table {session.tableId}
                    </h3>
                    <p className="text-zinc-400">{session.customerName} - {session.flavor}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-zinc-700 rounded-full text-zinc-300">
                        {session.team}
                      </span>
                      <span className="text-xs text-zinc-500">{session.created}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(session.status, session.statusColor, session.statusIcon)}
                  <div className="text-lg font-semibold text-white mt-1">
                    ${session.amount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm text-zinc-400 block mb-1">Assigned Staff:</label>
                  <div className="text-sm text-zinc-300">{session.assignedBOH}</div>
                </div>
                <div>
                  <label className="text-sm text-zinc-400 block mb-1">Notes:</label>
                  <div className="text-sm text-zinc-300">{session.notes}</div>
                </div>
                <div>
                  <label className="text-sm text-zinc-400 block mb-1">Created:</label>
                  <div className="text-sm text-zinc-300">{session.created}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button className="btn-pretty-pill bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30">
                  <Zap className="w-4 h-4 mr-2" />
                  Heat Up
                </Button>
                <Button className="btn-pretty-pill bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Restart Prep
                </Button>
                <Button className="btn-pretty-pill bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Resolve Issue
                </Button>
                <Button className="btn-pretty-pill bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30">
                  <Flag className="w-4 h-4 mr-2" />
                  Flag Manager
                </Button>
                <Button className="btn-pretty-pill bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30">
                  <Pause className="w-4 h-4 mr-2" />
                  Hold Session
                </Button>
                <Button className="btn-pretty-pill bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30">
                  <Zap className="w-4 h-4 mr-2" />
                  Request Refill
                </Button>
                <Button className="btn-pretty-pill bg-zinc-500/20 text-zinc-400 border border-zinc-500/30 hover:bg-zinc-500/30">
                  <MoreHorizontal className="w-4 h-4 mr-2" />
                  More
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
