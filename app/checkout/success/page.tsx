'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SecurePaymentNotice from '../../../components/SecurePaymentNotice';

export default function Success() {
  const searchParams = useSearchParams();
  const checkoutSessionId = searchParams.get('sid');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createSession = async () => {
      if (!checkoutSessionId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch checkout session details from Stripe
        const stripeResponse = await fetch(`/.netlify/functions/getSessionNotes?checkoutSessionId=${checkoutSessionId}`);
        
        // Create session in our database
        const sessionResponse = await fetch('/api/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            table: 'Unassigned', // Will be updated when table is assigned
            flavors: [], // Will be populated from Stripe metadata
            start_time: new Date().toISOString(),
            refills: 0,
            notes: [],
          }),
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          setSessionId(sessionData.id.toString());

          // Generate QR code URL (we'll create a simple one)
          // In production, use a QR code library
          const qrUrl = `/api/qr?sessionId=${sessionData.id}`;
          setQrCode(qrUrl);
        }
      } catch (error) {
        console.error('Error creating session:', error);
      } finally {
        setLoading(false);
      }
    };

    createSession();
  }, [checkoutSessionId]);

  if (loading) {
    return (
      <main style={{ maxWidth: 760, margin: '64px auto', padding: '0 16px', display: 'grid', gap: 12 }}>
        <h1>Processing your payment...</h1>
        <p>Please wait while we confirm your session.</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 760, margin: '64px auto', padding: '0 16px', display: 'grid', gap: 12 }}>
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-green-400">? Payment Successful!</h1>
        <p className="text-lg text-gray-300">Thanks! Your Hookah+ session is confirmed.</p>
      </div>

      {sessionId && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Session Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Session ID:</span>
              <span className="text-white font-mono">{sessionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Checkout Session:</span>
              <span className="text-white font-mono text-xs">{checkoutSessionId?.substring(0, 20)}...</span>
            </div>
          </div>
        </div>
      )}

      {qrCode && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Session QR Code</h2>
          <p className="text-sm text-gray-400 mb-4">
            Show this QR code to staff to start your session
          </p>
          <div className="bg-white p-4 rounded-lg inline-block">
            {/* QR Code placeholder - in production, use a QR code library */}
            <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-600 text-xs">
              QR Code
              <br />
              Session: {sessionId}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Session ID: {sessionId}
          </p>
        </div>
      )}

      <SecurePaymentNotice />

      <div className="flex gap-4 justify-center">
        <a
          href="/"
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Back to Home
        </a>
        <a
          href="/dashboard"
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          View Dashboard
        </a>
      </div>
    </main>
  );
}
