"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  CreditCard,
  Settings,
  Trash2,
  RefreshCw,
  ExternalLink,
  Calendar,
  MapPin,
  Shield
} from 'lucide-react';
import GlobalNavigation from '../../../components/GlobalNavigation';
import { Card, Button, Badge } from '../../../components';

interface SquareStatus {
  connected: boolean;
  isActive: boolean;
  isExpired: boolean;
  merchantId?: string;
  locationIds?: string[];
  expiresAt?: string;
  createdAt?: string;
}

function SquareSettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const loungeIdParam = searchParams.get('loungeId');
  const [loungeId, setLoungeId] = useState(loungeIdParam || 'HOPE_GLOBAL_FORUM'); // Default lounge ID
  const [status, setStatus] = useState<SquareStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const connected = searchParams.get('connected') === 'true';

  useEffect(() => {
    loadStatus();
  }, [loungeId]);

  useEffect(() => {
    if (loungeIdParam && loungeIdParam !== loungeId) {
      setLoungeId(loungeIdParam);
    }
  }, [loungeIdParam, loungeId]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/square/status?loungeId=${loungeId}`);
      const data = await response.json();
      
      if (data.success) {
        setStatus(data);
      }
    } catch (error) {
      console.error('Error loading Square status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Square account? This will stop automatic syncing.')) {
      return;
    }

    try {
      setDisconnecting(true);
      const response = await fetch('/api/square/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loungeId })
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus({ connected: false, isActive: false, isExpired: false });
        router.push('/square/connect');
      } else {
        alert('Failed to disconnect: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error disconnecting Square:', error);
      alert('Failed to disconnect Square account');
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <GlobalNavigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Settings className="w-8 h-8 text-teal-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Square Settings
            </h1>
          </div>
          <p className="text-xl text-zinc-400">
            Manage your Square POS integration
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
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
                Status and connection are shown for this lounge.
              </p>
            </div>
            <Button onClick={loadStatus} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </Card>

        {connected && (
          <Card className="p-6 mb-6 border-green-500/30 bg-green-500/10">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Successfully connected!</span>
            </div>
          </Card>
        )}

        {status?.connected ? (
          <div className="space-y-6">
            {/* Connection Status */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    status.isActive ? 'bg-green-500/20' : 'bg-yellow-500/20'
                  }`}>
                    <CreditCard className={`w-6 h-6 ${
                      status.isActive ? 'text-green-400' : 'text-yellow-400'
                    }`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Square Connected</h2>
                    <p className="text-sm text-zinc-400">Merchant ID: {status.merchantId}</p>
                  </div>
                </div>
                <Badge className={
                  status.isActive 
                    ? 'bg-green-500/20 text-green-400' 
                    : status.isExpired
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }>
                  {status.isActive ? 'Active' : status.isExpired ? 'Expired' : 'Inactive'}
                </Badge>
              </div>

              {status.isExpired && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-semibold">Token Expired</span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    Your Square access token has expired. Please reconnect your account.
                  </p>
                  <Button
                    onClick={() => router.push('/square/connect')}
                    className="mt-3"
                    variant="outline"
                  >
                    Reconnect Square
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-700">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-zinc-400">Locations</p>
                    <p className="text-white font-semibold">
                      {status.locationIds?.length || 0} location(s)
                    </p>
                  </div>
                </div>

                {status.expiresAt && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-zinc-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-zinc-400">Expires</p>
                      <p className="text-white font-semibold">
                        {new Date(status.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {status.createdAt && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-zinc-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-zinc-400">Connected</p>
                      <p className="text-white font-semibold">
                        {new Date(status.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Security Info */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-semibold text-white">Security</h3>
              </div>
              <p className="text-sm text-zinc-400 mb-4">
                Your Square credentials are encrypted and stored securely. Access tokens are automatically refreshed when needed.
              </p>
              <div className="flex items-center space-x-2 text-sm text-zinc-500">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>OAuth 2.0 secure authentication</span>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={loadStatus}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Status
                </Button>
                <Button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  variant="outline"
                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  {disconnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Disconnect
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-zinc-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Square Not Connected</h2>
              <p className="text-zinc-400 max-w-md">
                Connect your Square account to enable automatic POS synchronization and order management.
              </p>
              <Button
                onClick={() => router.push('/square/connect')}
                className="mt-6"
              >
                Connect Square Account
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function SquareSettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <GlobalNavigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        </div>
      </div>
    }>
      <SquareSettingsContent />
    </Suspense>
  );
}

