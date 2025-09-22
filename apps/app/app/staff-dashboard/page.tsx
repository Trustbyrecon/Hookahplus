"use client";

import React, { useState } from 'react';
import { Card, Button, Badge, TaskQueue, MetricCard } from '../../components';
import { 
  Users, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  ChefHat,
  UserCheck,
  Flame,
  RefreshCw,
  Pause,
  Play,
  Zap,
  BarChart3,
  Settings
} from 'lucide-react';

export default function StaffDashboard() {
  const [activeRole, setActiveRole] = useState<'foh' | 'boh'>('foh');
  const [tasks, setTasks] = useState<any[]>([
    {
      id: '1',
      title: 'Refill Table 5',
      description: 'Customer requested flavor refill - Blue Mist',
      priority: 'high' as const,
      status: 'pending' as const,
      createdAt: new Date(),
      dueAt: new Date(Date.now() + 10 * 60 * 1000),
      customerName: 'John Doe',
      tableNumber: '5',
      type: 'refill' as const
    },
    {
      id: '2',
      title: 'Clean Table 3',
      description: 'Table needs cleaning after session completion',
      priority: 'medium' as const,
      status: 'in_progress' as const,
      assignedTo: 'Sarah',
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      tableNumber: '3',
      type: 'cleanup' as const
    },
    {
      id: '3',
      title: 'Setup Table 7',
      description: 'New customers arriving in 15 minutes',
      priority: 'urgent' as const,
      status: 'pending' as const,
      createdAt: new Date(),
      dueAt: new Date(Date.now() + 15 * 60 * 1000),
      tableNumber: '7',
      type: 'setup' as const
    },
    {
      id: '4',
      title: 'Deliver Table 2',
      description: 'Hookah ready for delivery to table',
      priority: 'high' as const,
      status: 'pending' as const,
      createdAt: new Date(),
      tableNumber: '2',
      type: 'delivery' as const
    }
  ]);

  const metrics = [
    {
      title: 'Active Sessions',
      value: '4',
      icon: <Flame className="w-6 h-6" />,
      change: '+2',
      changeType: 'positive' as const
    },
    {
      title: 'Pending Tasks',
      value: '3',
      icon: <Clock className="w-6 h-6" />,
      change: '-1',
      changeType: 'negative' as const
    },
    {
      title: 'Completed Today',
      value: '12',
      icon: <CheckCircle className="w-6 h-6" />,
      change: '+5',
      changeType: 'positive' as const
    },
    {
      title: 'Issues',
      value: '0',
      icon: <AlertTriangle className="w-6 h-6" />,
      change: '0',
      changeType: 'neutral' as const
    }
  ];

  const handleTaskUpdate = (taskId: string, updates: any) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const handleTaskAssign = (taskId: string, staffId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, assignedTo: staffId, status: 'in_progress' as const } : task
    ));
  };

  const getRoleSpecificTasks = () => {
    if (activeRole === 'boh') {
      return tasks.filter(task => ['refill', 'setup', 'cleanup'].includes(task.type));
    } else {
      return tasks.filter(task => ['delivery', 'service'].includes(task.type));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H+</span>
                </div>
                <span className="text-2xl font-bold text-green-400">HOOKAH+</span>
              </div>
              <Button variant="primary" size="sm" className="bg-green-600 hover:bg-green-700">
                STAFF
              </Button>
            </div>

            {/* Role Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex bg-zinc-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveRole('foh')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeRole === 'foh'
                      ? 'bg-teal-600 text-white'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4 mr-2 inline" />
                  FOH
                </button>
                <button
                  onClick={() => setActiveRole('boh')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeRole === 'boh'
                      ? 'bg-teal-600 text-white'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  <ChefHat className="w-4 h-4 mr-2 inline" />
                  BOH
                </button>
              </div>

              <div className="text-right">
                <div className="text-sm text-zinc-400">Flow Status</div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold">Active</span>
                  <span className="text-sm">🔥</span>
                </div>
                <div className="text-xs text-zinc-500">{activeRole.toUpperCase()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            {activeRole === 'boh' ? (
              <ChefHat className="w-8 h-8 text-green-400" />
            ) : (
              <Users className="w-8 h-8 text-purple-400" />
            )}
            <h1 className="text-4xl font-bold">
              {activeRole === 'boh' ? 'Back of House' : 'Front of House'} Dashboard
            </h1>
          </div>
          <p className="text-xl text-zinc-400">
            {activeRole === 'boh' 
              ? 'Manage prep, assembly, and quality control' 
              : 'Handle delivery, service, and customer interactions'
            }
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              change={metric.change}
              changeType={metric.changeType}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Session Overview */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h3 className="text-xl font-semibold mb-4">Active Sessions</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <div className="font-medium">Table T-001</div>
                    <div className="text-sm text-zinc-400">Blue Mist - 45 min remaining</div>
                  </div>
                </div>
                <Badge className="bg-green-500 text-white">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">Table T-003</div>
                    <div className="text-sm text-zinc-400">Double Apple - Prep in progress</div>
                  </div>
                </div>
                <Badge className="bg-yellow-500 text-white">Prep</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">Table T-005</div>
                    <div className="text-sm text-zinc-400">Mint - Ready for delivery</div>
                  </div>
                </div>
                <Badge className="bg-blue-500 text-white">Ready</Badge>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="primary" className="bg-green-600 hover:bg-green-700">
                <Zap className="w-4 h-4 mr-2" />
                New Session
              </Button>
              
              <Button variant="outline" className="bg-zinc-800 hover:bg-zinc-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refill
              </Button>
              
              <Button variant="outline" className="bg-zinc-800 hover:bg-zinc-700">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
              
              <Button variant="outline" className="bg-zinc-800 hover:bg-zinc-700">
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-zinc-800 rounded-lg">
              <h4 className="font-semibold mb-2">Staff Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Sarah (BOH):</span>
                  <Badge className="bg-green-500 text-white">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Mike (FOH):</span>
                  <Badge className="bg-green-500 text-white">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Lisa (FOH):</span>
                  <Badge className="bg-yellow-500 text-white">Break</Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Task Queue */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">
            {activeRole === 'boh' ? 'Prep Room Tasks' : 'Floor Tasks'}
          </h2>
          <TaskQueue
            tasks={getRoleSpecificTasks()}
            onTaskUpdate={handleTaskUpdate}
            onTaskAssign={handleTaskAssign}
          />
        </div>
      </div>
    </div>
  );
}
