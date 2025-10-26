'use client';

// Guest build deployment trigger - updated for proper Vercel alignment
// Build timestamp: 2025-10-16T17:20:00Z
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import DollarTestButton from '../components/DollarTestButton';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { StatusIndicator } from '../components/StatusIndicator';
import { useCart } from '../components/cart/CartProvider';
import { SessionTimerAwareness } from '../components/SessionTimerAwareness';
import GlobalNavigation from '../components/GlobalNavigation';
import { HookahTracker } from '../components/HookahTracker';
import { QRCodeScanner } from '../components/QRCodeScanner';
import { QRCodeGenerator } from '../components/QRCodeGenerator';
import RealTimeSessionSync from '../components/RealTimeSessionSync';
import GuestIntelligenceDashboard from '../components/EnhancedStaffPanel';
import { sessionManager, SessionData } from '../lib/sessionManager';
import MobileFlavorMixSelector from '../components/customer/MobileFlavorMixSelector';
import MobileFireSessionDashboard from '../components/customer/MobileFireSessionDashboard';
import MobileTouchHandler from '../components/customer/MobileTouchHandler';
import MobilePerformanceOptimizer from '../components/customer/MobilePerformanceOptimizer';
import IOSOptimized from '../components/platform/IOSOptimized';
import AndroidOptimized from '../components/platform/AndroidOptimized';
import { usePlatformDetection } from '../utils/platformDetection';
import SuccessModal from '../components/SuccessModal';

// Analytics tracking functions
const trackConversion = (eventName: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      event_category: 'conversion',
      event_label: eventName,
      value: value || 0,
      currency: 'USD'
    });
    console.log(`[Analytics] 💰 Conversion tracked: ${eventName}`);
  }
};

const trackEngagement = (action: string, component: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'engagement', {
      event_category: 'user_interaction',
      event_label: `${component}:${action}`
    });
    console.log(`[Analytics] 📊 Engagement tracked: ${component}:${action}`);
  }
};

// Flavor categories for the FlavorMixSelector
const FLAVOR_CATEGORIES = [
  {
    id: "mint",
    label: "Mint & Cool",
    hue: 176,
    tier: "standard",
    items: [
      { id: "mint", label: "Classic Mint", price: 2.0 },
      { id: "ice-mint", label: "Ice Mint", price: 2.0 },
      { id: "spearmint", label: "Spearmint", price: 2.0 },
      { id: "menthol", label: "Menthol Burst", price: 2.5 },
    ],
  },
  {
    id: "fruit",
    label: "Fruity",
    hue: 18,
    tier: "standard",
    items: [
      { id: "mango", label: "Mango", price: 2.0 },
      { id: "peach", label: "Peach", price: 2.0 },
      { id: "watermelon", label: "Watermelon", price: 2.0 },
      { id: "grape", label: "Grape", price: 2.0 },
      { id: "berry", label: "Mixed Berry", price: 2.5 },
    ],
  },
  {
    id: "citrus",
    label: "Citrus",
    hue: 48,
    tier: "standard",
    items: [
      { id: "lemon", label: "Lemon", price: 2.0 },
      { id: "orange", label: "Orange", price: 2.0 },
      { id: "lime", label: "Lime", price: 2.0 },
      { id: "tangerine", label: "Tangerine", price: 2.5 },
    ],
  },
  {
    id: "dessert",
    label: "Dessert",
    hue: 300,
    tier: "medium",
    items: [
      { id: "vanilla", label: "Vanilla", price: 3.0 },
      { id: "caramel", label: "Caramel", price: 3.0 },
      { id: "chocolate", label: "Chocolate", price: 3.5 },
      { id: "cookie", label: "Cookie Dough", price: 3.5 },
    ],
  },
  {
    id: "spice",
    label: "Spice & Bold",
    hue: 12,
    tier: "medium",
    items: [
      { id: "double-apple", label: "Double Apple", price: 3.0 },
      { id: "cinnamon", label: "Cinnamon", price: 3.0 },
      { id: "cardamom", label: "Cardamom", price: 3.5 },
      { id: "anise", label: "Anise", price: 3.5 },
    ],
  },
  {
    id: "premium",
    label: "Premium",
    hue: 272,
    tier: "premium",
    items: [
      { id: "vodka-infused", label: "Vodka-Infused", price: 4.0 },
      { id: "whiskey-barrel", label: "Whiskey Barrel", price: 4.0 },
      { id: "boutique-import", label: "Boutique Import", price: 4.5 },
      { id: "rose", label: "Rose", price: 4.0 },
    ],
  },
];
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
  CreditCard,
  QrCode,
  MessageCircle,
  Users
} from 'lucide-react';

