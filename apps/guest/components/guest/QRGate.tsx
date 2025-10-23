'use client';

import React, { useState, useEffect } from 'react';
import { QRData, GuestProfile, FeatureFlags } from '../../types/guest';
import { createGhostLogEntry } from '../../libs/ghostlog/hash';
import { Shield, User, Smartphone, Clock, CheckCircle } from 'lucide-react';

interface QRGateProps {
  qrData: QRData;
  guestProfile: GuestProfile;
  flags: FeatureFlags;
  onProfileUpdate: (profile: GuestProfile) => void;
}

export default function QRGate({ qrData, guestProfile, flags, onProfileUpdate }: QRGateProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartSession = async () => {
    try {
      setIsStarting(true);
      setError(null);

      // Start session
      const response = await fetch('/api/guest/session/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loungeId: qrData.loungeId,
          guestId: guestProfile.guestId,
          tableId: qrData.tableId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start session');
      }

      const sessionData = await response.json();
      setSessionStarted(true);

      // Log session start event
      if (flags.ghostlog.lite) {
        const eventPayload = {
          sessionId: sessionData.sessionId,
          loungeId: qrData.loungeId,
          guestId: guestProfile.guestId,
          tableId: qrData.tableId,
          timestamp: new Date().toISOString()
        };

        const ghostLogEntry = createGhostLogEntry('session.started', eventPayload);
        console.log('Session start logged:', ghostLogEntry);
      }

    } catch (err) {
      console.error('Start session error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setIsStarting(false);
    }
  };

  const handleOptIn = async () => {
    try {
      // In production, this would prompt for phone/email
      const phone = prompt('Enter your phone number (optional):');
      const email = prompt('Enter your email (optional):');

      if (phone || email) {
        const updatedProfile = {
          ...guestProfile,
          anon: false,
          phone: phone || undefined,
          email: email || undefined,
          updatedAt: new Date().toISOString()
        };

        onProfileUpdate(updatedProfile);

        // Log opt-in event
        if (flags.ghostlog.lite) {
          const eventPayload = {
            guestId: guestProfile.guestId,
            loungeId: qrData.loungeId,
            phone: !!phone,
            email: !!email,
            timestamp: new Date().toISOString()
          };

          const ghostLogEntry = createGhostLogEntry('guest.opt_in', eventPayload);
          console.log('Guest opt-in logged:', ghostLogEntry);
        }
      }
    } catch (err) {
      console.error('Opt-in error:', err);
    }
  };

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-primary-500/20 rounded-lg">
          <Shield className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Welcome to Hookah+</h2>
          <p className="text-sm text-zinc-400">Scan complete - Ready to start your session</p>
        </div>
      </div>

      {/* Guest Status */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 p-4 bg-zinc-700/50 rounded-lg">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <User className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-white">
                {guestProfile.anon ? 'Anonymous Guest' : 'Registered Guest'}
              </span>
              {guestProfile.anon && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                  Anonymous
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              ID: {guestProfile.guestId}
            </p>
          </div>
        </div>

        {/* Opt-in prompt for anonymous guests */}
        {guestProfile.anon && flags.guest.anonymousMode && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <Smartphone className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-400 mb-1">
                  Unlock Full Experience
                </h3>
                <p className="text-xs text-zinc-400 mb-3">
                  Link your phone or email to save your preferences, earn rewards, and access exclusive features.
                </p>
                <button
                  onClick={handleOptIn}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Link Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Session Start */}
      {!sessionStarted ? (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              Ready to Start Your Session?
            </h3>
            <p className="text-sm text-zinc-400 mb-4">
              {qrData.tableId ? `Table: ${qrData.tableId}` : 'Choose your table and flavors'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={handleStartSession}
            disabled={isStarting}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isStarting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Starting Session...</span>
              </>
            ) : (
              <>
                <Clock className="w-5 h-5" />
                <span>Start Session</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-green-400">
            <CheckCircle className="w-6 h-6" />
            <span className="text-lg font-semibold">Session Started!</span>
          </div>
          <p className="text-sm text-zinc-400">
            Your session is now active. Choose your flavors and customize your experience.
          </p>
        </div>
      )}

      {/* QR Data Debug (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-3 bg-zinc-900/50 rounded-lg">
          <h4 className="text-xs font-medium text-zinc-400 mb-2">QR Data (Debug)</h4>
          <pre className="text-xs text-zinc-500 overflow-x-auto">
            {JSON.stringify(qrData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
