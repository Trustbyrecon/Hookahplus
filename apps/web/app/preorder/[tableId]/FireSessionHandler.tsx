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

      console.log('🔥 Creating Fire Session with Reflexive Orchestration (Hi Trust):', sessionData);

      // REFLEXIVE ORCHESTRATION: Create comprehensive session with BOH delivery preparation
      const sessionId = `session_${tableId}_${Date.now()}`;
      
      // Step 1: Create Fire Session
      const fireSessionResponse = await fetch('/api/fire-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          sessionId,
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

      if (!fireSessionResponse.ok) {
        const errorData = await fireSessionResponse.json();
        throw new Error(errorData.error || 'Failed to create Fire Session');
      }

      const fireSessionResult = await fireSessionResponse.json();
      console.log('✅ Fire Session created:', sessionId);

      // Step 2: Create BOH Delivery Preparation Order
      const bohOrderResponse = await fetch('/api/boh-delivery-prep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          tableId,
          orderDetails: {
            items: sessionData.selectedItems,
            flavors: sessionData.flavors,
            totalAmount: sessionData.totalAmount,
            customerInfo: sessionData.customerInfo,
            orderTime: sessionData.metadata.orderTime,
            priority: 'normal',
            estimatedPrepTime: 15, // minutes
            specialInstructions: 'Pre-order station order - prioritize for delivery'
          },
          deliveryInstructions: {
            tableLocation: tableId,
            customerName: sessionData.customerInfo.name,
            estimatedDeliveryTime: new Date(Date.now() + 15 * 60000).toISOString(),
            staffNotes: `Pre-order: ${sessionData.selectedItems.length} items, ${sessionData.flavors.length} hookah flavors`
          }
        })
      });

      if (bohOrderResponse.ok) {
        const bohOrder = await bohOrderResponse.json();
        console.log('✅ BOH Delivery Preparation Order created:', bohOrder.orderId);
      }

      // Step 3: Create Session in Supabase for BOH/FOH Integration
      const supabaseResponse = await fetch('/api/sessions-supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableId,
          customerName: sessionData.customerInfo.name,
          customerPhone: sessionData.customerInfo.phone,
          customerEmail: sessionData.customerInfo.email,
          flavors: sessionData.flavors,
          totalAmount: sessionData.totalAmount * 100, // Convert to cents
          source: 'preorder',
          metadata: sessionData.metadata,
          specialInstructions: 'Pre-order station order - prioritize for delivery',
          estimatedPrepTime: 15
        })
      });

      if (supabaseResponse.ok) {
        const supabaseData = await supabaseResponse.json();
        console.log('✅ Session created in Supabase:', supabaseData.session?.id);
      } else {
        console.error('⚠️ Failed to create session in Supabase');
      }

      // Also create session state for backward compatibility
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
