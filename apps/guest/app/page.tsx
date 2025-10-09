'use client';

import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import DollarTestButton from '@/components/DollarTestButton';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { StatusIndicator } from '../components/StatusIndicator';
import { useCart } from '@/components/cart/CartProvider';
import { SessionTimerAwareness } from '../components/SessionTimerAwareness';
import GlobalNavigation from '../components/GlobalNavigation';
import QRCodeScanner from '../components/QRCodeScanner';
import RealTimeSessionSync from '../components/RealTimeSessionSync';
import { sessionManager, SessionData } from '../lib/sessionManager';
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
  const { add, remove, items, subtotal } = useCart();
  const [tableData, setTableData] = useState<any>(null);
  const [sessionMetadata, setSessionMetadata] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [isStartingSession, setIsStartingSession] = useState(false);
  
  const addToCart = (item: { id: number; name: string; price: number }) => {
    add({ id: String(item.id), name: item.name, price: Math.round(item.price * 100), qty: 1 });
    console.log('Adding to cart:', item); // Debug log
  };

  const handleTableDetected = (tableData: any) => {
    setTableData(tableData);
    console.log('Table detected:', tableData);
  };

  const handleLoungeDetected = (loungeData: any) => {
    console.log('Lounge detected:', loungeData);
  };

  const handleSessionUpdate = (metadata: any) => {
    setSessionMetadata(metadata);
    console.log('Session metadata updated:', metadata);
  };

  // Subscribe to session updates - force rebuild
  useEffect(() => {
    const unsubscribe = sessionManager.subscribe((session) => {
      setCurrentSession(session);
    });

    // Get current session if exists
    const existingSession = sessionManager.getCurrentSession();
    if (existingSession) {
      setCurrentSession(existingSession);
    }

    return unsubscribe;
  }, []);

  // Handle Fire Session button click
  const handleFireSession = async () => {
    if (items.length === 0) {
      alert('Please add items to your cart before starting a session');
      return;
    }

    if (!tableData) {
      alert('Please scan your table QR code first');
      return;
    }

    setIsStartingSession(true);

    try {
      const result = await sessionManager.startSession({
        tableId: tableData.tableId,
        loungeId: tableData.loungeId,
        customerId: `guest_${Date.now()}`,
        items: items.map(item => ({
          name: item.name,
          quantity: item.qty,
          price: item.price
        })),
        totalAmount: subtotal,
        customerName: 'Guest Customer',
        customerPhone: '',
        sessionDuration: 60
      });

      if (result.ok && result.session) {
        // Start monitoring the session
        sessionManager.startMonitoring();
        alert('Session started successfully! You can now view it in the App build.');
      } else {
        alert(`Failed to start session: ${result.error}`);
      }
    } catch (error) {
      alert(`Error starting session: ${error}`);
    } finally {
      setIsStartingSession(false);
    }
  };

  // Handle Staff Panel button click
  const handleStaffPanel = () => {
    if (currentSession) {
      sessionManager.openAppBuild('staff');
    } else {
      // Open general staff panel
      window.open('https://hookahplus-app-prod.vercel.app/fire-session-dashboard', '_blank');
    }
  };

  // Handle Dashboard button click
  const handleDashboard = () => {
    if (currentSession) {
      sessionManager.openAppBuild('dashboard');
    } else {
      // Open general dashboard
      window.open('https://hookahplus-app-prod.vercel.app/dashboard', '_blank');
    }
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
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* QR Code Scanner */}
        <div className="mb-8">
          <QRCodeScanner
            onTableDetected={handleTableDetected}
            onLoungeDetected={handleLoungeDetected}
          />
        </div>

        {/* Session Timer Awareness */}
        <div className="mb-8">
          <SessionTimerAwareness
            tableId={tableData?.tableId || "T-001"}
            onSessionStart={() => {
              console.log('Session started for table', tableData?.tableId || "T-001");
            }}
            onSessionComplete={() => {
              console.log('Session completed for table', tableData?.tableId || "T-001");
            }}
          />
        </div>

        {/* Current Session Status */}
        {currentSession && (
          <div className="mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <h3 className="text-lg font-semibold">Active Session</h3>
                </div>
                <div className="text-sm text-zinc-400">
                  Session ID: {currentSession.sessionId}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-800 rounded-lg p-4">
                  <div className="text-sm text-zinc-400 mb-1">Table</div>
                  <div className="text-lg font-semibold">{currentSession.tableId}</div>
                </div>
                
                <div className="bg-zinc-800 rounded-lg p-4">
                  <div className="text-sm text-zinc-400 mb-1">Time Remaining</div>
                  <div className="text-lg font-semibold text-primary-400">
                    {currentSession.timeRemaining} min
                  </div>
                </div>
                
                <div className="bg-zinc-800 rounded-lg p-4">
                  <div className="text-sm text-zinc-400 mb-1">Total Amount</div>
                  <div className="text-lg font-semibold text-green-400">
                    ${(currentSession.totalAmount / 100).toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-3">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => sessionManager.openAppBuild('session')}
                >
                  View in App Build
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => sessionManager.openAppBuild('staff')}
                >
                  Staff Panel
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => sessionManager.openAppBuild('dashboard')}
                >
                  Dashboard
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Real-time Session Sync */}
        {sessionMetadata && (
          <div className="mb-8">
            <RealTimeSessionSync
              sessionId={sessionMetadata.sessionId}
              onSessionUpdate={handleSessionUpdate}
            />
          </div>
        )}
        
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

            {/* Streamlined Menu */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Menu</h3>
                  <div className="text-sm text-zinc-400">
                    {menuItems.length} items available
                  </div>
                </div>

                <div className="space-y-3">
                  {menuItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="text-xl">🍃</div>
                        <div>
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-zinc-400">{item.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-semibold text-primary-400">
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
                
                {/* Cart Items */}
                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400">Your cart is empty. Add items to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="p-3 bg-zinc-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">{item.name}</div>
                          <button
                            onClick={() => remove(item.id)}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                if (item.qty > 1) {
                                  add({ id: item.id, name: item.name, price: item.price, qty: -1 });
                                }
                              }}
                              className="w-6 h-6 bg-zinc-700 hover:bg-zinc-600 rounded-full flex items-center justify-center text-xs"
                              disabled={item.qty <= 1}
                            >
                              -
                            </button>
                            <span className="text-sm text-zinc-300 w-8 text-center">{item.qty}</span>
                            <button
                              onClick={() => add({ id: item.id, name: item.name, price: item.price, qty: 1 })}
                              className="w-6 h-6 bg-zinc-700 hover:bg-zinc-600 rounded-full flex items-center justify-center text-xs"
                            >
                              +
                            </button>
                          </div>
                          <div className="font-semibold text-primary-400">
                            ${(item.price * item.qty / 100).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Subtotal */}
                    <div className="border-t border-zinc-700 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Subtotal:</span>
                        <span className="text-lg font-bold text-primary-400">
                          ${(subtotal / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

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
                    onClick={handleFireSession}
                    disabled={isStartingSession || !tableData}
                  >
                    {isStartingSession ? 'Starting Session...' : '🔥 Fire Session'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    leftIcon={<UserCheck className="w-4 h-4" />}
                    onClick={handleStaffPanel}
                  >
                    Staff Panel
                    {currentSession && (
                      <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                        Live
                      </span>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    leftIcon={<BarChart3 className="w-4 h-4" />}
                    onClick={handleDashboard}
                  >
                    Dashboard
                    {currentSession && (
                      <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    leftIcon={<Star className="w-4 h-4" />}
                    onClick={() => {
                      // Navigate to partnership page
                      window.location.href = '/partnership';
                    }}
                  >
                    Join Partnership Program
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