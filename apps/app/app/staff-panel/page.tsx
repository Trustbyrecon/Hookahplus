"use client";

import React, { useState } from 'react';
import GlobalNavigation from '../../components/GlobalNavigation';
import { Card, Button, Badge } from '../../components';
import StaffPerformanceAnalytics from '../../components/StaffPerformanceAnalytics';
import StaffScheduling from '../../components/StaffScheduling';
import StaffCommunication from '../../components/StaffCommunication';
import RoleBasedPermissions from '../../components/RoleBasedPermissions';
import CoachingPanel from '../../components/CoachingPanel';
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Star,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MapPin,
  X,
  Save,
  User,
  Shield,
  Crown,
  MessageSquare,
  Bell,
  BarChart3,
  Lightbulb
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN';
  status: 'available' | 'busy' | 'offline';
  email: string;
  phone: string;
  hireDate: string;
  performance: number;
  sessionsCompleted: number;
  lastActive: string;
  metrics: {
    sessionsCompleted: number;
    averageRating: number;
    onTimeDelivery: number;
    customerSatisfaction: number;
    efficiency: number;
    attendance: number;
  };
  trends: {
    sessionsCompleted: number;
    averageRating: number;
    onTimeDelivery: number;
  };
  achievements: string[];
  availability: {
    monday: { start: string; end: string; available: boolean }[];
    tuesday: { start: string; end: string; available: boolean }[];
    wednesday: { start: string; end: string; available: boolean }[];
    thursday: { start: string; end: string; available: boolean }[];
    friday: { start: string; end: string; available: boolean }[];
    saturday: { start: string; end: string; available: boolean }[];
    sunday: { start: string; end: string; available: boolean }[];
  };
  maxHoursPerWeek: number;
  currentHoursThisWeek: number;
}

