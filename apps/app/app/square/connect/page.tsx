"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  CreditCard,
  ArrowRight,
  Shield,
  Zap
} from 'lucide-react';
import GlobalNavigation from '../../../components/GlobalNavigation';
import { Card, Button, Badge } from '../../../components';

function SquareConnectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const loungeIdParam = searchParams.get('loungeId');
  const [loungeId, setLoungeId] = useState(loungeIdParam || 'HOPE_GLOBAL_FORUM'); // Default lounge ID
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const success = searchParams.get('connected') === 'true';
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (loungeIdParam && loungeIdParam !== loungeId) {
      setLoungeId(loungeIdParam);
    }
    if (errorParam) {
      const decodedError = decodeURIComponent(errorParam);
      setError(decodedError);
      
      // Provide helpful messages for common errors
      if (decodedError === 'missing_params') {
        setError('OAuth callback missing required parameters. Please try connecting again. Make sure the redirect URL in Square matches exactly: http://localhost:3002/api/square/oauth/callback');
      } else if (decodedError === 'invalid_state') {
        setError('Security validation failed. Please try connecting again.');
      } else if (decodedError === 'missing_lounge') {
        setError('Lounge ID not found. Please try connecting again.');
      }
    }
  }, [errorParam]);

  const handleConnect = () => {
    setLoading(true);
    setError(null);
    
    // Redirect to OAuth authorization
    window.location.href = `/api/square/oauth/authorize?loungeId=${loungeId}`;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <GlobalNavigation />
        
        <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">Square Connected!</h1>
              <p className="text-zinc-400">
                Your Square account has been successfully connected to Hookah+.
              </p>
              <Button
                onClick={() => router.push('/square/settings')}
                className="mt-6"
              >
                Go to Square Settings
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Connect Square
          </h1>
          <p className="text-xl text-zinc-400">
            Connect your Square account to enable POS integration
          </p>
        </div>

        {error && (
          <Card className="p-6 mb-6 border-red-500/30 bg-red-500/10">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Error:</span>
              <span>{error}</span>
            </div>
          </Card>
        )}

        <Card className="p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center">
                <CreditCard className="w-10 h-10 text-teal-400" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-white text-center">
                Square POS Integration
              </h2>
              <p className="text-zinc-400 text-center">
                Connect your Square account to sync sessions, orders, and payments automatically.
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-zinc-700">
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-teal-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white">Automatic Sync</h3>
                  <p className="text-sm text-zinc-400">
                    Sessions and orders sync automatically with your Square POS
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-teal-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white">Secure Connection</h3>
                  <p className="text-sm text-zinc-400">
                    Your credentials are encrypted and stored securely
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white">Easy Setup</h3>
                  <p className="text-sm text-zinc-400">
                    Connect in just a few clicks through Square's secure OAuth flow
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Lounge ID
                </label>
                <input
                  value={loungeId}
                  onChange={(e) => setLoungeId(e.target.value)}
                  placeholder="e.g. HOPE_GLOBAL_FORUM"
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
                <p className="mt-2 text-xs text-zinc-500">
                  This is the Hookah+ lounge key used to store your Square merchant mapping.
                </p>
              </div>
              <Button
                onClick={handleConnect}
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold py-4 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect Square Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-zinc-500 text-center pt-4">
              By connecting, you authorize Hookah+ to access your Square account data.
              You can disconnect at any time from settings.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function SquareConnectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <GlobalNavigation />
        <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-400" />
          </Card>
        </div>
      </div>
    }>
      <SquareConnectContent />
    </Suspense>
  );
}

