'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GuestProfile, FeatureFlags } from '@guest-types';
import { featureFlags } from '../../config/flags';
import GlobalNavigation from '../../components/GlobalNavigation';
import RewardsBadgeStrip from '../../components/guest/RewardsBadgeStrip';
import MemoryBreadcrumbs from '../../components/guest/MemoryBreadcrumbs';
import ReferralQR from '../../components/guest/ReferralQR';
import { Shield, ArrowLeft } from 'lucide-react';

function RewardsContent() {
  const searchParams = useSearchParams();
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeGuest();
  }, []);

  const initializeGuest = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get guest info from localStorage
      const guestInfoStr = localStorage.getItem('guestInfo');
      const guestId = localStorage.getItem('guestId');
      const deviceId = localStorage.getItem('deviceId') || `device_${Date.now()}`;

      if (!guestInfoStr && !guestId) {
        throw new Error('No guest information found. Please visit the lounge first.');
      }

      let profile: GuestProfile | null = null;

      if (guestInfoStr) {
        try {
          const info = JSON.parse(guestInfoStr);
          profile = {
            guestId: info.guestId || guestId || `guest_${Date.now()}`,
            anon: !info.phone && !info.email,
            phone: info.phone,
            email: info.email,
            badges: info.badges || [],
            sessions: info.sessions || [],
            points: info.points || 0,
            createdAt: info.createdAt || new Date().toISOString(),
            updatedAt: info.updatedAt || new Date().toISOString(),
            deviceId: info.deviceId || deviceId,
            preferences: info.preferences || {
              favoriteFlavors: [],
              savedMixes: [],
              notifications: false
            }
          };
        } catch (e) {
          console.error('Failed to parse guest info:', e);
        }
      }

      if (!profile && guestId) {
        // Try to get profile from API
        const enterResponse = await fetch('/api/guest/enter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            loungeId: searchParams.get('loungeId') || 'default-lounge',
            guestId,
            deviceId
          })
        });

        if (enterResponse.ok) {
          const enterData = await enterResponse.json();
          if (enterData.existingProfile) {
            profile = enterData.existingProfile;
          }
        }
      }

      if (!profile) {
        throw new Error('Unable to load guest profile');
      }

      setGuestProfile(profile);

      // Get feature flags
      const loungeId = searchParams.get('loungeId') || 'default-lounge';
      const loungeFlags = featureFlags.getLoungeFlags(loungeId);
      setFlags(loungeFlags);

    } catch (err) {
      console.error('Guest initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize guest');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <GlobalNavigation currentPage="rewards" />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-zinc-400">Loading your rewards...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !guestProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <GlobalNavigation currentPage="rewards" />
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-semibold text-white">Error Loading Rewards</h2>
            </div>
            <p className="text-red-400 mb-4">{error || 'Guest profile not found'}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const loungeId = searchParams.get('loungeId') || 'default-lounge';

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation currentPage="rewards" />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/guest/${loungeId}`}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Lounge</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Your Rewards</h1>
          <p className="text-zinc-400">Track your points, badges, and session history</p>
        </div>

        {/* Cards Stack */}
        <div className="space-y-6">
          {/* Card 1: Your Rewards */}
          {flags?.rewards.badges.v1 && (
            <RewardsBadgeStrip
              guestProfile={guestProfile}
              flags={flags}
              onBadgeUpdate={() => {
                // Refresh profile if needed
                initializeGuest();
              }}
            />
          )}

          {/* Card 2: Last Session */}
          {flags?.memory.breadcrumbs.v1 && (
            <MemoryBreadcrumbs
              guestProfile={guestProfile}
              flags={flags}
            />
          )}

          {/* Card 3: Invite Friends */}
          {flags?.referral.qr.v1 && (
            <ReferralQR
              guestProfile={guestProfile}
              loungeId={loungeId}
              flags={flags}
              onReferralCreate={() => {
                // Refresh profile if needed
                initializeGuest();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function RewardsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <GlobalNavigation currentPage="rewards" />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-zinc-400">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <RewardsContent />
    </Suspense>
  );
}

