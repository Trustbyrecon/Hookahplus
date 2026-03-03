'use client';

import React, { useState, useRef } from 'react';
import { 
  MapPin, 
  Plus, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  X,
  Info,
  Table as TableIcon,
  Camera,
  Upload,
  FileText,
  Sparkles,
  Zap
} from 'lucide-react';

interface Table {
  id: string;
  name: string;
  x: number;
  y: number;
  capacity: number;
  seatingType: string;
}

export type LayoutProvenance = {
  source: 'manual' | 'ai_photos';
  sourceRef?: string;
  confidence?: number;
  confidenceSummary?: 'low' | 'medium' | 'high';
};

interface LoungeLayoutWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (payload: { tables: Table[]; provenance?: LayoutProvenance }) => void;
  existingTables?: Table[];
  loungeId?: string;
}

const seatingTypes = ['Booth', 'Couch', 'Bar', 'Outdoor', 'VIP', 'Private Room'];

export function LoungeLayoutWizard({ 
  isOpen, 
  onClose, 
  onComplete,
  existingTables = [],
  loungeId
}: LoungeLayoutWizardProps) {
  const [currentStep, setCurrentStep] = useState(0); // Start at Step 0 (Quick Setup)
  const [tables, setTables] = useState<Table[]>(existingTables);
  const [newTable, setNewTable] = useState({
    name: '',
    capacity: 4,
    seatingType: 'Booth',
    quantity: 1
  });
  
  // Photo + YAML upload state
  const [useQuickSetup, setUseQuickSetup] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [yamlMetadata, setYamlMetadata] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiGeneratedTables, setAiGeneratedTables] = useState<Table[]>([]);
  const [provenance, setProvenance] = useState<LayoutProvenance>({ source: 'manual' });
  const photoInputRef = useRef<HTMLInputElement>(null);
  const yamlInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 4; // 0 = Quick Setup, 1-3 = Manual steps

  const handleAddTable = () => {
    if (!newTable.name.trim()) return;

    const newTables: Table[] = [];
    const baseName = newTable.name.trim();
    const quantity = Math.max(1, Math.min(50, newTable.quantity || 1));
    
    for (let i = 0; i < quantity; i++) {
      // Generate table name: if quantity > 1, append number (e.g., "T-001", "T-002")
      const tableName = quantity > 1 
        ? `${baseName}-${String(i + 1).padStart(3, '0')}` 
        : baseName;
      
      const table: Table = {
        id: `table-${Date.now()}-${i}`,
        name: tableName,
        x: 50 + ((tables.length + i) % 5) * 20,
        y: 50 + Math.floor((tables.length + i) / 5) * 20,
        capacity: newTable.capacity,
        seatingType: newTable.seatingType
      };
      newTables.push(table);
    }

    setTables([...tables, ...newTables]);
    setNewTable({ name: '', capacity: 4, seatingType: 'Booth', quantity: 1 });
  };

  const handleRemoveTable = (id: string) => {
    setTables(tables.filter(t => t.id !== id));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedPhotos(prev => [...prev, ...files].slice(0, 6)); // Max 6 photos
  };

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

  const handleQuickSetup = async () => {
    if (uploadedPhotos.length < 3) {
      alert('Please upload at least 3 photos for AI analysis.');
      return;
    }

    setIsProcessing(true);
    try {
      // Call AI generation API
      const response = await fetch('/api/visual-grounder/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photos: uploadedPhotos.map(file => ({ name: file.name, size: file.size })),
          loungeInfo: {
            name: loungeId || 'Lounge',
            yamlMetadata: yamlMetadata || undefined
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate layout');
      }

      const data = await response.json();
      
      // Convert AI zones to tables
      const generatedTables: Table[] = (data.layout?.zones || []).map((zone: any, index: number) => ({
        id: `ai-table-${Date.now()}-${index}`,
        name: zone.name || `T-${String(index + 1).padStart(3, '0')}`,
        x: zone.coordinates?.x || 50 + (index % 5) * 20,
        y: zone.coordinates?.y || 50 + Math.floor(index / 5) * 20,
        capacity: zone.capacity || 4,
        seatingType: zone.type || 'Booth'
      }));

      setAiGeneratedTables(generatedTables);
      // Do NOT merge into canonical tables yet. Force a verification gate.
      // Staff must explicitly accept AI suggestions before moving on.
      const confidence = typeof data?.layout?.confidence === 'number' ? data.layout.confidence : undefined;
      const confidenceSummary =
        typeof confidence === 'number' ? (confidence >= 0.8 ? 'high' : confidence >= 0.55 ? 'medium' : 'low') : undefined;
      setProvenance({
        source: 'ai_photos',
        sourceRef: String(data?.layout?.version || 'visual-grounder-v1'),
        confidence,
        confidenceSummary,
      });
    } catch (error) {
      console.error('Error generating layout:', error);
      alert('Failed to generate layout from photos. You can continue with manual setup.');
      setProvenance({ source: 'manual' });
      setCurrentStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptAi = () => {
    if (aiGeneratedTables.length === 0) return;
    setTables([...tables, ...aiGeneratedTables]);
    setAiGeneratedTables([]);
    setCurrentStep(1);
  };

  const handleDiscardAi = () => {
    setAiGeneratedTables([]);
    setProvenance({ source: 'manual' });
  };

  const handleSkipQuickSetup = () => {
    setUseQuickSetup(false);
    setCurrentStep(1);
  };

  const handleComplete = () => {
    if (tables.length === 0) {
      alert('Please add at least one table to continue.');
      return;
    }
    onComplete({ tables, provenance });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-6 h-6 text-teal-400" />
              Lounge Layout Setup Wizard
            </h2>
            <p className="text-zinc-400 mt-1">
              {currentStep === 0 ? 'Quick Setup (Optional)' : `Step ${currentStep} of ${totalSteps - 1}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="Close wizard"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-zinc-800/50">
          <div className="flex items-center gap-2">
            {/* Step 0: Quick Setup (optional) */}
            {currentStep === 0 && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold bg-teal-500 text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="h-1 w-16 bg-zinc-700" />
              </div>
            )}
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      step < currentStep
                        ? 'bg-green-500 text-white'
                        : step === currentStep
                        ? 'bg-teal-500 text-white'
                        : 'bg-zinc-700 text-zinc-400'
                    }`}
                  >
                    {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                  </div>
                  {step < totalSteps && (
                    <div
                      className={`h-1 w-16 transition-colors ${
                        step < currentStep ? 'bg-green-500' : 'bg-zinc-700'
                      }`}
                    />
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border border-teal-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Quick Setup with AI (Optional)</h3>
                    <p className="text-sm text-zinc-300">
                      Upload photos of your lounge and optionally a YAML config file. Our AI will automatically
                      detect tables and seating areas, saving you time. You can always edit the results.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Camera className="w-5 h-5 text-teal-400" />
                    Upload Photos
                  </h3>
                  <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-teal-500 transition-colors">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                    <p className="text-sm text-zinc-300 mb-2">
                      Upload 3-6 photos of your lounge
                    </p>
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Choose Photos
                    </button>
                    {uploadedPhotos.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-zinc-400 mb-2">
                          {uploadedPhotos.length} photo{uploadedPhotos.length !== 1 ? 's' : ''} uploaded
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {uploadedPhotos.map((file, idx) => (
                            <div key={idx} className="text-xs bg-zinc-800 px-2 py-1 rounded">
                              {file.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* YAML Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-400" />
                    Upload YAML Config (Optional)
                  </h3>
                  <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-teal-500 transition-colors">
                    <input
                      ref={yamlInputRef}
                      type="file"
                      accept=".yaml,.yml"
                      onChange={handleYamlUpload}
                      className="hidden"
                    />
                    <FileText className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                    <p className="text-sm text-zinc-300 mb-2">
                      Upload YAML file with table metadata
                    </p>
                    <button
                      onClick={() => yamlInputRef.current?.click()}
                      className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Choose YAML File
                    </button>
                    {yamlMetadata && (
                      <div className="mt-4">
                        <p className="text-xs text-green-400">✓ YAML file loaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isProcessing && (
                <div className="bg-zinc-800 rounded-lg p-6 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
                  <p className="text-zinc-300">AI is analyzing your photos and generating layout...</p>
                </div>
              )}

              {aiGeneratedTables.length > 0 && (
                <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">AI Generated {aiGeneratedTables.length} Tables!</h3>
                      <p className="text-sm text-zinc-300">
                        AI is a suggestion, not truth. Accept these suggestions to begin editing, or discard and set up manually.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={handleAcceptAi}
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Use AI suggestions
                        </button>
                        <button
                          onClick={handleDiscardAi}
                          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Discard
                        </button>
                        {provenance?.source === 'ai_photos' ? (
                          <div className="text-xs text-zinc-400 flex items-center">
                            {typeof provenance.confidence === 'number'
                              ? `Confidence: ${Math.round(provenance.confidence * 100)}% (${provenance.confidenceSummary})`
                              : 'Confidence: unknown'}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <button
                  onClick={handleSkipQuickSetup}
                  className="text-zinc-400 hover:text-white transition-colors text-sm"
                >
                  Skip Quick Setup →
                </button>
                <button
                  onClick={handleQuickSetup}
                  disabled={uploadedPhotos.length < 3 || isProcessing || aiGeneratedTables.length > 0}
                  className="px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Generate Layout with AI
                </button>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Welcome to Lounge Layout Setup!</h3>
                    <p className="text-sm text-zinc-300">
                      This wizard will help you set up your lounge floor plan. You can always edit it later.
                      Start by adding your tables and seating areas.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Add Tables</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Table Name/Number
                    </label>
                    <input
                      type="text"
                      value={newTable.name}
                      onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                      placeholder="e.g., T-001, VIP-1"
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTable()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Capacity
                    </label>
                    <input
                      type="number"
                      value={newTable.capacity}
                      onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) || 4 })}
                      min="1"
                      max="20"
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Seating Type
                    </label>
                    <select
                      value={newTable.seatingType}
                      onChange={(e) => setNewTable({ ...newTable, seatingType: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {seatingTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Quantity
                      <span className="text-xs text-zinc-500 ml-1">(how many of this type?)</span>
                    </label>
                    <input
                      type="number"
                      value={newTable.quantity}
                      onChange={(e) => setNewTable({ ...newTable, quantity: Math.max(1, Math.min(50, parseInt(e.target.value) || 1)) })}
                      min="1"
                      max="50"
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddTable}
                  disabled={!newTable.name.trim()}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Table
                </button>
              </div>

              {tables.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Added Tables ({tables.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tables.map((table) => (
                      <div
                        key={table.id}
                        className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-white flex items-center gap-2">
                            <TableIcon className="w-4 h-4 text-teal-400" />
                            {table.name}
                          </div>
                          <div className="text-sm text-zinc-400 mt-1">
                            {table.capacity} seats • {table.seatingType}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveTable(table.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          aria-label={`Remove ${table.name}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Position Your Tables</h3>
                    <p className="text-sm text-zinc-300">
                      After completing this wizard, you'll be able to drag and drop tables on the layout canvas
                      to position them exactly where they are in your lounge.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Quick Tips</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-white">Drag to Position</div>
                      <div className="text-sm text-zinc-400">Click and drag tables to match your floor plan</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-white">Edit Anytime</div>
                      <div className="text-sm text-zinc-400">You can always come back to adjust positions</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-white">Save Your Layout</div>
                      <div className="text-sm text-zinc-400">Click the Save button when you're done positioning</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">You're Almost Done!</h3>
                    <p className="text-sm text-zinc-300">
                      Review your tables and click "Complete Setup" to finish. You'll be taken to the layout editor
                      where you can position your tables.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
                <div className="bg-zinc-800 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-zinc-400 text-sm">Total Tables</div>
                      <div className="text-2xl font-bold text-white">{tables.length}</div>
                    </div>
                    <div>
                      <div className="text-zinc-400 text-sm">Total Capacity</div>
                      <div className="text-2xl font-bold text-white">
                        {tables.reduce((sum, t) => sum + t.capacity, 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-zinc-800 bg-zinc-800/50">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
          <div className="flex items-center gap-3">
            {currentStep < totalSteps - 1 ? (
              <button
                onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                Complete Setup
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

