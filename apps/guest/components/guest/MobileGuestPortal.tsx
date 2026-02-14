'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileOptimizedLayout from './MobileOptimizedLayout';
import MobileFireSessionDashboard from './MobileFireSessionDashboard';
import MobileFlavorSelector from './MobileFlavorSelector';
import MobileQRScanner from './MobileQRScanner';
import MobileCart from './MobileCart';
import { 
  QrCode, 
  Palette, 
  ShoppingCart, 
  Flame, 
  Clock,
  Zap,
  Smartphone,
  Wifi,
  Battery
} from 'lucide-react';

interface SessionData {
  id: string;
  status: 'active' | 'paused' | 'completed' | 'ready';
  startTime: Date;
  duration: number;
  timeRemaining: number;
  totalAmount: number;
  flavors: string[];
  tableId: string;
  progress: number;
}

interface Flavor {
  id: string;
  name: string;
  category: string;
  popular: boolean;
  price: number;
  color: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'base' | 'flavor' | 'addon';
  color?: string;
}

export default function MobileGuestPortal() {
  const [currentView, setCurrentView] = useState<'scanner' | 'flavors' | 'cart' | 'session'>('scanner');
  const [session, setSession] = useState<SessionData | null>(null);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [tableData, setTableData] = useState<{ tableId: string; zone: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionType, setSessionType] = useState<'flat' | 'time-based'>('flat');
  const [basePrice] = useState(3000); // $30.00 in cents

  // Mock flavors data
  const flavors: Flavor[] = [
    { id: 'blue_mist', name: 'Blue Mist', category: 'fruity', popular: true, price: 200, color: 'bg-blue-400' },
    { id: 'double_apple', name: 'Double Apple', category: 'fruity', popular: true, price: 200, color: 'bg-green-400' },
    { id: 'mint_fresh', name: 'Mint Fresh', category: 'mint', popular: true, price: 200, color: 'bg-emerald-400' },
    { id: 'grape', name: 'Grape', category: 'fruity', popular: false, price: 200, color: 'bg-purple-400' },
    { id: 'strawberry', name: 'Strawberry', category: 'fruity', popular: false, price: 200, color: 'bg-pink-400' },
    { id: 'lemon', name: 'Lemon', category: 'citrus', popular: false, price: 200, color: 'bg-yellow-400' },
    { id: 'orange', name: 'Orange', category: 'citrus', popular: false, price: 200, color: 'bg-orange-400' },
    { id: 'watermelon', name: 'Watermelon', category: 'fruity', popular: false, price: 200, color: 'bg-red-400' },
    { id: 'strawberry_mojito', name: 'Strawberry Mojito', category: 'specialty', popular: true, price: 300, color: 'bg-rose-400' },
  ];

  const handleQRScanned = (data: string) => {
    // Parse QR data and set table information
    const [lounge, tableId, zone] = data.split('?')[0].split('_');
    setTableData({ tableId: tableId || 'T-001', zone: zone || 'VIP' });
    setCurrentView('flavors');
  };

  const handleManualEntry = () => {
    setTableData({ tableId: 'T-001', zone: 'VIP' });
    setCurrentView('flavors');
  };

  const handleFlavorToggle = (flavorId: string) => {
    setSelectedFlavors(prev => 
      prev.includes(flavorId) 
        ? prev.filter(id => id !== flavorId)
        : [...prev, flavorId]
    );
  };

  const handleClearAll = () => {
    setSelectedFlavors([]);
  };

  const handleStartSession = () => {
    setIsProcessing(true);
    // Simulate session start
    setTimeout(() => {
      const newSession: SessionData = {
        id: 'session_' + Date.now(),
        status: 'active',
        startTime: new Date(),
        duration: sessionType === 'flat' ? 60 : 30,
        timeRemaining: sessionType === 'flat' ? 60 : 30,
        totalAmount: basePrice + selectedFlavors.reduce((total, id) => {
          const flavor = flavors.find(f => f.id === id);
          return total + (flavor?.price || 0);
        }, 0),
        flavors: selectedFlavors.map(id => {
          const flavor = flavors.find(f => f.id === id);
          return flavor?.name || id;
        }),
        tableId: tableData?.tableId || 'T-001',
        progress: 0
      };
      setSession(newSession);
      setCurrentView('session');
      setIsProcessing(false);
    }, 2000);
  };

  const handlePauseSession = () => {
    if (session) {
      setSession({ ...session, status: 'paused' });
    }
  };

  const handleResumeSession = () => {
    if (session) {
      setSession({ ...session, status: 'active' });
    }
  };

  const handleEndSession = () => {
    if (session) {
      setSession({ ...session, status: 'completed' });
    }
  };

  const handleRestartSession = () => {
    setSession(null);
    setSelectedFlavors([]);
    setCurrentView('scanner');
  };

  const handleCheckout = () => {
    setCurrentView('cart');
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const navigationItems = [
    { id: 'scanner', label: 'Scan', icon: QrCode, active: currentView === 'scanner' },
    { id: 'flavors', label: 'Flavors', icon: Palette, active: currentView === 'flavors' },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, active: currentView === 'cart' },
    { id: 'session', label: 'Session', icon: Flame, active: currentView === 'session' },
  ];

  return (
    <MobileOptimizedLayout>
      {/* Mobile Status Bar */}
      <div className="flex items-center justify-between mb-4 p-3 bg-zinc-800/50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-green-400">Connected</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            <span>100%</span>
          </div>
          <div className="flex items-center gap-1">
            <Battery className="w-3 h-3" />
            <span>85%</span>
          </div>
        </div>
      </div>

      {/* Current Session Status */}
      {session && (
        <div className="mb-4">
          <MobileFireSessionDashboard
            session={session}
            onStartSession={handleStartSession}
            onPauseSession={handlePauseSession}
            onResumeSession={handleResumeSession}
            onEndSession={handleEndSession}
            onRestartSession={handleRestartSession}
            isProcessing={isProcessing}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="mb-6">
        <AnimatePresence mode="wait">
          {currentView === 'scanner' && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MobileQRScanner
                onQRScanned={handleQRScanned}
                onManualEntry={handleManualEntry}
                isScanning={false}
              />
            </motion.div>
          )}

          {currentView === 'flavors' && (
            <motion.div
              key="flavors"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MobileFlavorSelector
                flavors={flavors}
                selectedFlavors={selectedFlavors}
                onFlavorToggle={handleFlavorToggle}
                onClearAll={handleClearAll}
                basePrice={basePrice}
              />
              
              {/* Session Type Selection */}
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-medium text-zinc-300">Session Type</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSessionType('flat')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      sessionType === 'flat'
                        ? 'border-teal-400 bg-teal-500/10 text-teal-300'
                        : 'border-zinc-600 bg-zinc-700/50 text-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="w-4 h-4" />
                      <span className="font-medium">Flat Rate</span>
                    </div>
                    <div className="text-xs text-zinc-400">$30.00</div>
                  </button>
                  
                  <button
                    onClick={() => setSessionType('time-based')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      sessionType === 'time-based'
                        ? 'border-teal-400 bg-teal-500/10 text-teal-300'
                        : 'border-zinc-600 bg-zinc-700/50 text-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Time-Based</span>
                    </div>
                    <div className="text-xs text-zinc-400">$5.00/hour</div>
                  </button>
                </div>
              </div>

              {/* Start Session Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartSession}
                disabled={isProcessing || selectedFlavors.length === 0}
                className="w-full mt-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-zinc-600 disabled:to-zinc-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                {isProcessing ? 'Starting...' : 'Start Session'}
              </motion.button>
            </motion.div>
          )}

          {currentView === 'cart' && (
            <motion.div
              key="cart"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MobileCart
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onCheckout={handleCheckout}
                basePrice={basePrice}
                sessionType={sessionType}
                onSessionTypeChange={setSessionType}
              />
            </motion.div>
          )}

          {currentView === 'session' && session && (
            <motion.div
              key="session"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Session Active</h3>
                <p className="text-zinc-400 mb-6">
                  Your hookah session is running. Use the controls above to manage your session.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-700 p-2">
        <div className="max-w-md mx-auto flex justify-around">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  item.active
                    ? 'text-teal-400 bg-teal-500/10'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20" />
    </MobileOptimizedLayout>
  );
}
