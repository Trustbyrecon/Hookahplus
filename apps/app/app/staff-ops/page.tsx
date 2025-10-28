"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  Pause, 
  RefreshCw,
  Plus,
  UserCheck,
  Zap,
  ChevronRight,
  Calendar,
  MapPin,
  Phone
} from 'lucide-react';
import Button from '../../components/Button';
import GlobalNavigation from '../../components/GlobalNavigation';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
  createdAt: Date;
  dueAt?: Date;
  location?: string;
  customerInfo?: {
    name: string;
    phone: string;
    table: string;
  };
}

interface StaffMember {
  id: string;
  name: string;
  role: 'BOH' | 'FOH' | 'MANAGER';
  status: 'active' | 'break' | 'offline';
  currentTask?: string;
  lastActive: Date;
}

export default function StaffOpsDashboard() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task_1',
      title: 'Deliver Table 2',
      description: 'Hookah ready for delivery to table',
      priority: 'high',
      status: 'pending',
      assignedTo: 'Mike Rodriguez',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      dueAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      location: 'Table 2',
      customerInfo: {
        name: 'John Smith',
        phone: '(555) 123-4567',
        table: 'T-002'
      }
    },
    {
      id: 'task_2',
      title: 'Refill Table 5',
      description: 'Customer requested flavor change',
      priority: 'medium',
      status: 'in_progress',
      assignedTo: 'Sarah Chen',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      location: 'Table 5',
      customerInfo: {
        name: 'Emily Johnson',
        phone: '(555) 987-6543',
        table: 'T-005'
      }
    },
    {
      id: 'task_3',
      title: 'Setup Table 8',
      description: 'New customer arrival - setup complete hookah',
      priority: 'low',
      status: 'pending',
      assignedTo: 'Unassigned',
      createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      location: 'Table 8',
      customerInfo: {
        name: 'David Wilson',
        phone: '(555) 456-7890',
        table: 'T-008'
      }
    }
  ]);

  const [staff, setStaff] = useState<StaffMember[]>([
    {
      id: 'staff_1',
      name: 'Sarah Chen',
      role: 'BOH',
      status: 'active',
      currentTask: 'Refill Table 5',
      lastActive: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    },
    {
      id: 'staff_2',
      name: 'Mike Rodriguez',
      role: 'FOH',
      status: 'active',
      currentTask: 'Deliver Table 2',
      lastActive: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
    },
    {
      id: 'staff_3',
      name: 'Lisa Park',
      role: 'FOH',
      status: 'break',
      lastActive: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    }
  ]);

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    assignedTo: 'Unassigned',
    location: '',
    customerName: '',
    customerPhone: '',
    customerTable: ''
  });

  const handleTaskStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleAssignTask = (taskId: string, staffMember: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, assignedTo: staffMember } : task
    ));
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: `task_${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: 'pending',
      assignedTo: newTask.assignedTo,
      createdAt: new Date(),
      location: newTask.location,
      customerInfo: newTask.customerName ? {
        name: newTask.customerName,
        phone: newTask.customerPhone,
        table: newTask.customerTable
      } : undefined
    };

    setTasks(prev => [task, ...prev]);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      assignedTo: 'Unassigned',
      location: '',
      customerName: '',
      customerPhone: '',
      customerTable: ''
    });
    setShowNewTaskModal(false);
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'urgent': return 'text-red-400 bg-red-500/20';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'in_progress': return 'text-blue-400 bg-blue-500/20';
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/20';
    }
  };

  const getStaffStatusColor = (status: StaffMember['status']) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'break': return 'text-yellow-400 bg-yellow-500/20';
      case 'offline': return 'text-red-400 bg-red-500/20';
    }
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const completedToday = tasks.filter(task => 
    task.status === 'completed' && 
    task.createdAt.toDateString() === new Date().toDateString()
  ).length;
  const activeStaff = staff.filter(member => member.status === 'active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Users className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Staff Operations</h1>
              <p className="text-zinc-400">Manage staff tasks, assignments, and floor operations</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-zinc-800 rounded-lg p-1">
            {[
              { id: 'tasks', label: 'Floor Tasks', icon: Clock },
              { id: 'staff', label: 'Staff Status', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: CheckCircle }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-white">{pendingTasks}</div>
              <div className="text-zinc-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-sm text-zinc-400 mb-1">Pending Tasks</div>
            <div className="text-xs text-red-400">-1 from yesterday</div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-white">{inProgressTasks}</div>
              <div className="text-zinc-400">
                <RefreshCw className="w-5 h-5" />
              </div>
            </div>
            <div className="text-sm text-zinc-400 mb-1">In Progress</div>
            <div className="text-xs text-green-400">+2 from yesterday</div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-white">{completedToday}</div>
              <div className="text-zinc-400">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-sm text-zinc-400 mb-1">Completed Today</div>
            <div className="text-xs text-green-400">+5 from yesterday</div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-white">{activeStaff}</div>
              <div className="text-zinc-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-sm text-zinc-400 mb-1">Active Staff</div>
            <div className="text-xs text-green-400">All hands on deck</div>
          </div>
        </div>

        {/* Main Content */}
        {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Floor Tasks */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Floor Tasks</h2>
              <Button
                onClick={() => setShowNewTaskModal(true)}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Task Queue</h3>
                <div className="text-sm text-zinc-400">
                  Total: {tasks.length} Pending: {pendingTasks} In Progress: {inProgressTasks}
                </div>
              </div>

              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="bg-zinc-700/50 rounded-lg p-4 border border-zinc-600">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-zinc-500 rounded-full"></div>
                        <span className="font-medium">{task.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-zinc-300 mb-3">{task.description}</p>

                    {task.customerInfo && (
                      <div className="bg-zinc-600/50 rounded p-3 mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <UserCheck className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium">Customer Info</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center space-x-1">
                            <span className="text-zinc-400">Name:</span>
                            <span>{task.customerInfo.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            <span>{task.customerInfo.phone}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-zinc-400" />
                            <span>{task.customerInfo.table}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-zinc-400" />
                            <span>{task.createdAt.toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-zinc-400">
                        Assigned to: <span className="text-white">{task.assignedTo}</span>
                      </div>
                      <div className="flex space-x-2">
                        {task.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleTaskStatusChange(task.id, 'in_progress')}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Start
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => handleTaskStatusChange(task.id, 'completed')}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Complete
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTaskStatusChange(task.id, 'cancelled')}
                          className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Staff Status */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Staff Status</h2>

            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
              <div className="space-y-3">
                {staff.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-zinc-600 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-zinc-400">{member.role}</div>
                        {member.currentTask && (
                          <div className="text-xs text-blue-400">{member.currentTask}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStaffStatusColor(member.status)}`}>
                        {member.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {member.lastActive.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
              <h3 className="font-medium mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setShowNewTaskModal(true)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  New Session
                </Button>
                <Button
                  variant="outline"
                  className="text-zinc-400 border-zinc-600 hover:bg-zinc-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refill
                </Button>
                <Button
                  variant="outline"
                  className="text-zinc-400 border-zinc-600 hover:bg-zinc-700"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                <Button
                  variant="outline"
                  className="text-zinc-400 border-zinc-600 hover:bg-zinc-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Staff Management</h2>
            <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
              <div className="space-y-4">
                {staff.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-zinc-700/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-zinc-600 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-zinc-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{member.name}</div>
                        <div className="text-sm text-zinc-400">{member.role} • {member.currentTask || 'Available'}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStaffStatusColor(member.status)}`}>
                        {member.status.toUpperCase()}
                      </span>
                      <div className="text-right">
                        <div className="text-xs text-zinc-400">Last active</div>
                        <div className="text-sm text-white">{member.lastActive.toLocaleTimeString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Staff Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-blue-400" />
                  <span className="text-3xl font-bold text-white">87%</span>
                </div>
                <div className="text-sm text-zinc-400">Avg Efficiency</div>
                <div className="text-xs text-green-400 mt-2">+3% from last week</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <span className="text-3xl font-bold text-white">142</span>
                </div>
                <div className="text-sm text-zinc-400">Tasks Completed</div>
                <div className="text-xs text-green-400 mt-2">+12 from last week</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-purple-400" />
                  <span className="text-3xl font-bold text-white">2.3m</span>
                </div>
                <div className="text-sm text-zinc-400">Avg Response Time</div>
                <div className="text-xs text-green-400 mt-2">-0.5m improvement</div>
              </div>
            </div>
            
            <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
              <h3 className="font-semibold mb-4">Top Performing Staff</h3>
              <div className="space-y-3">
                {staff.sort((a, b) => (a.currentTask ? 1 : 0) - (b.currentTask ? 1 : 0)).map((member, idx) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl font-bold text-zinc-500">#{idx + 1}</div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-zinc-400">{member.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-400">
                        {member.currentTask ? 'Active' : 'Available'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Task</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNewTaskModal(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  placeholder="e.g., Deliver Table 2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white h-20 resize-none"
                  placeholder="Describe the task..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Assign To</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  >
                    <option value="Unassigned">Unassigned</option>
                    {staff.map(member => (
                      <option key={member.id} value={member.name}>{member.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={newTask.location}
                  onChange={(e) => setNewTask(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  placeholder="e.g., Table 2"
                />
              </div>

              <div className="border-t border-zinc-700 pt-4">
                <h4 className="text-sm font-medium mb-3">Customer Information (Optional)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={newTask.customerName}
                      onChange={(e) => setNewTask(prev => ({ ...prev, customerName: e.target.value }))}
                      className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
                      placeholder="Customer name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Phone</label>
                    <input
                      type="text"
                      value={newTask.customerPhone}
                      onChange={(e) => setNewTask(prev => ({ ...prev, customerPhone: e.target.value }))}
                      className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-xs text-zinc-400 mb-1">Table</label>
                  <input
                    type="text"
                    value={newTask.customerTable}
                    onChange={(e) => setNewTask(prev => ({ ...prev, customerTable: e.target.value }))}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
                    placeholder="T-002"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowNewTaskModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTask}
                disabled={!newTask.title.trim()}
                className="flex-1 bg-purple-500 hover:bg-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
