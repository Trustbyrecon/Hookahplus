"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StaffMember {
  id: string;
  name: string;
  role: 'manager' | 'boh' | 'foh' | 'host';
  status: 'active' | 'break' | 'off';
  currentTable?: string;
  ordersHandled: number;
  lastActivity: string;
  permissions: string[];
}

interface TableStatus {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  customerName?: string;
  sessionId?: string;
  estimatedTime?: number;
  assignedStaff?: string;
}

export default function StaffPanel() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'tables' | 'orders'>('overview');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Generate demo data
  useEffect(() => {
    const demoStaff: StaffMember[] = [
      {
        id: 'staff-1',
        name: 'Sarah Chen',
        role: 'manager',
        status: 'active',
        ordersHandled: 12,
        lastActivity: '2 min ago',
        permissions: ['all', 'override', 'financial', 'staff_management']
      },
      {
        id: 'staff-2',
        name: 'Mike Rodriguez',
        role: 'boh',
        status: 'active',
        currentTable: 'T-003',
        ordersHandled: 8,
        lastActivity: '1 min ago',
        permissions: ['prep', 'inventory', 'restart_prep', 'resolve_issues']
      },
      {
        id: 'staff-3',
        name: 'Alex Johnson',
        role: 'foh',
        status: 'active',
        currentTable: 'T-001',
        ordersHandled: 15,
        lastActivity: '30 sec ago',
        permissions: ['delivery', 'customer_service', 'payment']
      },
      {
        id: 'staff-4',
        name: 'Emily Davis',
        role: 'host',
        status: 'break',
        ordersHandled: 6,
        lastActivity: '5 min ago',
        permissions: ['seating', 'reservations']
      }
    ];

    const demoTables: TableStatus[] = [
      {
        id: 'table-1',
        number: 'T-001',
        status: 'occupied',
        customerName: 'John Smith',
        sessionId: 'session-1',
        estimatedTime: 45,
        assignedStaff: 'Alex Johnson'
      },
      {
        id: 'table-2',
        number: 'T-002',
        status: 'available'
      },
      {
        id: 'table-3',
        number: 'T-003',
        status: 'occupied',
        customerName: 'Maria Garcia',
        sessionId: 'session-2',
        estimatedTime: 30,
        assignedStaff: 'Mike Rodriguez'
      },
      {
        id: 'table-4',
        number: 'T-004',
        status: 'cleaning'
      },
      {
        id: 'table-5',
        number: 'T-005',
        status: 'reserved',
        customerName: 'David Lee',
        estimatedTime: 15
      }
    ];

    setStaff(demoStaff);
    setTables(demoTables);
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'text-purple-400';
      case 'boh': return 'text-blue-400';
      case 'foh': return 'text-green-400';
      case 'host': return 'text-yellow-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'break': return 'text-yellow-400';
      case 'off': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-400';
      case 'occupied': return 'text-red-400';
      case 'reserved': return 'text-yellow-400';
      case 'cleaning': return 'text-blue-400';
      default: return 'text-zinc-400';
    }
  };

  const handleStaffAction = (staffId: string, action: string) => {
    setStaff(prev => prev.map(member => {
      if (member.id === staffId) {
        switch (action) {
          case 'start_break':
            return { ...member, status: 'break' as const };
          case 'end_break':
            return { ...member, status: 'active' as const };
          case 'assign_table':
            return { ...member, currentTable: 'T-001' };
          default:
            return member;
        }
      }
      return member;
    }));
  };

  const activeStaff = staff.filter(s => s.status === 'active').length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const totalOrders = staff.reduce((sum, s) => sum + s.ordersHandled, 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-teal-300 mb-2">👥 Staff Panel</h1>
          <p className="text-zinc-400">Manage staff, tables, and operations in real-time</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-white">{activeStaff}</div>
            <div className="text-sm text-zinc-400">Active Staff</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">🪑</div>
            <div className="text-2xl font-bold text-white">{occupiedTables}</div>
            <div className="text-sm text-zinc-400">Occupied Tables</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">📦</div>
            <div className="text-2xl font-bold text-white">{totalOrders}</div>
            <div className="text-sm text-zinc-400">Orders Handled</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-2xl font-bold text-white">2.3h</div>
            <div className="text-sm text-zinc-400">Avg Session Time</div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors">
              ➕ Add Staff
            </button>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              📊 Generate Report
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/fire-session-dashboard"
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              🔥 Fire Session
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'overview', label: '📊 Overview', count: 0 },
            { id: 'staff', label: '👥 Staff', count: staff.length },
            { id: 'tables', label: '🪑 Tables', count: tables.length },
            { id: 'orders', label: '📦 Orders', count: totalOrders }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <h3 className="text-xl font-semibold text-teal-300 mb-4">Staff Status</h3>
                <div className="space-y-3">
                  {staff.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-lg">👤</div>
                        <div>
                          <div className="font-medium text-white">{member.name}</div>
                          <div className={`text-sm ${getRoleColor(member.role)}`}>
                            {member.role.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getStatusColor(member.status)}`}>
                          {member.status.toUpperCase()}
                        </div>
                        <div className="text-xs text-zinc-400">{member.lastActivity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <h3 className="text-xl font-semibold text-teal-300 mb-4">Table Status</h3>
                <div className="grid grid-cols-2 gap-3">
                  {tables.map((table) => (
                    <div key={table.id} className={`p-3 rounded-lg border ${
                      table.status === 'occupied' ? 'bg-red-900/20 border-red-500/50' :
                      table.status === 'available' ? 'bg-green-900/20 border-green-500/50' :
                      table.status === 'reserved' ? 'bg-yellow-900/20 border-yellow-500/50' :
                      'bg-blue-900/20 border-blue-500/50'
                    }`}>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{table.number}</div>
                        <div className={`text-sm ${getTableStatusColor(table.status)}`}>
                          {table.status.toUpperCase()}
                        </div>
                        {table.customerName && (
                          <div className="text-xs text-zinc-400 mt-1">{table.customerName}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                  <div className="text-lg">🔥</div>
                  <div className="flex-1">
                    <div className="text-white font-medium">Session started at T-001</div>
                    <div className="text-sm text-zinc-400">Alex Johnson • 2 minutes ago</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                  <div className="text-lg">👨‍🍳</div>
                  <div className="flex-1">
                    <div className="text-white font-medium">Prep completed for T-003</div>
                    <div className="text-sm text-zinc-400">Mike Rodriguez • 5 minutes ago</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                  <div className="text-lg">📦</div>
                  <div className="flex-1">
                    <div className="text-white font-medium">New order received</div>
                    <div className="text-sm text-zinc-400">Sarah Chen • 8 minutes ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            {staff.map((member) => (
              <div key={member.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">👤</div>
                    <div>
                      <h3 className="text-xl font-semibold text-teal-300">{member.name}</h3>
                      <p className={`${getRoleColor(member.role)} font-medium`}>
                        {member.role.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${getStatusColor(member.status)}`}>
                      {member.status.toUpperCase()}
                    </div>
                    <div className="text-zinc-400">{member.lastActivity}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-zinc-400">Current Table:</span>
                    <div className="text-zinc-300 font-medium">
                      {member.currentTable || 'None'}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Orders Handled:</span>
                    <div className="text-zinc-300 font-medium">{member.ordersHandled}</div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Permissions:</span>
                    <div className="text-zinc-300 font-medium">
                      {member.permissions.slice(0, 2).join(', ')}
                      {member.permissions.length > 2 && ` +${member.permissions.length - 2} more`}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {member.status === 'active' && (
                    <button
                      onClick={() => handleStaffAction(member.id, 'start_break')}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      ☕ Start Break
                    </button>
                  )}
                  {member.status === 'break' && (
                    <button
                      onClick={() => handleStaffAction(member.id, 'end_break')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      ✅ End Break
                    </button>
                  )}
                  <button
                    onClick={() => handleStaffAction(member.id, 'assign_table')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    🪑 Assign Table
                  </button>
                  <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors">
                    ✏️ Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tables Tab */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tables.map((table) => (
                <div key={table.id} className={`rounded-xl border p-6 ${
                  table.status === 'occupied' ? 'bg-red-900/20 border-red-500/50' :
                  table.status === 'available' ? 'bg-green-900/20 border-green-500/50' :
                  table.status === 'reserved' ? 'bg-yellow-900/20 border-yellow-500/50' :
                  'bg-blue-900/20 border-blue-500/50'
                }`}>
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">🪑</div>
                    <h3 className="text-xl font-semibold text-white">Table {table.number}</h3>
                    <div className={`text-lg font-medium ${getTableStatusColor(table.status)}`}>
                      {table.status.toUpperCase()}
                    </div>
                  </div>

                  {table.customerName && (
                    <div className="mb-4">
                      <span className="text-zinc-400">Customer:</span>
                      <div className="text-white font-medium">{table.customerName}</div>
                    </div>
                  )}

                  {table.assignedStaff && (
                    <div className="mb-4">
                      <span className="text-zinc-400">Staff:</span>
                      <div className="text-white font-medium">{table.assignedStaff}</div>
                    </div>
                  )}

                  {table.estimatedTime && (
                    <div className="mb-4">
                      <span className="text-zinc-400">Time Remaining:</span>
                      <div className="text-white font-medium">{table.estimatedTime} min</div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {table.status === 'available' && (
                      <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm">
                        🪑 Seat Customer
                      </button>
                    )}
                    {table.status === 'occupied' && (
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm">
                        📋 View Session
                      </button>
                    )}
                    {table.status === 'cleaning' && (
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm">
                        ✅ Mark Clean
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Order Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-3">Pending Orders</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-zinc-700 rounded">
                      <span className="text-white">Order #001</span>
                      <span className="text-yellow-400">Preparing</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-zinc-700 rounded">
                      <span className="text-white">Order #002</span>
                      <span className="text-blue-400">Ready</span>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-3">Completed Today</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-zinc-700 rounded">
                      <span className="text-white">Order #003</span>
                      <span className="text-green-400">Delivered</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-zinc-700 rounded">
                      <span className="text-white">Order #004</span>
                      <span className="text-green-400">Delivered</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
