"use client";

import React, { useState, useEffect } from 'react';
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
  Zap,
  Star,
  Heart,
  AlertCircle,
  CheckCircle2,
  Timer,
  Users,
  MapPin
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  tableId: string;
  preferences: string[];
  loyaltyPoints: number;
  visitCount: number;
}

interface Order {
  id: string;
  customerId: string;
  tableId: string;
  flavors: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'active' | 'completed';
  createdAt: Date;
  estimatedTime: number; // minutes
}

export default function CustomerJourneyTest() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [simulationMode, setSimulationMode] = useState(false);
  const [autoProgress, setAutoProgress] = useState(false);

  // Simulate customer data
  const createCustomer = (): Customer => ({
    id: 'cust_' + Date.now(),
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 123-4567',
    tableId: 'T-015',
    preferences: ['Blue Mist', 'Mint'],
    loyaltyPoints: 1250,
    visitCount: 8
  });

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
      id: 'payment',
      title: 'Payment',
      description: 'Complete your payment securely',
      status: (currentStep >= 4 ? (currentStep > 4 ? 'completed' : 'current') : 'upcoming') as 'completed' | 'current' | 'upcoming'
    },
    {
      id: 'enjoy',
      title: 'Enjoy Session',
      description: 'Your hookah session is ready!',
      status: (currentStep >= 5 ? 'completed' : 'upcoming') as 'completed' | 'current' | 'upcoming'
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
    },
    {
      id: '6',
      name: 'Rose',
      description: 'Elegant floral rose essence',
      category: 'herbal' as const,
      intensity: 'light' as const,
      price: 16.99
    }
  ];

  // Auto-progression simulation
  useEffect(() => {
    if (autoProgress && simulationMode) {
      const timer = setTimeout(() => {
        if (currentStep < 5) {
          setCurrentStep(currentStep + 1);
        } else {
          setAutoProgress(false);
        }
      }, 3000); // 3 seconds per step

      return () => clearTimeout(timer);
    }
  }, [currentStep, autoProgress, simulationMode]);

  const handleQRScan = (data: string) => {
    setScannedData(data);
    const newCustomer = createCustomer();
    newCustomer.tableId = data;
    setCustomer(newCustomer);
    setCurrentStep(2);
  };

  const handleFlavorSelection = (flavorIds: string[]) => {
    setSelectedFlavors(flavorIds);
    if (flavorIds.length > 0) {
      setCurrentStep(3);
    }
  };

  const handleConfirmOrder = () => {
    if (!customer) return;
    
    const selectedFlavorObjects = selectedFlavors.map(id => {
      const flavor = flavors.find(f => f.id === id);
      return {
        id: flavor!.id,
        name: flavor!.name,
        price: flavor!.price,
        quantity: 1
      };
    });

    const newOrder: Order = {
      id: 'order_' + Date.now(),
      customerId: customer.id,
      tableId: customer.tableId,
      flavors: selectedFlavorObjects,
      total: selectedFlavorObjects.reduce((sum, flavor) => sum + flavor.price, 0),
      status: 'pending',
      createdAt: new Date(),
      estimatedTime: 15
    };

    setOrder(newOrder);
    setCurrentStep(4);
  };

  const handlePayment = () => {
    if (!order) return;
    
    setOrder({...order, status: 'confirmed'});
    setCurrentStep(5);
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

  const startSimulation = () => {
    setSimulationMode(true);
    setAutoProgress(true);
    setCurrentStep(1);
    setCustomer(null);
    setOrder(null);
    setSelectedFlavors([]);
    setScannedData(null);
    setSessionActive(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">H+</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-green-400">Customer Journey Test</h1>
                  <p className="text-sm text-zinc-400">Complete flow simulation</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {customer && (
                <div className="text-right">
                  <div className="text-sm text-zinc-400">Customer</div>
                  <div className="font-semibold">{customer.name}</div>
                  <div className="text-xs text-zinc-500">Table {customer.tableId}</div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={startSimulation}
                  className="bg-zinc-800 hover:bg-zinc-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Start Simulation
                </Button>
                
                <Button 
                  variant={autoProgress ? "primary" : "outline"}
                  onClick={() => setAutoProgress(!autoProgress)}
                  className={autoProgress ? "bg-green-600 hover:bg-green-700" : "bg-zinc-800 hover:bg-zinc-700"}
                >
                  <Timer className="w-4 h-4 mr-2" />
                  {autoProgress ? 'Auto Progress ON' : 'Auto Progress OFF'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="mb-12">
          <StepIndicator 
            steps={flowSteps}
            orientation="horizontal"
            className="mb-6"
          />
          <FlowProgress 
            currentStep={currentStep}
            totalSteps={5}
            showPercentage={true}
            size="lg"
            variant="success"
          />
        </div>

        {/* Customer Info Card */}
        {customer && (
          <Card className="bg-zinc-900 border-zinc-800 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{customer.name}</h3>
                  <p className="text-zinc-400">{customer.email} • {customer.phone}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge className="bg-blue-500 text-white">
                      <MapPin className="w-3 h-3 mr-1" />
                      Table {customer.tableId}
                    </Badge>
                    <Badge className="bg-purple-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      {customer.loyaltyPoints} pts
                    </Badge>
                    <Badge className="bg-green-500 text-white">
                      <Users className="w-3 h-3 mr-1" />
                      {customer.visitCount} visits
                    </Badge>
                  </div>
                </div>
              </div>
              
              {order && (
                <div className="text-right">
                  <div className="text-sm text-zinc-400">Order Status</div>
                  <Badge className={`${
                    order.status === 'pending' ? 'bg-yellow-500' :
                    order.status === 'confirmed' ? 'bg-blue-500' :
                    order.status === 'preparing' ? 'bg-orange-500' :
                    order.status === 'ready' ? 'bg-green-500' :
                    'bg-purple-500'
                  } text-white`}>
                    {order.status.toUpperCase()}
                  </Badge>
                  <div className="text-lg font-semibold text-green-400 mt-1">
                    ${order.total.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Step Content */}
        {currentStep === 1 && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Welcome to Hookah+</h2>
            <p className="text-xl text-zinc-400 mb-8">
              {simulationMode 
                ? "Simulating QR code scan..." 
                : "Scan the QR code on your table to start your personalized hookah experience"
              }
            </p>
            
            {simulationMode ? (
              <div className="max-w-md mx-auto">
                <Card className="bg-zinc-900 border-zinc-800 p-8">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-teal-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-lg font-semibold mb-2">Simulating QR Scan...</p>
                    <p className="text-zinc-400">Table T-015 detected!</p>
                  </div>
                </Card>
              </div>
            ) : (
              <QRScanner 
                onScan={handleQRScan}
                onError={(error) => console.error('QR Scan Error:', error)}
                className="max-w-md mx-auto"
              />
            )}
            
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
              {customer && `Welcome back ${customer.name}! `}
              Select up to 3 flavors for your perfect hookah session
            </p>
            
            {customer && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-400">
                  <Heart className="w-4 h-4" />
                  <span>Based on your preferences: {customer.preferences.join(', ')}</span>
                </div>
              </div>
            )}
            
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
                
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full mt-6 bg-green-600 hover:bg-green-700"
                  onClick={handleConfirmOrder}
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Confirm Order
                </Button>
              </Card>

              {/* Customer Info */}
              {customer && (
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <h3 className="text-xl font-semibold mb-4">Customer Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Name:</span>
                      <span className="font-semibold">{customer.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Table:</span>
                      <span className="font-semibold">{customer.tableId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Loyalty Points:</span>
                      <span className="font-semibold text-purple-400">{customer.loyaltyPoints}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Visit Count:</span>
                      <span className="font-semibold text-blue-400">{customer.visitCount}</span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h2 className="text-3xl font-bold mb-4">Payment</h2>
            <p className="text-xl text-zinc-400 mb-8">
              Complete your payment securely
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Payment Methods */}
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
              </Card>

              {/* Order Summary */}
              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3">
                  {getSelectedFlavors().map((flavor) => (
                    <div key={flavor?.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{flavor?.name}</div>
                        <div className="text-sm text-zinc-400">Qty: 1</div>
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
                
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full mt-6 bg-green-600 hover:bg-green-700"
                  onClick={handlePayment}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Pay ${getTotalPrice().toFixed(2)}
                </Button>
                
                <p className="text-xs text-zinc-500 text-center mt-4">
                  Your session will begin immediately after payment confirmation
                </p>
              </Card>
            </div>
          </div>
        )}

        {currentStep === 5 && (
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
                    <span className="text-zinc-400">Customer:</span>
                    <span className="font-semibold">{customer?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Table:</span>
                    <span className="font-semibold">{customer?.tableId}</span>
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

        {/* Simulation Controls */}
        {simulationMode && (
          <Card className="bg-zinc-900 border-zinc-800 p-6 mt-8">
            <h3 className="text-xl font-semibold mb-4">Simulation Controls</h3>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous Step
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                disabled={currentStep === 5}
              >
                Next Step
              </Button>
              
              <Button 
                variant="primary" 
                onClick={() => {
                  setSimulationMode(false);
                  setAutoProgress(false);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                End Simulation
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
