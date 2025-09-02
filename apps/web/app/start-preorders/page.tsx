"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PreOrderCampaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate: string;
  targetOrders: number;
  currentOrders: number;
  flavors: string[];
  discount: number;
  description: string;
  createdAt: string;
}

interface QuickOrder {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  selectedFlavors: string[];
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';
  createdAt: string;
  estimatedDelivery: string;
}

export default function StartPreorders() {
  const [campaigns, setCampaigns] = useState<PreOrderCampaign[]>([]);
  const [quickOrders, setQuickOrders] = useState<QuickOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'orders' | 'analytics'>('campaigns');
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Generate demo data
  useEffect(() => {
    const demoCampaigns: PreOrderCampaign[] = [
      {
        id: 'campaign-1',
        name: 'Summer Hookah Festival',
        status: 'active',
        startDate: '2024-06-01',
        endDate: '2024-06-30',
        targetOrders: 100,
        currentOrders: 67,
        flavors: ['Blue Mist', 'Double Apple', 'Peach Wave', 'Mint Fresh'],
        discount: 15,
        description: 'Pre-order your favorite summer flavors and save 15%',
        createdAt: '2024-05-15'
      },
      {
        id: 'campaign-2',
        name: 'Weekend Special',
        status: 'active',
        startDate: '2024-06-08',
        endDate: '2024-06-09',
        targetOrders: 50,
        currentOrders: 23,
        flavors: ['Strawberry', 'Grape', 'Vanilla', 'Rose'],
        discount: 20,
        description: 'Weekend pre-orders get 20% off premium flavors',
        createdAt: '2024-06-01'
      }
    ];

    const demoOrders: QuickOrder[] = [
      {
        id: 'order-1',
        customerName: 'Sarah Johnson',
        email: 'sarah@email.com',
        phone: '+1-555-0123',
        selectedFlavors: ['Blue Mist', 'Mint Fresh'],
        quantity: 2,
        totalAmount: 5600,
        status: 'confirmed',
        createdAt: '2024-06-05T10:30:00Z',
        estimatedDelivery: '2024-06-08T18:00:00Z'
      },
      {
        id: 'order-2',
        customerName: 'Mike Chen',
        email: 'mike@email.com',
        phone: '+1-555-0456',
        selectedFlavors: ['Double Apple'],
        quantity: 1,
        totalAmount: 3200,
        status: 'preparing',
        createdAt: '2024-06-05T11:15:00Z',
        estimatedDelivery: '2024-06-08T19:00:00Z'
      }
    ];

    setCampaigns(demoCampaigns);
    setQuickOrders(demoOrders);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-zinc-400';
      case 'active': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'completed': return 'text-blue-400';
      default: return 'text-zinc-400';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'confirmed': return 'text-blue-400';
      case 'preparing': return 'text-orange-400';
      case 'ready': return 'text-green-400';
      case 'delivered': return 'text-purple-400';
      default: return 'text-zinc-400';
    }
  };

  const createNewCampaign = () => {
    const newCampaign: PreOrderCampaign = {
      id: `campaign-${Date.now()}`,
      name: `Campaign ${campaigns.length + 1}`,
      status: 'draft',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      targetOrders: 50,
      currentOrders: 0,
      flavors: ['Blue Mist', 'Double Apple'],
      discount: 10,
      description: 'New pre-order campaign',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCampaigns(prev => [newCampaign, ...prev]);
    setIsCreatingCampaign(false);
  };

  const createNewOrder = () => {
    const newOrder: QuickOrder = {
      id: `order-${Date.now()}`,
      customerName: `Customer ${quickOrders.length + 1}`,
      email: `customer${quickOrders.length + 1}@email.com`,
      phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      selectedFlavors: ['Blue Mist'],
      quantity: 1,
      totalAmount: 3200,
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    };

    setQuickOrders(prev => [newOrder, ...prev]);
    setIsCreatingOrder(false);
  };

  const updateOrderStatus = (orderId: string, newStatus: QuickOrder['status']) => {
    setQuickOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const totalRevenue = quickOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const pendingOrders = quickOrders.filter(o => o.status === 'pending');

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-teal-300 mb-2">🚀 Start Preorders</h1>
          <p className="text-zinc-400">Launch and manage pre-order campaigns with real-time tracking</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-white">{campaigns.length}</div>
            <div className="text-sm text-zinc-400">Total Campaigns</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-white">{activeCampaigns.length}</div>
            <div className="text-sm text-zinc-400">Active Campaigns</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">📦</div>
            <div className="text-2xl font-bold text-white">{quickOrders.length}</div>
            <div className="text-sm text-zinc-400">Total Orders</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold text-white">${(totalRevenue / 100).toFixed(2)}</div>
            <div className="text-sm text-zinc-400">Total Revenue</div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setIsCreatingCampaign(true)}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
            >
              🆕 New Campaign
            </button>
            <button
              onClick={() => setIsCreatingOrder(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              📝 New Order
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/pre-order"
              className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors font-medium"
            >
              🍃 Pre-Order Station
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'campaigns', label: '📊 Campaigns', count: campaigns.length },
            { id: 'orders', label: '📦 Orders', count: quickOrders.length },
            { id: 'analytics', label: '📈 Analytics', count: 0 }
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

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">📊</div>
                    <div>
                      <h3 className="text-xl font-semibold text-teal-300">{campaign.name}</h3>
                      <p className="text-zinc-400">{campaign.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${getStatusColor(campaign.status)}`}>
                      {campaign.status.toUpperCase()}
                    </div>
                    <div className="text-zinc-400">{campaign.discount}% off</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-zinc-400">Progress:</span>
                    <div className="text-teal-300 font-medium">
                      {campaign.currentOrders}/{campaign.targetOrders} orders
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Flavors:</span>
                    <div className="text-zinc-300 font-medium">
                      {campaign.flavors.slice(0, 2).join(', ')}
                      {campaign.flavors.length > 2 && ` +${campaign.flavors.length - 2} more`}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Duration:</span>
                    <div className="text-zinc-300 font-medium">
                      {campaign.startDate} to {campaign.endDate}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Created:</span>
                    <div className="text-zinc-300 font-medium">{campaign.createdAt}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {campaign.status === 'draft' && (
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                      🚀 Launch Campaign
                    </button>
                  )}
                  {campaign.status === 'active' && (
                    <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors">
                      ⏸️ Pause Campaign
                    </button>
                  )}
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    ✏️ Edit
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {quickOrders.map((order) => (
              <div key={order.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">📦</div>
                    <div>
                      <h3 className="text-xl font-semibold text-blue-300">{order.customerName}</h3>
                      <p className="text-zinc-400">{order.email} • {order.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${getOrderStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </div>
                    <div className="text-zinc-400">${(order.totalAmount / 100).toFixed(2)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-zinc-400">Flavors:</span>
                    <div className="text-zinc-300 font-medium">
                      {order.selectedFlavors.join(', ')}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Quantity:</span>
                    <div className="text-zinc-300 font-medium">{order.quantity}</div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Created:</span>
                    <div className="text-zinc-300 font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Delivery:</span>
                    <div className="text-zinc-300 font-medium">
                      {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      ✅ Confirm Order
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      🔧 Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      🎯 Mark Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      🚚 Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Campaign Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">📈</div>
                  <div className="text-2xl font-bold text-green-400">
                    {((quickOrders.length / campaigns.reduce((sum, c) => sum + c.targetOrders, 0)) * 100).toFixed(1)}%
                  </div>
                  <div className="text-zinc-400">Conversion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-2xl font-bold text-blue-400">
                    ${(totalRevenue / 100).toFixed(2)}
                  </div>
                  <div className="text-zinc-400">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {quickOrders.length}
                  </div>
                  <div className="text-zinc-400">Total Orders</div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-xl font-semibold text-teal-300 mb-4">Top Performing Flavors</h3>
              <div className="space-y-3">
                {['Blue Mist', 'Double Apple', 'Peach Wave', 'Mint Fresh'].map((flavor, index) => (
                  <div key={flavor} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-lg">#{index + 1}</div>
                      <div className="text-white font-medium">{flavor}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-teal-400 font-medium">
                        {Math.floor(Math.random() * 20) + 10} orders
                      </div>
                      <div className="text-sm text-zinc-400">
                        ${((Math.floor(Math.random() * 20) + 10) * 32).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {isCreatingCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-teal-300 mb-4">Create New Campaign</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Campaign Name</label>
                <input
                  type="text"
                  placeholder="Summer Hookah Festival"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Description</label>
                <textarea
                  placeholder="Campaign description..."
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">End Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Target Orders</label>
                  <input
                    type="number"
                    placeholder="100"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Discount %</label>
                  <input
                    type="number"
                    placeholder="15"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsCreatingCampaign(false)}
                className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNewCampaign}
                className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {isCreatingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-blue-300 mb-4">Create New Order</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Customer Name</label>
                <input
                  type="text"
                  placeholder="Customer Name"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="customer@email.com"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Phone</label>
                <input
                  type="tel"
                  placeholder="+1-555-0123"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Flavors</label>
                <select className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white">
                  <option>Blue Mist</option>
                  <option>Double Apple</option>
                  <option>Peach Wave</option>
                  <option>Mint Fresh</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Quantity</label>
                <input
                  type="number"
                  placeholder="1"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsCreatingOrder(false)}
                className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNewOrder}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
