"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface PreOrderItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'hookah' | 'drinks' | 'food' | 'desserts';
  image: string;
  popular: boolean;
  inStock: boolean;
}

interface TableInfo {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'reserved';
  customerName?: string;
  sessionId?: string;
  estimatedWaitTime?: number;
}

export default function PreOrderTablePage() {
  const params = useParams();
  const tableId = params.tableId as string;
  
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [preOrderItems, setPreOrderItems] = useState<PreOrderItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<PreOrderItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('hookah');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate demo data
  useEffect(() => {
    const demoTableInfo: TableInfo = {
      id: tableId,
      number: tableId,
      status: 'available',
      customerName: 'John Smith',
      sessionId: 'session-1',
      estimatedWaitTime: 15
    };

    const demoItems: PreOrderItem[] = [
      {
        id: 'item-1',
        name: 'Blue Mist Hookah',
        description: 'Premium blueberry mint blend with smooth clouds',
        price: 3200,
        category: 'hookah',
        image: '🍃',
        popular: true,
        inStock: true
      },
      {
        id: 'item-2',
        name: 'Double Apple Hookah',
        description: 'Classic apple flavor with authentic taste',
        price: 3000,
        category: 'hookah',
        image: '🍎',
        popular: true,
        inStock: true
      },
      {
        id: 'item-3',
        name: 'Peach Wave Hookah',
        description: 'Sweet peach flavor with tropical notes',
        price: 3100,
        category: 'hookah',
        image: '🍑',
        popular: false,
        inStock: true
      },
      {
        id: 'item-4',
        name: 'Mint Fresh Hookah',
        description: 'Cool mint with refreshing aftertaste',
        price: 2900,
        category: 'hookah',
        image: '🌿',
        popular: true,
        inStock: true
      },
      {
        id: 'item-5',
        name: 'Strawberry Mojito',
        description: 'Fresh strawberry with mint and lime',
        price: 800,
        category: 'drinks',
        image: '🍓',
        popular: true,
        inStock: true
      },
      {
        id: 'item-6',
        name: 'Virgin Piña Colada',
        description: 'Creamy coconut with pineapple',
        price: 900,
        category: 'drinks',
        image: '🥥',
        popular: false,
        inStock: true
      },
      {
        id: 'item-7',
        name: 'Chicken Wings',
        description: 'Spicy buffalo wings with ranch dip',
        price: 1200,
        category: 'food',
        image: '🍗',
        popular: true,
        inStock: true
      },
      {
        id: 'item-8',
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with vanilla ice cream',
        price: 1000,
        category: 'desserts',
        image: '🍰',
        popular: true,
        inStock: true
      }
    ];

    setTableInfo(demoTableInfo);
    setPreOrderItems(demoItems);
  }, [tableId]);

  const categories = [
    { id: 'hookah', label: '🍃 Hookah', count: preOrderItems.filter(item => item.category === 'hookah').length },
    { id: 'drinks', label: '🥤 Drinks', count: preOrderItems.filter(item => item.category === 'drinks').length },
    { id: 'food', label: '🍽️ Food', count: preOrderItems.filter(item => item.category === 'food').length },
    { id: 'desserts', label: '🍰 Desserts', count: preOrderItems.filter(item => item.category === 'desserts').length }
  ];

  const filteredItems = preOrderItems.filter(item => item.category === activeCategory);
  const popularItems = preOrderItems.filter(item => item.popular);

  const addToOrder = (item: PreOrderItem) => {
    if (item.inStock) {
      setSelectedItems(prev => [...prev, item]);
    }
  };

  const addPopularToQuickOrder = (item: PreOrderItem) => {
    if (item.inStock) {
      setSelectedItems(prev => [...prev, item]);
    }
  };

  const removeFromOrder = (itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const getTotalPrice = () => {
    return selectedItems.reduce((sum, item) => sum + item.price, 0);
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    
    // Create session in Fire Session Dashboard
    const sessionData = {
      tableId: tableId,
      customerName: 'John Smith', // In real app, this would come from form
      flavor: selectedItems.map(item => item.name).join(' + '),
      amount: getTotalPrice(),
      status: 'PAID_CONFIRMED',
      currentStage: 'BOH',
      notes: `Pre-order from T-${tableId}: ${selectedItems.map(item => item.name).join(', ')}`
    };
    
    // In a real app, this would call an API to create the session
    console.log('Creating Fire Session:', sessionData);
    
    // Redirect to Fire Session Dashboard
    window.location.href = `/fire-session-dashboard?newSession=true&tableId=${tableId}`;
  };

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-400';
      case 'occupied': return 'text-red-400';
      case 'reserved': return 'text-yellow-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-teal-300 mb-2">🍃 Pre-Order Station</h1>
              <p className="text-zinc-400">Table {tableId} • Pre-order your favorites</p>
              <div className="mt-2 p-3 bg-green-900/20 border border-green-500/50 rounded-lg">
                <p className="text-green-300 text-sm">
                  <strong>Customer Interface:</strong> Browse menu, select items, and start your Fire Session
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-zinc-400">Table Status</div>
              <div className={`text-lg font-semibold ${getTableStatusColor(tableInfo?.status || 'available')}`}>
                {tableInfo?.status?.toUpperCase() || 'AVAILABLE'}
              </div>
              {tableInfo?.estimatedWaitTime && (
                <div className="text-sm text-zinc-400">
                  Est. Wait: {tableInfo.estimatedWaitTime} min
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Order */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h2 className="text-2xl font-bold text-teal-300 mb-4">⚡ Quick Order</h2>
              <div id="quick-order-display" className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                <div className="text-center text-zinc-400">
                  <div className="text-2xl mb-2">🎯</div>
                  <p>Select popular flavors to build your quick order</p>
                </div>
              </div>
            </div>

            {/* Popular Items */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h2 className="text-2xl font-bold text-teal-300 mb-4">🔥 Popular This Week</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 hover:border-teal-500/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{item.image}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        <p className="text-sm text-zinc-400">{item.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-teal-400 font-bold">${(item.price / 100).toFixed(2)}</span>
                          <button
                            onClick={() => {
                              addPopularToQuickOrder(item);
                              // Update quick order display
                              const quickOrderElement = document.getElementById('quick-order-display');
                              if (quickOrderElement) {
                                const existingItems = selectedItems.filter(i => i.id === item.id).length + 1;
                                quickOrderElement.innerHTML = `
                                  <div class="text-sm text-teal-300 font-medium">Quick Order Updated:</div>
                                  <div class="text-white">${item.name} x${existingItems} - $${(item.price / 100).toFixed(2)} each</div>
                                  <div class="text-xs text-zinc-400 mt-1">Added to your order below</div>
                                `;
                              }
                            }}
                            disabled={!item.inStock}
                            className="bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-600 text-white px-3 py-1 rounded-lg transition-colors text-sm"
                          >
                            {item.inStock ? '⚡ Quick Add' : 'Out of Stock'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Navigation */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      activeCategory === category.id
                        ? 'bg-teal-500 text-white'
                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                    }`}
                  >
                    {category.label} ({category.count})
                  </button>
                ))}
              </div>

              {/* Menu Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 hover:border-teal-500/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{item.image}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        <p className="text-sm text-zinc-400">{item.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-teal-400 font-bold">${(item.price / 100).toFixed(2)}</span>
                          <button
                            onClick={() => addToOrder(item)}
                            disabled={!item.inStock}
                            className="bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-600 text-white px-3 py-1 rounded-lg transition-colors text-sm"
                          >
                            {item.inStock ? 'Add' : 'Out of Stock'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-teal-300 mb-4">📋 Your Order</h2>
              
              {selectedItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🛒</div>
                  <p className="text-zinc-400">Your cart is empty</p>
                  <p className="text-sm text-zinc-500">Add items to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedItems.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-lg">{item.image}</div>
                          <div>
                            <div className="font-medium text-white">{item.name}</div>
                            <div className="text-sm text-zinc-400">${(item.price / 100).toFixed(2)}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromOrder(item.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-zinc-700 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold text-white">Total:</span>
                      <span className="text-2xl font-bold text-teal-400">
                        ${(getTotalPrice() / 100).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting || selectedItems.length === 0}
                      className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-600 text-white py-3 rounded-lg font-medium transition-colors"
                    >
                      {isSubmitting ? 'Creating Fire Session...' : '🔥 Start Fire Session'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-lg font-semibold text-teal-300 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/fire-session-dashboard"
                  className="block w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-center transition-colors"
                >
                  🔥 Fire Session
                </Link>
                <Link
                  href="/staff-panel"
                  className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-center transition-colors"
                >
                  👥 Staff Panel
                </Link>
                <Link
                  href="/dashboard"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-center transition-colors"
                >
                  📊 Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
