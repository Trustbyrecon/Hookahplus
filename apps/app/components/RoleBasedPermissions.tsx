"use client";

import React, { useState } from 'react';
import { 
  Shield, 
  User, 
  Crown, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  Save,
  Lock,
  Unlock
} from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'general' | 'staff' | 'financial' | 'system' | 'reports';
  level: 'read' | 'write' | 'admin';
}

interface Role {
  id: string;
  name: string;
  description: string;
  level: number; // 1-5, higher = more permissions
  permissions: string[]; // Permission IDs
  color: string;
  icon: React.ReactNode;
}

interface UserRole {
  userId: string;
  userName: string;
  roleId: string;
  roleName: string;
  assignedBy: string;
  assignedAt: Date;
  isActive: boolean;
}

interface RoleBasedPermissionsProps {
  currentUserRole: string;
  onPermissionChange: (userId: string, permissions: string[]) => void;
  onRoleAssign: (userId: string, roleId: string) => void;
}

export default function RoleBasedPermissions({ 
  currentUserRole, 
  onPermissionChange, 
  onRoleAssign 
}: RoleBasedPermissionsProps) {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'users'>('roles');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    level: 3,
    permissions: [] as string[]
  });

  // Define all available permissions
  const allPermissions: Permission[] = [
    // General permissions
    { id: 'view_dashboard', name: 'View Dashboard', description: 'Access to main dashboard', category: 'general', level: 'read' },
    { id: 'view_analytics', name: 'View Analytics', description: 'Access to analytics and reports', category: 'general', level: 'read' },
    { id: 'view_settings', name: 'View Settings', description: 'Access to system settings', category: 'general', level: 'read' },
    
    // Staff permissions
    { id: 'view_staff', name: 'View Staff', description: 'View staff members and their information', category: 'staff', level: 'read' },
    { id: 'add_staff', name: 'Add Staff', description: 'Add new staff members', category: 'staff', level: 'write' },
    { id: 'edit_staff', name: 'Edit Staff', description: 'Edit staff member information', category: 'staff', level: 'write' },
    { id: 'delete_staff', name: 'Delete Staff', description: 'Remove staff members', category: 'staff', level: 'admin' },
    { id: 'manage_schedules', name: 'Manage Schedules', description: 'Create and edit staff schedules', category: 'staff', level: 'write' },
    { id: 'view_performance', name: 'View Performance', description: 'View staff performance metrics', category: 'staff', level: 'read' },
    { id: 'manage_performance', name: 'Manage Performance', description: 'Edit performance metrics and reviews', category: 'staff', level: 'admin' },
    
    // Financial permissions
    { id: 'view_financials', name: 'View Financials', description: 'View financial reports and data', category: 'financial', level: 'read' },
    { id: 'manage_payments', name: 'Manage Payments', description: 'Process and manage payments', category: 'financial', level: 'write' },
    { id: 'view_revenue', name: 'View Revenue', description: 'Access revenue reports', category: 'financial', level: 'read' },
    { id: 'manage_pricing', name: 'Manage Pricing', description: 'Update menu prices and packages', category: 'financial', level: 'admin' },
    
    // System permissions
    { id: 'system_settings', name: 'System Settings', description: 'Modify system configuration', category: 'system', level: 'admin' },
    { id: 'user_management', name: 'User Management', description: 'Manage user accounts and roles', category: 'system', level: 'admin' },
    { id: 'backup_restore', name: 'Backup & Restore', description: 'Create and restore system backups', category: 'system', level: 'admin' },
    { id: 'view_logs', name: 'View Logs', description: 'Access system logs and audit trails', category: 'system', level: 'read' },
    
    // Reports permissions
    { id: 'generate_reports', name: 'Generate Reports', description: 'Create custom reports', category: 'reports', level: 'write' },
    { id: 'export_data', name: 'Export Data', description: 'Export data to external formats', category: 'reports', level: 'write' },
    { id: 'view_audit', name: 'View Audit Trail', description: 'Access audit logs and changes', category: 'reports', level: 'read' }
  ];

  // Define default roles
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access with all permissions',
      level: 5,
      permissions: allPermissions.map(p => p.id),
      color: 'bg-red-500',
      icon: <Shield className="w-5 h-5" />
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Management access with staff and financial permissions',
      level: 4,
      permissions: allPermissions.filter(p => 
        p.category === 'general' || 
        p.category === 'staff' || 
        p.category === 'financial' ||
        (p.category === 'reports' && p.level !== 'admin')
      ).map(p => p.id),
      color: 'bg-purple-500',
      icon: <Crown className="w-5 h-5" />
    },
    {
      id: 'supervisor',
      name: 'Supervisor',
      description: 'Supervisory access with limited management permissions',
      level: 3,
      permissions: allPermissions.filter(p => 
        p.category === 'general' || 
        (p.category === 'staff' && p.level !== 'admin') ||
        (p.category === 'financial' && p.level === 'read')
      ).map(p => p.id),
      color: 'bg-blue-500',
      icon: <User className="w-5 h-5" />
    },
    {
      id: 'staff',
      name: 'Staff',
      description: 'Basic staff access with limited permissions',
      level: 2,
      permissions: allPermissions.filter(p => 
        p.category === 'general' && p.level === 'read'
      ).map(p => p.id),
      color: 'bg-green-500',
      icon: <User className="w-5 h-5" />
    },
    {
      id: 'guest',
      name: 'Guest',
      description: 'Minimal access for temporary users',
      level: 1,
      permissions: ['view_dashboard'],
      color: 'bg-gray-500',
      icon: <Eye className="w-5 h-5" />
    }
  ]);

  const [userRoles, setUserRoles] = useState<UserRole[]>([]);

  const getRoleById = (roleId: string) => roles.find(r => r.id === roleId);
  const getPermissionsByCategory = (category: string) => allPermissions.filter(p => p.category === category);
  const getRolePermissions = (roleId: string) => {
    const role = getRoleById(roleId);
    return role ? allPermissions.filter(p => role.permissions.includes(p.id)) : [];
  };

  const handleCreateRole = () => {
    if (!newRole.name.trim()) return;

    const role: Role = {
      id: `role-${Date.now()}`,
      name: newRole.name,
      description: newRole.description,
      level: newRole.level,
      permissions: newRole.permissions,
      color: 'bg-blue-500',
      icon: <User className="w-5 h-5" />
    };

    setRoles([...roles, role]);
    setNewRole({ name: '', description: '', level: 3, permissions: [] });
    setShowRoleModal(false);
  };

  const handleUpdateRole = () => {
    if (!editingRole) return;

    setRoles(roles.map(role => 
      role.id === editingRole.id 
        ? { ...role, name: newRole.name, description: newRole.description, level: newRole.level, permissions: newRole.permissions }
        : role
    ));
    setEditingRole(null);
    setNewRole({ name: '', description: '', level: 3, permissions: [] });
    setShowRoleModal(false);
  };

  const handleDeleteRole = (roleId: string) => {
    if (confirm('Are you sure you want to delete this role? This will affect all users with this role.')) {
      setRoles(roles.filter(role => role.id !== roleId));
    }
  };

  const handleAssignRole = (userId: string, roleId: string) => {
    const role = getRoleById(roleId);
    if (!role) return;

    setUserRoles(userRoles.map(ur => 
      ur.userId === userId 
        ? { ...ur, roleId, roleName: role.name, assignedBy: 'Current User', assignedAt: new Date() }
        : ur
    ));
    onRoleAssign(userId, roleId);
  };

  const handlePermissionToggle = (permissionId: string) => {
    if (!selectedRole) return;

    const updatedPermissions = selectedRole.permissions.includes(permissionId)
      ? selectedRole.permissions.filter(p => p !== permissionId)
      : [...selectedRole.permissions, permissionId];

    setRoles(roles.map(role => 
      role.id === selectedRole.id 
        ? { ...role, permissions: updatedPermissions }
        : role
    ));
    setSelectedRole({ ...selectedRole, permissions: updatedPermissions });
  };

  const canManageRoles = currentUserRole === 'admin' || currentUserRole === 'manager';
  const canViewPermissions = currentUserRole === 'admin' || currentUserRole === 'manager' || currentUserRole === 'supervisor';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Role-Based Permissions</h2>
          <p className="text-zinc-400">Manage user roles and access permissions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-zinc-800 rounded-lg p-1">
        {[
          { id: 'roles', label: 'Roles', icon: Shield },
          { id: 'permissions', label: 'Permissions', icon: Settings },
          { id: 'users', label: 'User Assignments', icon: User }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">System Roles</h3>
            {canManageRoles && (
              <button
                onClick={() => {
                  setEditingRole(null);
                  setNewRole({ name: '', description: '', level: 3, permissions: [] });
                  setShowRoleModal(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Role</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedRole?.id === role.id
                    ? 'bg-blue-600/20 border-blue-500/50'
                    : 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50'
                }`}
                onClick={() => setSelectedRole(role)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${role.color}`}>
                    {role.icon}
                  </div>
                  <div className="flex space-x-2">
                    {canManageRoles && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingRole(role);
                            setNewRole({
                              name: role.name,
                              description: role.description,
                              level: role.level,
                              permissions: role.permissions
                            });
                            setShowRoleModal(true);
                          }}
                          className="p-1 text-zinc-400 hover:text-white transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {role.level < 5 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRole(role.id);
                            }}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <h4 className="font-semibold text-white mb-1">{role.name}</h4>
                <p className="text-sm text-zinc-400 mb-3">{role.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Level {role.level}</span>
                  <span className="text-zinc-400">{role.permissions.length} permissions</span>
                </div>
              </div>
            ))}
          </div>

          {/* Role Details */}
          {selectedRole && (
            <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">{selectedRole.name} Permissions</h4>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${selectedRole.color} text-white`}>
                    Level {selectedRole.level}
                  </div>
                  <span className="text-sm text-zinc-400">{selectedRole.permissions.length} permissions</span>
                </div>
              </div>

              <div className="space-y-4">
                {['general', 'staff', 'financial', 'system', 'reports'].map((category) => (
                  <div key={category}>
                    <h5 className="text-sm font-medium text-zinc-300 mb-2 capitalize">{category} Permissions</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {getPermissionsByCategory(category).map((permission) => (
                        <div
                          key={permission.id}
                          className={`flex items-center space-x-3 p-2 rounded-lg border transition-colors ${
                            selectedRole.permissions.includes(permission.id)
                              ? 'bg-green-500/20 border-green-500/30'
                              : 'bg-zinc-700/50 border-zinc-600'
                          }`}
                        >
                          <button
                            onClick={() => handlePermissionToggle(permission.id)}
                            disabled={!canManageRoles}
                            className={`p-1 rounded transition-colors ${
                              selectedRole.permissions.includes(permission.id)
                                ? 'text-green-400'
                                : 'text-zinc-400'
                            } ${!canManageRoles ? 'cursor-not-allowed opacity-50' : 'hover:bg-zinc-600'}`}
                          >
                            {selectedRole.permissions.includes(permission.id) ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">{permission.name}</div>
                            <div className="text-xs text-zinc-400">{permission.description}</div>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs ${
                            permission.level === 'admin' ? 'bg-red-500/20 text-red-400' :
                            permission.level === 'write' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {permission.level}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && canViewPermissions && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">All Permissions</h3>
          
          <div className="space-y-6">
            {['general', 'staff', 'financial', 'system', 'reports'].map((category) => (
              <div key={category} className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-4">
                <h4 className="text-lg font-semibold text-white mb-4 capitalize">{category} Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {getPermissionsByCategory(category).map((permission) => (
                    <div key={permission.id} className="p-3 bg-zinc-700/50 rounded-lg border border-zinc-600">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-white">{permission.name}</h5>
                        <div className={`px-2 py-1 rounded text-xs ${
                          permission.level === 'admin' ? 'bg-red-500/20 text-red-400' :
                          permission.level === 'write' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {permission.level}
                        </div>
                      </div>
                      <p className="text-sm text-zinc-400">{permission.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Assignments Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">User Role Assignments</h3>
          
          <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-700/50">
                  <tr>
                    <th className="text-left py-3 px-4 text-zinc-300">User</th>
                    <th className="text-left py-3 px-4 text-zinc-300">Current Role</th>
                    <th className="text-left py-3 px-4 text-zinc-300">Assigned By</th>
                    <th className="text-left py-3 px-4 text-zinc-300">Assigned At</th>
                    <th className="text-left py-3 px-4 text-zinc-300">Status</th>
                    <th className="text-left py-3 px-4 text-zinc-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userRoles.map((userRole) => {
                    const role = getRoleById(userRole.roleId);
                    return (
                      <tr key={userRole.userId} className="border-t border-zinc-700/50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">{userRole.userName}</div>
                        </td>
                        <td className="py-3 px-4">
                          {role && (
                            <div className="flex items-center space-x-2">
                              <div className={`p-1 rounded ${role.color}`}>
                                {role.icon}
                              </div>
                              <span className="text-white">{role.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-zinc-400">{userRole.assignedBy}</td>
                        <td className="py-3 px-4 text-zinc-400">
                          {userRole.assignedAt.toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className={`flex items-center space-x-1 ${
                            userRole.isActive ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {userRole.isActive ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            <span className="text-sm">{userRole.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {canManageRoles && (
                            <select
                              value={userRole.roleId}
                              onChange={(e) => handleAssignRole(userRole.userId, e.target.value)}
                              className="px-3 py-1 bg-zinc-700 border border-zinc-600 rounded text-white text-sm"
                            >
                              {roles.map((role) => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                              ))}
                            </select>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Role Name</label>
                  <input
                    type="text"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                    placeholder="Enter role name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Level (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newRole.level}
                    onChange={(e) => setNewRole({ ...newRole, level: parseInt(e.target.value) || 3 })}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white h-20 resize-none"
                  placeholder="Enter role description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-3">Permissions</label>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {['general', 'staff', 'financial', 'system', 'reports'].map((category) => (
                    <div key={category}>
                      <h5 className="text-sm font-medium text-zinc-300 mb-2 capitalize">{category}</h5>
                      <div className="space-y-1">
                        {getPermissionsByCategory(category).map((permission) => (
                          <label key={permission.id} className="flex items-center space-x-3 p-2 hover:bg-zinc-700/50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newRole.permissions.includes(permission.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewRole({ ...newRole, permissions: [...newRole.permissions, permission.id] });
                                } else {
                                  setNewRole({ ...newRole, permissions: newRole.permissions.filter(p => p !== permission.id) });
                                }
                              }}
                              className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white">{permission.name}</div>
                              <div className="text-xs text-zinc-400">{permission.description}</div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs ${
                              permission.level === 'admin' ? 'bg-red-500/20 text-red-400' :
                              permission.level === 'write' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {permission.level}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowRoleModal(false)}
                className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-white"
              >
                Cancel
              </button>
              <button
                onClick={editingRole ? handleUpdateRole : handleCreateRole}
                disabled={!newRole.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed rounded-lg transition-colors text-white flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{editingRole ? 'Update Role' : 'Create Role'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
