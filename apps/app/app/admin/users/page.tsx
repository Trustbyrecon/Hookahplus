"use client";

import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Shield,
  Clock,
  Mail,
  Phone,
  MapPin,
  Crown,
  ChefHat,
  User,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import GlobalNavigation from '../../../components/GlobalNavigation';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock user data
  const users = [
    { 
      id: 1, 
      name: 'John Smith', 
      email: 'john@hookahplus.com', 
      phone: '+1 (555) 123-4567',
      role: 'Manager', 
      status: 'active', 
      lastLogin: '2 hours ago',
      joinDate: '2024-01-15',
      avatar: '👨‍💼'
    },
    { 
      id: 2, 
      name: 'Sarah Chen', 
      email: 'sarah@hookahplus.com', 
      phone: '+1 (555) 234-5678',
      role: 'BOH', 
      status: 'active', 
      lastLogin: '1 hour ago',
      joinDate: '2024-02-20',
      avatar: '👩‍🍳'
    },
    { 
      id: 3, 
      name: 'Mike Rodriguez', 
      email: 'mike@hookahplus.com', 
      phone: '+1 (555) 345-6789',
      role: 'FOH', 
      status: 'inactive', 
      lastLogin: '1 day ago',
      joinDate: '2024-01-10',
      avatar: '👨‍💼'
    },
    { 
      id: 4, 
      name: 'Emily Davis', 
      email: 'emily@hookahplus.com', 
      phone: '+1 (555) 456-7890',
      role: 'Admin', 
      status: 'active', 
      lastLogin: '30 minutes ago',
      joinDate: '2023-12-01',
      avatar: '👩‍💻'
    },
    { 
      id: 5, 
      name: 'Alex Johnson', 
      email: 'alex@hookahplus.com', 
      phone: '+1 (555) 567-8901',
      role: 'BOH', 
      status: 'active', 
      lastLogin: '3 hours ago',
      joinDate: '2024-03-05',
      avatar: '👨‍🍳'
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role.toLowerCase() === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return <Crown className="w-4 h-4" />;
      case 'Manager': return <UserCheck className="w-4 h-4" />;
      case 'BOH': return <ChefHat className="w-4 h-4" />;
      case 'FOH': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Manager': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'BOH': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'FOH': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    admins: users.filter(u => u.role === 'Admin').length,
    managers: users.filter(u => u.role === 'Manager').length,
    staff: users.filter(u => ['BOH', 'FOH'].includes(u.role)).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-8 h-8 text-teal-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              User Management
            </h1>
          </div>
          <p className="text-xl text-zinc-400">
            Manage users, roles, and permissions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="card-pretty p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-sm text-zinc-400">Total Users</div>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="card-pretty p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-400">{stats.active}</div>
                <div className="text-sm text-zinc-400">Active</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="card-pretty p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-400">{stats.inactive}</div>
                <div className="text-sm text-zinc-400">Inactive</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="card-pretty p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-400">{stats.admins}</div>
                <div className="text-sm text-zinc-400">Admins</div>
              </div>
              <Crown className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="card-pretty p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-400">{stats.managers}</div>
                <div className="text-sm text-zinc-400">Managers</div>
              </div>
              <UserCheck className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="card-pretty p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-400">{stats.staff}</div>
                <div className="text-sm text-zinc-400">Staff</div>
              </div>
              <ChefHat className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button className="btn-pretty-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </button>
            <button className="btn-pretty-secondary">
              <Shield className="w-4 h-4 mr-2" />
              Manage Roles
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="boh">BOH</option>
              <option value="foh">FOH</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="card-pretty">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Last Login</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{user.avatar}</div>
                        <div>
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="text-sm text-zinc-400">Joined {user.joinDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-zinc-300">
                          <Mail className="w-3 h-3" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-zinc-300">
                          <Phone className="w-3 h-3" />
                          <span>{user.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span>{user.role}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2 text-sm text-zinc-300">
                        <Clock className="w-3 h-3" />
                        <span>{user.lastLogin}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-400 hover:text-blue-300" title="Edit User">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="text-red-400 hover:text-red-300" title="Delete User">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="text-green-400 hover:text-green-300" title="View Details">
                          <User className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
