"use client";

import React, { useState } from 'react';
import { X, User, Phone, Clock, Flame, DollarSign, Users, FileText, MapPin } from 'lucide-react';
import { TableSelector } from './TableSelector';
import { TableType } from '../lib/tableTypes';
import FlavorWheelSelector from './FlavorWheelSelector';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession: (sessionData: any) => Promise<string | undefined>; // Returns session ID for payment linking
  isDemoMode?: boolean; // Optional: if true, skip real Stripe payments
  demoMenuFlavors?: string[] | null; // For demo mode: flavors from uploaded menu
  isDemoSlug?: boolean; // True when accessed via /demo/[slug] route
  demoSource?: 'onboarding' | 'marketing'; // Demo source for routing
}

interface SessionData {
  tableId: string;
  tableType: TableType;
  customerName: string;
  customerPhone: string;
  sessionType: string;
  flavor: string; // Keep for backward compatibility
  flavorMix: string[]; // New: array of flavor IDs
  flavorMixPrice: number; // New: total price for flavor mix
  amount: number;
  bohStaff: string;
  fohStaff: string;
  notes: string;
  timerDuration: number; // in minutes
  pricingModel: 'flat' | 'time-based'; // New: pricing model choice
  basePrice: number; // New: base price for calculations
}

const sessionTypes = [
  { value: 'walk-in', label: 'Walk-in', icon: <User className="w-4 h-4" /> },
  { value: 'reservation', label: 'Reservation', icon: <Clock className="w-4 h-4" /> },
  { value: 'vip', label: 'VIP', icon: <Flame className="w-4 h-4" /> }
];

const flavors = [
  'Blue Mist',
  'Double Apple',
  'Mint Fresh',
  'Strawberry Mojito',
  'Peach Wave',
  'Watermelon Mint',
  'Custom Mix'
];

const bohStaff = [
  'Mike Rodriguez',
  'Sarah Chen',
  'Alex Johnson',
  'Maria Garcia'
];

const fohStaff = [
  'John Smith',
  'Emily Davis',
  'David Wilson',
  'Lisa Brown'
];

const timerDurations = [
  { value: 30, label: '30 minutes', description: 'Standard session' },
  { value: 45, label: '45 minutes', description: 'Extended session' },
  { value: 60, label: '1 hour', description: 'Premium session' },
  { value: 90, label: '1.5 hours', description: 'VIP session' },
  { value: 120, label: '2 hours', description: 'Ultimate session' }
];

