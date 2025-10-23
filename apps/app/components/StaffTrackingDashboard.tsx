'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  ChefHat,
  Flame,
  CheckCircle,
  AlertCircle,
  Users,
  MapPin,
  Bell,
  Eye,
  MessageSquare,
  Zap,
  Timer,
  RefreshCw
} from 'lucide-react';
import { cn } from '../utils/cn';

interface TrackingOrder {
  id: string;
  sessionId: string;
  loungeId: string;
  tableId: string;
  status: 'pending' | 'preparing' | 'heating' | 'ready' | 'delivered';
  startTime: string;
  estimatedCompletion: string;
  customerName?: string;
  flavors: string[];
  notes?: string;
  priority: 'low' | 'medium' | 'high';
}

export const StaffTrackingDashboard: React.FC = () => {
  const [orders, setOrders] = useState<TrackingOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<TrackingOrder | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Mock data for demo
  useEffect(() => {
    const mockOrders: TrackingOrder[] = [
      {
        id: 'order_1',
        sessionId: 'session_001',
        loungeId: 'lounge_001',
        tableId: 'T-001',
        status: 'preparing',
        startTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        estimatedCompletion: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        customerName: 'John Doe',
        flavors: ['Mint', 'Grape', 'Peach'],
        priority: 'medium'
      },
      {
        id: 'order_2',
        sessionId: 'session_002',
        loungeId: 'lounge_001',
        tableId: 'T-003',
        status: 'heating',
        startTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        customerName: 'Sarah Smith',
        flavors: ['Double Apple', 'Cinnamon'],
        priority: 'high'
      },
      {
        id: 'order_3',
        sessionId: 'session_003',
        loungeId: 'lounge_001',
        tableId: 'T-005',
        status: 'ready',
        startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        estimatedCompletion: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        customerName: 'Mike Johnson',
        flavors: ['Watermelon', 'Menthol'],
        priority: 'low'
      }
    ];
    
    setOrders(mockOrders);
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: TrackingOrder['status'], notes?: string) => {
    setIsUpdating(true);
    
    try {
      // In a real app, this would call the API
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, notes }
          : order
      ));
      
      // Track staff action
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'staff_status_update', {
          event_category: 'staff_actions',
          event_label: `${orderId}:${newStatus}`,
          value: 1
        });
      }
      
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: TrackingOrder['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'preparing': return 'text-blue-400 bg-blue-500/20';
      case 'heating': return 'text-orange-400 bg-orange-500/20';
      case 'ready': return 'text-purple-400 bg-purple-500/20';
      case 'delivered': return 'text-green-400 bg-green-500/20';
      default: return 'text-zinc-400 bg-zinc-500/20';
    }
  };

  const getStatusIcon = (status: TrackingOrder['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'preparing': return <ChefHat className="w-4 h-4" />;
      case 'heating': return <Flame className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: TrackingOrder['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-zinc-400 bg-zinc-500/20';
    }
  };

  const getElapsedTime = (startTime: string) => {
    const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span>Hookah Tracking Dashboard</span>
            </h1>
            <p className="text-zinc-400 mt-2">Manage active hookah orders and track preparation progress</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-zinc-400">Active Orders</div>
              <div className="text-2xl font-bold text-orange-400">{orders.length}</div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 hover:border-zinc-600 transition-colors"
            >
              {/* Order Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold">Table {order.tableId}</span>
                </div>
                <div className={cn('px-2 py-1 rounded-full text-xs font-medium', getPriorityColor(order.priority))}>
                  {order.priority.toUpperCase()}
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-300">{order.customerName || 'Guest'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Timer className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-400">{getElapsedTime(order.startTime)} elapsed</span>
                </div>
              </div>

              {/* Flavors */}
              <div className="mb-4">
                <div className="text-sm text-zinc-400 mb-2">Flavors:</div>
                <div className="flex flex-wrap gap-1">
                  {order.flavors.map((flavor, index) => (
                    <span key={index} className="text-xs px-2 py-1 bg-zinc-700 rounded-full text-zinc-300">
                      {flavor}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="mb-4">
                <div className={cn('inline-flex items-center space-x-2 px-3 py-2 rounded-lg', getStatusColor(order.status))}>
                  {getStatusIcon(order.status)}
                  <span className="text-sm font-medium capitalize">{order.status}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    disabled={isUpdating}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <ChefHat className="w-4 h-4" />
                    <span>Start Preparing</span>
                  </button>
                )}
                
                {order.status === 'preparing' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'heating')}
                    disabled={isUpdating}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Start Heating</span>
                  </button>
                )}
                
                {order.status === 'heating' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    disabled={isUpdating}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark Ready</span>
                  </button>
                )}
                
                {order.status === 'ready' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    disabled={isUpdating}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark Delivered</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedOrder(order)}
                  className="w-full bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Details Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Order Details</h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <AlertCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-zinc-400">Session ID</div>
                    <div className="font-mono text-sm">{selectedOrder.sessionId}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-zinc-400">Table</div>
                    <div className="font-semibold">Table {selectedOrder.tableId}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-zinc-400">Customer</div>
                    <div className="font-semibold">{selectedOrder.customerName || 'Guest'}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-zinc-400">Flavors</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedOrder.flavors.map((flavor, index) => (
                        <span key={index} className="px-2 py-1 bg-zinc-700 rounded text-sm">
                          {flavor}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-zinc-400">Status</div>
                    <div className={cn('inline-flex items-center space-x-2 px-3 py-2 rounded-lg mt-1', getStatusColor(selectedOrder.status))}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="font-medium capitalize">{selectedOrder.status}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-zinc-400">Elapsed Time</div>
                    <div className="font-mono">{getElapsedTime(selectedOrder.startTime)}</div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Add Note</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
