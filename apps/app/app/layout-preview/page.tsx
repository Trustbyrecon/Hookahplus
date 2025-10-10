"use client";

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  MapPin,
  Users,
  DollarSign,
  Clock,
  Zap,
  Target,
  CheckCircle,
  AlertCircle,
  Activity,
  Plus,
  Minus,
  RotateCcw,
  Lock,
  Unlock,
  ArrowRight,
  ArrowLeft,
  Info,
  Lightbulb,
  Camera,
  FileText,
  Settings,
  Brain,
  Sparkles,
  TrendingUp,
  Shield,
  Eye,
  Download,
  RefreshCw,
  BarChart3,
  Filter,
  Search,
  Maximize2,
  Minimize2,
  Play,
  Pause
} from 'lucide-react';
import GlobalNavigation from '../../components/GlobalNavigation';

export default function LayoutPreviewPage() {
  // Core state for physical lounge digitization
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [yamlMetadata, setYamlMetadata] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedLayout, setGeneratedLayout] = useState<any>(null);
  const [revenueMetrics, setRevenueMetrics] = useState({
    sessionsPerMonth: 1000,
    revenuePerSession: 70,
    monthlyRevenue: 35000,
    hookahPlusAnnualRevenue: 12000
  });
  const [posIntegration, setPosIntegration] = useState<'square' | 'clover' | 'toast' | 'stripe'>('square');
  const [behavioralMemory, setBehavioralMemory] = useState<any[]>([]);
  
  // File input refs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const yamlInputRef = useRef<HTMLInputElement>(null);

  // POS Integration Priority (as specified)
  const posIntegrations = [
    {
      id: 'square',
      name: 'Square',
      priority: 1,
      description: 'Best QR Alignment',
      icon: '🟦',
      color: 'bg-blue-500',
      features: ['QR Code Integration', 'Mobile Payments', 'Inventory Sync']
    },
    {
      id: 'clover',
      name: 'Clover',
      priority: 2,
      description: 'Developer-friendly, strong lounge adoption',
      icon: '🟩',
      color: 'bg-green-500',
      features: ['API Integration', 'Custom Apps', 'Lounge Analytics']
    },
    {
      id: 'toast',
      name: 'Toast',
      priority: 3,
      description: 'Extend reach into hybrid hookah+food lounges',
      icon: '🟨',
      color: 'bg-yellow-500',
      features: ['Food Integration', 'Kitchen Display', 'Multi-Concept']
    },
    {
      id: 'stripe',
      name: 'Stripe',
      priority: 4,
      description: 'Universal checkout/pre-order layer',
      icon: '🟪',
      color: 'bg-purple-500',
      features: ['Online Payments', 'Pre-Orders', 'Subscription Management']
    }
  ];

  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedPhotos(prev => [...prev, ...files]);
  };

  // Handle YAML metadata upload
  const handleYamlUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setYamlMetadata(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  // Process photos and YAML to generate layout
  const processLoungeData = async () => {
    setIsProcessing(true);
    try {
      // Simulate AI processing of photos + YAML metadata
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate layout from uploaded data
      const mockLayout = {
        name: 'Digitized Lounge Layout',
        zones: [
          { id: 'bar_1', name: 'Bar Counter', capacity: 8, occupied: 3, sessions: 2, color: 'blue' },
          { id: 'booth_1', name: 'VIP Booth', capacity: 6, occupied: 4, sessions: 3, color: 'purple' },
          { id: 'table_1', name: 'Main Floor', capacity: 20, occupied: 12, sessions: 8, color: 'green' }
        ],
        totalCapacity: 34,
        activeSessions: 13,
        monthlyRevenue: revenueMetrics.monthlyRevenue
      };
      
      setGeneratedLayout(mockLayout);
      
      // Generate behavioral memory layer
      const memoryData = [
        { type: 'customer_preference', data: 'VIP booths preferred for groups', value: 0.85 },
        { type: 'peak_hours', data: 'Friday 8-11 PM highest revenue', value: 0.92 },
        { type: 'session_length', data: 'Average session 2.5 hours', value: 0.78 },
        { type: 'upsell_success', data: 'Premium flavors increase revenue 40%', value: 0.88 }
      ];
      
      setBehavioralMemory(memoryData);
      
    } catch (error) {
      console.error('Error processing lounge data:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <GlobalNavigation />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Physical Lounge Digitization</h1>
          <p className="text-gray-400 text-lg">Connect your physical space to Hookah+ operations for maximum revenue generation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload & Processing */}
          <div className="space-y-6">
            {/* Photo Upload Section */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Camera className="w-5 h-5 mr-2 text-blue-400" />
                Upload Lounge Photos
              </h2>
              <p className="text-gray-400 mb-4">Upload 3-6 photos of your lounge layout for AI analysis</p>
              
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Drag & drop photos or click to browse</p>
                <input
                  ref={photoInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Select Photos
                </button>
              </div>
              
              {uploadedPhotos.length > 0 && (
                <div className="mt-4">
                  <p className="text-green-400 mb-2">✓ {uploadedPhotos.length} photos uploaded</p>
                  <div className="flex flex-wrap gap-2">
                    {uploadedPhotos.map((file, index) => (
                      <span key={index} className="bg-gray-700 text-gray-300 px-3 py-1 rounded text-sm">
                        {file.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* YAML Metadata Upload */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-400" />
                Seating Metadata (YAML)
              </h2>
              <p className="text-gray-400 mb-4">Upload YAML file with seating configuration and pricing data</p>
              
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Upload your seating configuration file</p>
                <input
                  ref={yamlInputRef}
                  type="file"
                  accept=".yaml,.yml"
                  onChange={handleYamlUpload}
                  className="hidden"
                />
                <button
                  onClick={() => yamlInputRef.current?.click()}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Upload YAML
                </button>
              </div>
              
              {yamlMetadata && (
                <div className="mt-4">
                  <p className="text-green-400 mb-2">✓ YAML metadata loaded</p>
                  <div className="bg-gray-800 p-3 rounded text-sm text-gray-300 font-mono">
                    {yamlMetadata.substring(0, 200)}...
                  </div>
                </div>
              )}
            </div>

            {/* Process Button */}
            <button
              onClick={processLoungeData}
              disabled={uploadedPhotos.length === 0 || !yamlMetadata || isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Processing Lounge Data...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  Generate Digital Layout
                </>
              )}
            </button>
          </div>

          {/* Right Column - Revenue Model & POS Integration */}
          <div className="space-y-6">
            {/* Revenue Model */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-400" />
                Revenue Model
              </h2>
              
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Per Session Revenue</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Base Price</p>
                      <p className="text-white font-semibold">$30</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Add-ons/Premium</p>
                      <p className="text-white font-semibold">$40</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-gray-400">Hookah+ Profit per Session</p>
                    <p className="text-green-400 font-bold text-lg">$1.65 - $1.90</p>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Monthly Lounge Revenue</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Sessions/Month</p>
                      <p className="text-white font-semibold">1,000</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Revenue/Month</p>
                      <p className="text-white font-semibold">$35,000</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-gray-400">Hookah+ Annual Revenue/Lounge</p>
                    <p className="text-green-400 font-bold text-lg">$12k - $15k</p>
                  </div>
                </div>
              </div>
            </div>

            {/* POS Integration Priority */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-400" />
                POS Integration Priority
              </h2>
              
              <div className="space-y-3">
                {posIntegrations.map((pos) => (
                  <div
                    key={pos.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      posIntegration === pos.id 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setPosIntegration(pos.id as any)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{pos.icon}</span>
                        <div>
                          <h3 className="font-semibold text-white">{pos.name}</h3>
                          <p className="text-sm text-gray-400">{pos.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">Priority</span>
                        <p className="text-white font-bold">{pos.priority}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {pos.features.map((feature, index) => (
                        <span key={index} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generated Layout Display */}
        {generatedLayout && (
          <div className="mt-8 bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-purple-400" />
              Generated Digital Layout
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {generatedLayout.zones.map((zone: any) => (
                <div key={zone.id} className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">{zone.name}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400">Capacity</p>
                      <p className="text-white">{zone.capacity}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Occupied</p>
                      <p className="text-white">{zone.occupied}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Active Sessions</p>
                      <p className="text-green-400 font-semibold">{zone.sessions}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Status</p>
                      <p className="text-green-400">Live</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Behavioral Memory Layer */}
        {behavioralMemory.length > 0 && (
          <div className="mt-8 bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-400" />
              Behavioral Memory Layer
            </h2>
            <p className="text-gray-400 mb-4">AI-generated insights from your lounge data</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {behavioralMemory.map((memory, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white capitalize">
                      {memory.type.replace('_', ' ')}
                    </h3>
                    <span className="text-green-400 font-bold">
                      {(memory.value * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{memory.data}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}