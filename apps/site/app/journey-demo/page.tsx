"use client";

import React, { useState } from 'react';
import { 
  StepIndicator, 
  FlowProgress, 
  JourneyCard, 
  QRScanner, 
  FlavorSelector, 
  SessionTimer,
  TaskQueue,
  Flavor
} from '@hookahplus/design-system';

export default function JourneyDemo() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [scannedData, setScannedData] = useState<string | null>(null);

  const journeySteps = [
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

  const sampleFlavors: Flavor[] = [
    {
      id: '1',
      name: 'Double Apple',
      description: 'Classic sweet and tangy apple flavor',
      category: 'tobacco',
      intensity: 'medium',
      price: 15.99,
      isPopular: true
    },
    {
      id: '2',
      name: 'Mint',
      description: 'Cool and refreshing mint sensation',
      category: 'tobacco',
      intensity: 'light',
      price: 12.99
    },
    {
      id: '3',
      name: 'Grape',
      description: 'Sweet and juicy grape flavor',
      category: 'tobacco',
      intensity: 'medium',
      price: 14.99
    },
    {
      id: '4',
      name: 'Rose',
      description: 'Elegant floral rose essence',
      category: 'herbal',
      intensity: 'light',
      price: 16.99,
      isFavorite: true
    },
    {
      id: '5',
      name: 'Chocolate Mint',
      description: 'Rich chocolate with cool mint',
      category: 'mixed',
      intensity: 'strong',
      price: 18.99
    }
  ];

  const sampleTasks = [
    {
      id: '1',
      title: 'Refill Table 5',
      description: 'Customer requested flavor refill',
      priority: 'high' as const,
      status: 'pending' as const,
      createdAt: new Date(),
      dueAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      customerName: 'John Doe',
      tableNumber: '5',
      type: 'refill' as const
    },
    {
      id: '2',
      title: 'Clean Table 3',
      description: 'Table needs cleaning after session',
      priority: 'medium' as const,
      status: 'in_progress' as const,
      assignedTo: 'Sarah',
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      tableNumber: '3',
      type: 'cleanup' as const
    },
    {
      id: '3',
      title: 'Setup Table 7',
      description: 'New customers arriving in 15 minutes',
      priority: 'urgent' as const,
      status: 'pending' as const,
      createdAt: new Date(),
      dueAt: new Date(Date.now() + 15 * 60 * 1000),
      tableNumber: '7',
      type: 'setup' as const
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

  const handleTaskUpdate = (taskId: string, updates: any) => {
    console.log('Task updated:', taskId, updates);
  };

  const handleTaskAssign = (taskId: string, staffId: string) => {
    console.log('Task assigned:', taskId, 'to', staffId);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            HookahPlus Journey Demo
          </h1>
          <p className="text-xl text-zinc-400">
            Experience the complete customer and staff journey flows
          </p>
        </div>

        {/* Journey Progress */}
        <div className="mb-12">
          <StepIndicator 
            steps={journeySteps}
            orientation="horizontal"
            className="mb-6"
          />
          <FlowProgress 
            currentStep={currentStep}
            totalSteps={4}
            showPercentage={true}
            size="lg"
          />
        </div>

        {/* Journey Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {journeySteps.map((step, index) => (
            <JourneyCard
              key={step.id}
              title={step.title}
              description={step.description}
              status={step.status as any}
              duration={index === 0 ? '2 min' : index === 1 ? '5 min' : index === 2 ? '1 min' : '60 min'}
              nextAction={index < journeySteps.length - 1 ? journeySteps[index + 1].description : undefined}
              onAction={index === currentStep - 1 ? () => setCurrentStep(currentStep + 1) : undefined}
              actionLabel={index === currentStep - 1 ? 'Continue' : 'Start'}
            />
          ))}
        </div>

        {/* Interactive Components Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* QR Scanner */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">QR Code Scanner</h3>
            <QRScanner 
              onScan={handleQRScan}
              onError={(error) => console.error('QR Scan Error:', error)}
            />
            {scannedData && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400">
                  Scanned: {scannedData}
                </p>
              </div>
            )}
          </div>

          {/* Session Timer */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Session Timer</h3>
            <SessionTimer 
              duration={60}
              onTimeUp={() => console.log('Session completed!')}
              onPause={() => console.log('Session paused')}
              onResume={() => console.log('Session resumed')}
              onReset={() => console.log('Session reset')}
            />
          </div>
        </div>

        {/* Flavor Selector */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6">Flavor Selection</h3>
          <FlavorSelector
            flavors={sampleFlavors}
            selectedFlavors={selectedFlavors}
            onSelectionChange={handleFlavorSelection}
            maxSelections={3}
          />
          {selectedFlavors.length > 0 && (
            <div className="mt-6 p-4 bg-teal-500/10 border border-teal-500/20 rounded-lg">
              <h4 className="text-lg font-semibold text-teal-400 mb-2">
                Selected Flavors:
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedFlavors.map(flavorId => {
                  const flavor = sampleFlavors.find(f => f.id === flavorId);
                  return flavor ? (
                    <span 
                      key={flavorId}
                      className="px-3 py-1 bg-teal-600 text-white rounded-full text-sm"
                    >
                      {flavor.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Staff Task Queue */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Staff Task Queue</h3>
          <TaskQueue
            tasks={sampleTasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskAssign={handleTaskAssign}
          />
        </div>
      </div>
    </div>
  );
}
