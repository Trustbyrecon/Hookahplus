"use client";

import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  RefreshCw,
  MapPin,
  Settings,
  Eye,
  Download,
  AlertCircle,
  Info,
  Lightbulb,
  Zap,
  Target,
  BarChart3,
  X,
  Image as ImageIcon
} from 'lucide-react';
import GlobalNavigation from '../../components/GlobalNavigation';

export default function VisualGrounderPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [loungeInfo, setLoungeInfo] = useState({
    name: '',
    address: '',
    capacity: '',
    seatingTypes: [] as string[]
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [generatedLayout, setGeneratedLayout] = useState<any>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    {
      id: 1,
      title: 'Upload Photos',
      description: 'Take 3-6 photos of your main floor from different angles',
      icon: <Camera className="w-5 h-5" />
    },
    {
      id: 2,
      title: 'Basic Info',
      description: 'Provide lounge name and basic settings',
      icon: <Settings className="w-5 h-5" />
    },
    {
      id: 3,
      title: 'Generate Map',
      description: 'AI analyzes photos and creates seating map',
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: 4,
      title: 'Review & Deploy',
      description: 'Review seating map and deploy to dashboard',
      icon: <Target className="w-5 h-5" />
    }
  ];

  const seatingTypes = [
    'Bar Counter',
    'Booth Seating',
    'Table Seating',
    'Patio Seating',
    'VIP Section',
    'Sectional Seating',
    'High Top Tables',
    'Lounge Chairs'
  ];

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const newPhotos = [...uploadedPhotos, ...files].slice(0, 6);
      setUploadedPhotos(newPhotos);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const simulateAnalysis = async () => {
    const steps = [
      { progress: 25, step: 'Analyzing photos...' },
      { progress: 50, step: 'Detecting seating areas...' },
      { progress: 75, step: 'Optimizing layout...' },
      { progress: 100, step: 'Generating map...' }
    ];

    for (const { progress, step } of steps) {
      setAnalysisProgress(progress);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const handleGenerateLayout = async () => {
    setIsGenerating(true);
    setAnalysisProgress(0);
    
    try {
      await simulateAnalysis();
      
      // Call API to generate layout
      const response = await fetch('/api/visual-grounder/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photos: uploadedPhotos.map(file => ({ name: file.name, size: file.size })),
          loungeInfo
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate layout');
      }
      
      const data = await response.json();
      setGeneratedLayout(data.layout);
    } catch (error) {
      console.error('Error generating layout:', error);
      alert('Failed to generate layout. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeployLayout = async () => {
    setIsDeploying(true);
    try {
      // Call API to deploy layout
      const response = await fetch('/api/visual-grounder/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          layoutId: generatedLayout?.id,
          layoutData: generatedLayout
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to deploy layout');
      }
      
      const data = await response.json();
      alert('Layout deployed successfully! Redirecting to dashboard...');
      window.location.href = '/layout-preview';
    } catch (error) {
      console.error('Error deploying layout:', error);
      alert('Failed to deploy layout. Please try again.');
    } finally {
      setIsDeploying(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-teal-400 mb-2">Upload Lounge Photos</h2>
        <p className="text-zinc-400">Take 3-6 photos from different angles to capture your seating layout</p>
      </div>

      <div 
        className="border-2 border-dashed border-zinc-600 rounded-lg p-8 text-center hover:border-teal-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
        <Camera className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
        <p className="text-xl text-zinc-300 mb-2">Add Photo</p>
        <p className="text-sm text-zinc-500 mb-4">Click to upload or drag and drop</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="btn-pretty-primary"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Photos
        </button>
      </div>

      {uploadedPhotos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {uploadedPhotos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={URL.createObjectURL(photo)}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                Photo {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-zinc-800/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
          Photo Tips
        </h3>
        <ul className="space-y-2 text-sm text-zinc-300">
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 text-green-400 mt-0.5 flex-shrink-0" />
            Take photos from different angles (front, side, overhead if possible)
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 text-green-400 mt-0.5 flex-shrink-0" />
            Include bar area, seating areas, and main walkways
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 text-green-400 mt-0.5 flex-shrink-0" />
            Ensure good lighting and clear visibility
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 text-green-400 mt-0.5 flex-shrink-0" />
            Avoid photos with customers for privacy
          </li>
        </ul>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-teal-400 mb-2">Basic Information</h2>
        <p className="text-zinc-400">Provide your lounge details and seating preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Lounge Name *</label>
          <input
            type="text"
            value={loungeInfo.name}
            onChange={(e) => setLoungeInfo(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Enter lounge name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Address</label>
          <input
            type="text"
            value={loungeInfo.address}
            onChange={(e) => setLoungeInfo(prev => ({ ...prev, address: e.target.value }))}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Enter address"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-zinc-300 mb-2">Total Capacity</label>
          <input
            type="number"
            value={loungeInfo.capacity}
            onChange={(e) => setLoungeInfo(prev => ({ ...prev, capacity: e.target.value }))}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Enter total capacity"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">Seating Types *</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {seatingTypes.map((type) => (
            <label key={type} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={loungeInfo.seatingTypes.includes(type)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setLoungeInfo(prev => ({ ...prev, seatingTypes: [...prev.seatingTypes, type] }));
                  } else {
                    setLoungeInfo(prev => ({ ...prev, seatingTypes: prev.seatingTypes.filter(t => t !== type) }));
                  }
                }}
                className="w-4 h-4 text-teal-600 bg-zinc-800 border-zinc-700 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-zinc-300">{type}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-teal-400 mb-2">Generate Seating Map</h2>
        <p className="text-zinc-400">AI will analyze your photos and create an optimized seating layout</p>
      </div>

      <div className="bg-zinc-800/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Analysis Progress</h3>
          <span className="text-sm text-zinc-400">{uploadedPhotos.length} photos uploaded</span>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-zinc-300">Photo Analysis</span>
            <span className="text-green-400">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300">Layout Detection</span>
            <span className="text-green-400">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300">Seating Optimization</span>
            <span className="text-green-400">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300">Map Generation</span>
            <span className={isGenerating ? "text-yellow-400" : "text-green-400"}>
              {isGenerating ? "In Progress..." : "Complete"}
            </span>
          </div>
        </div>

        {isGenerating && (
          <div className="mt-4">
            <div className="w-full bg-zinc-700 rounded-full h-2">
              <div 
                className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${analysisProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-zinc-400 mt-2 text-center">{analysisProgress}% Complete</p>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleGenerateLayout}
            disabled={isGenerating || uploadedPhotos.length < 3}
            className="w-full btn-pretty-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Layout...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Seating Map
              </>
            )}
          </button>
        </div>
      </div>

      {generatedLayout && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-semibold">Layout Generated Successfully!</span>
          </div>
          <p className="text-sm text-zinc-300">
            Your seating map has been created with {generatedLayout.zones.length} zones and optimized for your lounge layout.
          </p>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-teal-400 mb-2">Review & Deploy</h2>
        <p className="text-zinc-400">Review your generated seating map and deploy to your dashboard</p>
      </div>

      {generatedLayout ? (
        <div className="space-y-6">
          <div className="bg-zinc-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Generated Layout Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedLayout.zones.map((zone: any) => (
                <div key={zone.id} className="p-4 bg-zinc-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{zone.name}</span>
                    <span className="text-sm text-zinc-400">{zone.type}</span>
                  </div>
                  <div className="text-sm text-zinc-300">
                    Capacity: {zone.capacity} • Occupied: {zone.occupied}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleDeployLayout}
              disabled={isDeploying}
              className="flex-1 btn-pretty-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeploying ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Deploy to Dashboard
                </>
              )}
            </button>
            <button className="btn-pretty-secondary">
              <Download className="w-4 h-4 mr-2" />
              Download Layout
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <p className="text-zinc-400">Please generate a layout first in the previous step.</p>
        </div>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <MapPin className="w-8 h-8 text-teal-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Reflex Visual Grounder
            </h1>
          </div>
          <p className="text-xl text-zinc-400">
            Create and deploy a seating map for your lounge
          </p>
        </div>

        {/* Status */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-zinc-800 rounded-lg">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-zinc-300">No Seating Map Deployed</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-zinc-900/50 border border-teal-500/30 rounded-xl p-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-teal-500 border-teal-500 text-white' 
                    : 'border-zinc-600 text-zinc-400'
                }`}>
                  {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.icon}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-white' : 'text-zinc-400'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-zinc-500">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-teal-500' : 'bg-zinc-600'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {renderCurrentStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="btn-pretty-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep === 4 || (currentStep === 1 && uploadedPhotos.length < 3)}
              className="btn-pretty-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
