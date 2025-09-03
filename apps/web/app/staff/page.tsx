"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type StaffMember = {
  id: string;
  name: string;
  role: "server" | "bartender" | "manager" | "host";
  status: "active" | "break" | "offline";
  currentTable?: string;
  ordersInProgress: number;
  totalOrders: number;
  rating: number;
  shiftStart: number;
};

type Order = {
  id: string;
  tableId: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    status: "pending" | "preparing" | "ready" | "delivered";
  }>;
  totalAmount: number;
  status: "pending" | "preparing" | "ready" | "delivered";
  createdAt: number;
  assignedTo?: string;
};

export default function StaffPanel() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'staff' | 'tables'>('overview');

  // Generate demo data
  useEffect(() => {
    const demoStaff: StaffMember[] = [
      {
        id: 'staff-1',
        name: 'Alex Johnson',
        role: 'server',
        status: 'active',
        currentTable: 'T-001',
        ordersInProgress: 2,
        totalOrders: 15,
        rating: 4.8,
        shiftStart: Date.now() - 28800000 // 8 hours ago
      },
      {
        id: 'staff-2',
        name: 'Sarah Chen',
        role: 'bartender',
        status: 'active',
        currentTable: 'Bar-1',
        ordersInProgress: 3,
        totalOrders: 22,
        rating: 4.9,
        shiftStart: Date.now() - 28800000
      },
      {
        id: 'staff-3',
        name: 'Mike Rodriguez',
        role: 'server',
        status: 'break',
        currentTable: undefined,
        ordersInProgress: 0,
        totalOrders: 8,
        rating: 4.7,
        shiftStart: Date.now() - 28800000
      }
    ];

    const demoOrders: Order[] = [
      {
        id: 'order-1',
        tableId: 'T-001',
        customerName: 'John Smith',
        items: [
          { name: 'Blue Mist Hookah', quantity: 1, price: 3000, status: 'ready' },
          { name: 'Mint Tea', quantity: 2, price: 500, status: 'delivered' }
        ],
        totalAmount: 4000,
        status: 'ready',
        createdAt: Date.now() - 300000, // 5 minutes ago
        assignedTo: 'Alex Johnson'
      },
      {
        id: 'order-2',
        tableId: 'T-003',
        customerName: 'Emily Davis',
        items: [
          { name: 'Double Apple Hookah', quantity: 1, price: 3200, status: 'preparing' },
          { name: 'Hummus Plate', quantity: 1, price: 800, status: 'pending' }
        ],
        totalAmount: 4000,
        status: 'preparing',
        createdAt: Date.now() - 180000, // 3 minutes ago
        assignedTo: 'Mike Rodriguez'
      }
    ];

    setStaffMembers(demoStaff);
    setOrders(demoOrders);
  }, []);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'break': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'preparing': return 'text-blue-400';
      case 'ready': return 'text-green-400';
      case 'delivered': return 'text-zinc-400';
      default: return 'text-zinc-400';
    }
  };

  const handleOrderStatusUpdate = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus }
        : order
    ));
  };

  const handleStaffStatusUpdate = (staffId: string, newStatus: StaffMember['status']) => {
    setStaffMembers(prev => prev.map(staff => 
      staff.id === staffId 
        ? { ...staff, status: newStatus }
        : staff
    ));
  };

  const activeStaff = staffMembers.filter(s => s.status === 'active');
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="px-4 py-6 border-b border-teal-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-teal-300">👥 Staff Operations</h1>
              <p className="text-zinc-400">Staff performance monitoring and operations overview</p>
              <div className="mt-2 p-3 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                <p className="text-blue-300 text-sm">
                  <strong>Operations Dashboard:</strong> Monitor staff performance, ratings, and order completion metrics.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Link href="/staff-panel" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                ⚙️ Staff Management
              </Link>
              <Link href="/sessions" className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors">
                🔥 Sessions
              </Link>
              <Link href="/dashboard" className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors">
                📊 Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-white">{activeStaff.length}</div>
            <div className="text-sm text-zinc-400">Active Staff</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-2xl font-bold text-white">{pendingOrders.length}</div>
            <div className="text-sm text-zinc-400">Pending Orders</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-white">{readyOrders.length}</div>
            <div className="text-sm text-zinc-400">Ready Orders</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold text-white">{formatCurrency(orders.reduce((sum, o) => sum + o.totalAmount, 0))}</div>
            <div className="text-sm text-zinc-400">Total Orders</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'orders', label: '📋 Orders' },
            { id: 'staff', label: '👥 Staff' },
            { id: 'tables', label: '🪑 Tables' }
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
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Staff Status */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Staff Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {staffMembers.map((staff) => (
                  <div key={staff.id} className="bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{staff.name}</span>
                      <span className={`text-sm ${getStatusColor(staff.status)}`}>
                        {staff.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-zinc-400">
                      <div>{staff.role}</div>
                      <div>Orders: {staff.ordersInProgress}/{staff.totalOrders}</div>
                      <div>Rating: ⭐ {staff.rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div>
                      <div className="font-medium text-white">Table {order.tableId}</div>
                      <div className="text-sm text-zinc-400">{order.customerName}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm ${getOrderStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </div>
                      <div className="text-teal-300">{formatCurrency(order.totalAmount)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-teal-300">Order #{order.id}</h3>
                    <p className="text-zinc-400">Table {order.tableId} - {order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${getOrderStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </div>
                    <div className="text-teal-300">{formatCurrency(order.totalAmount)}</div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-teal-400">🍃</span>
                        <span>{item.name}</span>
                        <span className="text-zinc-400">x{item.quantity}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm ${getOrderStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        <span className="text-teal-300">{formatCurrency(item.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-400">
                    Assigned to: {order.assignedTo || 'Unassigned'}
                  </div>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleOrderStatusUpdate(order.id, 'preparing')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        🚀 Start Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleOrderStatusUpdate(order.id, 'ready')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        ✅ Mark Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => handleOrderStatusUpdate(order.id, 'delivered')}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        🚚 Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            {staffMembers.map((staff) => (
              <div key={staff.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">👤</div>
                    <div>
                      <h3 className="text-xl font-semibold text-teal-300">{staff.name}</h3>
                      <p className="text-zinc-400 capitalize">{staff.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${getStatusColor(staff.status)}`}>
                      {staff.status.toUpperCase()}
                    </div>
                    <div className="text-teal-300">⭐ {staff.rating}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-zinc-400">Current Table:</span>
                    <div className="text-teal-300 font-medium">{staff.currentTable || 'None'}</div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Orders in Progress:</span>
                    <div className="text-teal-300 font-medium">{staff.ordersInProgress}</div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Shift Duration:</span>
                    <div className="text-teal-300 font-medium">{formatDuration(Date.now() - staff.shiftStart)}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {staff.status === 'active' && (
                    <button
                      onClick={() => handleStaffStatusUpdate(staff.id, 'break')}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      ⏸️ Break
                    </button>
                  )}
                  {staff.status === 'break' && (
                    <button
                      onClick={() => handleStaffStatusUpdate(staff.id, 'active')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      ▶️ Resume
                    </button>
                  )}
                  <button
                    onClick={() => handleStaffStatusUpdate(staff.id, 'offline')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    🚪 End Shift
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tables Tab */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Table Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['T-001', 'T-002', 'T-003', 'T-004', 'Bar-1', 'Bar-2', 'Booth-1', 'Booth-2'].map((tableId) => {
                  const hasOrder = orders.some(o => o.tableId === tableId);
                  const assignedStaff = staffMembers.find(s => s.currentTable === tableId);
                  
                  return (
                    <div key={tableId} className={`p-4 rounded-lg border ${
                      hasOrder ? 'bg-green-900 border-green-500' : 'bg-zinc-800 border-zinc-700'
                    }`}>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{tableId}</div>
                        <div className={`text-sm ${hasOrder ? 'text-green-400' : 'text-zinc-400'}`}>
                          {hasOrder ? 'Occupied' : 'Available'}
                        </div>
                        {assignedStaff && (
                          <div className="text-xs text-teal-400 mt-1">
                            {assignedStaff.name}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
