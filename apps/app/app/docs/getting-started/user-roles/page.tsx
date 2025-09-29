"use client";

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Users, 
  ChefHat, 
  UserCheck, 
  Crown, 
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Button from '../../../../components/Button';
import GlobalNavigation from '../../../../components/GlobalNavigation';

export default function UserRolesGuide() {
  const [selectedRole, setSelectedRole] = useState('boh');

  const roles = [
    {
      id: 'boh',
      name: 'Back of House (BOH)',
      description: 'Handles hookah preparation and equipment management',
      icon: <ChefHat className="w-6 h-6" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      responsibilities: [
        'Prepare hookah sessions according to orders',
        'Manage equipment inventory and maintenance',
        'Update session status during preparation',
        'Handle equipment issues and replacements',
        'Coordinate with FOH on order timing'
      ],
      permissions: [
        'View and update session status',
        'Access equipment management tools',
        'Create and manage prep tasks',
        'View customer order details',
        'Update inventory levels'
      ],
      dashboard: 'Fire Session Dashboard - BOH View',
      actions: [
        'Start Prep',
        'Mark Ready',
        'Report Equipment Issues',
        'Update Inventory',
        'View Prep Queue'
      ]
    },
    {
      id: 'foh',
      name: 'Front of House (FOH)',
      description: 'Manages customer service and session delivery',
      icon: <UserCheck className="w-6 h-6" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      responsibilities: [
        'Take customer orders and payments',
        'Deliver prepared hookah sessions to tables',
        'Provide customer service during sessions',
        'Handle customer complaints and requests',
        'Manage table assignments and seating'
      ],
      permissions: [
        'Create new sessions',
        'Process payments',
        'Update session status',
        'Access customer information',
        'Manage table assignments'
      ],
      dashboard: 'Fire Session Dashboard - FOH View',
      actions: [
        'Take Delivery',
        'Start Session',
        'Pause/Resume Session',
        'Complete Session',
        'Handle Customer Issues'
      ]
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Oversees operations and handles complex issues',
      icon: <Crown className="w-6 h-6" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      responsibilities: [
        'Oversee all BOH and FOH operations',
        'Handle escalated customer issues',
        'Manage staff scheduling and assignments',
        'Review and approve special requests',
        'Monitor system performance and analytics'
      ],
      permissions: [
        'Full access to all features',
        'Manage staff accounts',
        'View detailed analytics',
        'Handle escalated issues',
        'Configure system settings'
      ],
      dashboard: 'Fire Session Dashboard - Manager View',
      actions: [
        'All BOH and FOH actions',
        'Resolve Edge Cases',
        'Manage Staff',
        'View Analytics',
        'System Configuration'
      ]
    },
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access and configuration management',
      icon: <Shield className="w-6 h-6" />,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      responsibilities: [
        'Configure system settings and preferences',
        'Manage user accounts and permissions',
        'Handle system maintenance and updates',
        'Access advanced analytics and reporting',
        'Manage integrations and third-party services'
      ],
      permissions: [
        'Complete system access',
        'User management',
        'System configuration',
        'Advanced analytics',
        'Integration management'
      ],
      dashboard: 'Admin Control Center',
      actions: [
        'All Manager actions',
        'User Management',
        'System Settings',
        'POS Waitlist Management',
        'Advanced Analytics'
      ]
    }
  ];

  const roleHierarchy = [
    { level: 1, role: 'BOH', description: 'Preparation and Equipment' },
    { level: 2, role: 'FOH', description: 'Customer Service and Delivery' },
    { level: 3, role: 'Manager', description: 'Operations Oversight' },
    { level: 4, role: 'Admin', description: 'System Administration' }
  ];

  const selectedRoleData = roles.find(role => role.id === selectedRole) || roles[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/docs" className="inline-flex items-center text-zinc-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Documentation
          </Link>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Users className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Understanding User Roles</h1>
              <p className="text-zinc-400">Learn about BOH, FOH, Manager, and Admin roles and permissions</p>
            </div>
          </div>
        </div>

        {/* Role Overview */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Role Hierarchy</h2>
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
            <div className="space-y-4">
              {roleHierarchy.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 font-semibold">
                    {item.level}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.role}</h3>
                    <p className="text-sm text-zinc-400">{item.description}</p>
                  </div>
                  {index < roleHierarchy.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-zinc-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Select a Role to Learn More</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedRole === role.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700/50'
                }`}
              >
                <div className={`${role.color} mb-2`}>
                  {role.icon}
                </div>
                <h3 className="font-medium mb-1">{role.name}</h3>
                <p className="text-sm text-zinc-400">{role.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Role Details */}
        <div className="mb-12">
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
            <div className="flex items-center space-x-4 mb-6">
              <div className={`w-12 h-12 ${selectedRoleData.bgColor} rounded-lg flex items-center justify-center ${selectedRoleData.color}`}>
                {selectedRoleData.icon}
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{selectedRoleData.name}</h2>
                <p className="text-zinc-400">{selectedRoleData.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Responsibilities */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                  Key Responsibilities
                </h3>
                <div className="space-y-2">
                  {selectedRoleData.responsibilities.map((responsibility, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-zinc-300">{responsibility}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-400" />
                  System Permissions
                </h3>
                <div className="space-y-2">
                  {selectedRoleData.permissions.map((permission, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-zinc-300">{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-purple-400" />
                Available Actions
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedRoleData.actions.map((action, index) => (
                  <span key={index} className="px-3 py-1 bg-zinc-700 text-sm text-zinc-300 rounded-full">
                    {action}
                  </span>
                ))}
              </div>
            </div>

            {/* Dashboard */}
            <div className="mt-6 p-4 bg-zinc-700/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-300">Primary Dashboard</span>
              </div>
              <p className="text-sm text-zinc-400">{selectedRoleData.dashboard}</p>
            </div>
          </div>
        </div>

        {/* Role Management */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Managing User Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-green-400" />
                Adding New Users
              </h3>
              <div className="space-y-2 text-sm text-zinc-300">
                <p>1. Go to Admin → User Management</p>
                <p>2. Click "Add New User"</p>
                <p>3. Enter user details and select role</p>
                <p>4. Send invitation email</p>
                <p>5. User accepts and sets up account</p>
              </div>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Edit className="w-5 h-5 mr-2 text-blue-400" />
                Updating Roles
              </h3>
              <div className="space-y-2 text-sm text-zinc-300">
                <p>1. Find user in User Management</p>
                <p>2. Click "Edit" next to their name</p>
                <p>3. Select new role from dropdown</p>
                <p>4. Save changes</p>
                <p>5. User will see updated permissions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Best Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-300">Do's</h3>
              <ul className="space-y-2 text-sm text-green-200">
                <li>• Assign roles based on actual job responsibilities</li>
                <li>• Regularly review and update role permissions</li>
                <li>• Train staff on their specific role capabilities</li>
                <li>• Use the principle of least privilege</li>
                <li>• Monitor role usage and effectiveness</li>
              </ul>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-300">Don'ts</h3>
              <ul className="space-y-2 text-sm text-red-200">
                <li>• Don't give everyone admin access</li>
                <li>• Don't share login credentials</li>
                <li>• Don't leave old user accounts active</li>
                <li>• Don't skip role-based training</li>
                <li>• Don't ignore permission audit logs</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
          <h3 className="text-lg font-semibold mb-4">Ready to Set Up Roles?</h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/admin">
              <Button className="bg-purple-500 hover:bg-purple-600">
                <Users className="w-4 h-4 mr-2" />
                Go to Admin Center
              </Button>
            </Link>
            <Link href="/fire-session-dashboard">
              <Button variant="outline" className="text-zinc-400 border-zinc-600 hover:bg-zinc-700">
                <Eye className="w-4 h-4 mr-2" />
                View Role-Based Dashboard
              </Button>
            </Link>
            <Link href="/docs/workflow-management/boh-workflow">
              <Button variant="outline" className="text-zinc-400 border-zinc-600 hover:bg-zinc-700">
                <ArrowRight className="w-4 h-4 mr-2" />
                Next: BOH Workflow
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
