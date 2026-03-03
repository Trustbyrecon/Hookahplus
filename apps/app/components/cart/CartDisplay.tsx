"use client";

import React, { useState } from "react";
import { useCart } from "./CartProvider";
import { ShoppingCart, Minus, Plus, Trash2, CreditCard, CheckCircle } from "lucide-react";
import Button from "../Button";

function cents(n: number) {
  return `$${(n / 100).toFixed(2)}`;
}

export function CartDisplay() {
  const { items, remove, subtotal, itemCount } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setIsProcessing(true);
    setPaymentStatus('processing');
    
    try {
      // For development/testing, simulate successful payment
      // In production, this would integrate with Stripe Checkout
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate payment processing
      
      setPaymentStatus('success');
      
      // Create fire session after successful payment
      await createFireSession(items);
      
    } catch (error) {
      console.error('Checkout error:', error);
      setPaymentStatus('error');
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const createFireSession = async (cartItems: any[]) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: 'T-001', // Default table
          customerRef: 'Customer',
          flavor: cartItems.map(item => item.name).join(', '),
          priceCents: subtotal,
          state: 'NEW',
          assignedBOHId: 'boh-staff-1',
          assignedFOHId: 'foh-staff-1'
        })
      });
      
      if (response.ok) {
        // Redirect to Fire Session Dashboard
        window.location.href = '/fire-session-dashboard';
      }
    } catch (error) {
      console.error('Session creation error:', error);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <ShoppingCart className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <p className="text-zinc-400">Your cart is empty. Add items to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cart Items */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex items-center space-x-3 p-3 bg-zinc-800/50 rounded-lg">
            <div className="text-lg">{item.icon || "🍃"}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{item.name}</div>
              {item.description && (
                <div className="text-xs text-zinc-400 truncate">{item.description}</div>
              )}
              <div className="text-xs font-semibold text-teal-400">{cents(item.price)}</div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="w-6 h-6 p-0 flex items-center justify-center"
                onClick={() => remove(item.id)}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="text-sm font-medium w-6 text-center">{item.qty}</span>
              <Button
                size="sm"
                variant="outline"
                className="w-6 h-6 p-0 flex items-center justify-center"
                onClick={() => remove(item.id)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-6 h-6 p-0 flex items-center justify-center text-red-400 hover:text-red-300"
              onClick={() => remove(item.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="border-t border-zinc-700 pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-zinc-400">Subtotal ({itemCount} items)</span>
          <span className="text-lg font-semibold text-white">{cents(subtotal)}</span>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            className={`w-full ${
              paymentStatus === 'success' 
                ? 'btn-pretty-success' 
                : paymentStatus === 'error'
                ? 'btn-pretty-danger'
                : 'btn-pretty-primary'
            }`}
            onClick={handleCheckout}
            disabled={isProcessing || items.length === 0}
            loading={isProcessing}
          >
            {paymentStatus === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Payment Successful!
              </>
            ) : isProcessing ? (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Processing Payment...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Proceed to Checkout
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
