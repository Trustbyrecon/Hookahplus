"use client";

import React, { useState, useEffect } from 'react';
import GlobalNavigation from '../../components/GlobalNavigation';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  CreditCard, 
  CheckCircle,
  Shield,
  Clock,
  AlertCircle,
  Zap,
  Lock
} from 'lucide-react';

interface CheckoutData {
  customerId: string;
  tableId: string;
  flavors: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export default function CheckoutPage() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card_4242');
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Simulate checkout data from URL params or state
  useEffect(() => {
    const mockCheckoutData: CheckoutData = {
      customerId: 'cust_1234567890',
      tableId: 'T-015',
      flavors: [
        { id: '1', name: 'Blue Mist', price: 15.99, quantity: 1 },
        { id: '2', name: 'Mint', price: 12.99, quantity: 1 }
      ],
      subtotal: 28.98,
      tax: 2.32,
      total: 31.30,
      paymentMethod: 'card_4242',
      status: 'pending'
    };
    setCheckoutData(mockCheckoutData);
  }, []);

  const paymentMethods = [
    {
      id: 'card_4242',
      name: 'Card ending in 4242',
      description: 'Expires 12/25',
      icon: CreditCard,
      popular: true
    },
    {
      id: 'card_1234',
      name: 'Card ending in 1234',
      description: 'Expires 08/24',
      icon: CreditCard,
      popular: false
    },
    {
      id: 'new_card',
      name: 'Add new card',
      description: 'Save for future use',
      icon: CreditCard,
      popular: false
    }
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/customer-flow';
      }, 2000);
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation currentPage="checkout" />
      
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Complete Your Order</h1>
          <p className="text-zinc-400">Review your session details and complete payment</p>
        </div>

        <Card className="p-8">
          {success ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-400 mb-2">Payment Successful!</h2>
              <p className="text-zinc-400 mb-6">Your hookah session is ready to begin</p>
              <Button 
                variant="primary" 
                onClick={() => window.location.href = '/customer-flow'}
                className="w-full"
              >
                Start Your Session
              </Button>
            </div>
          ) : (
            <>
              {/* Order Summary */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Table:</span>
                    <span className="font-semibold">{checkoutData.tableId}</span>
                  </div>
                  
                  <div className="space-y-3">
                    {checkoutData.flavors.map((flavor) => (
                      <div key={flavor.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{flavor.name}</div>
                          <div className="text-sm text-zinc-400">Qty: {flavor.quantity}</div>
                        </div>
                        <div className="text-green-400 font-semibold">
                          ${flavor.price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-zinc-700 pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Subtotal:</span>
                      <span className="font-semibold">${checkoutData.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Tax:</span>
                      <span className="font-semibold">${checkoutData.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-green-400">${checkoutData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>
                
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedPaymentMethod === method.id
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedPaymentMethod === method.id
                              ? 'border-green-500 bg-green-500'
                              : 'border-zinc-600'
                          }`}>
                            {selectedPaymentMethod === method.id && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                            )}
                          </div>
                          <method.icon className="w-5 h-5 text-zinc-400" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{method.name}</span>
                              {method.popular && (
                                <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                                  Popular
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-zinc-400">{method.description}</p>
                          </div>
                        </div>
                        {selectedPaymentMethod === method.id && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400">{error}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="p-4 bg-zinc-800 rounded-lg">
                  <h3 className="font-medium mb-2">Payment Details</h3>
                  <div className="space-y-2 text-sm text-zinc-400">
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="text-white">{paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="text-green-400 font-semibold">
                        ${checkoutData.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Security:</span>
                      <span className="text-green-400">256-bit SSL encrypted</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handlePayment}
                  disabled={isProcessing}
                  leftIcon={<Lock className="w-4 h-4" />}
                >
                  {isProcessing ? 'Processing Payment...' : `Pay $${checkoutData.total.toFixed(2)}`}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = '/'}
                >
                  Cancel Order
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Security Info */}
        <Card className="mt-6 p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <Shield className="w-5 h-5 text-green-400 mr-2" />
            Secure Payment
          </h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>• Your payment information is encrypted and secure</li>
            <li>• We use industry-standard SSL encryption</li>
            <li>• Your card details are never stored on our servers</li>
            <li>• All transactions are processed securely through Stripe</li>
            <li>• You can cancel your order before payment is processed</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
