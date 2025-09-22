"use client";

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, StepIndicator, FlowProgress } from '../../components';
import { 
  CreditCard, 
  CheckCircle,
  ArrowRight,
  Shield,
  Clock,
  AlertCircle,
  User,
  MapPin,
  Star,
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
  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Simulate checkout data from URL params or state
  useEffect(() => {
    // In a real app, this would come from URL params or state management
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

  const checkoutSteps = [
    {
      id: 'review',
      title: 'Review Order',
      description: 'Confirm your selection and details',
      status: (currentStep >= 1 ? (currentStep > 1 ? 'completed' : 'current') : 'upcoming') as 'completed' | 'current' | 'upcoming'
    },
    {
      id: 'payment',
      title: 'Payment',
      description: 'Secure payment processing',
      status: (currentStep >= 2 ? (currentStep > 2 ? 'completed' : 'current') : 'upcoming') as 'completed' | 'current' | 'upcoming'
    },
    {
      id: 'confirmation',
      title: 'Confirmation',
      description: 'Order confirmed and session started',
      status: (currentStep >= 3 ? 'completed' : 'upcoming') as 'completed' | 'current' | 'upcoming'
    }
  ];

  const handlePayment = async () => {
    setPaymentProcessing(true);
    setCurrentStep(2);
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentSuccess(true);
      setPaymentProcessing(false);
      setCurrentStep(3);
      
      // Update checkout data
      if (checkoutData) {
        setCheckoutData({
          ...checkoutData,
          status: 'completed'
        });
      }
    }, 3000);
  };

  const handleStartSession = () => {
    // Redirect to session page or start session
    window.location.href = '/customer-flow';
  };

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H+</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-400">Checkout</h1>
                <p className="text-sm text-zinc-400">Complete your hookah session order</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-sm text-zinc-400">Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="mb-12">
          <StepIndicator 
            steps={checkoutSteps}
            orientation="horizontal"
            className="mb-6"
          />
          <FlowProgress 
            currentStep={currentStep}
            totalSteps={3}
            showPercentage={true}
            size="lg"
            variant="success"
          />
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
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
            </Card>

            {/* Payment Method */}
            <Card className="bg-zinc-900 border-zinc-800 p-6">
              <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-zinc-800 rounded-lg border-2 border-green-500">
                  <CreditCard className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="font-medium">Card ending in 4242</div>
                    <div className="text-sm text-zinc-400">Expires 12/25</div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-zinc-800 rounded-lg">
                  <CreditCard className="w-6 h-6 text-zinc-400" />
                  <div>
                    <div className="font-medium">Card ending in 1234</div>
                    <div className="text-sm text-zinc-400">Expires 08/24</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-zinc-800 rounded-lg">
                  <CreditCard className="w-6 h-6 text-zinc-400" />
                  <div>
                    <div className="font-medium">Add new card</div>
                    <div className="text-sm text-zinc-400">Save for future use</div>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full mt-6 bg-green-600 hover:bg-green-700"
                onClick={handlePayment}
              >
                <Lock className="w-5 h-5 mr-2" />
                Pay ${checkoutData.total.toFixed(2)}
              </Button>
              
              <p className="text-xs text-zinc-500 text-center mt-4">
                Your payment is secured with 256-bit SSL encryption
              </p>
            </Card>
          </div>
        )}

        {currentStep === 2 && (
          <div className="text-center">
            <Card className="bg-zinc-900 border-zinc-800 p-12 max-w-2xl mx-auto">
              {paymentProcessing ? (
                <div>
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-6"></div>
                  <h3 className="text-2xl font-semibold mb-4">Processing Payment</h3>
                  <p className="text-zinc-400 mb-6">
                    Please wait while we process your payment securely...
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-green-400">
                    <Shield className="w-5 h-5" />
                    <span>Secure payment in progress</span>
                  </div>
                </div>
              ) : paymentSuccess ? (
                <div>
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold mb-4 text-green-400">Payment Successful!</h3>
                  <p className="text-zinc-400 mb-6">
                    Your payment has been processed successfully. Your session will begin shortly.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span>Order confirmed</span>
                  </div>
                </div>
              ) : (
                <div>
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold mb-4 text-red-400">Payment Failed</h3>
                  <p className="text-zinc-400 mb-6">
                    There was an issue processing your payment. Please try again.
                  </p>
                  <Button 
                    variant="primary" 
                    onClick={() => setCurrentStep(1)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {currentStep === 3 && (
          <div className="text-center">
            <Card className="bg-zinc-900 border-zinc-800 p-12 max-w-2xl mx-auto">
              <div className="mb-8">
                <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4 text-green-400">Order Confirmed!</h2>
                <p className="text-xl text-zinc-400 mb-6">
                  Your hookah session is ready to begin
                </p>
              </div>
              
              <div className="bg-zinc-800 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">Session Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Table:</span>
                    <span className="font-semibold">{checkoutData.tableId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Flavors:</span>
                    <span className="font-semibold">{checkoutData.flavors.map(f => f.name).join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Total:</span>
                    <span className="font-semibold text-green-400">${checkoutData.total.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Status:</span>
                    <Badge className="bg-green-500 text-white">Confirmed</Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleStartSession}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Your Session
                </Button>
                
                <p className="text-sm text-zinc-500">
                  Your session will begin immediately. Staff will be notified to prepare your hookah.
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
