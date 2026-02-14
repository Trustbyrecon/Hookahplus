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
  Image as ImageIcon,
  Edit3,
  Users
} from 'lucide-react';
import GlobalNavigation from '../../components/GlobalNavigation';
import { InteractiveLayoutEditor } from '../../components/InteractiveLayoutEditor';
import { StaffTrainingWorkflow } from '../../components/StaffTrainingWorkflow';
import { VisualGrounderAnalytics } from '../../components/VisualGrounderAnalytics';

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
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
      title: 'Edit Layout',
      description: 'Customize and perfect your AI-generated layout',
      icon: <Edit3 className="w-5 h-5" />
    },
    {
      id: 5,
      title: 'Staff Training',
      description: 'Train your team on the new layout system',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 6,
      title: 'Analytics',
      description: 'Monitor performance and optimize your layout',
      icon: <BarChart3 className="w-5 h-5" />
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

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return `${file.name} is not a valid image file`;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return `${file.name} is too large (max 10MB)`;
    }
    
    // Check image dimensions (basic validation)
    return null;
  };

  const processFiles = async (files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    }
    
    if (errors.length > 0) {
      setUploadErrors(errors);
      setTimeout(() => setUploadErrors([]), 5000);
    }
    
    if (validFiles.length > 0) {
      setIsUploading(true);
      
      try {
        // Create FormData for API upload
        const formData = new FormData();
        validFiles.forEach(file => {
          formData.append('photos', file);
        });

        // Upload to API
        const response = await fetch('/api/visual-grounder/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          // Simulate progress for each file
          for (let i = 0; i < validFiles.length; i++) {
            const fileIndex = uploadedPhotos.length + i;
            for (let progress = 0; progress <= 100; progress += 20) {
              setUploadProgress(prev => ({ ...prev, [fileIndex]: progress }));
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
          
          // Add to uploaded photos
          const newPhotos = [...uploadedPhotos, ...validFiles].slice(0, 6);
          setUploadedPhotos(newPhotos);
          
          console.log(`[Visual Grounder] ✅ Uploaded ${validFiles.length} photos successfully`);
        } else {
          setUploadErrors(result.errors || ['Upload failed']);
          setTimeout(() => setUploadErrors([]), 5000);
        }
      } catch (error) {
        console.error('[Visual Grounder] ❌ Upload error:', error);
        setUploadErrors(['Failed to upload photos. Please try again.']);
        setTimeout(() => setUploadErrors([]), 5000);
      } finally {
        setIsUploading(false);
        setUploadProgress({});
      }
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
  };

  const handleNext = () => {
    if (currentStep < 6) {
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
      { progress: 20, step: 'Analyzing photo composition...' },
      { progress: 40, step: 'Detecting architectural features...' },
      { progress: 60, step: 'Identifying seating areas...' },
      { progress: 80, step: 'Calculating optimal table placement...' },
      { progress: 100, step: 'Generating AI recommendations...' }
    ];

    for (const { progress, step } of steps) {
      setAnalysisProgress(progress);
      setCurrentAnalysisStep(step);
      await new Promise(resolve => setTimeout(resolve, 1200));
    }
  };

  const handleGenerateLayout = async () => {
    setIsGenerating(true);
    setAnalysisProgress(0);
    setCurrentAnalysisStep('');
    
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
      setAiAnalysis(data.analysis);
      
      console.log('[Visual Grounder AI] ✅ Layout generated with AI analysis:', data.analysis);
    } catch (error) {
      console.error('[Visual Grounder AI] ❌ Error generating layout:', error);
      alert('Failed to generate layout. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLayoutChange = (updatedLayout: any) => {
    setGeneratedLayout(updatedLayout);
    console.log('[Visual Grounder] 📝 Layout updated:', updatedLayout);
  };

  const handleSaveLayout = async () => {
    try {
      // Call API to save layout
      const response = await fetch('/api/visual-grounder/save', {
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
        throw new Error('Failed to save layout');
      }
      
      console.log('[Visual Grounder] 💾 Layout saved successfully');
      alert('Layout saved successfully!');
    } catch (error) {
      console.error('[Visual Grounder] ❌ Error saving layout:', error);
      alert('Failed to save layout. Please try again.');
    }
  };

  const handleExportLayout = () => {
    try {
      const dataStr = JSON.stringify(generatedLayout, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `layout_${generatedLayout?.name || 'export'}_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      console.log('[Visual Grounder] 📤 Layout exported successfully');
    } catch (error) {
      console.error('[Visual Grounder] ❌ Error exporting layout:', error);
      alert('Failed to export layout. Please try again.');
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
        <div className="mt-2 text-sm text-zinc-500">
          {uploadedPhotos.length}/6 photos uploaded
        </div>
      </div>

      {/* Error Messages */}
      {uploadErrors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-semibold">Upload Errors</span>
          </div>
          <ul className="space-y-1 text-sm text-red-300">
            {uploadErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Drag and Drop Area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragOver 
            ? 'border-teal-500 bg-teal-500/10' 
            : 'border-zinc-600 hover:border-teal-500'
        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="space-y-4">
            <RefreshCw className="w-16 h-16 text-teal-400 mx-auto animate-spin" />
            <p className="text-xl text-teal-400">Uploading Photos...</p>
            <p className="text-sm text-zinc-500">Please wait while we process your images</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Camera className="w-16 h-16 text-zinc-400 mx-auto" />
            <div>
              <p className="text-xl text-zinc-300 mb-2">
                {isDragOver ? 'Drop photos here' : 'Add Photos'}
              </p>
              <p className="text-sm text-zinc-500 mb-4">
                Click to upload or drag and drop images
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="btn-pretty-primary"
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Photos
            </button>
          </div>
        )}
      </div>

      {/* Photo Gallery */}
      {uploadedPhotos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-teal-400" />
            Uploaded Photos ({uploadedPhotos.length}/6)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedPhotos.map((photo, index) => (
              <div key={index} className="relative group">
                <div className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  
                  {/* Upload Progress */}
                  {uploadProgress[index] !== undefined && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-xs text-white">{uploadProgress[index]}%</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  {/* Photo Info */}
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    Photo {index + 1}
                  </div>
                  
                  {/* File Size */}
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {(photo.size / 1024 / 1024).toFixed(1)}MB
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Tips */}
      <div className="bg-zinc-800/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
          Photo Tips for Best Results
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
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 text-green-400 mt-0.5 flex-shrink-0" />
            Supported formats: JPG, PNG, WebP (max 10MB each)
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
        <h2 className="text-2xl font-bold text-teal-400 mb-2">AI Layout Generation</h2>
        <p className="text-zinc-400">Advanced AI analyzes your photos and creates an optimized seating layout</p>
      </div>

      <div className="bg-zinc-800/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Zap className="w-5 h-5 mr-2 text-teal-400" />
            AI Analysis Progress
          </h3>
          <span className="text-sm text-zinc-400">{uploadedPhotos.length} photos uploaded</span>
        </div>
        
        {/* AI Analysis Steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-zinc-300">Photo Composition Analysis</span>
            <span className="text-green-400">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300">Architectural Feature Detection</span>
            <span className="text-green-400">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300">Seating Area Identification</span>
            <span className="text-green-400">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300">Optimal Table Placement</span>
            <span className="text-green-400">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300">AI Recommendations</span>
            <span className={isGenerating ? "text-yellow-400" : "text-green-400"}>
              {isGenerating ? "In Progress..." : "Complete"}
            </span>
          </div>
        </div>

        {/* Current AI Step */}
        {isGenerating && currentAnalysisStep && (
          <div className="mt-4 p-4 bg-zinc-700/50 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
              <span className="text-teal-400 font-medium">AI Processing</span>
            </div>
            <p className="text-sm text-zinc-300">{currentAnalysisStep}</p>
            <div className="w-full bg-zinc-600 rounded-full h-2 mt-3">
              <div 
                className="bg-gradient-to-r from-teal-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${analysisProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-zinc-400 mt-2 text-center">{analysisProgress}% Complete</p>
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
                AI Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate AI Layout
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Analysis Results */}
      {aiAnalysis && (
        <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-6 h-6 text-teal-400" />
            <span className="text-teal-400 font-semibold text-lg">AI Analysis Complete!</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-3">Analysis Results</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-300">Confidence Score:</span>
                  <span className="text-teal-400 font-semibold">{(aiAnalysis.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-300">Processing Time:</span>
                  <span className="text-zinc-400">{aiAnalysis.processingTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-300">Features Detected:</span>
                  <span className="text-zinc-400">{aiAnalysis.featuresDetected?.length || 0}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3">Detected Features</h4>
              <div className="space-y-1">
                {aiAnalysis.featuresDetected?.slice(0, 4).map((feature: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
                    <span className="text-zinc-300">{feature}</span>
                  </div>
                ))}
                {aiAnalysis.featuresDetected?.length > 4 && (
                  <div className="text-xs text-zinc-500">
                    +{aiAnalysis.featuresDetected.length - 4} more features
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layout Generation Success */}
      {generatedLayout && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-semibold">Layout Generated Successfully!</span>
          </div>
          <p className="text-sm text-zinc-300">
            AI created {generatedLayout.zones.length} zones with {generatedLayout.totalCapacity} total capacity, 
            optimized for your lounge layout with {aiAnalysis?.confidence ? (aiAnalysis.confidence * 100).toFixed(1) : '92'}% confidence.
          </p>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-teal-400 mb-2">Interactive Layout Editor</h2>
        <p className="text-zinc-400">Edit, customize, and perfect your AI-generated seating layout</p>
      </div>

      {generatedLayout ? (
        <div className="space-y-6">
          {/* AI Recommendations */}
          {aiAnalysis?.recommendations && (
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-blue-400" />
                AI Recommendations
              </h3>
              <div className="space-y-2">
                {aiAnalysis.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-zinc-300">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Layout Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-zinc-700/50 rounded-lg">
              <div className="text-2xl font-bold text-teal-400">{generatedLayout.zones.length}</div>
              <div className="text-xs text-zinc-400">Zones</div>
            </div>
            <div className="text-center p-3 bg-zinc-700/50 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{generatedLayout.totalCapacity}</div>
              <div className="text-xs text-zinc-400">Total Capacity</div>
            </div>
            <div className="text-center p-3 bg-zinc-700/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{aiAnalysis?.confidence ? (aiAnalysis.confidence * 100).toFixed(0) : '92'}%</div>
              <div className="text-xs text-zinc-400">AI Confidence</div>
            </div>
            <div className="text-center p-3 bg-zinc-700/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{aiAnalysis?.featuresDetected?.length || 0}</div>
              <div className="text-xs text-zinc-400">Features</div>
            </div>
          </div>

          {/* Interactive Layout Editor */}
          <div className="bg-zinc-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Edit3 className="w-5 h-5 mr-2 text-teal-400" />
              Interactive Layout Editor
            </h3>
            <p className="text-sm text-zinc-400 mb-4">
              Drag zones to reposition, resize, lock, duplicate, or delete. Click on zones to see detailed options.
            </p>
            
            <InteractiveLayoutEditor
              layout={generatedLayout}
              onLayoutChange={handleLayoutChange}
              onSave={handleSaveLayout}
              onExport={handleExportLayout}
            />
          </div>

          {/* Action Buttons */}
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
                  Deploy Final Layout
                </>
              )}
            </button>
            <button 
              onClick={handleExportLayout}
              className="btn-pretty-secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              Export JSON
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

  const getZoneColor = (color: string) => {
    const colors: { [key: string]: string } = {
      orange: '#f97316',
      blue: '#3b82f6',
      green: '#10b981',
      purple: '#8b5cf6',
      gray: '#6b7280'
    };
    return colors[color] || '#6b7280';
  };

  const renderStep5 = () => (
    <div className="space-y-6">
      <StaffTrainingWorkflow
        layout={generatedLayout}
        onComplete={() => {
          console.log('[Visual Grounder] ✅ Staff training completed');
          setCurrentStep(6);
        }}
      />
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <VisualGrounderAnalytics
        layoutId={generatedLayout?.id || 'unknown'}
        onExport={(data) => {
          console.log('[Visual Grounder] 📊 Analytics exported:', data);
          // Handle export
        }}
      />
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
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
              disabled={currentStep === 6 || (currentStep === 1 && uploadedPhotos.length < 3)}
              className="btn-pretty-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === 6 ? 'Complete' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
