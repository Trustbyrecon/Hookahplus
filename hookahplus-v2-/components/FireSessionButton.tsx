// components/FireSessionButton.tsx
'use client';

import React, { useState } from 'react';

interface FireSessionButtonProps {
  tableId: string;
  flavor: string;
  customerInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  onSessionFired?: (session: any) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

export default function FireSessionButton({
  tableId,
  flavor,
  customerInfo = {},
  onSessionFired,
  className = '',
  size = 'md',
  variant = 'primary',
  disabled = false
}: FireSessionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFireSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/demo-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'fire-session',
          tableId,
          flavor,
          customerInfo: {
            name: customerInfo.name || 'Demo Customer',
            phone: customerInfo.phone || '+1 (555) 123-4567',
            email: customerInfo.email || 'demo@hookahplus.com',
            ...customerInfo
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('🔥 Fire session triggered:', result.message);
        
        if (onSessionFired) {
          onSessionFired(result.session);
        }
        
        // Show success feedback
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      } else {
        throw new Error(result.error || 'Failed to fire session');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Failed to fire session:', errorMessage);
      setIsLoading(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'outline':
        return 'border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white';
      default:
        return 'bg-orange-600 hover:bg-orange-700 text-white';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleFireSession}
        disabled={disabled || isLoading}
        className={`
          ${getSizeClasses()}
          ${getVariantClasses()}
          ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          rounded-lg font-medium transition-colors duration-200
          flex items-center space-x-2
          ${className}
        `}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Firing...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            <span>Fire Session</span>
          </>
        )}
      </button>

      {error && (
        <div className="absolute top-full left-0 mt-2 bg-red-900 border border-red-700 text-red-100 px-3 py-2 rounded-lg text-sm z-10 whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
}

// Quick Fire Session Buttons for different pathways
export function QuickFireButtons() {
  const [selectedTable, setSelectedTable] = useState('T-001');
  const [selectedFlavor, setSelectedFlavor] = useState('Blue Mist + Mint');

  const tables = ['T-001', 'T-002', 'T-003', 'B-001', 'B-002', 'L-001', 'L-002'];
  const flavors = [
    'Blue Mist + Mint',
    'Strawberry + Vanilla',
    'Grape + Mint',
    'Rose + Cardamom',
    'Coconut + Pineapple',
    'Lavender + Honey'
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Quick Fire Session</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Table</label>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {tables.map(table => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Flavor</label>
          <select
            value={selectedFlavor}
            onChange={(e) => setSelectedFlavor(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {flavors.map(flavor => (
              <option key={flavor} value={flavor}>{flavor}</option>
            ))}
          </select>
        </div>
      </div>

      <FireSessionButton
        tableId={selectedTable}
        flavor={selectedFlavor}
        size="lg"
        className="w-full"
        onSessionFired={(session) => {
          console.log('Session fired:', session);
        }}
      />
    </div>
  );
}

// Fire Session Button for Layout Preview
export function LayoutPreviewFireButton({ 
  tableId, 
  flavor, 
  onSessionFired 
}: { 
  tableId: string; 
  flavor: string; 
  onSessionFired?: (session: any) => void;
}) {
  return (
    <FireSessionButton
      tableId={tableId}
      flavor={flavor}
      size="md"
      onSessionFired={onSessionFired}
    />
  );
}

// Fire Session Button for QR Check-in
export function QRCheckinFireButton({ 
  tableId, 
  flavor, 
  customerInfo,
  onSessionFired 
}: { 
  tableId: string; 
  flavor: string; 
  customerInfo?: any;
  onSessionFired?: (session: any) => void;
}) {
  return (
    <FireSessionButton
      tableId={tableId}
      flavor={flavor}
      customerInfo={customerInfo}
      size="lg"
      variant="primary"
      onSessionFired={onSessionFired}
    />
  );
}
