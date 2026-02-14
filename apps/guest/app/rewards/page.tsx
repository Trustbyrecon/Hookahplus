'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GuestProfile, FeatureFlags } from '@guest-types';
import { featureFlags } from '../../config/flags';
import RewardsBadgeStrip from '../../components/guest/RewardsBadgeStrip';
import MemoryBreadcrumbs from '../../components/guest/MemoryBreadcrumbs';
import ReferralQR from '../../components/guest/ReferralQR';
import { Shield, ArrowLeft, Flame, Clock } from 'lucide-react';
import { useGuestSessionContext } from '../../contexts/GuestSessionContext';
import { STATUS_TO_TRACKER_STAGE } from '../../../app/types/enhancedSession';
import Badge from '../../components/Badge';
import Card from '../../components/Card';

function RewardsContent() {
  const searchParams = useSearchParams();
  const { sessions, customerPhone, refreshSessions } = useGuestSessionContext();
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load sessions when customerPhone is available
  useEffect(() => {
    if (customerPhone) {
      refreshSessions();
    }
  }, [customerPhone, refreshSessions]);

  useEffect(() => {
    initializeGuest();
  }, []);

  const initializeGuest = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get customer phone from localStorage (primary identifier)
      const phone = customerPhone || localStorage.getItem('hookahplus_customer_phone');
      const name = localStorage.getItem('hookahplus_customer_name');
      
      // Get guest info from localStorage (legacy support)
      const guestInfoStr = localStorage.getItem('guestInfo');
      const guestId = localStorage.getItem('guestId');
      const deviceId = localStorage.getItem('deviceId') || `device_${Date.now()}`;

      if (!phone && !guestInfoStr && !guestId) {
        // Don't throw error, just show empty state
        setIsLoading(false);
        return;
      }

      let profile: GuestProfile | null = null;

      // Calculate real metrics from sessions
      const completedSessions = sessions.filter(s => s.status === 'CLOSED');
      const totalSessions = sessions.length;
      const favoriteFlavors = sessions
        .map(s => s.flavor)
        .reduce((acc, flavor) => {
          acc[flavor] = (acc[flavor] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      const topFlavor = Object.entries(favoriteFlavors).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
      
      // Calculate points (1 point per completed session, 5 bonus for 5+ sessions)
      const points = completedSessions.length + (completedSessions.length >= 5 ? 5 : 0);
      
      // Generate badges based on session history
      const badges: string[] = [];
      if (completedSessions.length >= 1) badges.push('Regular');
      if (completedSessions.length >= 5) badges.push('Loyalist');
      if (topFlavor) badges.push('MixMaster');
      if (sessions.some(s => s.status === 'ACTIVE')) badges.push('Explorer');

      if (guestInfoStr) {
        try {
          const info = JSON.parse(guestInfoStr);
          profile = {
            guestId: info.guestId || guestId || `guest_${Date.now()}`,
            anon: !phone && !info.email,
            phone: phone || info.phone,
            email: info.email,
            badges: badges.length > 0 ? badges : (info.badges || []),
            sessions: sessions.map(s => s.id),
            points: points || info.points || 0,
            createdAt: info.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deviceId: info.deviceId || deviceId,
            preferences: {
              favoriteFlavors: topFlavor ? [topFlavor] : (info.preferences?.favoriteFlavors || []),
              savedMixes: info.preferences?.savedMixes || [],
              notifications: info.preferences?.notifications || false
            }
          };
        } catch (e) {
          console.error('Failed to parse guest info:', e);
        }
      } else if (phone) {
        // Create profile from phone and session data
        profile = {
          guestId: guestId || `guest_${Date.now()}`,
          anon: false,
          phone: phone,
          name: name || undefined,
          badges: badges,
          sessions: sessions.map(s => s.id),
          points: points,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deviceId: deviceId,
          preferences: {
            favoriteFlavors: topFlavor ? [topFlavor] : [],
            savedMixes: [],
            notifications: false
          }
        };
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
        // Show empty state instead of error
        setIsLoading(false);
        return;
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

        {/* Session History Summary */}
        {sessions.length > 0 && (
          <div className="mb-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-400" />
                Session History
              </h2>
              <div className="space-y-3">
                {sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="p-3 bg-zinc-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-teal-400" />
                        <span className="font-medium">{session.tableId}</span>
                        <Badge className="bg-teal-500/20 text-teal-400 text-xs">
                          {STATUS_TO_TRACKER_STAGE[session.status as keyof typeof STATUS_TO_TRACKER_STAGE]}
                        </Badge>
                      </div>
                      <span className="text-xs text-zinc-400">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-zinc-300">
                      {session.flavor} • ${(session.amount / 100).toFixed(2)}
                    </div>
                  </div>
                ))}
                {sessions.length > 5 && (
                  <p className="text-xs text-zinc-400 text-center">
                    +{sessions.length - 5} more sessions
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}

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

