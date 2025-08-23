"use client";

import React, { useState, useEffect } from 'react';

interface HookahOrder {
  id: string;
  tableId: string;
  customerName: string;
  flavor: string;
  amount: number;
  status: 'paid' | 'preparing' | 'ready' | 'delivered';
  paidAt: number;
  deliveryStartTime?: number;
  estimatedDeliveryTime?: number;
  actualDeliveryTime?: number;
  hookahRoomStaff?: string;
  deliveryConfirmedBy?: string;
  deliveryConfirmedAt?: number;
  notes?: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: 'preparer' | 'deliverer' | 'supervisor';
  currentOrders: string[];
  status: 'available' | 'busy' | 'offline';
}

const HookahRoomDashboard: React.FC = () => {
  const [orders, setOrders] = useState<HookahOrder[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: '1', name: 'John D.', role: 'preparer', currentOrders: [], status: 'available' },
    { id: '2', name: 'Sarah M.', role: 'deliverer', currentOrders: [], status: 'available' },
    { id: '3', name: 'Mike R.', role: 'preparer', currentOrders: [], status: 'available' },
    { id: '4', name: 'Lisa K.', role: 'deliverer', currentOrders: [], status: 'available' }
  ]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [deliveryBuffer, setDeliveryBuffer] = useState<number>(2); // minutes

  // Mock orders data
  useEffect(() => {
    const mockOrders: HookahOrder[] = [
      {
        id: 'order-1',
        tableId: 'T-7',
        customerName: 'Demo Customer 1',
        flavor: 'Blue Mist + Mint',
        amount: 3200,
        status: 'paid',
        paidAt: Date.now() - 300000, // 5 minutes ago
        notes: 'Extra mint, light on coal'
      },
      {
        id: 'order-2',
        tableId: 'Bar-3',
        customerName: 'Demo Customer 2',
        flavor: 'Double Apple',
        amount: 2800,
        status: 'preparing',
        paidAt: Date.now() - 180000, // 3 minutes ago
        deliveryStartTime: Date.now() - 120000, // 2 minutes ago
        estimatedDeliveryTime: Date.now() + 60000, // 1 minute from now
        hookahRoomStaff: 'John D.',
        notes: 'Standard preparation'
      },
      {
        id: 'order-3',
        tableId: 'T-12',
        customerName: 'Demo Customer 3',
        flavor: 'Grape Burst',
        amount: 3000,
        status: 'ready',
        paidAt: Date.now() - 600000, // 10 minutes ago
        deliveryStartTime: Date.now() - 540000, // 9 minutes ago
        estimatedDeliveryTime: Date.now() - 300000, // 5 minutes ago
        hookahRoomStaff: 'Mike R.',
        notes: 'Ready for pickup'
      }
    ];
    setOrders(mockOrders);
  }, []);

  // Function to start preparing an order
  const startPreparation = (orderId: string, staffId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: 'preparing', 
            deliveryStartTime: Date.now(),
            estimatedDeliveryTime: Date.now() + (deliveryBuffer * 60000), // Add buffer time
            hookahRoomStaff: staff.find(s => s.id === staffId)?.name
          }
        : order
    ));
    
    setStaff(prev => prev.map(s => 
      s.id === staffId 
        ? { ...s, currentOrders: [...s.currentOrders, orderId], status: 'busy' }
        : s
    ));
  };

  // Function to mark order as ready
  const markReady = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'ready' }
        : order
    ));
  };

  // Function to confirm delivery
  const confirmDelivery = (orderId: string, staffId: string) => {
    const now = Date.now();
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: 'delivered', 
            actualDeliveryTime: now,
            deliveryConfirmedBy: staff.find(s => s.id === staffId)?.name,
            deliveryConfirmedAt: now
          }
        : order
    ));
    
    setStaff(prev => prev.map(s => 
      s.id === staffId 
        ? { 
            ...s, 
            currentOrders: s.currentOrders.filter(id => id !== orderId),
            status: s.currentOrders.length <= 1 ? 'available' : 'busy'
          }
        : s
    ));
  };

  // Function to calculate delivery time
  const getDeliveryTime = (order: HookahOrder) => {
    if (!order.deliveryStartTime) return 'Not started';
    
    const now = Date.now();
    const elapsed = Math.floor((now - order.deliveryStartTime) / 60000);
    
    if (order.status === 'delivered') {
      return `Delivered in ${elapsed} min`;
    }
    
    if (order.estimatedDeliveryTime) {
      const remaining = Math.floor((order.estimatedDeliveryTime - now) / 60000);
      if (remaining <= 0) {
        return 'Overdue';
      }
      return `${remaining} min remaining`;
    }
    
    return `${elapsed} min elapsed`;
  };

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-blue-600';
      case 'preparing': return 'bg-yellow-600';
      case 'ready': return 'bg-green-600';
      case 'delivered': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-teal-300">Hookah Room Staff Dashboard</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-400">Delivery Buffer:</label>
            <select 
              value={deliveryBuffer} 
              onChange={(e) => setDeliveryBuffer(Number(e.target.value))}
              className="bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-white text-sm"
            >
              <option value={1}>1 min</option>
              <option value={2}>2 min</option>
              <option value={3}>3 min</option>
              <option value={5}>5 min</option>
            </select>
          </div>
          <div className="text-sm text-zinc-400">
            {orders.filter(o => o.status === 'ready').length} Ready for Pickup
          </div>
        </div>
      </div>

      {/* Staff Status */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-white mb-3">Staff Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {staff.map(member => (
            <div key={member.id} className="bg-zinc-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{member.name}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  member.status === 'available' ? 'bg-green-600 text-white' :
                  member.status === 'busy' ? 'bg-yellow-600 text-white' :
                  'bg-red-600 text-white'
                }`}>
                  {member.status}
                </span>
              </div>
              <div className="text-xs text-zinc-400 capitalize">{member.role}</div>
              <div className="text-xs text-zinc-400">
                {member.currentOrders.length} active orders
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Queue */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-white">Orders Queue</h4>
        
        {orders.map(order => (
          <div key={order.id} className="bg-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h5 className="text-white font-medium">Table {order.tableId}</h5>
                <p className="text-zinc-400 text-sm">{order.customerName}</p>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.toUpperCase()}
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  ${(order.amount / 100).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div>
                <span className="text-sm text-zinc-400">Flavor:</span>
                <p className="text-white">{order.flavor}</p>
              </div>
              <div>
                <span className="text-sm text-zinc-400">Delivery Time:</span>
                <p className="text-white">{getDeliveryTime(order)}</p>
              </div>
              <div>
                <span className="text-sm text-zinc-400">Staff:</span>
                <p className="text-white">{order.hookahRoomStaff || 'Unassigned'}</p>
              </div>
            </div>

            {order.notes && (
              <div className="mb-3">
                <span className="text-sm text-zinc-400">Notes:</span>
                <p className="text-white text-sm">{order.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {order.status === 'paid' && (
                <>
                  <select 
                    value={selectedStaff} 
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white text-sm"
                  >
                    <option value="">Select Staff</option>
                    {staff.filter(s => s.role === 'preparer' && s.status === 'available').map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => startPreparation(order.id, selectedStaff)}
                    disabled={!selectedStaff}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Start Preparation
                  </button>
                </>
              )}

              {order.status === 'preparing' && (
                <button
                  onClick={() => markReady(order.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  Mark Ready
                </button>
              )}

              {order.status === 'ready' && (
                <>
                  <select 
                    value={selectedStaff} 
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white text-sm"
                  >
                    <option value="">Select Deliverer</option>
                    {staff.filter(s => s.role === 'deliverer' && s.status === 'available').map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => confirmDelivery(order.id, selectedStaff)}
                    disabled={!selectedStaff}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Confirm Delivery
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Rules */}
      <div className="mt-6 p-4 bg-zinc-800 rounded-lg">
        <h4 className="text-lg font-medium text-white mb-2">Delivery Rules</h4>
        <ul className="text-sm text-zinc-300 space-y-1">
          <li>• Customer timer starts 2-3 minutes AFTER delivery confirmation</li>
          <li>• Hookah room staff must confirm delivery before timer starts</li>
          <li>• Delivery buffer: {deliveryBuffer} minutes from preparation start</li>
          <li>• Staff roles: Preparer (hookah room) + Deliverer (front of house)</li>
          <li>• Orders marked 'ready' signal front staff for pickup</li>
        </ul>
      </div>
    </div>
  );
};

export default HookahRoomDashboard;
