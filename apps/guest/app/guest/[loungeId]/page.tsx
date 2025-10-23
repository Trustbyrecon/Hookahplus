'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { QRData, GuestProfile, FeatureFlags } from '../../../types/guest';
import { featureFlags } from '../../../config/flags';
import QRGate from '../../../components/guest/QRGate';
import FlavorComposer from '../../../components/guest/FlavorComposer';
import SessionCard from '../../../components/guest/SessionCard';
import PriceBreakdown from '../../../components/guest/PriceBreakdown';
import RewardsBadgeStrip from '../../../components/guest/RewardsBadgeStrip';
import ReferralQR from '../../../components/guest/ReferralQR';
import MemoryBreadcrumbs from '../../../components/guest/MemoryBreadcrumbs';
import MobileOptimizedLayout from '../../../components/guest/MobileOptimizedLayout';
import MobileQRScanner from '../../../components/guest/MobileQRScanner';
import MobileFlavorSelector, { MOCK_FLAVORS } from '../../../components/guest/MobileFlavorSelector';
import MobileCart from '../../../components/guest/MobileCart';
import { createGhostLogEntry } from '../../../libs/ghostlog/hash';

export default function GuestLoungePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const loungeId = params.loungeId as string;
  
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Mobile-specific state
  const [isMobile, setIsMobile] = useState(false);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [sessionType, setSessionType] = useState<'flat' | 'time-based'>('flat');
  const [showQRScanner, setShowQRScanner] = useState(false);

  useEffect(() => {
    initializeGuest();
    detectMobile();
  }, [loungeId]);

  const detectMobile = () => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    setIsMobile(isMobileDevice);
  };

  const initializeGuest = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Parse QR data from URL parameters
      const ref = searchParams.get('ref');
      const s = searchParams.get('s');
      const u = searchParams.get('u');
      const tableId = searchParams.get('tableId');
      const zone = searchParams.get('zone');

      const qrData: QRData = {
        loungeId,
        ref: ref || undefined,
        s: s || undefined,
        u: u || undefined,
        tableId: tableId || undefined,
        zone: zone || undefined
      };

      setQrData(qrData);

      // Get feature flags
      const loungeFlags = featureFlags.getLoungeFlags(loungeId);
      setFlags(loungeFlags);

      // Check if guest features are enabled
      if (!loungeFlags.guest.enabled) {
        setError('Guest features are not enabled for this lounge');
        return;
      }

      // Enter guest (create or retrieve profile)
      const enterResponse = await fetch('/api/guest/enter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loungeId,
          ref,
          u,
          deviceId: localStorage.getItem('deviceId') || undefined
        })
      });

      if (!enterResponse.ok) {
        const errorData = await enterResponse.json();
        throw new Error(errorData.error || 'Failed to enter guest');
      }

      const enterData = await enterResponse.json();
      
      if (enterData.isNewGuest) {
        // Store device ID for anonymous tracking
        if (!u) {
          const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('deviceId', deviceId);
        }
      }

      setGuestProfile(enterData.existingProfile);

      // Log guest entry event
      if (loungeFlags.ghostlog.lite) {
        const eventPayload = {
          loungeId,
          ref,
          isNewGuest: enterData.isNewGuest,
          qrData,
          timestamp: new Date().toISOString()
        };

        const ghostLogEntry = createGhostLogEntry('guest.entered', eventPayload);
        console.log('Guest entry logged:', ghostLogEntry);
      }

    } catch (err) {
      console.error('Guest initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize guest');
    } finally {
      setIsLoading(false);
    }
  };

  // Mobile handlers
  const handleFlavorToggle = (flavorId: string) => {
    setSelectedFlavors(prev => {
      const newSelection = prev.includes(flavorId)
        ? prev.filter(id => id !== flavorId)
        : [...prev, flavorId];
      
      // Update cart items
      const flavor = MOCK_FLAVORS.find(f => f.id === flavorId);
      if (flavor) {
        if (newSelection.includes(flavorId)) {
          setCartItems(prev => [...prev, {
            id: flavorId,
            name: flavor.name,
            price: flavor.price,
            quantity: 1,
            type: 'flavor',
            color: flavor.color
          }]);
        } else {
          setCartItems(prev => prev.filter(item => item.id !== flavorId));
        }
      }
      
      return newSelection;
    });
  };

  const handleClearAllFlavors = () => {
    setSelectedFlavors([]);
    setCartItems(prev => prev.filter(item => item.type !== 'flavor'));
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== id));
      setSelectedFlavors(prev => prev.filter(flavorId => flavorId !== id));
    } else {
      setCartItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    setSelectedFlavors(prev => prev.filter(flavorId => flavorId !== id));
  };

  const handleQRScanned = (data: string) => {
    // Parse QR data and update state
    const url = new URL(data, window.location.origin);
    const tableId = url.searchParams.get('tableId');
    const zone = url.searchParams.get('zone');
    
    if (qrData) {
      setQrData({
        ...qrData,
        tableId: tableId || qrData.tableId,
        zone: zone || qrData.zone
      });
    }
    setShowQRScanner(false);
  };

  const handleManualEntry = () => {
    // For now, just simulate QR data
    handleQRScanned('lounge_001?tableId=T-001&zone=VIP');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Initializing Guest Experience</h2>
          <p className="text-zinc-400">Setting up your session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-red-400">Access Denied</h2>
          <p className="text-zinc-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!qrData || !flags || !guestProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-zinc-400">Please wait while we set up your experience.</p>
        </div>
      </div>
    );
  }

  // Mobile-optimized render
  if (isMobile) {
    return (
      <MobileOptimizedLayout>
        {!qrData || !flags || !guestProfile ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold mb-2">Loading...</h2>
            <p className="text-zinc-400 text-sm">Setting up your experience</p>
          </div>
        ) : showQRScanner ? (
          <MobileQRScanner
            onQRScanned={handleQRScanned}
            onManualEntry={handleManualEntry}
            isScanning={true}
          />
        ) : (
          <div className="space-y-6">
            {/* QR Scanner Trigger */}
            <div className="text-center">
              <button
                onClick={() => setShowQRScanner(true)}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg"
              >
                Scan QR Code
              </button>
              <p className="text-xs text-zinc-400 mt-2">
                Table: {qrData.tableId || 'Not selected'} • Zone: {qrData.zone || 'Not selected'}
              </p>
            </div>

            {/* Flavor Selection */}
            <MobileFlavorSelector
              flavors={MOCK_FLAVORS}
              selectedFlavors={selectedFlavors}
              onFlavorToggle={handleFlavorToggle}
              onClearAll={handleClearAllFlavors}
              basePrice={3000} // $30.00 base price
            />

            {/* Cart */}
            <MobileCart
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onCheckout={() => console.log('Checkout')}
              basePrice={3000}
              sessionType={sessionType}
              onSessionTypeChange={setSessionType}
            />

            {/* Trust Lock Indicator */}
            {flags.ghostlog.lite && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium">Trust Lock Active</span>
                </div>
                <p className="text-green-200 text-xs mt-1">
                  Your session is secure and encrypted
                </p>
              </div>
            )}
          </div>
        )}
      </MobileOptimizedLayout>
    );
  }

  // Desktop render (original)
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🍃</div>
              <div>
                <h1 className="text-xl font-bold">Hookah+ Guest</h1>
                <p className="text-sm text-zinc-400">Lounge: {loungeId}</p>
              </div>
            </div>
            
            {flags.ghostlog.lite && (
              <div className="flex items-center space-x-2 text-sm text-zinc-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Trust Lock Active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Flow */}
          <div className="lg:col-span-2 space-y-6">
            {/* QR Gate */}
            <QRGate
              qrData={qrData}
              guestProfile={guestProfile}
              flags={flags}
              onProfileUpdate={setGuestProfile}
            />

            {/* Session Card */}
            <SessionCard
              guestProfile={guestProfile}
              flags={flags}
              onSessionUpdate={() => {
                // Handle session updates
              }}
            />

            {/* Flavor Composer */}
            <FlavorComposer
              guestProfile={guestProfile}
              flags={flags}
              onMixUpdate={() => {
                // Handle mix updates
              }}
            />

            {/* Price Breakdown */}
            <PriceBreakdown
              guestProfile={guestProfile}
              flags={flags}
              onPriceUpdate={() => {
                // Handle price updates
              }}
            />
          </div>

          {/* Right Column - Rewards & Social */}
          <div className="space-y-6">
            {/* Rewards Badge Strip */}
            {flags.rewards.badges.v1 && (
              <RewardsBadgeStrip
                guestProfile={guestProfile}
                flags={flags}
                onBadgeUpdate={() => {
                  // Handle badge updates
                }}
              />
            )}

            {/* Memory Breadcrumbs */}
            {flags.memory.breadcrumbs.v1 && (
              <MemoryBreadcrumbs
                guestProfile={guestProfile}
                flags={flags}
              />
            )}

            {/* Referral QR */}
            {flags.referral.qr.v1 && (
              <ReferralQR
                guestProfile={guestProfile}
                loungeId={loungeId}
                flags={flags}
                onReferralCreate={() => {
                  // Handle referral creation
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