export default function CreateSessionModal({ isOpen, onClose, onCreateSession, isDemoMode = false, demoMenuFlavors = null, isDemoSlug = false, demoSource = 'marketing' }: CreateSessionModalProps) {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const [formData, setFormData] = useState<SessionData>({
    tableId: 'table-001',
    tableType: {} as TableType,
    customerName: 'John Smith',
    customerPhone: '+1 (555) 123-4567',
    sessionType: 'walk-in',
    flavor: 'Blue Mist', // Keep for backward compatibility
    flavorMix: [], // New: empty array for flavor mix
    flavorMixPrice: 0, // New: no additional flavor cost initially
    amount: 30, // Base session price
    bohStaff: '',
    fohStaff: '',
    notes: '',
    timerDuration: 60, // Default to 1 hour
    pricingModel: 'flat', // New: default to flat fee
    basePrice: 30 // New: base price for calculations
  });

  const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
  const [showTableSelector, setShowTableSelector] = useState(false);

  const [errors, setErrors] = useState<Partial<Record<keyof SessionData, string>>>({});

  // Calculate total amount based on pricing model
  const calculateTotalAmount = (pricingModel: 'flat' | 'time-based', timerDuration: number, flavorMixPrice: number, basePrice: number = 30, tableMultiplier: number = 1) => {
    if (pricingModel === 'flat') {
      // Base price with table multiplier + flavor add-ons
      return (basePrice * tableMultiplier) + flavorMixPrice;
    } else {
      // Time-based: $0.50 per minute + flavor add-ons
      const timeBasedPrice = timerDuration * 0.50;
      return timeBasedPrice + flavorMixPrice;
    }
  };

  const handleInputChange = (field: keyof SessionData, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate amount when pricing model or duration changes
      if (field === 'pricingModel' || field === 'timerDuration') {
        const tableMultiplier = selectedTable?.priceMultiplier || 1;
        updated.amount = calculateTotalAmount(
          field === 'pricingModel' ? value as 'flat' | 'time-based' : updated.pricingModel,
          field === 'timerDuration' ? value as number : updated.timerDuration,
          updated.flavorMixPrice,
          updated.basePrice,
          tableMultiplier
        );
      }
      
      return updated;
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTableSelect = (table: TableType) => {
    setSelectedTable(table);
    setFormData(prev => {
      const newAmount = calculateTotalAmount(
        prev.pricingModel,
        prev.timerDuration,
        prev.flavorMixPrice,
        prev.basePrice,
        table.priceMultiplier
      );
      return {
        ...prev,
        tableId: table.id,
        tableType: table,
        amount: newAmount
      };
    });
    setShowTableSelector(false);
  };

  // Handle flavor mix changes
  const handleFlavorMixChange = (flavors: string[], totalPrice: number) => {
    setFormData(prev => {
      // Ensure flavor prices are properly calculated (not zeroed in non-demo mode)
      const flavorPrice = isDemoMode ? 0 : totalPrice;
      const tableMultiplier = selectedTable?.priceMultiplier || 1;
      const newAmount = calculateTotalAmount(
        prev.pricingModel,
        prev.timerDuration,
        flavorPrice,
        prev.basePrice,
        tableMultiplier
      );
      const updated = {
        ...prev,
        flavorMix: flavors,
        flavorMixPrice: flavorPrice, // $2.00-$4.50 per flavor, properly calculated
        amount: newAmount
      };
      console.log('[CreateSessionModal] Flavor mix updated:', {
        flavors,
        totalPrice,
        flavorPrice,
        calculatedAmount: updated.amount,
        pricingModel: prev.pricingModel,
        timerDuration: prev.timerDuration,
        tableMultiplier
      });
      return updated;
    });
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Partial<Record<keyof SessionData, string>> = {};
    
    if (!formData.tableId.trim()) {
      newErrors.tableId = 'Table ID is required';
    } else if (selectedTable) {
      // Validate table exists and is available
      try {
        const response = await fetch('/api/lounges/tables/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tableId: formData.tableId,
            checkAvailability: true
          })
        });

        if (response.ok) {
          const validation = await response.json();
          if (!validation.valid) {
            newErrors.tableId = validation.error || 'Invalid table';
            if (validation.suggestions) {
              newErrors.tableId += ` (Suggestions: ${validation.suggestions.join(', ')})`;
            }
          } else if (!validation.available) {
            newErrors.tableId = validation.error || 'Table is not available';
          }
        }
      } catch (error) {
        console.warn('Table validation error (non-blocking):', error);
        // Don't block on validation errors - graceful degradation
      }
    }

    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!formData.sessionType) newErrors.sessionType = 'Session type is required';
    if (formData.flavorMix.length === 0) newErrors.flavor = 'At least one flavor must be selected';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.timerDuration || formData.timerDuration <= 0) newErrors.timerDuration = 'Session duration is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await validateForm();
    if (isValid) {
      // Format data for the API endpoint
      const apiData = {
        session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        lounge_id: 'fire-session-lounge',
        table_id: formData.tableId || selectedTable?.id || 'table-001',
        flavor_mix: formData.flavorMix,
        customer_name: formData.customerName || 'Guest Customer',
        customer_phone: formData.customerPhone || '+1234567890',
        session_type: formData.sessionType || 'walk-in',
        amount: formData.amount,
        pricing_model: formData.pricingModel,
        timer_duration: formData.timerDuration,
        boh_staff: formData.bohStaff,
        foh_staff: formData.fohStaff,
        notes: formData.notes,
        flavor_mix_price: formData.flavorMixPrice,
        base_price: formData.basePrice
      };
      
      console.log('Creating session with data:', apiData); // Debug log
      
      // Create session first and get session ID
      let sessionId: string | undefined;
      try {
        sessionId = await onCreateSession(apiData);
        if (!sessionId) {
          throw new Error('Session created but no ID returned');
        }
      } catch (error) {
        console.error('Session creation failed:', error);
        // Don't proceed to payment if session creation failed
        return;
      }
      
      // Calculate total amount in cents (same as pre-order)
      // Ensure cart items are calculated and reflected
      const totalAmountCents = Math.round(formData.amount * 100);
      const totalAmountDollars = formData.amount;
      
      // Calculate cart breakdown for display
      const cartItems = [
        {
          name: `Hookah Session - ${formData.flavorMix.length > 0 ? formData.flavorMix.join(' + ') : (formData.flavor || 'Custom Mix')}`,
          quantity: 1,
          price: totalAmountDollars,
          priceCents: totalAmountCents
        }
      ];
      
      console.log('[CreateSessionModal] Cart items calculated:', {
        items: cartItems,
        total: totalAmountDollars,
        totalCents: totalAmountCents
      });
      
      // In demo mode, route through new demo-session API
      if (isDemoMode) {
        console.log('[CreateSessionModal] 🎭 Demo Mode: Routing through demo-session API');
        try {
          const response = await fetch('/api/demo-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              // For staff-facing demo from FSD, always use simulated mode (no Stripe redirect)
              mode: 'simulated',
              loungeId: (isDemoSlug ? 'demo-lounge' : 'default-lounge'),
              operatorId: undefined,
              source: demoSource,
              sessionData: {
                tableId: formData.tableId || selectedTable?.id || 'table-001',
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                flavorMix: formData.flavorMix.length > 0 ? formData.flavorMix : [formData.flavor || 'Custom Mix'],
                amount: totalAmountDollars,
                pricingModel: formData.pricingModel,
                timerDuration: formData.timerDuration,
              },
            })
          });
          
          const data = await response.json();
          
          if (data.status === 'error') {
            throw new Error(data.reason || 'Failed to create demo session');
          }
          
          // Show user-facing message
          if (data.message) {
            console.log('[CreateSessionModal] Demo mode message:', data.message);
          }
          
          // For staff-facing demo, always treat as simulated: never redirect to Stripe
          if (data.simulatedSessionId) {
            // Simulated mode - complete payment immediately
            console.log('[CreateSessionModal] 🎭 Simulated Mode: Completing payment');
            
            // Call complete endpoint to finalize simulated payment
            const completeResponse = await fetch('/api/demo-session/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                simulatedSessionId: data.simulatedSessionId,
                sessionId: sessionId,
                loungeId: (isDemoSlug ? 'demo-lounge' : 'default-lounge'),
                amountCents: totalAmountCents,
                flavorMix: formData.flavorMix.length > 0 ? JSON.stringify(formData.flavorMix) : null,
                tableId: formData.tableId || selectedTable?.id || 'table-001',
                customerPhone: formData.customerPhone,
              })
            });
            
            if (completeResponse.ok) {
              console.log('[CreateSessionModal] 🎭 Simulated payment completed');
              onClose();
              window.dispatchEvent(new Event('refreshSessions'));
              return;
            } else {
              throw new Error('Failed to complete simulated payment');
            }
          } else {
            // Fallback: no simulatedSessionId returned
            console.warn('[CreateSessionModal] Demo session response missing simulatedSessionId. Skipping payment flow.');
            onClose();
            window.dispatchEvent(new Event('refreshSessions'));
            return;
          }
        } catch (error) {
          console.error('[CreateSessionModal] Demo session error:', error);
          alert(`Demo session error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          // Don't close modal on error - let user retry
          return;
        }
      }
      
      // Production mode: Immediately trigger payment (Stripe checkout) with session ID
      try {
        console.log('[CreateSessionModal] Creating Stripe checkout with session ID:', sessionId);
        
        const response = await fetch('/api/checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionId, // SECURITY: Only send opaque session ID to Stripe
            flavors: formData.flavorMix.length > 0 ? formData.flavorMix : [formData.flavor || 'Custom Mix'],
            tableId: formData.tableId || selectedTable?.id || 'table-001',
            amount: totalAmountCents, // Amount in cents (same as pre-order)
            total: totalAmountDollars, // Total in dollars for display
            sessionDuration: formData.timerDuration * 60,
            loungeId: 'default-lounge', // Default lounge ID
            isDemo: isDemoMode // Pass demo mode flag to ensure test keys are used
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          let checkoutError;
          try {
            checkoutError = errorText ? JSON.parse(errorText) : { error: 'Unknown error' };
          } catch {
            checkoutError = { error: errorText || `HTTP ${response.status}` };
          }
          
          // Special handling for Stripe configuration errors
          if (checkoutError.isConfigurationError || checkoutError.error === 'Stripe not configured') {
            const setupMessage = 
              `⚠️ Stripe Payment Not Configured\n\n` +
              `Session created successfully (ID: ${sessionId}), but payment checkout requires Stripe setup.\n\n` +
              `To enable payments:\n` +
              `1. Get test key: ${checkoutError.setupUrl || 'https://dashboard.stripe.com/apikeys'}\n` +
              `2. Add to apps/app/.env.local:\n` +
              `   STRIPE_SECRET_KEY=sk_test_...\n` +
              `3. Restart app build server\n\n` +
              `You can manually confirm payment using the "Confirm Payment" button in the FSD.`;
            
            alert(setupMessage);
            onClose(); // Close modal even if Stripe fails
            return;
          }
          
          throw new Error(checkoutError.error || checkoutError.details || 'Failed to create checkout session');
        }
        
        const data = await response.json();
        console.log('[CreateSessionModal] Checkout response:', data);
        
        if (data.success && data.url) {
          // Redirect to Stripe checkout (same pattern as pre-order)
          console.log('✅ Stripe checkout URL created, redirecting to:', data.url);
          window.location.href = data.url;
          // Note: We don't close the modal here because we're redirecting
          // The redirect will happen, and when user returns, they'll see the updated session
        } else {
          throw new Error(data.error || data.details || 'Invalid checkout response');
        }
      } catch (error) {
        console.error('Payment error (session still created):', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert(
          `⚠️ Session created, but payment checkout failed.\n\n` +
          `Error: ${errorMessage}\n\n` +
          `Session ID: ${sessionId}\n` +
          `You can manually confirm payment using the "Confirm Payment" button in the FSD.`
        );
        onClose(); // Close modal even if Stripe fails
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700 bg-zinc-800/50">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Flame className="w-6 h-6 mr-2 text-orange-400" />
            Create New Session
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Table Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Table Selection *
                </label>
                <div className="space-y-2">
                  {selectedTable ? (
                    <div className="p-3 bg-zinc-800/80 border border-zinc-500 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{selectedTable.icon}</span>
                          <div>
                            <div className="text-white font-medium">{selectedTable.name}</div>
                            <div className="text-sm text-zinc-400 capitalize">{selectedTable.type} • {selectedTable.capacity} people • {selectedTable.location}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedTable.availability === 'available' ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
                          }`}>
                            {selectedTable.availability}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowTableSelector(!showTableSelector)}
                            className="text-teal-400 hover:text-teal-300"
                          >
                            <MapPin className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowTableSelector(true)}
                      className="w-full p-3 bg-zinc-800/80 border border-zinc-500 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>Select a table...</span>
                      </div>
                    </button>
                  )}
                  
                  {showTableSelector && (
                    <div className="max-h-96 overflow-y-auto">
                      <TableSelector
                        selectedTableId={selectedTable?.id}
                        onTableSelect={handleTableSelect}
                        showAvailability={true}
                        showCapacity={true}
                        showPricing={true}
                        useLayoutData={true}
                        partySize={formData.timerDuration ? undefined : undefined} // Can add party size field later
                        className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
                      />
                    </div>
                  )}
                </div>
                {errors.tableId && (
                  <p className="text-red-400 text-sm mt-1">{errors.tableId}</p>
                )}
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-semibold">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  className={`w-full px-4 py-3 bg-zinc-800/80 border rounded-lg text-white placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.customerName ? 'border-red-500' : 'border-zinc-500'
                  }`}
                  placeholder="Enter customer name"
                />
                {errors.customerName && (
                  <p className="text-red-400 text-sm mt-1">{errors.customerName}</p>
                )}
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-semibold">
                  Customer Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800/80 border border-zinc-500 rounded-lg text-white placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Session Type */}
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-semibold">
                  Session Type *
                </label>
                <select
                  value={formData.sessionType}
                  onChange={(e) => handleInputChange('sessionType', e.target.value)}
                  className={`w-full px-4 py-3 bg-zinc-800/80 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.sessionType ? 'border-red-500' : 'border-zinc-500'
                  }`}
                >
                  {sessionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.sessionType && (
                  <p className="text-red-400 text-sm mt-1">{errors.sessionType}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Flavor Mix Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-semibold">
                  Flavor Mix *
                </label>
                <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-600">
                  <FlavorWheelSelector
                    selectedFlavors={formData.flavorMix}
                    onSelectionChange={handleFlavorMixChange}
                    maxSelections={4}
                    mode="staff"
                    className=""
                    customFlavors={isDemoMode && demoMenuFlavors ? demoMenuFlavors : undefined}
                    isDemoMode={isDemoMode}
                  />
                </div>
                {/* Show flavor pricing breakdown - professional display even in demo */}
                <div className="mt-2 text-sm">
                  {formData.flavorMix.length > 0 ? (
                    <div className="space-y-1">
                      <div className="text-zinc-300">
                        Selected: {formData.flavorMix.length} flavor{formData.flavorMix.length > 1 ? 's' : ''}
                      </div>
                      {isDemoMode ? (
                        <div className="text-zinc-400 italic">
                          Flavors: Free (demo mode) • Base: ${formData.basePrice.toFixed(2)} = Total: ${formData.amount.toFixed(2)}
                        </div>
                      ) : (
                        <div className="text-green-400">
                          Flavor Add-ons: +${formData.flavorMixPrice.toFixed(2)} • Base: ${formData.basePrice.toFixed(2)} = Total: ${formData.amount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-zinc-400">No flavors selected</div>
                  )}
                </div>
                {errors.flavor && (
                  <p className="text-red-400 text-sm mt-1">{errors.flavor}</p>
                )}
              </div>

              {/* Pricing Model */}
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-semibold">
                  Pricing Model *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange('pricingModel', 'flat')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.pricingModel === 'flat'
                        ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                        : 'border-zinc-600 bg-zinc-800/80 text-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    <div className="font-medium">Flat Fee</div>
                    <div className="text-sm text-zinc-400">$30.00 fixed</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('pricingModel', 'time-based')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.pricingModel === 'time-based'
                        ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                        : 'border-zinc-600 bg-zinc-800/80 text-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    <div className="font-medium">Time-Based</div>
                    <div className="text-sm text-zinc-400">$0.50/min</div>
                  </button>
                </div>
                <div className="mt-2 text-xs text-zinc-400">
                  {formData.pricingModel === 'flat' 
                    ? 'Fixed $30.00 + flavor add-ons' 
                    : `$${(formData.timerDuration * 0.50).toFixed(2)} for ${formData.timerDuration}min + flavor add-ons`
                  }
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-semibold">
                  Total Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 bg-zinc-700 border border-zinc-500 rounded-lg text-white cursor-not-allowed"
                    placeholder="0.00"
                  />
                </div>
                {/* Professional cart breakdown display */}
                <div className="mt-2 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <div className="text-xs font-semibold text-zinc-300 mb-2">Cart Breakdown:</div>
                  <div className="space-y-1 text-xs">
                    {formData.pricingModel === 'flat' ? (
                      <>
                        <div className="flex justify-between text-zinc-400">
                          <span>Base Session (Flat Rate):</span>
                          <span>${formData.basePrice.toFixed(2)}</span>
                        </div>
                        {formData.flavorMix.length > 0 && (
                          <div className="flex justify-between text-zinc-400">
                            <span>Flavor Mix ({formData.flavorMix.length}):</span>
                            <span>{isDemoMode ? 'Free (Demo)' : `+$${formData.flavorMixPrice.toFixed(2)}`}</span>
                          </div>
                        )}
                        {selectedTable && selectedTable.priceMultiplier !== 1 && (
                          <div className="flex justify-between text-zinc-400">
                            <span>Table Premium ({selectedTable.name}):</span>
                            <span>+${((formData.basePrice * selectedTable.priceMultiplier) - formData.basePrice).toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-zinc-400">
                          <span>Time-Based ({formData.timerDuration} min @ $0.50/min):</span>
                          <span>${(formData.timerDuration * 0.50).toFixed(2)}</span>
                        </div>
                        {formData.flavorMix.length > 0 && (
                          <div className="flex justify-between text-zinc-400">
                            <span>Flavor Mix ({formData.flavorMix.length}):</span>
                            <span>{isDemoMode ? 'Free (Demo)' : `+$${formData.flavorMixPrice.toFixed(2)}`}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="border-t border-zinc-700 pt-1 mt-1 flex justify-between font-semibold text-white">
                      <span>Total:</span>
                      <span>${formData.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                {errors.amount && (
                  <p className="text-red-400 text-sm mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Timer Duration */}
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-semibold">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Session Duration *
                </label>
                <select
                  value={formData.timerDuration}
                  onChange={(e) => handleInputChange('timerDuration', parseInt(e.target.value))}
                  className={`w-full px-4 py-3 bg-zinc-800/80 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.timerDuration ? 'border-red-500' : 'border-zinc-500'
                  }`}
                >
                  {timerDurations.map((duration) => (
                    <option key={duration.value} value={duration.value}>
                      {duration.label} - {duration.description}
                    </option>
                  ))}
                </select>
                {errors.timerDuration && (
                  <p className="text-red-400 text-sm mt-1">{errors.timerDuration}</p>
                )}
              </div>

              {/* Assign BOH Staff */}
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-semibold">
                  Assign BOH Staff
                </label>
                <select
                  value={formData.bohStaff}
                  onChange={(e) => handleInputChange('bohStaff', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select BOH Staff</option>
                  {bohStaff.map((staff) => (
                    <option key={staff} value={staff}>
                      {staff}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assign FOH Staff - Hidden in demo slug experience */}
              {!isDemoSlug && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2 font-semibold">
                    Assign FOH Staff
                  </label>
                  <select
                    value={formData.fohStaff}
                    onChange={(e) => handleInputChange('fohStaff', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select FOH Staff</option>
                    {fohStaff.map((staff) => (
                      <option key={staff} value={staff}>
                        {staff}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Session Notes - Full Width */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2 font-semibold">
              <FileText className="w-4 h-4 inline mr-2" />
              Session Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-500 rounded-lg text-white placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              placeholder="Add any special instructions or notes for this session..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Flame className="w-4 h-4 inline mr-2" />
              Create New Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
