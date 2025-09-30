"use client";

import React, { useState } from 'react';
import GlobalNavigation from '../../components/GlobalNavigation';
import { Card, Button, Badge } from '../../components';
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
  MapPin
} from 'lucide-react';

export default function StaffPanelPage() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const staffMembers = [
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
      lastActive: '2 minutes ago'
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
      lastActive: '5 minutes ago'
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
      lastActive: '1 minute ago'
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
      lastActive: '2 hours ago'
    }
  ];

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
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'staff', label: 'Staff Management', icon: <Users className="w-4 h-4" /> },
            { id: 'performance', label: 'Performance', icon: <Star className="w-4 h-4" /> },
            { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Total Staff</h3>
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{staffMembers.length}</div>
              <div className="text-sm text-zinc-400">Active team members</div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Available</h3>
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {staffMembers.filter(s => s.status === 'available').length}
              </div>
              <div className="text-sm text-zinc-400">Ready to work</div>
            </Card>

            <Card className="p-6">
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
        )}

        {activeTab === 'staff' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Staff Members</h2>
              <Button className="btn-pretty-primary">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {staffMembers.map((staff) => (
                <Card key={staff.id} className="p-6">
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
                          <Badge className={`${getRoleColor(staff.role)} text-white`}>
                            {staff.role}
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
                        <Button className="btn-pretty-outline" size="sm">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button className="btn-pretty-outline" size="sm">
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
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Performance Analytics</h3>
            <p className="text-zinc-400">Detailed performance metrics coming soon</p>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Staff Scheduling</h3>
            <p className="text-zinc-400">Schedule management coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
