'use client';

// Guest build deployment trigger - updated for proper Vercel alignment
// Build timestamp: 2025-10-16T17:20:00Z
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
import { sessionManager, SessionData } from '../lib/sessionManager';
import FlavorMixSelector from '../components/customer/FlavorMixSelector';
import SuccessModal from '../components/SuccessModal';
import { HookahTracker } from '../components/HookahTracker';

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
  X
} from 'lucide-react';

export default function GuestPortal() {
  const { add, remove, items, subtotal } = useCart();
  const [tableData, setTableData] = useState<any>(null);
  const [sessionMetadata, setSessionMetadata] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [showEnhancedStaffPanel, setShowEnhancedStaffPanel] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showHookahTracker, setShowHookahTracker] = useState(false);
  const [pricingModel, setPricingModel] = useState<'flat' | 'time-based'>('flat');
  const [sessionDuration, setSessionDuration] = useState(60); // Default 60 minutes
  
  // FlavorMixSelector state
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [flavorMixPrice, setFlavorMixPrice] = useState(0);
  
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
      // Map to match the API endpoint expectations
      const flavorMix = items
        .filter(item => item.name.includes('Add-on') || item.name.includes('Flavor'))
        .map(item => item.name.replace(' Add-on', '').replace(' Flavor', '').trim())
        .filter(flavor => flavor.length > 0);
      
      const sessionData = {
        tableId: tableData?.tableId || 'T-001',
        loungeId: 'guest-lounge',
        guestId: `guest_${Date.now()}`, // Changed from customerId to guestId
        sessionType: 'standard',
        items: items,
        totalAmount: subtotal / 100, // Convert cents to dollars
        customerName: 'Guest Customer',
        customerPhone: '+1234567890',
        flavorMix: flavorMix.length > 0 ? flavorMix : ['Custom Mix']
      };

      // Send to guest session start API
      const response = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });

      // Parse response safely
      let result;
      const responseText = await response.text();
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('[Fire Session] Failed to parse response:', parseError);
        throw new Error(`Invalid response from server: ${response.status} ${response.statusText}`);
      }

      if (response.ok) {
        console.log('✅ Session created successfully:', result);
        
        // Get app session ID for Stripe checkout
        // Check multiple possible locations for the session ID (in order of likelihood)
        const appSessionId = result.session?.id ||           // Most common: session.id
                            result.id ||                     // Top-level id
                            result.sessionId ||              // Alternative: sessionId
                            result.session?.sessionId ||     // Nested sessionId
                            result.appSessionId ||           // Legacy: appSessionId
                            result.session?.appSessionId;     // Legacy nested: session.appSessionId
        
        const loungeId = result.session?.loungeId || 
                        result.loungeId ||
                        sessionData.loungeId || 
                        'default-lounge';
        
        console.log('[Fire Session] Extracted session ID:', appSessionId, 'from result:', {
          hasSession: !!result.session,
          sessionId: result.session?.id,
          topLevelId: result.id,
          sessionSessionId: result.session?.sessionId,
          fullResult: JSON.stringify(result, null, 2).substring(0, 500) // First 500 chars for debugging
        });
        
        if (!appSessionId) {
          console.error('[Fire Session] No session ID found in result. Full response:', JSON.stringify(result, null, 2));
          throw new Error('Session created but no session ID returned. Please check the server response.');
        }
        
        // Log sync status with detailed error info
        if (result.synced) {
          console.log('✅ Session synced to Fire Session Dashboard (app build)');
          console.log('📊 App Session ID:', appSessionId);
        } else {
          console.error('⚠️ Session created but NOT synced to app build');
          console.error('📋 Warning:', result.warning);
          if (result.syncError) {
            console.error('❌ Sync Error Details:', result.syncError);
          }
        }
        
        // Determine payment model (default to independent for now, can be configured per lounge)
        // TODO: Fetch lounge config from database to determine payment model
        const paymentModel = 'independent'; // Default: 80% use case
        
        // Create Stripe checkout session (same pattern as pre-order)
        try {
          // Calculate amount in cents (same pattern as pre-order)
          const totalAmountCents = subtotal; // subtotal is already in cents
          const totalAmountDollars = subtotal / 100; // Convert to dollars for display
          
          console.log('[Fire Session] Creating Stripe checkout with:', {
            sessionId: appSessionId,
            amount: totalAmountCents,
            total: totalAmountDollars,
            loungeId: loungeId,
            paymentModel: paymentModel
          });
          
          const checkoutResponse = await fetch('/api/checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: appSessionId, // SECURITY: Only send opaque session ID to Stripe
              flavors: flavorMix.length > 0 ? flavorMix : ['Custom Mix'],
              tableId: tableData?.tableId || 'T-001',
              amount: totalAmountCents, // Amount in cents (same as pre-order)
              total: totalAmountDollars, // Total in dollars for display
              loungeId: loungeId,
              paymentModel: paymentModel
            })
          });
          
          console.log('[Fire Session] Checkout response status:', checkoutResponse.status);
          
          if (!checkoutResponse.ok) {
            const errorText = await checkoutResponse.text();
            let checkoutError;
            try {
              checkoutError = errorText ? JSON.parse(errorText) : { error: 'Unknown error' };
            } catch {
              checkoutError = { error: errorText || `HTTP ${checkoutResponse.status}` };
            }
            console.error('[Fire Session] Checkout API error:', checkoutError);
            
            // Special handling for Stripe configuration errors
            if (checkoutError.isConfigurationError || checkoutError.error === 'Stripe not configured') {
              const setupMessage = 
                `⚠️ Stripe Payment Not Configured\n\n` +
                `Session created successfully, but payment checkout requires Stripe setup.\n\n` +
                `To enable payments:\n` +
                `1. Get test key: ${checkoutError.setupUrl || 'https://dashboard.stripe.com/apikeys'}\n` +
                `2. Add to apps/guest/.env.local:\n` +
                `   STRIPE_SECRET_KEY=sk_test_...\n` +
                `3. Restart guest build server\n\n` +
                `Session ID: ${appSessionId}\n` +
                `You can manually confirm payment in the FSD.`;
              
              alert(setupMessage);
              throw new Error('Stripe not configured');
            }
            
            throw new Error(checkoutError.error || checkoutError.details || 'Failed to create checkout session');
          }
          
          const checkoutData = await checkoutResponse.json();
          console.log('[Fire Session] Checkout data:', checkoutData);
          
          if (checkoutData.success) {
            if (paymentModel === 'independent') {
              // Independent operator: Require verified payment before services
              if (checkoutData.url) {
                console.log('✅ Stripe checkout URL created, redirecting to:', checkoutData.url);
                // Redirect to Stripe checkout
                window.location.href = checkoutData.url;
                return; // Exit early, Stripe will handle redirect
              } else {
                console.error('[Fire Session] ❌ Stripe checkout URL missing in response:', checkoutData);
                throw new Error('Stripe checkout URL not returned');
              }
            } else {
              // Internal lounge: Payment hold created, route immediately
              if (checkoutData.paymentIntentId) {
                console.log('✅ Payment hold created:', checkoutData.paymentIntentId);
                // Route to app build immediately after hold
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
                window.location.href = `${appUrl}/fire-session-dashboard?session=${appSessionId}&loungeId=${loungeId}`;
                return;
              } else {
                throw new Error('Payment intent ID not returned');
              }
            }
          } else {
            // Checkout failed - show user-friendly error
            const errorMsg = checkoutData.error || checkoutData.details || 'Unknown error';
            console.error('⚠️ Stripe checkout failed:', errorMsg, checkoutData);
            
            if (errorMsg.includes('Stripe not configured') || errorMsg.includes('STRIPE_SECRET_KEY')) {
              alert(
                `⚠️ Payment checkout unavailable.\n\n` +
                `Stripe is not configured for the guest build.\n\n` +
                `To enable payment:\n` +
                `1. Get test key from: https://dashboard.stripe.com/apikeys\n` +
                `2. Add to guest build .env.local: STRIPE_SECRET_KEY=sk_test_...\n` +
                `3. Restart dev server\n\n` +
                `Session is created but needs payment to proceed.`
              );
            } else {
              alert(`⚠️ Payment checkout failed: ${errorMsg}\n\nSession is created but needs payment to proceed.`);
            }
            // Continue to success modal even if Stripe fails
          }
        } catch (stripeError) {
          console.error('⚠️ Stripe checkout error (session still created):', stripeError);
          alert(`⚠️ Payment checkout error: ${stripeError instanceof Error ? stripeError.message : 'Unknown error'}\n\nSession is created but needs payment to proceed.`);
          // Continue to success modal even if Stripe fails
        }
        
        setShowSuccessModal(true);
        
        // Clear cart after successful session start
        items.forEach(item => remove(item.id));
        
        // Refresh staff dashboard if open
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sessionCreated', { 
            detail: { 
              sessionData: result.session,
              synced: result.synced,
              appSessionId: appSessionId
            } 
          }));
        }
      } else {
        console.error('[Fire Session] API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: result
        });
        throw new Error(result.error || result.details || `Failed to create session: ${response.status}`);
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
        
        {/* Flavor Mix Selector - Wheel/Guided Mode */}
        <div className="mb-6">
          <FlavorMixSelector
            selectedFlavors={selectedFlavors}
            onSelectionChange={handleFlavorSelectionChange}
            maxSelections={4}
            onPriceUpdate={handleFlavorPriceUpdate}
          />
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
                    {isStartingSession ? 'Starting...' : '🔥 Fire Session'}
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
                      leftIcon={<Clock className="w-3 h-3" />}
                    onClick={() => {
                        setShowHookahTracker(true);
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
      </div>

      {/* Guest Intelligence Dashboard Modal */}
      {showEnhancedStaffPanel && (
        <GuestIntelligenceDashboard
          sessionId={currentSession?.sessionId}
          tableId={tableData?.tableId}
          onClose={() => setShowEnhancedStaffPanel(false)}
        />
      )}

      {/* Hookah Tracker Modal */}
      {showHookahTracker && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
          <div className="min-h-screen">
            <div className="flex justify-end p-4">
              <button
                onClick={() => setShowHookahTracker(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <HookahTracker
              sessionId={currentSession?.sessionId || 'demo-session'}
              loungeId={tableData?.loungeId || 'demo-lounge'}
              tableId={tableData?.tableId || 'T-001'}
              onComplete={() => {
                setShowHookahTracker(false);
              }}
            />
          </div>
        </div>
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
  );
}