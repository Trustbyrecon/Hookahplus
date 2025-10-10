"use client";

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  MapPin,
  Users,
  Camera,
  FileText,
  Brain,
  RefreshCw
} from 'lucide-react';
import GlobalNavigation from '../../components/GlobalNavigation';
import AliethiaLayers from '../../components/AliethiaLayers';

export default function LayoutPreviewPage() {
  // Core state for physical lounge digitization
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [yamlMetadata, setYamlMetadata] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedLayout, setGeneratedLayout] = useState<any>(null);
  const [behavioralMemory, setBehavioralMemory] = useState<any[]>([]);
  
  // File input refs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const yamlInputRef = useRef<HTMLInputElement>(null);


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

          {/* Right Column - Generated Layout Output */}
          <div className="space-y-6">
            {generatedLayout ? (
              <>
                {/* Live Layout Visualization */}
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-purple-400" />
                    Live Layout Visualization
                  </h2>

          {/* Layout Canvas */}
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="relative mx-auto border-2 border-gray-300 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg"
                         style={{ width: '400px', height: '300px' }}>
                      {generatedLayout.zones.map((zone: any, index: number) => {
                        const colors = {
                          blue: 'bg-blue-500',
                          purple: 'bg-purple-500',
                          green: 'bg-green-500'
                        };
                        const positions = [
                          { x: 20, y: 20, width: 120, height: 80 },
                          { x: 160, y: 20, width: 100, height: 100 },
                          { x: 20, y: 120, width: 200, height: 80 }
                        ];
                        const pos = positions[index] || positions[0];
                        
                        return (
                <div
                  key={zone.id}
                            className={`absolute ${colors[zone.color as keyof typeof colors]} opacity-80 hover:opacity-100 cursor-pointer transition-all duration-300 hover:scale-105 ${
                              zone.sessions > 0 ? 'animate-pulse' : ''
                  }`}
                  style={{
                              left: pos.x,
                              top: pos.y,
                              width: pos.width,
                              height: pos.height,
                              borderRadius: '8px',
                              boxShadow: zone.sessions > 0 ? '0 0 15px rgba(239, 68, 68, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                >
                  <div className="p-2 text-white text-sm font-medium">
                    {zone.name}
                  </div>
                            <div className="absolute bottom-1 left-2 text-xs text-white font-semibold">
                    {zone.occupied}/{zone.capacity}
                  </div>
                  {zone.sessions > 0 && (
                              <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-bounce">
                      {zone.sessions}
                    </div>
                  )}
                  </div>
                );
              })}
            </div>
          </div>

                  {/* Layout Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-white">{generatedLayout.totalCapacity}</div>
                      <div className="text-sm text-gray-400">Total Capacity</div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{generatedLayout.activeSessions}</div>
                      <div className="text-sm text-gray-400">Active Sessions</div>
          </div>
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">${generatedLayout.monthlyRevenue.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">Monthly Revenue</div>
          </div>
                  </div>
                </div>

                {/* Zone Details */}
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-400" />
                    Zone Details
                  </h2>
                  
                  <div className="space-y-3">
                    {generatedLayout.zones.map((zone: any) => (
                      <div key={zone.id} className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white">{zone.name}</h3>
                          <div className={`w-3 h-3 rounded-full ${
                            zone.occupied === zone.capacity ? 'bg-red-400' :
                            zone.occupied > zone.capacity * 0.7 ? 'bg-yellow-400' :
                            'bg-green-400'
                          }`} />
                        </div>
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
                            <p className="text-gray-400">Available</p>
                            <p className="text-green-400">{zone.capacity - zone.occupied}</p>
          </div>
                  <div>
                            <p className="text-gray-400">Active Sessions</p>
                            <p className="text-red-400 font-semibold">{zone.sessions}</p>
                          </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
              </>
            ) : (
              /* Placeholder when no layout generated */
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                  Layout Output
                </h2>
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No layout generated yet</p>
                  <p className="text-gray-500 text-sm">Upload photos and YAML metadata to generate your digital layout</p>
                </div>
              </div>
            )}
          </div>
        </div>


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

        {/* Aliethia - The Five Unseen Layers */}
        <div className="mt-8">
          <AliethiaLayers />
        </div>
      </div>
    </div>
  );
}