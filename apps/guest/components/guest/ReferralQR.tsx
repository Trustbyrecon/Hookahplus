'use client';

import React, { useState, useEffect } from 'react';
import { GuestProfile, FeatureFlags, ReferralCreateResponse } from '../../../types/guest';
import { createGhostLogEntry } from '../../libs/ghostlog/hash';
import { QrCode, Share2, Copy, Users, Gift, ExternalLink } from 'lucide-react';

interface ReferralQRProps {
  guestProfile: GuestProfile;
  loungeId: string;
  flags: FeatureFlags;
  onReferralCreate: () => void;
}

export default function ReferralQR({ guestProfile, loungeId, flags, onReferralCreate }: ReferralQRProps) {
  const [referralData, setReferralData] = useState<ReferralCreateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Don't auto-create referral, let user initiate
  }, []);

  const createReferral = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/guest/referral/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loungeId,
          inviterGuestId: guestProfile.guestId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create referral');
      }

      const data = await response.json();
      setReferralData(data);
      onReferralCreate();

      // Log referral creation event
      if (flags.ghostlog.lite) {
        const eventPayload = {
          code: data.code,
          loungeId,
          inviterGuestId: guestProfile.guestId,
          url: data.url,
          timestamp: new Date().toISOString()
        };

        const ghostLogEntry = createGhostLogEntry('referral.created', eventPayload);
        console.log('Referral creation logged:', ghostLogEntry);
      }

    } catch (err) {
      console.error('Create referral error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create referral');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const shareReferral = async () => {
    if (!referralData) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me at Hookah+',
          text: 'Check out this amazing hookah lounge!',
          url: referralData.url
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback to copy
      copyToClipboard(referralData.url);
    }
  };

  if (error) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <QrCode className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Referral Error</h2>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
        <button
          onClick={createReferral}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!referralData) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <QrCode className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Invite Friends</h2>
            <p className="text-sm text-zinc-400">Earn rewards for bringing friends</p>
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="p-4 bg-zinc-700/50 rounded-lg">
            <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-white mb-2">Share the Experience</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Create a referral link and earn 50 points for each friend who joins!
            </p>
          </div>

          <button
            onClick={createReferral}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <QrCode className="w-5 h-5" />
                <span>Create Referral Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <QrCode className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Your Referral Link</h2>
          <p className="text-sm text-zinc-400">Share and earn rewards</p>
        </div>
      </div>

      {/* QR Code */}
      <div className="text-center mb-6">
        <div className="inline-block p-4 bg-white rounded-lg">
          {referralData.qrCode ? (
            <img
              src={referralData.qrCode}
              alt="Referral QR Code"
              className="w-32 h-32"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
              <QrCode className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>
        <p className="text-xs text-zinc-400 mt-2">Scan to join this lounge</p>
      </div>

      {/* Referral Code */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-2">
          Referral Code
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={referralData.code}
            readOnly
            className="flex-1 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white font-mono text-sm"
          />
          <button
            onClick={() => copyToClipboard(referralData.code)}
            className="px-3 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        {copied && (
          <p className="text-xs text-green-400 mt-1">Copied to clipboard!</p>
        )}
      </div>

      {/* Referral URL */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-2">
          Referral Link
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={referralData.url}
            readOnly
            className="flex-1 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm truncate"
          />
          <button
            onClick={() => copyToClipboard(referralData.url)}
            className="px-3 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Share Actions */}
      <div className="space-y-2">
        <button
          onClick={shareReferral}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Share with Friends</span>
        </button>
        
        <button
          onClick={() => window.open(referralData.url, '_blank')}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open Link</span>
        </button>
      </div>

      {/* Rewards Info */}
      <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Gift className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-green-400">Earn Rewards</span>
        </div>
        <p className="text-xs text-zinc-400">
          Get 50 points for each friend who joins using your link. 
          They'll also get a welcome bonus!
        </p>
      </div>

      {/* Trust Lock Indicator */}
      {flags.ghostlog.lite && (
        <div className="mt-4 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span className="text-xs text-green-400">
              Referral tracking secured with Trust Lock
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