export default function StaffPanelPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'quarter'>('week');
  const [showCoaching, setShowCoaching] = useState(false);
  const [selectedStaffForCoaching, setSelectedStaffForCoaching] = useState<string | null>(null);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'FOH' as 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN'
  });
  
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: 'staff-001',
      name: 'Mike Rodriguez',
      role: 'BOH',
      status: 'available',
      email: 'mike@hookahplus.com',
      phone: '+1 (555) 123-4567',
      hireDate: '2024-01-15',
      performance: 4.8,
      sessionsCompleted: 156,
      lastActive: '2 minutes ago',
      metrics: {
        sessionsCompleted: 156,
        averageRating: 4.8,
        onTimeDelivery: 94.2,
        customerSatisfaction: 92.5,
        efficiency: 88.7,
        attendance: 96.8
      },
      trends: {
        sessionsCompleted: 12.5,
        averageRating: 0.3,
        onTimeDelivery: 2.1
      },
      achievements: ['Top Performer Q1', 'Perfect Attendance'],
      availability: {
        monday: [{ start: '09:00', end: '17:00', available: true }],
        tuesday: [{ start: '09:00', end: '17:00', available: true }],
        wednesday: [{ start: '09:00', end: '17:00', available: true }],
        thursday: [{ start: '09:00', end: '17:00', available: true }],
        friday: [{ start: '09:00', end: '17:00', available: true }],
        saturday: [{ start: '10:00', end: '18:00', available: true }],
        sunday: [{ start: '10:00', end: '18:00', available: true }]
      },
      maxHoursPerWeek: 40,
      currentHoursThisWeek: 32
    },
    {
      id: 'staff-002', 
      name: 'Sarah Chen',
      role: 'FOH',
      status: 'busy',
      email: 'sarah@hookahplus.com',
      phone: '+1 (555) 234-5678',
      hireDate: '2024-02-01',
      performance: 4.9,
      sessionsCompleted: 203,
      lastActive: '5 minutes ago',
      metrics: {
        sessionsCompleted: 203,
        averageRating: 4.9,
        onTimeDelivery: 96.8,
        customerSatisfaction: 95.2,
        efficiency: 91.3,
        attendance: 98.1
      },
      trends: {
        sessionsCompleted: 18.2,
        averageRating: 0.5,
        onTimeDelivery: 3.2
      },
      achievements: ['Customer Favorite', 'Efficiency Expert'],
      availability: {
        monday: [{ start: '12:00', end: '20:00', available: true }],
        tuesday: [{ start: '12:00', end: '20:00', available: true }],
        wednesday: [{ start: '12:00', end: '20:00', available: true }],
        thursday: [{ start: '12:00', end: '20:00', available: true }],
        friday: [{ start: '12:00', end: '20:00', available: true }],
        saturday: [{ start: '14:00', end: '22:00', available: true }],
        sunday: [{ start: '14:00', end: '22:00', available: true }]
      },
      maxHoursPerWeek: 40,
      currentHoursThisWeek: 28
    },
    {
      id: 'staff-003',
      name: 'Alex Johnson', 
      role: 'MANAGER',
      status: 'available',
      email: 'alex@hookahplus.com',
      phone: '+1 (555) 345-6789',
      hireDate: '2023-11-20',
      performance: 4.9,
      sessionsCompleted: 312,
      lastActive: '1 minute ago',
      metrics: {
        sessionsCompleted: 312,
        averageRating: 4.9,
        onTimeDelivery: 97.5,
        customerSatisfaction: 96.8,
        efficiency: 93.2,
        attendance: 99.2
      },
      trends: {
        sessionsCompleted: 8.7,
        averageRating: 0.2,
        onTimeDelivery: 1.8
      },
      achievements: ['Manager of the Year', 'Team Leader'],
      availability: {
        monday: [{ start: '08:00', end: '18:00', available: true }],
        tuesday: [{ start: '08:00', end: '18:00', available: true }],
        wednesday: [{ start: '08:00', end: '18:00', available: true }],
        thursday: [{ start: '08:00', end: '18:00', available: true }],
        friday: [{ start: '08:00', end: '18:00', available: true }],
        saturday: [{ start: '10:00', end: '20:00', available: true }],
        sunday: [{ start: '10:00', end: '20:00', available: true }]
      },
      maxHoursPerWeek: 50,
      currentHoursThisWeek: 42
    },
    {
      id: 'staff-004',
      name: 'Maria Garcia',
      role: 'FOH',
      status: 'offline',
      email: 'maria@hookahplus.com',
      phone: '+1 (555) 456-7890',
      hireDate: '2024-03-10',
      performance: 4.7,
      sessionsCompleted: 89,
      lastActive: '2 hours ago',
      metrics: {
        sessionsCompleted: 89,
        averageRating: 4.7,
        onTimeDelivery: 91.5,
        customerSatisfaction: 89.3,
        efficiency: 85.6,
        attendance: 92.4
      },
      trends: {
        sessionsCompleted: 5.2,
        averageRating: 0.1,
        onTimeDelivery: 1.2
      },
      achievements: ['Rising Star'],
      availability: {
        monday: [{ start: '16:00', end: '24:00', available: true }],
        tuesday: [{ start: '16:00', end: '24:00', available: true }],
        wednesday: [{ start: '16:00', end: '24:00', available: true }],
        thursday: [{ start: '16:00', end: '24:00', available: true }],
        friday: [{ start: '16:00', end: '24:00', available: true }],
        saturday: [{ start: '18:00', end: '02:00', available: true }],
        sunday: [{ start: '18:00', end: '02:00', available: true }]
      },
      maxHoursPerWeek: 35,
      currentHoursThisWeek: 24
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'BOH': return 'bg-orange-500';
      case 'FOH': return 'bg-blue-500';
      case 'MANAGER': return 'bg-purple-500';
      case 'ADMIN': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'BOH': return <Shield className="w-4 h-4" />;
      case 'FOH': return <User className="w-4 h-4" />;
      case 'MANAGER': return <Crown className="w-4 h-4" />;
      case 'ADMIN': return <Shield className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const handleAddStaff = () => {
    if (newStaff.name && newStaff.email && newStaff.phone) {
      const staff: StaffMember = {
        id: `staff-${Date.now()}`,
        name: newStaff.name,
        role: newStaff.role,
        status: 'available',
        email: newStaff.email,
        phone: newStaff.phone,
        hireDate: new Date().toISOString().split('T')[0],
        performance: 5.0,
        sessionsCompleted: 0,
        lastActive: 'Just now',
        metrics: {
          sessionsCompleted: 0,
          averageRating: 5.0,
          onTimeDelivery: 100,
          customerSatisfaction: 100,
          efficiency: 100,
          attendance: 100
        },
        trends: {
          sessionsCompleted: 0,
          averageRating: 0,
          onTimeDelivery: 0
        },
        achievements: [],
        availability: {
          monday: [{ start: '09:00', end: '17:00', available: true }],
          tuesday: [{ start: '09:00', end: '17:00', available: true }],
          wednesday: [{ start: '09:00', end: '17:00', available: true }],
          thursday: [{ start: '09:00', end: '17:00', available: true }],
          friday: [{ start: '09:00', end: '17:00', available: true }],
          saturday: [{ start: '10:00', end: '18:00', available: true }],
          sunday: [{ start: '10:00', end: '18:00', available: true }]
        },
        maxHoursPerWeek: 40,
        currentHoursThisWeek: 0
      };
      
      setStaffMembers([...staffMembers, staff]);
      setNewStaff({ name: '', email: '', phone: '', role: 'FOH' });
      setShowAddStaffModal(false);
    }
  };

  const handleEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff);
    setNewStaff({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role
    });
    setShowAddStaffModal(true);
  };

  const handleUpdateStaff = () => {
    if (editingStaff && newStaff.name && newStaff.email && newStaff.phone) {
      setStaffMembers(staffMembers.map(staff => 
        staff.id === editingStaff.id 
          ? { ...staff, name: newStaff.name, email: newStaff.email, phone: newStaff.phone, role: newStaff.role }
          : staff
      ));
      setEditingStaff(null);
      setNewStaff({ name: '', email: '', phone: '', role: 'FOH' });
      setShowAddStaffModal(false);
    }
  };

  const handleDeleteStaff = (staffId: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      setStaffMembers(staffMembers.filter(staff => staff.id !== staffId));
    }
  };

  const handleToggleStatus = (staffId: string) => {
    setStaffMembers(staffMembers.map(staff => 
      staff.id === staffId 
        ? { 
            ...staff, 
            status: staff.status === 'available' ? 'busy' : 
                   staff.status === 'busy' ? 'offline' : 'available'
          }
        : staff
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Staff Panel
            </h1>
          </div>
          <p className="text-xl text-zinc-400">
            Manage staff assignments and performance
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'staff', label: 'Staff Management', icon: <Users className="w-4 h-4" /> },
            { id: 'performance', label: 'Performance', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
            { id: 'communication', label: 'Communication', icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'permissions', label: 'Permissions', icon: <Shield className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors btn-tablet whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="card-tablet">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Total Staff</h3>
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{staffMembers.length}</div>
                <div className="text-sm text-zinc-400">Active team members</div>
              </Card>

              <Card className="card-tablet">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Available</h3>
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {staffMembers.filter(s => s.status === 'available').length}
                </div>
                <div className="text-sm text-zinc-400">Ready to work</div>
              </Card>

              <Card className="card-tablet">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Avg Performance</h3>
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {(staffMembers.reduce((sum, s) => sum + s.performance, 0) / staffMembers.length).toFixed(1)}
                </div>
                <div className="text-sm text-zinc-400">Out of 5.0</div>
              </Card>
            </div>

            {/* Coaching Panel - On-demand */}
            <div className="mb-8">
              {!showCoaching ? (
                <Card className="card-tablet">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Micro-Coaching</h3>
                      <p className="text-sm text-zinc-400">Get personalized coaching tips for your role</p>
                    </div>
                    <Button
                      className="btn-pretty-primary btn-tablet"
                      onClick={() => setShowCoaching(true)}
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      View Coaching Tips
                    </Button>
                  </div>
                </Card>
              ) : (
                <CoachingPanel
                  role={selectedStaffForCoaching ? 
                    (staffMembers.find(s => s.id === selectedStaffForCoaching)?.role === 'BOH' ? 'prep' : 'foh') as 'prep' | 'foh' | 'runner'
                    : 'foh'}
                  staffId={selectedStaffForCoaching || undefined}
                  onDismiss={() => setShowCoaching(false)}
                  showDismiss={true}
                />
              )}
            </div>
          </>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Staff Members</h2>
              <Button 
                className="btn-pretty-primary btn-tablet"
                onClick={() => {
                  setEditingStaff(null);
                  setNewStaff({ name: '', email: '', phone: '', role: 'FOH' });
                  setShowAddStaffModal(true);
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {staffMembers.map((staff) => (
                <Card key={staff.id} className="card-tablet">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-white">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{staff.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getRoleColor(staff.role)} text-white flex items-center space-x-1`}>
                            {getRoleIcon(staff.role)}
                            <span>{staff.role}</span>
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(staff.status)}`}></div>
                            <span className="text-sm text-zinc-400 capitalize">{staff.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-zinc-400">Performance</div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-semibold">{staff.performance}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-zinc-400">Sessions</div>
                        <div className="text-white font-semibold">{staff.sessionsCompleted}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          className="btn-pretty-outline btn-tablet-sm"
                          onClick={() => handleEditStaff(staff)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button 
                          className="btn-pretty-outline btn-tablet-sm"
                          onClick={() => handleToggleStatus(staff.id)}
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                        <Button 
                          className="btn-pretty-outline btn-tablet-sm"
                          onClick={() => handleDeleteStaff(staff.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-zinc-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-zinc-400" />
                        <span className="text-zinc-300">{staff.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-zinc-400" />
                        <span className="text-zinc-300">{staff.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-zinc-400" />
                        <span className="text-zinc-300">Last active: {staff.lastActive}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <StaffPerformanceAnalytics
            staffMembers={staffMembers}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        )}

        {activeTab === 'schedule' && (
          <StaffScheduling
            staffMembers={staffMembers}
            onShiftCreate={(shift) => {
              // Handle shift creation
              console.log('Creating shift:', shift);
            }}
            onShiftUpdate={(shiftId, updates) => {
              // Handle shift update
              console.log('Updating shift:', shiftId, updates);
            }}
            onShiftDelete={(shiftId) => {
              // Handle shift deletion
              console.log('Deleting shift:', shiftId);
            }}
          />
        )}

        {activeTab === 'communication' && (
          <StaffCommunication
            currentUserId="staff-003" // Current user (Alex Johnson - Manager)
            staffMembers={staffMembers.map(staff => ({
              id: staff.id,
              name: staff.name,
              role: staff.role,
              status: staff.status === 'available' ? 'online' : staff.status === 'busy' ? 'busy' : 'offline',
              lastSeen: new Date()
            }))}
            onMessageSend={(message) => {
              // Handle message sending
              console.log('Sending message:', message);
            }}
            onNotificationMarkRead={(notificationId) => {
              // Handle notification read
              console.log('Marking notification as read:', notificationId);
            }}
          />
        )}

        {activeTab === 'permissions' && (
          <RoleBasedPermissions
            currentUserRole="manager"
            onPermissionChange={(userId, permissions) => {
              // Handle permission changes
              console.log('Updating permissions for user:', userId, permissions);
            }}
            onRoleAssign={(userId, roleId) => {
              // Handle role assignment
              console.log('Assigning role to user:', userId, roleId);
            }}
          />
        )}
      </div>

      {/* Add/Edit Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="modal-tablet w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
              <Button 
                className="btn-pretty-outline btn-tablet-sm"
                onClick={() => {
                  setShowAddStaffModal(false);
                  setEditingStaff(null);
                  setNewStaff({ name: '', email: '', phone: '', role: 'FOH' });
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="input-tablet w-full bg-zinc-800 border border-zinc-700 text-white"
                  placeholder="Enter staff name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="input-tablet w-full bg-zinc-800 border border-zinc-700 text-white"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  className="input-tablet w-full bg-zinc-800 border border-zinc-700 text-white"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN' })}
                  className="input-tablet w-full bg-zinc-800 border border-zinc-700 text-white"
                >
                  <option value="FOH">FOH (Front of House)</option>
                  <option value="BOH">BOH (Back of House)</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  className="btn-pretty-primary btn-tablet flex-1"
                  onClick={editingStaff ? handleUpdateStaff : handleAddStaff}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingStaff ? 'Update Staff' : 'Add Staff'}
                </Button>
                <Button 
                  className="btn-pretty-outline btn-tablet flex-1"
                  onClick={() => {
                    setShowAddStaffModal(false);
                    setEditingStaff(null);
                    setNewStaff({ name: '', email: '', phone: '', role: 'FOH' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
