'use client';

import React, { useState, useEffect } from 'react';
import { QRData, GuestProfile, FeatureFlags } from '@guest-types';
import { createGhostLogEntry } from '../../libs/ghostlog/hash';
import { Shield, User, Smartphone, Clock, CheckCircle, UserPlus } from 'lucide-react';
import Link from 'next/link';

interface QRGateProps {
  qrData: QRData;
  guestProfile: GuestProfile;
  flags: FeatureFlags;
  onProfileUpdate: (profile: GuestProfile) => void;
  /** When true, session was already resolved by enter (canonical resolver); skip Start Session tap */
  initialSessionStarted?: boolean;
}

export default function QRGate({ qrData, guestProfile, flags, onProfileUpdate, initialSessionStarted }: QRGateProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(!!initialSessionStarted);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSessionStarted) setSessionStarted(true);
  }, [initialSessionStarted]);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [joinMode, setJoinMode] = useState<string | null>(null);

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
      if (sessionData?.participantId) setParticipantId(sessionData.participantId);
      if (sessionData?.mode) setJoinMode(sessionData.mode);
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

  const handleNotMe = async () => {
    if (!qrData.tableId) return;
    setIsStarting(true);
    setError(null);
    try {
      const response = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loungeId: qrData.loungeId,
          tableId: qrData.tableId,
          guestId: guestProfile.guestId,
          customerName: 'Guest',
          notMe: true,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || data?.error || 'Unable to create a new guest slot');
      }

      setParticipantId(data?.session?.participantId || null);
      setJoinMode(data?.session?.mode || 'join');
      setSessionStarted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to switch guest');
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

      {/* Register Prompt - Above Table ID */}
      {guestProfile.anon && (
        <div className="mb-6 bg-gradient-to-r from-teal-900/20 to-cyan-900/20 border border-teal-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <UserPlus className="w-5 h-5 text-teal-400 mt-0.5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white mb-1">
                Register to Remember
              </h3>
              <p className="text-xs text-zinc-300 mb-3">
                Save your preferences and rewards for next time.
              </p>
              <Link
                href={`/register?loungeId=${encodeURIComponent(qrData.loungeId)}&return=${encodeURIComponent(`/guest/${qrData.loungeId}`)}`}
                className="inline-flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <UserPlus className="w-3 h-3" />
                Register Now
              </Link>
            </div>
          </div>
        </div>
      )}

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
              {qrData.tableId ? `Table: ${qrData.tableId}` : 'ID: ' + guestProfile.guestId}
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

      {/* Canonical enforcement: no tableId means no session creation/join */}
      {!qrData.tableId && !sessionStarted ? (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              Scan Your Table QR Code
            </h3>
            <p className="text-sm text-zinc-400">
              This link doesn’t include a table. Scan the QR code on your table to continue.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="p-3 bg-zinc-900/40 border border-zinc-700 rounded-lg text-xs text-zinc-400">
            Tip: Ask staff for the correct table QR if you don’t see one.
          </div>
        </div>
      ) : qrData.tableId && !sessionStarted ? (
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-green-400">
            <CheckCircle className="w-6 h-6" />
            <span className="text-lg font-semibold">You are joining Table {qrData.tableId}</span>
          </div>
          <p className="text-sm text-zinc-400">Is this you?</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleStartSession}
              disabled={isStarting}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              Yes, continue
            </button>
            <button
              onClick={handleNotMe}
              disabled={isStarting}
              className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 disabled:opacity-50"
            >
              Not me
            </button>
          </div>
        </div>
      ) : sessionStarted ? (
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-green-400">
            <CheckCircle className="w-6 h-6" />
            <span className="text-lg font-semibold">Session Started!</span>
          </div>
          <p className="text-sm text-zinc-400">
            Your session is now active. Choose your flavors and customize your experience.
          </p>
          {joinMode ? (
            <p className="text-xs text-zinc-500">
              Join mode: {joinMode}{participantId ? ` • Participant ${participantId.slice(0, 8)}` : ''}
            </p>
          ) : null}
        </div>
      ) : null}

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
