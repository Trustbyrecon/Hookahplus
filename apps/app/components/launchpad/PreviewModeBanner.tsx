'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PreviewModeBannerProps {
  loungeId: string;
  onActivate?: () => void;
}

export function PreviewModeBanner({ loungeId, onActivate }: PreviewModeBannerProps) {
  const [modeStatus, setModeStatus] = useState<{
    mode: 'preview' | 'live';
    message: string;
    canActivate: boolean;
    subscriptionStatus?: {
      active: boolean;
      plan?: string;
      trialDaysRemaining?: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModeStatus() {
      try {
        const response = await fetch(`/api/launchpad/mode-status/${loungeId}`);
        if (response.ok) {
          const data = await response.json();
          setModeStatus(data.status);
        }
      } catch (error) {
        console.error('[Preview Mode Banner] Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchModeStatus();
  }, [loungeId]);

  if (loading || !modeStatus || modeStatus.mode === 'live') {
    return null; // Don't show banner if live or loading
  }

  const handleActivate = async () => {
    try {
      const response = await fetch(`/api/launchpad/activate/${loungeId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        if (onActivate) {
          onActivate();
        }
        // Refresh page to show live mode
        window.location.reload();
      } else {
        alert(data.message || 'Failed to activate lounge');
      }
    } catch (error) {
      console.error('[Activate Lounge] Error:', error);
      alert('Failed to activate lounge. Please try again.');
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-600/50 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="bg-amber-900/40 p-2 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              Preview Mode Active
            </h3>
            <p className="text-sm text-amber-200 mb-2">
              {modeStatus.message}
            </p>
            {modeStatus.subscriptionStatus?.trialDaysRemaining !== undefined && (
              <p className="text-xs text-amber-300/80 mb-2">
                {modeStatus.subscriptionStatus.trialDaysRemaining} trial days remaining
              </p>
            )}
            <div className="text-xs text-amber-300/70 space-y-1">
              <p>• Sessions are disabled in preview mode</p>
              <p>• QR codes show preview links only</p>
              <p>• Analytics and loyalty features are limited</p>
            </div>
          </div>
        </div>
        {modeStatus.canActivate && (
          <button
            onClick={handleActivate}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
          >
            <Zap className="w-4 h-4" />
            Activate Lounge
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

