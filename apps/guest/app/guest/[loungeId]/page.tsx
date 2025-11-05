'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { QRData, GuestProfile, FeatureFlags } from '@guest-types';
import { featureFlags } from '../../../config/flags';
import QRGate from '../../../components/guest/QRGate';
import FlavorMixSelector from '../../../components/customer/FlavorMixSelector';
import SessionCard from '../../../components/guest/SessionCard';
import PriceBreakdown from '../../../components/guest/PriceBreakdown';
import RewardsBadgeStrip from '../../../components/guest/RewardsBadgeStrip';
import ReferralQR from '../../../components/guest/ReferralQR';
import MemoryBreadcrumbs from '../../../components/guest/MemoryBreadcrumbs';
import MobileOptimizedLayout from '../../../components/guest/MobileOptimizedLayout';
import MobileQRScanner from '../../../components/guest/MobileQRScanner';
import MobileFlavorSelector, { MOCK_FLAVORS } from '../../../components/guest/MobileFlavorSelector';
import SessionPricing from '../../../components/guest/SessionPricing';
import GuestIntelligenceDashboard from '../../../components/EnhancedStaffPanel';
import { UserPlus, Brain } from 'lucide-react';

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
  const [sessionType, setSessionType] = useState<'flat' | 'time-based'>('flat');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [flavorMixPrice, setFlavorMixPrice] = useState<number>(0);
  const [sessionStarted, setSessionStarted] = useState<boolean>(false); // Track if session started after payment
  const [showIntelligenceDashboard, setShowIntelligenceDashboard] = useState(false);

  useEffect(() => {
    initializeGuest();
    detectMobile();
  }, [loungeId]);

  // Safety timeout - if loading takes too long, show error
  useEffect(() => {
    if (!isLoading) return;
    
    const timeoutId = setTimeout(() => {
      console.error('Guest initialization timeout');
      setError('Loading is taking longer than expected. Please refresh the page.');
      setIsLoading(false);
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

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

      // Get guest info from localStorage (if registered)
      const guestInfoStr = localStorage.getItem('guestInfo');
      let guestInfo: { guestId?: string; deviceId?: string } | null = null;
      if (guestInfoStr) {
        try {
          guestInfo = JSON.parse(guestInfoStr);
        } catch (e) {
          console.warn('Failed to parse guestInfo from localStorage:', e);
        }
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
          guestId: guestInfo?.guestId || undefined, // Send guestId if registered
          deviceId: guestInfo?.deviceId || localStorage.getItem('deviceId') || undefined
        })
      });

      if (!enterResponse.ok) {
        const errorData = await enterResponse.json();
        throw new Error(errorData.error || 'Failed to enter guest');
      }

      const enterData = await enterResponse.json();
      
      if (enterData.isNewGuest) {
        // Store device ID for anonymous tracking
        if (!u && enterData.guestId) {
          const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('deviceId', deviceId);
        }
      }

      // Set guest profile - use existingProfile or create a fallback from enterData
      const profile = enterData.existingProfile || (enterData.guestId ? {
        guestId: enterData.guestId,
        anon: enterData.isNewGuest,
        badges: [],
        sessions: [],
        points: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        preferences: {
          favoriteFlavors: [],
          savedMixes: [],
          notifications: false
        }
      } : null);

      if (profile) {
        setGuestProfile(profile);
      } else {
        throw new Error('Failed to initialize guest profile');
      }

      // Log guest entry event (client-side logging only - server-side logging happens in API)
      if (loungeFlags.ghostlog.lite) {
        const eventPayload = {
          loungeId,
          ref,
          isNewGuest: enterData.isNewGuest,
          qrData,
          timestamp: new Date().toISOString()
        };

        // Client-side logging only - actual ghostlog entry is created server-side in /api/guest/enter
        console.log('Guest entry:', eventPayload);
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
      return newSelection;
    });
  };

  const handleClearAllFlavors = () => {
    setSelectedFlavors([]);
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
            {qrData?.tableId && (
              <MobileFlavorSelector
                flavors={MOCK_FLAVORS}
                selectedFlavors={selectedFlavors}
                onFlavorToggle={handleFlavorToggle}
                onClearAll={handleClearAllFlavors}
                basePrice={3000} // $30.00 base price
              />
            )}

            {/* Session Pricing */}
            {qrData?.tableId && (
              <SessionPricing
                sessionType={sessionType}
                onSessionTypeChange={setSessionType}
              />
            )}

            {/* Order Review & Checkout */}
            {selectedFlavors.length > 0 && (
              <PriceBreakdown
                guestProfile={guestProfile}
                flags={flags}
                selectedFlavors={selectedFlavors}
                specialInstructions={specialInstructions}
                loungeId={loungeId}
                tableId={qrData?.tableId}
                zone={qrData?.zone}
                sessionType={sessionType}
                onPriceUpdate={() => {}}
                onCheckoutSuccess={(sessionId) => {
                  setSessionStarted(true);
                }}
              />
            )}

            {/* Session Status - Only after payment */}
            {sessionStarted && (
              <SessionCard
                guestProfile={guestProfile}
                flags={flags}
                showSession={sessionStarted}
                onSessionUpdate={() => {}}
              />
            )}

            {/* Registration Prompt for Anonymous Users - Mobile */}
            {guestProfile?.anon && (
              <div className="bg-gradient-to-r from-teal-900/20 to-cyan-900/20 border border-teal-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <UserPlus className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white mb-1">
                      Register to Remember
                    </h3>
                    <p className="text-xs text-zinc-300 mb-3">
                      Save your preferences and rewards for next time.
                    </p>
                    <Link
                      href={`/register?loungeId=${encodeURIComponent(loungeId)}&return=${encodeURIComponent(`/guest/${loungeId}`)}`}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      <UserPlus className="w-3 h-3" />
                      Register
                    </Link>
                  </div>
                </div>
              </div>
            )}

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
                <p className="text-sm text-zinc-400">Light the Flame. Feel the Flow.</p>
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
          {/* Left Column - Main Flow (Step-by-Step Workflow) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: QR Gate */}
            <QRGate
              qrData={qrData}
              guestProfile={guestProfile}
              flags={flags}
              onProfileUpdate={setGuestProfile}
            />

            {/* Step 2: Session Pricing (replaces Live Mix Preview) */}
            {qrData && (
              <SessionPricing
                sessionType={sessionType}
                onSessionTypeChange={setSessionType}
              />
            )}

            {/* Step 3: Flavor Selection - Always show after QRGate */}
            {qrData && (
              <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-2">Choose Your Flavors</h2>
                  <p className="text-sm text-zinc-400">Select up to 4 flavors for your perfect mix</p>
                </div>
                
                <FlavorMixSelector
                  selectedFlavors={selectedFlavors}
                  onSelectionChange={setSelectedFlavors}
                  maxSelections={4}
                  onPriceUpdate={setFlavorMixPrice}
                />
                
                {/* Special Instructions */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-white mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any special requests or notes for your mix (e.g., extra ice, light flavor, strong mix)..."
                    className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Order Review & Checkout */}
            {selectedFlavors.length > 0 && (
              <PriceBreakdown
                guestProfile={guestProfile}
                flags={flags}
                selectedFlavors={selectedFlavors}
                specialInstructions={specialInstructions}
                loungeId={loungeId}
                tableId={qrData?.tableId}
                zone={qrData?.zone}
                sessionType={sessionType}
                onPriceUpdate={() => {
                  // Handle price updates
                }}
                onCheckoutSuccess={(sessionId) => {
                  // Start session after successful checkout
                  setSessionStarted(true);
                  console.log('Session started after checkout:', sessionId);
                }}
              />
            )}

            {/* Order Cart Summary - Always visible when flavors are selected */}
            {selectedFlavors.length > 0 && (
              <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Your Order</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">Selected Flavors:</span>
                    <span className="text-sm font-medium text-white">{selectedFlavors.length} selected</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedFlavors.map((flavor, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-500/20 text-primary-400 text-sm rounded-full border border-primary-500/30"
                      >
                        {flavor}
                      </span>
                    ))}
                  </div>
                  {specialInstructions && (
                    <div className="mt-3 p-3 bg-zinc-700/50 rounded-lg">
                      <span className="text-xs text-zinc-400">Special Instructions:</span>
                      <p className="text-sm text-zinc-300 mt-1">{specialInstructions}</p>
                    </div>
                  )}
                  <div className="pt-3 border-t border-zinc-700 flex items-center justify-between">
                    <span className="text-lg font-semibold text-white">Estimated Total:</span>
                    <span className="text-xl font-bold text-teal-400">
                      ${flavorMixPrice > 0 ? (flavorMixPrice / 100).toFixed(2) : '30.00'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Session Status (only after payment) */}
            {sessionStarted && (
              <SessionCard
                guestProfile={guestProfile}
                flags={flags}
                showSession={sessionStarted}
                onSessionUpdate={() => {
                  // Handle session updates
                }}
              />
            )}
          </div>

          {/* Right Column - Rewards & Social */}
          <div className="space-y-6">
            {/* Registration Prompt for Anonymous Users */}
            {guestProfile?.anon && (
              <div className="bg-gradient-to-r from-teal-900/20 to-cyan-900/20 border border-teal-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <UserPlus className="w-6 h-6 text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Register to Remember
                    </h3>
                    <p className="text-sm text-zinc-300 mb-4">
                      Quick registration saves your preferences, favorite flavors, and rewards so we can personalize your next visit.
                    </p>
                    <Link
                      href={`/register?loungeId=${encodeURIComponent(loungeId)}&return=${encodeURIComponent(`/guest/${loungeId}`)}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      Register Now
                    </Link>
                  </div>
                </div>
              </div>
            )}

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

            {/* Guest Intelligence Dashboard Button */}
            {guestProfile && !guestProfile.anon && (
              <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
                <button
                  onClick={() => setShowIntelligenceDashboard(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all"
                >
                  <Brain className="w-5 h-5" />
                  <span>Guest Intelligence Dashboard</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guest Intelligence Dashboard Modal */}
      {showIntelligenceDashboard && guestProfile && flags && (
        <GuestIntelligenceDashboard
          sessionId={sessionStarted ? 'current-session' : undefined}
          tableId={qrData?.tableId}
          guestProfile={guestProfile}
          flags={flags}
          onClose={() => setShowIntelligenceDashboard(false)}
        />
      )}
    </div>
  );
}
