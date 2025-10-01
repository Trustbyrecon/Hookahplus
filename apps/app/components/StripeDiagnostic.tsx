'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export function StripeDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStripe = async () => {
      try {
        const response = await fetch('/api/check-stripe');
        const data = await response.json();
        setDiagnostics(data);
      } catch (error) {
        setDiagnostics({ error: 'Failed to fetch diagnostics' });
      } finally {
        setIsLoading(false);
      }
    };

    checkStripe();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm text-gray-300">Checking Stripe configuration...</span>
        </div>
      </div>
    );
  }

  if (!diagnostics) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
        <div className="flex items-center gap-2 text-red-300">
          <XCircle className="w-4 h-4" />
          <span className="text-sm">Failed to load diagnostics</span>
        </div>
      </div>
    );
  }

  const hasStripeKey = diagnostics.stripe?.hasSecretKey;
  const hasPublicKey = diagnostics.stripe?.hasPublicKey;

  return (
    <div className="p-4 bg-gray-800 rounded-lg space-y-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-medium text-white">Stripe Configuration</span>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Environment:</span>
          <span className="text-white">{diagnostics.environment?.nodeEnv || 'unknown'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Vercel:</span>
          <span className="text-white">{diagnostics.environment?.vercel ? 'Yes' : 'No'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Secret Key:</span>
          <div className="flex items-center gap-1">
            {hasStripeKey ? (
              <CheckCircle className="w-3 h-3 text-green-400" />
            ) : (
              <XCircle className="w-3 h-3 text-red-400" />
            )}
            <span className={hasStripeKey ? 'text-green-400' : 'text-red-400'}>
              {hasStripeKey ? 'Present' : 'Missing'}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Public Key:</span>
          <div className="flex items-center gap-1">
            {hasPublicKey ? (
              <CheckCircle className="w-3 h-3 text-green-400" />
            ) : (
              <XCircle className="w-3 h-3 text-red-400" />
            )}
            <span className={hasPublicKey ? 'text-green-400' : 'text-red-400'}>
              {hasPublicKey ? 'Present' : 'Missing'}
            </span>
          </div>
        </div>
        
        {hasStripeKey && (
          <div className="flex justify-between">
            <span className="text-gray-400">Key Length:</span>
            <span className="text-white">{diagnostics.stripe?.secretKeyLength} chars</span>
          </div>
        )}
      </div>
    </div>
  );
}
