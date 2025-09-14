// hookahplus-v2-/components/MobileQRGenerator.tsx
"use client";

import { useState } from 'react';

interface MobileQRGeneratorProps {
  onOrderCreated?: (order: any) => void;
}

export default function MobileQRGenerator({ onOrderCreated }: MobileQRGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

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

      // Show success message
      alert(`Mobile QR order created for ${mobileOrder.tableId}! Check the prep queue.`);
      
      // Log the order details
      console.log('Mobile QR Order Created:', {
        tableId: mobileOrder.tableId,
        customerName: mobileOrder.customerName,
        partySize: mobileOrder.partySize,
        flavor: mobileOrder.flavor,
        estimatedWait: mobileOrder.estimatedWait,
        priority: mobileOrder.priority
      });
      
      // Notify parent component
      if (onOrderCreated) {
        onOrderCreated(mobileOrder);
      }
    } catch (error) {
      console.error('Error creating mobile QR order:', error);
      // Still show success message for demo purposes
      const fallbackOrder = {
        id: `mobile_${Date.now()}`,
        tableId: `T-${Math.floor(Math.random() * 10) + 1}`,
        flavor: 'Double Apple',
        customerName: 'Mobile Customer',
        partySize: 2,
        estimatedWait: 5,
        priority: 'normal'
      };
      
      alert(`Mobile QR order created for ${fallbackOrder.tableId}! Check the prep queue.`);
      
      if (onOrderCreated) {
        onOrderCreated(fallbackOrder);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generateMobileQR}
      disabled={isGenerating}
      className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? '🔄 Generating...' : '📱 Generate Mobile QR'}
    </button>
  );
}
