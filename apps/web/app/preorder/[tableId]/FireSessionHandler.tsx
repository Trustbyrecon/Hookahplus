// apps/web/app/preorder/[tableId]/FireSessionHandler.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PreOrderItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'hookah' | 'drinks' | 'food' | 'desserts';
  image: string;
  popular: boolean;
  inStock: boolean;
}

interface FireSessionHandlerProps {
  tableId: string;
  selectedItems: PreOrderItem[];
  customerInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  onSessionCreated?: (sessionId: string) => void;
}

export default function FireSessionHandler({ 
  tableId, 
  selectedItems, 
  customerInfo,
  onSessionCreated 
}: FireSessionHandlerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFireSession = async () => {
    if (selectedItems.length === 0) {
      setError('Please add items to your order before starting a Fire Session');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Extract hookah flavors from selected items
      const hookahItems = selectedItems.filter(item => item.category === 'hookah');
      const flavors = hookahItems.map(item => item.name);
      
      // Calculate total amount
      const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);
      
      // Create session data
      const sessionData = {
        tableId,
        flavors,
        selectedItems: selectedItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.category,
          image: item.image
        })),
        customerInfo: {
          name: customerInfo?.name || 'Customer',
          phone: customerInfo?.phone || '+1 (555) 123-4567',
          email: customerInfo?.email || 'customer@hookahplus.com'
        },
        totalAmount,
        source: 'preorder',
        metadata: {
          tableId,
          orderTime: new Date().toISOString(),
          itemCount: selectedItems.length,
          hookahCount: hookahItems.length
        }
      };

      console.log('🔥 Creating Fire Session with data:', sessionData);

      // Create the session via API
      const response = await fetch('/api/fire-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          sessionId: `session_${tableId}_${Date.now()}`,
          tableId,
          flavorMix: {
            flavors,
            strength: 'medium',
            buildTest: false
          },
          prepStaffId: 'prep_staff_1',
          metadata: sessionData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create Fire Session');
      }

      const result = await response.json();
      const sessionId = result.session.id;

      console.log('✅ Fire Session created:', sessionId);

      // Also create a session in the session state system
      await createSessionState(sessionData, sessionId);

      // Navigate to Fire Session Dashboard with session data
      const params = new URLSearchParams({
        sessionId,
        tableId,
        fromPreOrder: 'true',
        flavors: flavors.join(','),
        totalAmount: totalAmount.toString()
      });

      router.push(`/fire-session-dashboard?${params.toString()}`);

      if (onSessionCreated) {
        onSessionCreated(sessionId);
      }

    } catch (err: any) {
      console.error('❌ Failed to create Fire Session:', err);
      setError(err.message || 'Failed to create Fire Session');
    } finally {
      setIsLoading(false);
    }
  };

  const createSessionState = async (sessionData: any, sessionId: string) => {
    try {
      // Create session in the session state system
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          tableId: sessionData.tableId,
          state: 'PAID_CONFIRMED',
          meta: {
            customerId: sessionData.customerInfo.name,
            phone: sessionData.customerInfo.phone,
            email: sessionData.customerInfo.email,
            flavors: sessionData.flavors,
            selectedItems: sessionData.selectedItems,
            totalAmount: sessionData.totalAmount,
            source: 'preorder'
          },
          timers: {
            createdAt: Date.now(),
            paidAt: Date.now()
          }
        })
      });

      if (response.ok) {
        console.log('✅ Session state created for BOH/FOH flow');
      }
    } catch (err) {
      console.error('⚠️ Failed to create session state:', err);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <button
        onClick={handleFireSession}
        disabled={isLoading || selectedItems.length === 0}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
          selectedItems.length === 0
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : isLoading
            ? 'bg-orange-600 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Creating Fire Session...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            🔥 Fire Session
            {selectedItems.length > 0 && (
              <span className="ml-2 text-sm opacity-75">
                ({selectedItems.length} items)
              </span>
            )}
          </div>
        )}
      </button>
    </div>
  );
}
