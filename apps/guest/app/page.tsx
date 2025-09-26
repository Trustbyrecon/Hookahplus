'use client';

import React from 'react';
import Card from '../components/Card';
import DollarTestButton from '@/components/DollarTestButton';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { StatusIndicator } from '../components/StatusIndicator';
import { TrustLock } from '../components/TrustLock';
import { useCart } from '@/components/cart/CartProvider';
import { 
  Clock, 
  Plus, 
  RefreshCw, 
  ShoppingCart,
  Star,
  Zap,
  CheckCircle,
  AlertCircle,
  UserCheck,
  BarChart3,
  Brain,
  Shield,
  CreditCard
} from 'lucide-react';

export default function GuestPortal() {
  const { add } = useCart();
  const addToCart = (item: { id: number; name: string; price: number }) => {
    add({ id: String(item.id), name: item.name, price: Math.round(item.price * 100), qty: 1 });
    console.log('Adding to cart:', item); // Debug log
  };
  const menuItems = [
    {
      id: 1,
      name: 'Blue Mist Hookah',
      description: 'Premium blueberry mint blend with smooth clouds',
      price: 32.00,
      category: 'Hookah',
      popular: true
    },
    {
      id: 2,
      name: 'Double Apple Hookah',
      description: 'Classic apple flavor with authentic taste',
      price: 30.00,
      category: 'Hookah',
      popular: true
    },
    {
      id: 3,
      name: 'Mint Fresh Hookah',
      description: 'Cool mint with refreshing aftertaste',
      price: 29.00,
      category: 'Hookah',
      popular: true
    },
    {
      id: 4,
      name: 'Strawberry Mojito',
      description: 'Fresh strawberry with mint and lime',
      price: 8.00,
      category: 'Drinks',
      popular: true
    }
  ];

  const categories = [
    { name: 'Hookah', count: 4, active: true },
    { name: 'Drinks', count: 2, active: false },
    { name: 'Food', count: 1, active: false },
    { name: 'Desserts', count: 1, active: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-teal-500/50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                🍃 Pre-Order Station
              </h1>
              <p className="text-zinc-400 mt-1">Table T-001 • QR scan - Menu browse - Flavor personalize - Start Fire Session</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <StatusIndicator status="online" label="QR Ready" value="Active" />
              <StatusIndicator status="online" label="Menu" value="Loaded" />
              <StatusIndicator status="online" label="Payment" value="Ready" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Trust Lock Display */}
        <div className="mb-8 flex justify-center">
          <TrustLock trustScore={0.87} status="active" version="TLH-v1" size="lg" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Test Mode Toggle */}
            <div className="mb-6">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-zinc-600 bg-zinc-800 text-primary-500 focus:ring-primary-500" />
                <span className="text-sm text-zinc-300">Test Mode ($1.00)</span>
              </label>
              {/* $1 Stripe sandbox test */}
              <DollarTestButton />
            </div>

            {/* Quick Order */}
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Order</h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Select popular flavors to build your quick order
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems.filter(item => item.popular).map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-zinc-800 rounded-lg">
                      <div className="text-2xl">🍃</div>
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-zinc-400">{item.description}</div>
                        <div className="text-sm font-semibold text-primary-400">${item.price.toFixed(2)}</div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => addToCart(item)}>
                        Quick Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Popular This Week */}
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Popular This Week</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems.filter(item => item.popular).map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-zinc-800 rounded-lg">
                      <div className="text-2xl">🍃</div>
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-zinc-400">{item.description}</div>
                        <div className="text-sm font-semibold text-primary-400">${item.price.toFixed(2)}</div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => addToCart(item)}>
                        Quick Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Menu Categories */}
            <Card>
              <div className="p-6">
                <div className="flex space-x-1 mb-6">
                  {categories.map((category, index) => (
                    <button
                      key={index}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        category.active
                          ? 'bg-primary-600 text-white'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                      }`}
                    >
                      {category.name} ({category.count})
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {menuItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">🍃</div>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-zinc-400">{item.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-lg font-semibold text-primary-400">
                          ${item.price.toFixed(2)}
                        </div>
                        <Button size="sm" variant="primary" onClick={() => addToCart(item)}>
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Your Order</h3>
                
                {/* Empty Cart */}
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400">Your cart is empty. Add items to get started.</p>
                </div>

                {/* Table Status */}
                <div className="mt-6 p-4 bg-zinc-800 rounded-lg">
                  <h4 className="font-semibold mb-2">Table Status</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 font-medium">AVAILABLE</span>
                    <span className="text-sm text-zinc-400">15 min</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 space-y-3">
                  <Button 
                    variant="fire" 
                    className="w-full"
                    leftIcon={<Zap className="w-4 h-4" />}
                  >
                    🔥 Fire Session
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    leftIcon={<UserCheck className="w-4 h-4" />}
                  >
                    Staff Panel
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    leftIcon={<BarChart3 className="w-4 h-4" />}
                  >
                    Dashboard
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}