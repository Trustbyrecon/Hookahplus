'use client';

import { useState } from 'react';
import DollarTestButton from '@/components/DollarTestButton';

export default function ExtendSession() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExtend = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/session/extend/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId: '550e8400-e29b-41d4-a716-446655440000', // Demo venue
          sessionId: 'demo-session-123',
          priceLookupKey: 'price_extended_time_20m'
        })
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create extension checkout');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Extend Your Session
        </h1>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900">Add 20 Minutes</h3>
            <p className="text-sm text-blue-700">Extend your hookah session for $10.00</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <button
            onClick={handleExtend}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Extend Session - $10.00'}
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Ops Sandbox</h2>
          <DollarTestButton />
        </div>
      </div>
    </div>
  );
}
