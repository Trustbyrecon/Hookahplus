"use client";

import React, { useState } from 'react';
import { Zap, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Button from './Button';

interface TestSessionButtonProps {
  tableId: string;
}

export function TestSessionButton({ tableId }: TestSessionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  const handleTestSession = async () => {
    setIsLoading(true);
    setStatus('processing');
    setError('');

    try {
      // Create test session
      const response = await fetch('/api/test-session/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableId,
          customerInfo: {
            name: 'Test Customer',
            phone: '(555) 123-4567'
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create test session');
      }

      // Simulate payment processing
      setStatus('processing');
      
      // Simulate Stripe payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful payment
      setStatus('success');
      
      // Redirect to success page after a short delay
      setTimeout(() => {
        window.location.href = '/checkout/success?session_id=test_session&amount=100';
      }, 1500);

    } catch (err: any) {
      console.error('Test session error:', err);
      setStatus('error');
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case 'processing':
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing $1 Test...
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Test Session Created!
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4 mr-2" />
            Try Again
          </>
        );
      default:
        return (
          <>
            <Zap className="w-4 h-4 mr-2" />
            Start $1 Test Session
          </>
        );
    }
  };

  const getButtonStyle = () => {
    switch (status) {
      case 'success':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'error':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return 'bg-green-500 hover:bg-green-600 text-white';
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleTestSession}
        disabled={isLoading || status === 'processing'}
        className={`w-full ${getButtonStyle()}`}
      >
        {getButtonContent()}
      </Button>

      {status === 'success' && (
        <div className="text-center">
          <p className="text-sm text-green-400 mb-2">
            ✅ Test session created successfully!
          </p>
          <p className="text-xs text-zinc-500">
            Redirecting to session dashboard...
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center">
          <p className="text-sm text-red-400 mb-2">
            ❌ {error}
          </p>
          <p className="text-xs text-zinc-500">
            Please try again or contact support
          </p>
        </div>
      )}

      {status === 'idle' && (
        <div className="text-center">
          <p className="text-xs text-zinc-500">
            This will create a test hookah session with a $1 payment
          </p>
        </div>
      )}
    </div>
  );
}
