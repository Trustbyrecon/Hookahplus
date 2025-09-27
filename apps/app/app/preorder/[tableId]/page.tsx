"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, Badge } from '../../../components';
import { 
  Flame, 
  Users, 
  Clock, 
  TrendingUp,
  Plus,
  BarChart3,
  Settings,
  ChefHat,
  UserCheck,
  AlertTriangle,
  Crown,
  Folder,
  FileText,
  RefreshCw,
  CheckCircle,
  Flag,
  Pause,
  Zap,
  Trash2,
  Edit3,
  Menu,
  X,
  DollarSign,
  Activity,
  TrendingDown,
  Star,
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock3,
  User,
  Phone,
  MapPin,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Zap as Lightning,
  Heart,
  Coffee,
  Wind,
  Sparkles,
  Brain,
  Lock,
  CreditCard,
  Smartphone,
  QrCode,
  Play,
  Save,
  Eye,
  EyeOff,
  ShoppingCart,
  Star as StarIcon
} from 'lucide-react';

export default function PreOrderPage() {
  const params = useParams();
  const tableId = params.tableId as string;
  const [isPrettyTheme] = useState(process.env.NEXT_PUBLIC_PRETTY_THEME === '1');
  const [showTestMode, setShowTestMode] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Menu items
  const menuItems = [
    {
      id: 1,
      name: 'Blue Mist Hookah',
      description: 'Premium blueberry mint blend with smooth clouds',
      price: 32.00,
      category: 'Hookah',
      popular: true,
      icon: '🍃'
    },
    {
      id: 2,
      name: 'Double Apple Hookah',
      description: 'Classic apple flavor with authentic taste',
      price: 30.00,
      category: 'Hookah',
      popular: true,
      icon: '🍎'
    },
    {
      id: 3,
      name: 'Mint Fresh Hookah',
      description: 'Cool mint with refreshing aftertaste',
      price: 29.00,
      category: 'Hookah',
      popular: true,
      icon: '🌿'
    },
    {
      id: 4,
      name: 'Strawberry Mojito',
      description: 'Fresh strawberry with mint and lime',
      price: 8.00,
      category: 'Drinks',
      popular: true,
      icon: '🍓'
    },
    {
      id: 5,
      name: 'Peach Wave',
      description: 'Sweet peach with tropical notes',
      price: 28.00,
      category: 'Hookah',
      popular: false,
      icon: '🍑'
    },
    {
      id: 6,
      name: 'Watermelon Mint',
      description: 'Refreshing watermelon with cool mint',
      price: 31.00,
      category: 'Hookah',
      popular: false,
      icon: '🍉'
    }
  ];

  const categories = [
    { name: 'Hookah', count: 4, active: true },
    { name: 'Drinks', count: 2, active: false },
    { name: 'Food', count: 1, active: false },
    { name: 'Desserts', count: 1, active: false }
  ];

  const handleTestMode = async () => {
    try {
      const response = await fetch('/api/payments/live-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TEST_TOKEN || ''
        },
        body: JSON.stringify({ source: 'preorder:$1-smoke' })
      });

      const data = await response.json();
      setTestResult({
        ok: response.ok,
        message: data.message || (response.ok ? 'Test successful' : 'Test failed')
      });
    } catch (error) {
      setTestResult({
        ok: false,
        message: 'Test failed: ' + (error as Error).message
      });
    }
  };

  if (!isPrettyTheme) {
    // Fallback to original solid design
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Pre-Order Station - Table {tableId}</h1>
            <p className="text-zinc-400 mb-8">Select your hookah flavors and place your order</p>
            <div className="flex justify-center space-x-4">
              <Link href="/fire-session-dashboard">
                <Button variant="primary" size="lg">
                  Start Fire Session
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pretty Theme Design
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="status-bar">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H+</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  HOOKAH+
                </span>
              </div>
              <div className="text-sm text-zinc-400">
                Table {tableId} • Pre-Order Station
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-zinc-400">Live</span>
              </div>
              <Link href="/fire-session-dashboard">
                <Button className="btn-pretty-secondary">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Menu */}
          <div className="lg:col-span-2 space-y-6">
            {/* Test Mode Banner */}
            {process.env.NODE_ENV === 'development' && (
              <div className="card-pretty p-4 bg-yellow-500/10 border-yellow-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-yellow-400">Test Mode ($1.00)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      onClick={handleTestMode}
                      className="btn-pretty-pill bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Run $1 Stripe test
                    </Button>
                    {testResult && (
                      <span className={`text-sm ${testResult.ok ? 'text-green-400' : 'text-red-400'}`}>
                        {testResult.ok ? '✅' : '❌'} {testResult.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Order */}
            <div className="card-pretty p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Order</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Select popular flavors to build your quick order
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.filter(item => item.popular).map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors duration-300">
                    <div className="text-2xl">{item.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-zinc-400">{item.description}</div>
                      <div className="text-sm font-semibold text-teal-400">${item.price.toFixed(2)}</div>
                    </div>
                    <Button className="btn-pretty-pill bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30">
                      <Plus className="w-4 h-4 mr-2" />
                      Quick Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular This Week */}
            <div className="card-pretty p-6">
              <h3 className="text-lg font-semibold mb-4">Popular This Week</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.filter(item => item.popular).map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors duration-300">
                    <div className="text-2xl">{item.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-zinc-400">{item.description}</div>
                      <div className="text-sm font-semibold text-teal-400">${item.price.toFixed(2)}</div>
                    </div>
                    <Button className="btn-pretty-pill bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30">
                      <Plus className="w-4 h-4 mr-2" />
                      Quick Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Menu Categories */}
            <div className="card-pretty p-6">
              <div className="flex space-x-1 mb-6">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      category.active
                        ? 'bg-teal-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {menuItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors duration-300">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{item.icon}</div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-zinc-400">{item.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-semibold text-teal-400">
                        ${item.price.toFixed(2)}
                      </div>
                      <Button className="btn-pretty-pill bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30">
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Your Order */}
            <div className="card-pretty p-6">
              <h3 className="text-lg font-semibold mb-4">Your Order</h3>
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">Your cart is empty. Add items to get started.</p>
              </div>
            </div>

            {/* Live Session Status */}
            <div className="card-pretty p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-400" />
                Live Session Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Active Sessions</span>
                  <span className="text-sm font-semibold text-blue-400">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">System Health</span>
                  <span className="text-sm font-semibold text-green-400">EXCELLENT</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Trust Score</span>
                  <span className="text-sm font-semibold text-teal-400">87%</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card-pretty p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/fire-session-dashboard">
                  <Button className="w-full btn-pretty-primary">
                    <Flame className="w-4 h-4 mr-2" />
                    Start Fire Session
                  </Button>
                </Link>
                <Link href="/fire-session-dashboard">
                  <Button className="w-full btn-pretty-secondary">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Fire Dashboard
                  </Button>
                </Link>
                <Link href="/staff-panel">
                  <Button className="w-full btn-pretty-secondary">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Staff Panel
                  </Button>
                </Link>
                <Link href="/">
                  <Button className="w-full btn-pretty-secondary">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
