'use client';

import React, { useState } from 'react';
import { X, Lock, CreditCard, CheckCircle } from 'lucide-react';

interface DemoStripeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sessionData: {
    table: string;
    customerName: string;
    customerPhone?: string;
    basePrice: number;
    addons: string[];
    total: number;
  };
}

export default function DemoStripeModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  sessionData 
}: DemoStripeModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/25');
  const [cvc, setCvc] = useState('123');
  const [name, setName] = useState(sessionData.customerName || '');
  const [email, setEmail] = useState('demo@example.com');
  const [zipCode, setZipCode] = useState('12345');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const addonItems = [
    { id: 'mint', label: 'Mint', price: 2.50 },
    { id: 'mango', label: 'Mango', price: 2.00 },
    { id: 'strawberry', label: 'Strawberry', price: 2.00 },
    { id: 'peach', label: 'Peach', price: 2.50 },
  ];

  const addonTotal = sessionData.addons.reduce((sum, addonId) => {
    const item = addonItems.find(a => a.id === addonId);
    return sum + (item?.price || 0);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Stripe Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <Lock className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-white font-semibold text-lg">Stripe</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Badge */}
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2">
          <p className="text-xs text-yellow-800 text-center">
            🎭 <strong>Demo Mode:</strong> This is a simulated Stripe checkout. No real payment will be processed.
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Order Summary */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Hookah Session - Table {sessionData.table}</span>
                <span className="text-gray-900 font-medium">${sessionData.basePrice.toFixed(2)}</span>
              </div>
              {sessionData.addons.length > 0 && (
                <>
                  {sessionData.addons.map(addonId => {
                    const item = addonItems.find(a => a.id === addonId);
                    return item ? (
                      <div key={addonId} className="flex justify-between text-sm">
                        <span className="text-gray-600">+ {item.label} Add-on</span>
                        <span className="text-gray-900 font-medium">${item.price.toFixed(2)}</span>
                      </div>
                    ) : null;
                  })}
                </>
              )}
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-lg text-gray-900">${sessionData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Information
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  placeholder="1234 1234 1234 1234"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry
                </label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                  placeholder="MM/YY"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVC
                </label>
                <input
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  maxLength={3}
                  placeholder="123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name on Card
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
                placeholder="12345"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
            <Lock className="w-4 h-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay ${sessionData.total.toFixed(2)}</span>
              </>
            )}
          </button>

          {/* Demo Notice */}
          <p className="mt-4 text-xs text-center text-gray-500">
            Powered by Stripe • Demo Mode
          </p>
        </form>
      </div>
    </div>
  );
}

