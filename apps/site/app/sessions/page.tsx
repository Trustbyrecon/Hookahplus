import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Flame, Users, Clock, TrendingUp, BarChart3, Settings, UserCheck, Brain, Shield, CreditCard, ArrowRight, Play, CheckCircle, Zap, Activity, Heart, Star } from 'lucide-react';

export default function SessionsPage() {
  const sessions = [
    {
      id: 'session_001',
      table: 'Table 5',
      status: 'active',
      duration: '45m',
      guests: 4,
      revenue: '$89.50',
      mix: 'Blueberry Mint',
      startTime: '2:30 PM'
    },
    {
      id: 'session_002', 
      table: 'Table 12',
      status: 'active',
      duration: '32m',
      guests: 2,
      revenue: '$67.25',
      mix: 'Strawberry Kiwi',
      startTime: '3:15 PM'
    },
    {
      id: 'session_003',
      table: 'Table 8',
      status: 'completed',
      duration: '1h 15m',
      guests: 6,
      revenue: '$156.80',
      mix: 'Mango Tango',
      startTime: '1:45 PM'
    }
  ];

  const metrics = [
    {
      title: 'Active Sessions',
      value: '18',
      icon: <Flame className="w-6 h-6" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Total Revenue',
      value: '$12,340',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      change: '+5%',
      changeType: 'positive' as const
    },
    {
      title: 'Avg Session Time',
      value: '52m',
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
            <Button variant="primary" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Start New Session
            </Button>
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

        {/* Active Sessions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Active Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.filter(s => s.status === 'active').map((session) => (
              <Card key={session.id} className="hover:border-teal-500/50 transition-colors">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{session.table}</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-400">Active</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Duration:</span>
                      <span className="text-white">{session.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Guests:</span>
                      <span className="text-white">{session.guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Mix:</span>
                      <span className="text-teal-400">{session.mix}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Revenue:</span>
                      <span className="text-green-400 font-semibold">{session.revenue}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-zinc-700">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button variant="primary" size="sm" className="flex-1">
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Recent Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:border-teal-500/50 transition-colors">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{session.table}</h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        session.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-zinc-400'
                      }`}></div>
                      <span className={`text-sm ${
                        session.status === 'active' ? 'text-green-400' : 'text-zinc-400'
                      }`}>
                        {session.status === 'active' ? 'Active' : 'Completed'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Duration:</span>
                      <span className="text-white">{session.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Guests:</span>
                      <span className="text-white">{session.guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Mix:</span>
                      <span className="text-teal-400">{session.mix}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Revenue:</span>
                      <span className="text-green-400 font-semibold">{session.revenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Started:</span>
                      <span className="text-white">{session.startTime}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-zinc-700">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      {session.status === 'active' && (
                        <Button variant="primary" size="sm" className="flex-1">
                          Manage
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
