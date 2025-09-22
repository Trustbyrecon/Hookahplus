"use client";

import React, { useState } from 'react';
import { Card, Button, Badge, StepIndicator, FlowProgress, QRScanner, FlavorSelector, SessionTimer } from '../../components';
import { 
  QrCode, 
  ShoppingCart, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Flame,
  User,
  CreditCard,
  Zap
} from 'lucide-react';

export default function CustomerFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState(false);

  const flowSteps = [
    {
      id: 'scan',
      title: 'Scan QR Code',
      description: 'Point your camera at the QR code on your table',
      status: (currentStep >= 1 ? (currentStep > 1 ? 'completed' : 'current') : 'upcoming') as 'completed' | 'current' | 'upcoming'
    },
    {
      id: 'select',
      title: 'Choose Flavors',
      description: 'Select your preferred hookah flavors',
      status: (currentStep >= 2 ? (currentStep > 2 ? 'completed' : 'current') : 'upcoming') as 'completed' | 'current' | 'upcoming'
    },
    {
      id: 'confirm',
      title: 'Confirm Order',
      description: 'Review and confirm your selection',
      status: (currentStep >= 3 ? (currentStep > 3 ? 'completed' : 'current') : 'upcoming') as 'completed' | 'current' | 'upcoming'
    },
    {
      id: 'enjoy',
      title: 'Enjoy Session',
      description: 'Your hookah session is ready!',
      status: (currentStep >= 4 ? 'completed' : 'upcoming') as 'completed' | 'current' | 'upcoming'
    }
  ];

  const flavors = [
    {
      id: '1',
      name: 'Blue Mist',
      description: 'Classic sweet and smooth blueberry flavor',
      category: 'tobacco' as const,
      intensity: 'medium' as const,
      price: 15.99,
      isPopular: true
    },
    {
      id: '2',
      name: 'Double Apple',
      description: 'Sweet and tangy apple flavor',
      category: 'tobacco' as const,
      intensity: 'medium' as const,
      price: 14.99,
      isPopular: true
    },
    {
      id: '3',
      name: 'Mint',
      description: 'Cool and refreshing mint sensation',
      category: 'tobacco' as const,
      intensity: 'light' as const,
      price: 12.99
    },
    {
      id: '4',
      name: 'Grape',
      description: 'Sweet and juicy grape flavor',
      category: 'tobacco' as const,
      intensity: 'medium' as const,
      price: 13.99
    },
    {
      id: '5',
      name: 'Custom Mix',
      description: 'Create your own flavor combination',
      category: 'mixed' as const,
      intensity: 'strong' as const,
      price: 18.99,
      isFavorite: true
    }
  ];

  const handleQRScan = (data: string) => {
    setScannedData(data);
    setCurrentStep(2);
  };

  const handleFlavorSelection = (flavorIds: string[]) => {
    setSelectedFlavors(flavorIds);
    if (flavorIds.length > 0) {
      setCurrentStep(3);
    }
  };

  const handleConfirmOrder = () => {
    setCurrentStep(4);
    setSessionActive(true);
  };

  const getTotalPrice = () => {
    return selectedFlavors.reduce((total, flavorId) => {
      const flavor = flavors.find(f => f.id === flavorId);
      return total + (flavor?.price || 0);
    }, 0);
  };

  const getSelectedFlavors = () => {
    return selectedFlavors.map(id => flavors.find(f => f.id === id)).filter(Boolean);
  };

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
                <h1 className="text-2xl font-bold text-green-400">Hookah+</h1>
                <p className="text-sm text-zinc-400">Experience the future of lounge sessions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-zinc-400">Flow Status</div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold">{currentStep * 25}%</span>
                  <span className="text-sm">🔥</span>
                </div>
                <div className="text-xs text-zinc-500">
                  {currentStep === 1 ? 'Scanning' : 
                   currentStep === 2 ? 'Selecting' : 
                   currentStep === 3 ? 'Confirming' : 'Active'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="mb-12">
          <StepIndicator 
            steps={flowSteps}
            orientation="horizontal"
            className="mb-6"
          />
          <FlowProgress 
            currentStep={currentStep}
            totalSteps={4}
            showPercentage={true}
            size="lg"
            variant="success"
          />
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Welcome to Hookah+</h2>
            <p className="text-xl text-zinc-400 mb-8">
              Scan the QR code on your table to start your personalized hookah experience
            </p>
            <QRScanner 
              onScan={handleQRScan}
              onError={(error) => console.error('QR Scan Error:', error)}
              className="max-w-md mx-auto"
            />
            {scannedData && (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>Table {scannedData} detected!</span>
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="text-3xl font-bold mb-4">Choose Your Flavors</h2>
            <p className="text-xl text-zinc-400 mb-8">
              Select up to 3 flavors for your perfect hookah session
            </p>
            <FlavorSelector
              flavors={flavors}
              selectedFlavors={selectedFlavors}
              onSelectionChange={handleFlavorSelection}
              maxSelections={3}
            />
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-3xl font-bold mb-4">Confirm Your Order</h2>
            <p className="text-xl text-zinc-400 mb-8">
              Review your selection and proceed to payment
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Summary */}
              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3">
                  {getSelectedFlavors().map((flavor) => (
                    <div key={flavor?.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{flavor?.name}</div>
                        <div className="text-sm text-zinc-400">{flavor?.description}</div>
                      </div>
                      <div className="text-green-400 font-semibold">
                        ${flavor?.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-zinc-700 pt-3">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-green-400">${getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Payment Options */}
              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h3 className="text-xl font-semibold mb-4">Payment</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-zinc-800 rounded-lg">
                    <CreditCard className="w-6 h-6 text-blue-400" />
                    <div>
                      <div className="font-medium">Card ending in 4242</div>
                      <div className="text-sm text-zinc-400">Expires 12/25</div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleConfirmOrder}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Start Fire Session - ${getTotalPrice().toFixed(2)}
                  </Button>
                  
                  <p className="text-xs text-zinc-500 text-center">
                    Your session will begin immediately after payment confirmation
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Session Active!</h2>
            <p className="text-xl text-zinc-400 mb-8">
              Your hookah session is ready. Enjoy your {getSelectedFlavors().map(f => f?.name).join(', ')} blend!
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Session Timer */}
              <SessionTimer 
                duration={60}
                onTimeUp={() => console.log('Session completed!')}
                onPause={() => console.log('Session paused')}
                onResume={() => console.log('Session resumed')}
                onReset={() => console.log('Session reset')}
              />

              {/* Session Info */}
              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h3 className="text-xl font-semibold mb-4">Session Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Table:</span>
                    <span className="font-semibold">{scannedData}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Flavors:</span>
                    <span className="font-semibold">{getSelectedFlavors().map(f => f?.name).join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Total:</span>
                    <span className="font-semibold text-green-400">${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Status:</span>
                    <Badge className="bg-green-500 text-white">Active</Badge>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <Button variant="outline" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    Request Staff
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Flame className="w-4 h-4 mr-2" />
                    Request Refill
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
