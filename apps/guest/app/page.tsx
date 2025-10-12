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
import GuestIntelligenceDashboard from '../components/EnhancedStaffPanel';
import FlavorMixSelector from '../components/customer/FlavorMixSelector';
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
  const [showEnhancedStaffPanel, setShowEnhancedStaffPanel] = useState(false);
  
  const addToCart = (item: { id: number; name: string; price: number }) => {
    add({ id: String(item.id), name: item.name, price: Math.round(item.price * 100), qty: 1 });
    console.log('Adding to cart:', item); // Debug log
  };

  const addFlavorToCart = (flavorName: string) => {
    // Add flavor as add-on to base hookah
    const flavorItem = {
      id: Date.now() + Math.random(),
      name: `${flavorName} Add-on`,
      price: 2.00, // $2 per flavor add-on
      description: `Premium ${flavorName} flavor enhancement`
    };
    add({ id: String(flavorItem.id), name: flavorItem.name, price: Math.round(flavorItem.price * 100), qty: 1 });
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

  // Ensure base hookah is always in cart
  useEffect(() => {
    const baseHookahExists = items.some(item => item.name === 'Premium Hookah');
    if (!baseHookahExists) {
      add({ 
        id: 'base-hookah', 
        name: 'Premium Hookah', 
        price: 3000, // $30.00 in cents
        qty: 1 
      });
    }
  }, [items, add]);

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
    try {
      setIsStartingSession(true);
      
      // Create session data for main app API
      const sessionData = {
        session_id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        lounge_id: 'guest-lounge',
        table_id: tableData?.tableId || 'T-001',
        flavor_mix: items.map(item => item.name),
        meta: {
          customerId: 'guest',
          phone: '+1234567890',
          email: 'guest@hookahplus.com',
          flavors: items.map(item => item.name),
          selectedItems: items,
          totalAmount: subtotal,
          source: 'guest_portal'
        }
      };

      // Send to guest session start API
      const response = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Session created successfully:', result);
        
        alert('Session started successfully! You can now view it in the App build.');
        
        // Clear cart after successful session start
        items.forEach(item => remove(item.id));
        
        // Refresh staff dashboard if open
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sessionCreated', { 
            detail: { sessionData: result.session } 
          }));
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Error creating session: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsStartingSession(false);
    }
  };

  // Handle Staff Panel button click
  const handleStaffPanel = () => {
    setShowEnhancedStaffPanel(true);
  };

  // Handle Dashboard button click
  const handleDashboard = () => {
    if (currentSession) {
      sessionManager.openAppBuild('dashboard');
    } else {
      // Open general operator dashboard
      window.open('https://hookahplus.net/operator', '_blank');
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
      <GlobalNavigation currentPage="home" />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Compact QR Scanner & Table Status */}
        <div className="mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                  <QRCodeScanner onTableDetected={handleTableDetected} onLoungeDetected={handleLoungeDetected} />
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Table</div>
                  <div className="font-semibold">{tableData?.tableId || "T-001"}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-400 font-medium">READY</div>
                <div className="text-xs text-zinc-400">Base: $30.00</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Current Session Status - Compact */}
        {currentSession && (
          <div className="mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="font-semibold">Active Session</span>
                </div>
                <div className="text-sm text-zinc-400">
                  {currentSession.timeRemaining} min • ${(currentSession.totalAmount / 100).toFixed(2)}
                </div>
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
        
        {/* Main Layout - Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Flavor Wheel */}
          <div>
            <Card className="h-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">🎯 Create Your Perfect Mix</h3>
                  <div className="text-sm text-zinc-400">Base: $30.00</div>
                </div>
                <FlavorMixSelector
                  selectedFlavors={items.filter(item => item.name.includes('Add-on')).map(item => item.name.replace(' Add-on', ''))}
                  onSelectionChange={(flavors) => {
                    // Clear existing flavor add-ons
                    items.filter(item => item.name.includes('Add-on')).forEach(item => remove(item.id));
                    
                    // Add new flavor selections
                    flavors.forEach(flavor => {
                      addFlavorToCart(flavor);
                    });
                  }}
                  maxSelections={3}
                  onPriceUpdate={(price) => {
                    console.log('Flavor mix price updated:', price);
                  }}
                />
              </div>
            </Card>
          </div>

          {/* Right: Order & Actions */}
          <div>
            <Card className="h-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Your Order</h3>
                
                {/* Base Hookah */}
                <div className="mb-4 p-3 bg-zinc-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Premium Hookah</div>
                      <div className="text-sm text-zinc-400">Base session (60 min)</div>
                    </div>
                    <div className="font-semibold text-primary-400">$30.00</div>
                  </div>
                </div>
                
                {/* Flavor Add-ons */}
                {items.filter(item => item.name.includes('Add-on')).length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-zinc-400 mb-2">Flavor Add-ons</div>
                    <div className="space-y-2">
                      {items.filter(item => item.name.includes('Add-on')).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-zinc-800 rounded">
                          <div className="text-sm">{item.name.replace(' Add-on', '')}</div>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm text-primary-400">${(item.price / 100).toFixed(2)}</div>
                            <button
                              onClick={() => remove(item.id)}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Total */}
                <div className="border-t border-zinc-700 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold text-primary-400">
                      ${(subtotal / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Table Status */}
                <div className="mb-6 p-3 bg-zinc-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Table Status</span>
                    <span className="text-green-400 font-medium">AVAILABLE</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    variant="fire" 
                    className="w-full"
                    leftIcon={<Zap className="w-4 h-4" />}
                    onClick={handleFireSession}
                    disabled={isStartingSession || !tableData}
                  >
                    {isStartingSession ? 'Starting Session...' : '🔥 Fire Session'}
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      leftIcon={<Brain className="w-4 h-4" />}
                      onClick={handleStaffPanel}
                    >
                      Intelligence
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      leftIcon={<BarChart3 className="w-4 h-4" />}
                      onClick={() => {
                        window.open('https://hookahplus.net/operator', '_blank');
                      }}
                    >
                      Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Guest Intelligence Dashboard Modal */}
      {showEnhancedStaffPanel && (
        <GuestIntelligenceDashboard
          sessionId={currentSession?.sessionId}
          tableId={tableData?.tableId}
          onClose={() => setShowEnhancedStaffPanel(false)}
        />
      )}
    </div>
  );
}