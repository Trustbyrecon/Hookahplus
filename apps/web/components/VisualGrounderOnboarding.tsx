// apps/web/components/VisualGrounderOnboarding.tsx
"use client";

import { useState, useRef } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export default function VisualGrounderOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [seedData, setSeedData] = useState({
    lounge_id: '',
    name: '',
    defaults: {
      base_price_usd: 30,
      session_timer_min: 60,
      allow_qr_preorder: true
    },
    hints: {
      zones: ['bar', 'lounge', 'booth_wall'],
      wheelchair_route_targets: ['bar', 'restroom', 'exit']
    }
  });
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps: OnboardingStep[] = [
    {
      id: 'photos',
      title: 'Upload Photos',
      description: 'Take 3-6 photos of your main floor from different angles',
      completed: photos.length >= 3
    },
    {
      id: 'seed',
      title: 'Basic Info',
      description: 'Provide lounge name and basic settings',
      completed: seedData.name.length > 0
    },
    {
      id: 'process',
      title: 'Generate Map',
      description: 'AI analyzes photos and creates seating map',
      completed: results !== null
    },
    {
      id: 'review',
      title: 'Review & Deploy',
      description: 'Review compliance report and deploy to dashboard',
      completed: false
    }
  ];

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPhotos(prev => [...prev, ...files].slice(0, 6)); // Max 6 photos
  };

  const handleSeedChange = (field: string, value: any) => {
    setSeedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const processPhotos = async () => {
    if (photos.length < 3) {
      alert('Please upload at least 3 photos');
      return;
    }

    setProcessing(true);
    
    try {
      const formData = new FormData();
      photos.forEach(photo => {
        formData.append('photos', photo);
      });
      formData.append('seed', JSON.stringify(seedData));

      const response = await fetch('/api/visual-grounder', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setResults(result.data);
        setCurrentStep(3);
      } else {
        alert('Processing failed: ' + result.error);
      }
    } catch (error) {
      console.error('Processing error:', error);
      alert('Processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-teal-300 mb-2">Upload Lounge Photos</h3>
              <p className="text-zinc-400">Take 3-6 photos from different angles to capture your seating layout</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative bg-zinc-800 rounded-lg p-4">
                  <div className="aspect-square bg-zinc-700 rounded-lg flex items-center justify-center">
                    <span className="text-zinc-400 text-sm">{photo.name}</span>
                  </div>
                  <button
                    onClick={() => setPhotos(prev => prev.filter((_, i) => i !== index))}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {photos.length < 6 && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square bg-zinc-800 border-2 border-dashed border-zinc-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-teal-500 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📸</div>
                    <div className="text-zinc-400 text-sm">Add Photo</div>
                  </div>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
            
            <div className="bg-zinc-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Photo Tips</h4>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li>• Take photos from different angles (front, side, overhead if possible)</li>
                <li>• Include bar area, seating areas, and main walkways</li>
                <li>• Ensure good lighting and clear visibility</li>
                <li>• Avoid photos with customers for privacy</li>
              </ul>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-teal-300 mb-2">Lounge Information</h3>
              <p className="text-zinc-400">Provide basic details about your lounge</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Lounge Name</label>
                <input
                  type="text"
                  value={seedData.name}
                  onChange={(e) => handleSeedChange('name', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
                  placeholder="e.g., Copper Fern Lounge"
                />
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Lounge ID</label>
                <input
                  type="text"
                  value={seedData.lounge_id}
                  onChange={(e) => handleSeedChange('lounge_id', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
                  placeholder="e.g., lounge-pilot-001"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Base Price (USD)</label>
                  <input
                    type="number"
                    value={seedData.defaults.base_price_usd}
                    onChange={(e) => handleSeedChange('defaults', {
                      ...seedData.defaults,
                      base_price_usd: parseInt(e.target.value)
                    })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Session Timer (minutes)</label>
                  <input
                    type="number"
                    value={seedData.defaults.session_timer_min}
                    onChange={(e) => handleSeedChange('defaults', {
                      ...seedData.defaults,
                      session_timer_min: parseInt(e.target.value)
                    })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="qr_preorder"
                  checked={seedData.defaults.allow_qr_preorder}
                  onChange={(e) => handleSeedChange('defaults', {
                    ...seedData.defaults,
                    allow_qr_preorder: e.target.checked
                  })}
                  className="w-4 h-4 text-teal-600 bg-zinc-800 border-zinc-700 rounded focus:ring-teal-500"
                />
                <label htmlFor="qr_preorder" className="text-white">Enable QR Pre-order</label>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-teal-300 mb-2">Generate Seating Map</h3>
              <p className="text-zinc-400">AI will analyze your photos and create a seating map with compliance checking</p>
            </div>
            
            <div className="bg-zinc-800 rounded-lg p-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🤖</div>
                <h4 className="text-white font-medium mb-2">Reflex Visual Grounder</h4>
                <p className="text-zinc-400 text-sm mb-4">
                  Analyzing {photos.length} photos to detect seating patterns, routes, and ADA compliance
                </p>
                
                <button
                  onClick={processPhotos}
                  disabled={processing}
                  className="bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  {processing ? 'Processing...' : 'Generate Seating Map'}
                </button>
              </div>
            </div>
            
            {processing && (
              <div className="bg-zinc-800 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-400"></div>
                  <div className="text-white">Analyzing photos and generating seating map...</div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-teal-300 mb-2">Review Results</h3>
              <p className="text-zinc-400">Review your seating map and compliance report</p>
            </div>
            
            {results && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{results.seatingMap.metadata.total_capacity}</div>
                    <div className="text-sm text-zinc-400">Total Seats</div>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400">{results.complianceReport.summary.total_violations}</div>
                    <div className="text-sm text-zinc-400">Violations</div>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-teal-400">{results.suggestions.length}</div>
                    <div className="text-sm text-zinc-400">Suggestions</div>
                  </div>
                </div>
                
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Compliance Status</h4>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    results.complianceReport.overall_compliance === 'compliant' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-yellow-600 text-white'
                  }`}>
                    {results.complianceReport.overall_compliance === 'compliant' ? '✅ COMPLIANT' : '⚠️ NON-COMPLIANT'}
                  </div>
                </div>
                
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Suggestions</h4>
                  <ul className="space-y-2">
                    {results.suggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="text-zinc-400 text-sm flex items-start">
                        <span className="text-teal-400 mr-2">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      // Deploy to dashboard
                      console.log('Deploying to dashboard...');
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Deploy to Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentStep(0)}
                    className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-teal-500 p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">🔍</span>
        <h2 className="text-xl font-semibold text-teal-300">Reflex Visual Grounder</h2>
      </div>
      
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index <= currentStep 
                ? 'bg-teal-600 text-white' 
                : 'bg-zinc-700 text-zinc-400'
            }`}>
              {step.completed ? '✓' : index + 1}
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium text-white">{step.title}</div>
              <div className="text-xs text-zinc-400">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-px mx-4 ${
                index < currentStep ? 'bg-teal-600' : 'bg-zinc-700'
              }`} />
            )}
          </div>
        ))}
      </div>
      
      {/* Step Content */}
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Previous
        </button>
        
        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1 || !steps[currentStep].completed}
          className="bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
