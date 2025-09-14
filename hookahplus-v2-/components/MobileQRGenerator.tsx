// hookahplus-v2-/components/MobileQRGenerator.tsx
"use client";

import { useState } from 'react';

interface MobileQRGeneratorProps {
  onOrderCreated?: (order: any) => void;
}

export default function MobileQRGenerator({ onOrderCreated }: MobileQRGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<string | null>(null);

  const generateMobileQR = async () => {
    setIsGenerating(true);
    
    try {
      // Generate mobile QR demo data
      const mobileOrder = {
        id: `mobile_${Date.now()}`,
        tableId: `T-${Math.floor(Math.random() * 10) + 1}`,
        flavor: ['Double Apple', 'Mint', 'Strawberry', 'Grape'][Math.floor(Math.random() * 4)],
        amount: 2500 + Math.floor(Math.random() * 2000),
        status: 'paid',
        createdAt: Date.now(),
        customerName: `Mobile Customer ${Math.floor(Math.random() * 100)}`,
        customerId: `cust_${Math.floor(Math.random() * 1000)}`,
        partySize: Math.floor(Math.random() * 4) + 1,
        estimatedWait: Math.floor(Math.random() * 10) + 1,
        priority: Math.floor(Math.random() * 4) + 1 > 4 ? 'high' : 'normal'
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Log the order details
      console.log('Mobile QR Order Created:', {
        tableId: mobileOrder.tableId,
        customerName: mobileOrder.customerName,
        partySize: mobileOrder.partySize,
        flavor: mobileOrder.flavor,
        estimatedWait: mobileOrder.estimatedWait,
        priority: mobileOrder.priority
      });
      
      // Set visual feedback
      setLastCreatedOrder(mobileOrder.tableId);
      setTimeout(() => setLastCreatedOrder(null), 3000); // Clear after 3 seconds
      
      // Notify parent component (this will update the Floor Queue)
      if (onOrderCreated) {
        onOrderCreated(mobileOrder);
      }
    } catch (error) {
      console.error('Error creating mobile QR order:', error);
      // Create fallback order without modal
      const fallbackOrder = {
        id: `mobile_${Date.now()}`,
        tableId: `T-${Math.floor(Math.random() * 10) + 1}`,
        flavor: 'Double Apple',
        customerName: 'Mobile Customer',
        partySize: 2,
        estimatedWait: 5,
        priority: 'normal'
      };
      
      // Set visual feedback for fallback
      setLastCreatedOrder(fallbackOrder.tableId);
      setTimeout(() => setLastCreatedOrder(null), 3000);
      
      if (onOrderCreated) {
        onOrderCreated(fallbackOrder);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={generateMobileQR}
        disabled={isGenerating}
        className={`px-6 py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
          lastCreatedOrder 
            ? 'bg-green-600 text-white shadow-lg scale-105' 
            : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}
      >
        {isGenerating ? '🔄 Generating...' : '📱 Generate Mobile QR'}
      </button>
      {lastCreatedOrder && (
        <div className="text-sm text-green-600 font-medium animate-pulse">
          ✅ Order created for {lastCreatedOrder}
        </div>
      )}
    </div>
  );
}
