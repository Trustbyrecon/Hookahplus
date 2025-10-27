'use client';

import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import TaskDetailsModal from '../../components/TaskDetailsModal';
import { Users, Clock, TrendingUp, BarChart3, Settings, UserCheck, Brain, Shield, CreditCard, ArrowRight, Play, CheckCircle, Zap, Activity, Heart, Star, ChefHat, Bell } from 'lucide-react';

export default function StaffOpsPage() {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const staffMembers = [
    {
      id: 'staff_001',
      name: 'Sarah Johnson',
      role: 'Floor Manager',
      status: 'active',
      currentTask: 'Table 5 service',
      efficiency: 94,
      avatar: 'SJ'
    },
    {
      id: 'staff_002',
      name: 'Mike Chen',
      role: 'Server',
      status: 'active',
      currentTask: 'Table 12 setup',
      efficiency: 87,
      avatar: 'MC'
    },
    {
      id: 'staff_003',
      name: 'Emma Rodriguez',
      role: 'Host',
      status: 'break',
      currentTask: 'On break',
      efficiency: 91,
      avatar: 'ER'
    }
  ];

  const tasks = [
    {
      id: 'task_001',
      title: 'Table 5 - New Session Setup',
      priority: 'high',
      assignedTo: 'Sarah Johnson',
      estimatedTime: '15m',
      status: 'in_progress'
    },
    {
      id: 'task_002',
      title: 'Table 12 - Mix Preparation',
      priority: 'medium',
      assignedTo: 'Mike Chen',
      estimatedTime: '10m',
      status: 'pending'
    },
    {
      id: 'task_003',
      title: 'Table 8 - Session Cleanup',
      priority: 'low',
      assignedTo: 'Emma Rodriguez',
      estimatedTime: '8m',
      status: 'completed'
    }
  ];

  const metrics = [
    {
      title: 'Active Staff',
      value: '12',
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      change: '+2',
      changeType: 'positive' as const
    },
    {
      title: 'Avg Efficiency',
      value: '91%',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      change: '+3%',
      changeType: 'positive' as const
    },
    {
      title: 'Tasks Completed',
      value: '47',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      change: '+8',
      changeType: 'positive' as const
    },
    {
      title: 'Response Time',
      value: '2.3m',
      icon: <Clock className="w-6 h-6" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      change: '-0.5m',
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
              <h1 className="text-3xl font-bold text-white">Operations Center</h1>
              <p className="text-zinc-400 mt-2">Staff coordination and workflow management</p>
            </div>
            <Button 
              variant="primary" 
              className="flex items-center gap-2"
              onClick={() => {
                console.log('Sending staff alert');
                // Send alert to all staff members
                alert('Staff Alert Sent! All team members have been notified.');
              }}
            >
              <Bell className="w-4 h-4" />
              Send Alert
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Staff Status */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Staff Status</h2>
            <div className="space-y-4">
              {staffMembers.map((staff) => (
                <Card key={staff.id} className="hover:border-teal-500/50 transition-colors">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center">
                          <span className="text-teal-400 font-semibold text-sm">{staff.avatar}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{staff.name}</h3>
                          <p className="text-sm text-zinc-400">{staff.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          staff.status === 'active' ? 'bg-green-400 animate-pulse' : 
                          staff.status === 'break' ? 'bg-yellow-400' : 'bg-zinc-400'
                        }`}></div>
                        <span className={`text-sm ${
                          staff.status === 'active' ? 'text-green-400' : 
                          staff.status === 'break' ? 'text-yellow-400' : 'text-zinc-400'
                        }`}>
                          {staff.status === 'active' ? 'Active' : 
                           staff.status === 'break' ? 'Break' : 'Offline'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Current Task:</span>
                        <span className="text-white">{staff.currentTask}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Efficiency:</span>
                        <span className="text-teal-400">{staff.efficiency}%</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Performance</span>
                        <span>{staff.efficiency}%</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div 
                          className="bg-teal-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${staff.efficiency}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Task Queue */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Task Queue</h2>
            <div className="space-y-4">
              {tasks.map((task) => (
                <Card key={task.id} className="hover:border-teal-500/50 transition-colors">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{task.title}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {task.priority}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Assigned to:</span>
                        <span className="text-white">{task.assignedTo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Est. Time:</span>
                        <span className="text-white">{task.estimatedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Status:</span>
                        <span className={`${
                          task.status === 'completed' ? 'text-green-400' :
                          task.status === 'in_progress' ? 'text-blue-400' :
                          'text-yellow-400'
                        }`}>
                          {task.status === 'completed' ? 'Completed' :
                           task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-zinc-700">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedTask(task);
                            setIsTaskModalOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            console.log(`Managing task ${task.id}`);
                            setSelectedTask(task);
                            setIsTaskModalOpen(true);
                          }}
                        >
                          {task.status === 'completed' ? 'Review' : 'Manage'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
      />
    </div>
  );
}