export default function GuestPortal() {
  const { add, remove, items, subtotal } = useCart();
  const [tableData, setTableData] = useState<any>(null);
  const [sessionMetadata, setSessionMetadata] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [showHookahTracker, setShowHookahTracker] = useState(false);
  const [trackingSessionId, setTrackingSessionId] = useState<string | null>(null);
  const [showEnhancedStaffPanel, setShowEnhancedStaffPanel] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pricingModel, setPricingModel] = useState<'flat' | 'time-based'>('flat');
  const [sessionDuration, setSessionDuration] = useState(60); // Default 60 minutes
  
  // FlavorMixSelector state
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [flavorMixPrice, setFlavorMixPrice] = useState(0);
  
  // Platform detection
  const platform = usePlatformDetection();
  
  // Staff alert functionality
  const alertStaff = async (alertType: string, message: string) => {
    try {
      const response = await fetch('/api/staff/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tableId: tableData?.tableId || 'unknown',
          alertType,
          message,
          timestamp: new Date().toISOString(),
          priority: 'normal'
        })
      });

      if (response.ok) {
        console.log('Staff alert sent successfully:', alertType);
      }
    } catch (error) {
      console.error('Failed to alert staff:', error);
    }
  };
  
  // Handle URL parameters for QR code scanning
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const loungeId = urlParams.get('loungeId');
    const tableId = urlParams.get('tableId');
    const ref = urlParams.get('ref');
    const mode = urlParams.get('mode');
    
    if (loungeId && tableId) {
      console.log('QR Code parameters detected:', { loungeId, tableId, ref, mode });
      
      // Create table data from URL parameters
      const tableData = {
        loungeId,
        tableId,
        ref: ref || 'demo',
        status: 'ready',
        capacity: 4,
        zone: 'Main Floor',
        type: 'table'
      };
      
      // Set table data and trigger QR scan success
      setTableData(tableData);
      
      // Track QR scan event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'qr_scan', {
          event_category: 'engagement',
          event_label: `lounge:${loungeId},table:${tableId},ref:${ref || 'none'},mode:${mode || 'default'}`
        });
      }
      
      // If mode is flavor-wheel, automatically open flavor wheel
      if (mode === 'flavor-wheel') {
        console.log('Auto-opening flavor wheel for QR scan');
        // Trigger flavor wheel opening after a short delay
        setTimeout(() => {
          const flavorWheelButton = document.querySelector('[data-flavor-wheel-trigger]') as HTMLButtonElement;
          if (flavorWheelButton) {
            flavorWheelButton.click();
          }
        }, 1000);
      }
      
      // Clear URL parameters to clean up the address bar
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  
  const addToCart = (item: { id: number; name: string; price: number }) => {
    add({ id: String(item.id), name: item.name, price: Math.round(item.price * 100), qty: 1 });
    console.log('Adding to cart:', item); // Debug log
  };

  const addFlavorToCart = (flavorName: string, flavorId: string) => {
    // Find the actual flavor price from FLAVOR_CATEGORIES
    const flavor = FLAVOR_CATEGORIES.flatMap(c => c.items).find(f => f.id === flavorId);
    const flavorPrice = flavor ? flavor.price : 2.0; // Default to $2 if not found
    
    // Add flavor as add-on to base hookah
    const flavorItem = {
      id: Date.now() + Math.random(),
      name: `${flavorName} Add-on`,
      price: flavorPrice, // Use actual flavor price
      description: `Premium ${flavorName} flavor enhancement`
    };
    add({ id: String(flavorItem.id), name: flavorItem.name, price: Math.round(flavorItem.price * 100), qty: 1 });
  };

  // FlavorMixSelector handlers
  const handleFlavorSelectionChange = (flavors: string[]) => {
    setSelectedFlavors(flavors);
    
    // Clear existing flavor add-ons from cart
    items.filter(item => item.name.includes('Add-on')).forEach(item => remove(item.id));
    
    // Add new flavor add-ons to cart
    flavors.forEach(flavorId => {
      const flavor = FLAVOR_CATEGORIES.flatMap(c => c.items).find(f => f.id === flavorId);
      if (flavor) {
        addFlavorToCart(flavor.label, flavorId);
      }
    });
  };

  const handleFlavorPriceUpdate = (total: number) => {
    setFlavorMixPrice(total);
  };

  const handleTableDetected = async (tableData: any) => {
    setTableData(tableData);
    console.log('Table detected:', tableData);
    
    // Start hookah tracking
    const sessionId = `session_${Date.now()}`;
    setTrackingSessionId(sessionId);
    
    try {
      const response = await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          loungeId: tableData.loungeId || 'lounge_001',
          tableId: tableData.tableId || 'T-001',
          action: 'start'
        })
      });
      
      if (response.ok) {
        setShowHookahTracker(true);
        trackEngagement('qr_scan_success', 'hookah_tracker');
      }
    } catch (error) {
      console.error('Failed to start tracking:', error);
    }
  };

  const handleLoungeDetected = (loungeData: any) => {
    console.log('Lounge detected:', loungeData);
    // Handle lounge detection if needed
  };

  const handleTrackingComplete = () => {
    setShowHookahTracker(false);
    setShowSuccessModal(true);
    trackConversion('hookah_delivered', 25); // Track successful delivery
  };

  const handleSessionUpdate = (metadata: any) => {
    setSessionMetadata(metadata);
    console.log('Session metadata updated:', metadata);
  };

  // Calculate base price based on pricing model
  const calculateBasePrice = () => {
    if (pricingModel === 'flat') {
      return 3000; // $30.00 in cents
    } else {
      return Math.round(sessionDuration * 0.50 * 100); // $0.50 per minute in cents
    }
  };

  // Ensure base hookah is always in cart with correct pricing
  useEffect(() => {
    const baseHookahExists = items.some(item => item.name === 'Premium Hookah');
    const currentBasePrice = calculateBasePrice();
    
    if (!baseHookahExists) {
      add({ 
        id: 'base-hookah', 
        name: 'Premium Hookah', 
        price: currentBasePrice,
        qty: 1 
      });
    } else {
      // Update existing base hookah price if pricing model changed
      const baseHookah = items.find(item => item.name === 'Premium Hookah');
      if (baseHookah && baseHookah.price !== currentBasePrice) {
        remove(baseHookah.id);
        add({ 
          id: 'base-hookah', 
          name: 'Premium Hookah', 
          price: currentBasePrice,
          qty: 1 
        });
      }
    }
  }, [items, add, remove, pricingModel, sessionDuration]);

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
      
      // Create session data for guest session API
      const sessionData = {
        tableId: tableData?.tableId || 'T-001',
        loungeId: 'guest-lounge',
        customerId: 'guest',
        items: items,
        totalAmount: subtotal,
        customerName: 'Guest Customer',
        customerPhone: '+1234567890',
        sessionDuration: sessionDuration,
        pricingModel: pricingModel,
        flavorMix: items.filter(item => item.name.includes('Add-on')).map(item => item.name.replace(' Add-on', '')),
        flavorMixPrice: items.filter(item => item.name.includes('Add-on')).reduce((sum, item) => sum + item.price, 0) / 100,
        basePrice: calculateBasePrice() / 100
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
        
        // Start Hookah Tracker instead of just showing success modal
        const sessionId = result.session?.id || `session_${Date.now()}`;
        const loungeId = tableData?.loungeId || 'lounge_001';
        const tableId = tableData?.tableId || 'T-001';
        
        // Open Hookah Tracker in new window
        const trackerUrl = `/hookah-tracker?sessionId=${sessionId}&loungeId=${loungeId}&tableId=${tableId}`;
        window.open(trackerUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
        
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

  // Platform-specific wrapper component
  const PlatformWrapper = ({ children }: { children: React.ReactNode }) => {
    if (platform.isIOS) {
      return (
        <IOSOptimized enableBiometrics={true} enableHaptics={true} enableSafeArea={true}>
          {children}
        </IOSOptimized>
      );
    } else if (platform.isAndroid) {
      return (
        <AndroidOptimized enableBiometrics={true} enableHaptics={true} enableMaterialDesign={true}>
          {children}
        </AndroidOptimized>
      );
    }
    return <>{children}</>;
  };

  return (
    <PlatformWrapper>
      {/* Hookah Tracker - Show when tracking is active */}
      {showHookahTracker && trackingSessionId && tableData && (
        <HookahTracker
          sessionId={trackingSessionId}
          loungeId={tableData.loungeId || 'lounge_001'}
          tableId={tableData.tableId || 'T-001'}
          onComplete={handleTrackingComplete}
        />
      )}
      
      {/* Main Guest Portal - Show when not tracking */}
      {!showHookahTracker && (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white platform-optimized">
        <GlobalNavigation currentPage="home" />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* QR Scanner & Table Status with Pricing Options */}
        <div className="mb-6">
          <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-zinc-700 rounded-lg flex items-center justify-center">
                  <QrCode className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <div className="text-xs text-zinc-400">Table</div>
                  <div className="text-sm font-semibold">{tableData?.tableId || "T-001"}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-green-400 font-medium">READY</div>
                <div className="text-xs text-zinc-400">Base: $30.00</div>
              </div>
            </div>
            
            {/* QR Scanner Section */}
            <div className="mb-4">
              <QRCodeScanner onTableDetected={handleTableDetected} onLoungeDetected={handleLoungeDetected} />
            </div>
            
            {/* QR Code Generator for Testing */}
            <div className="mb-4">
              <QRCodeGenerator 
                loungeId={tableData?.loungeId || 'lounge_001'}
                tableId={tableData?.tableId || 'T-001'}
                campaignRef="demo"
                onQRGenerated={(qrData) => {
                  console.log('QR Code generated for testing:', qrData);
                }}
              />
            </div>
            
            {/* Pricing Model Selection */}
            <div className="border-t border-zinc-700 pt-4">
              <div className="text-sm font-medium text-white mb-3">Session Pricing</div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setPricingModel('flat')}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    pricingModel === 'flat'
                      ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                      : 'border-zinc-600 bg-zinc-800/80 text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  <div className="font-medium text-sm">Flat Fee</div>
                  <div className="text-xs text-zinc-400">$30.00 fixed</div>
                </button>
                <button
                  onClick={() => setPricingModel('time-based')}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    pricingModel === 'time-based'
                      ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                      : 'border-zinc-600 bg-zinc-800/80 text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  <div className="font-medium text-sm">Time-Based</div>
                  <div className="text-xs text-zinc-400">$0.50/min</div>
                </button>
              </div>
              
              {/* Session Duration Selector (only show for time-based) */}
              {pricingModel === 'time-based' && (
                <div className="mb-3">
                  <div className="text-xs text-zinc-400 mb-2">Session Duration</div>
                  <select
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value={30}>30 minutes - $15.00</option>
                    <option value={45}>45 minutes - $22.50</option>
                    <option value={60}>60 minutes - $30.00</option>
                    <option value={90}>90 minutes - $45.00</option>
                    <option value={120}>120 minutes - $60.00</option>
                  </select>
                </div>
              )}
              
              <div className="text-xs text-zinc-400">
                {pricingModel === 'flat' 
                  ? 'Fixed $30.00 + flavor add-ons' 
                  : `$${(sessionDuration * 0.50).toFixed(2)} for ${sessionDuration}min + flavor add-ons`
                }
              </div>
            </div>
          </div>
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
        
        {/* Mobile-Optimized Flavor Mix Selector - Wheel/Guided Mode */}
        <div className="mb-6">
          <MobilePerformanceOptimizer enableLazyLoading={true} enablePerformanceTracking={true}>
            <MobileTouchHandler
              onSwipe={(direction, distance) => {
                console.log(`Swipe ${direction} detected with distance ${distance}`);
              }}
              onTap={(position) => {
                console.log(`Tap detected at ${position.x}, ${position.y}`);
              }}
              onDoubleTap={(position) => {
                console.log(`Double tap detected at ${position.x}, ${position.y}`);
              }}
            >
              <MobileFlavorMixSelector
                selectedFlavors={selectedFlavors}
                onSelectionChange={handleFlavorSelectionChange}
                maxSelections={4}
                onPriceUpdate={handleFlavorPriceUpdate}
              />
            </MobileTouchHandler>
          </MobilePerformanceOptimizer>
        </div>

        {/* Order Summary & Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Left: Session Info */}
          <div className="xl:col-span-2">
            <Card className="h-fit">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-3">Session Details</h3>
                
                {/* Session Pricing Info */}
                <div className="p-3 bg-zinc-800 rounded-lg mb-4">
                  <div className="text-sm text-zinc-400 mb-2">Pricing Model</div>
                  <div className="text-lg font-semibold">
                    {pricingModel === 'flat' ? 'Flat Fee' : 'Time-Based'}
                  </div>
                  <div className="text-sm text-zinc-400">
                    {pricingModel === 'flat' 
                      ? 'Fixed $30.00 + flavor add-ons' 
                      : `$${(sessionDuration * 0.50).toFixed(2)} for ${sessionDuration}min + flavor add-ons`
                    }
                  </div>
                </div>

                {/* Selected Flavors Display */}
                {selectedFlavors.length > 0 && (
                  <div className="p-3 bg-zinc-800 rounded-lg">
                    <div className="text-sm text-zinc-400 mb-2">Selected Flavors:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedFlavors.map((flavorId) => {
                        const flavor = FLAVOR_CATEGORIES.flatMap(c => c.items).find(f => f.id === flavorId);
                        return (
                          <span key={flavorId} className="text-xs px-2 py-1 rounded-full bg-primary-500/20 border border-primary-500/30">
                            {flavor?.label || flavorId} ${(flavor?.price || 0).toFixed(2)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right: Order Summary & Actions */}
          <div>
            <Card className="h-fit">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-3">Your Order</h3>
                
                {/* Base Hookah */}
                <div className="mb-3 p-2 bg-zinc-800 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Premium Hookah</div>
                      <div className="text-xs text-zinc-400">60 min session</div>
                    </div>
                    <div className="font-semibold text-primary-400">$30.00</div>
                  </div>
                        </div>
                        
                {/* Flavor Add-ons */}
                {items.filter(item => item.name.includes('Add-on')).length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-zinc-400 mb-1">Add-ons</div>
                    <div className="space-y-1">
                      {items.filter(item => item.name.includes('Add-on')).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-1 bg-zinc-800 rounded text-xs">
                          <span>{item.name.replace(' Add-on', '')}</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-primary-400">${(item.price / 100).toFixed(2)}</span>
                            <button
                              onClick={() => remove(item.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              ×
                            </button>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-zinc-700 pt-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-lg font-bold text-primary-400">
                      ${(subtotal / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    variant="fire" 
                    className="w-full"
                    leftIcon={<Zap className="w-4 h-4" />}
                    onClick={handleFireSession}
                    disabled={isStartingSession || !tableData}
                  >
                    {isStartingSession ? 'Starting...' : 'Checkout'}
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                      size="sm"
                      leftIcon={<Brain className="w-3 h-3" />}
                    onClick={handleStaffPanel}
                  >
                      Intelligence
                  </Button>
                  
                  <Button 
                    variant="outline" 
                      size="sm"
                      leftIcon={<BarChart3 className="w-3 h-3" />}
                    onClick={() => {
                        // Open Hookah Tracker instead of old operator link
                        const sessionId = `session_${Date.now()}`;
                        const loungeId = tableData?.loungeId || 'lounge_001';
                        const tableId = tableData?.tableId || 'T-001';
                        
                        // Create a new window with Hookah Tracker
                        const trackerUrl = `/hookah-tracker?sessionId=${sessionId}&loungeId=${loungeId}&tableId=${tableId}`;
                        window.open(trackerUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                    }}
                  >
                      Hookah Tracker
                  </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Staff Contact Section */}
        <Card className="mt-6">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Need Help?</h3>
                  <p className="text-sm text-zinc-400">Our staff is here to assist you</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alertStaff('help_request', 'Guest needs assistance with ordering')}
                  className="flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  Contact Staff
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alertStaff('order_question', 'Guest has questions about their order')}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Ask Question
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Guest Intelligence Dashboard Modal */}
      {showEnhancedStaffPanel && (
        <GuestIntelligenceDashboard
          sessionId={currentSession?.sessionId}
          tableId={tableData?.tableId}
          onClose={() => setShowEnhancedStaffPanel(false)}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onAction={() => {
          setShowSuccessModal(false);
          window.open('https://hookahplus-iursz2jf6-dwaynes-projects-1c5c280a.vercel.app/fire-session-dashboard', '_blank');
        }}
      />
      </div>
      )}
    </PlatformWrapper>
  );
}