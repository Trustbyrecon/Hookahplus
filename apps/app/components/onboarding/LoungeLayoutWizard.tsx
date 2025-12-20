'use client';

import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  X,
  Info,
  Table as TableIcon
} from 'lucide-react';

interface Table {
  id: string;
  name: string;
  x: number;
  y: number;
  capacity: number;
  seatingType: string;
}

interface LoungeLayoutWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (tables: Table[]) => void;
  existingTables?: Table[];
}

const seatingTypes = ['Booth', 'Couch', 'Bar', 'Outdoor', 'VIP', 'Private Room'];

export function LoungeLayoutWizard({ 
  isOpen, 
  onClose, 
  onComplete,
  existingTables = []
}: LoungeLayoutWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [tables, setTables] = useState<Table[]>(existingTables);
  const [newTable, setNewTable] = useState({
    name: '',
    capacity: 4,
    seatingType: 'Booth'
  });

  const totalSteps = 3;

  const handleAddTable = () => {
    if (!newTable.name.trim()) return;

    const table: Table = {
      id: `table-${Date.now()}`,
      name: newTable.name,
      x: 50 + (tables.length % 5) * 20,
      y: 50 + Math.floor(tables.length / 5) * 20,
      capacity: newTable.capacity,
      seatingType: newTable.seatingType
    };

    setTables([...tables, table]);
    setNewTable({ name: '', capacity: 4, seatingType: 'Booth' });
  };

  const handleRemoveTable = (id: string) => {
    setTables(tables.filter(t => t.id !== id));
  };

  const handleComplete = () => {
    if (tables.length === 0) {
      alert('Please add at least one table to continue.');
      return;
    }
    onComplete(tables);
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
            <p className="text-zinc-400 mt-1">Step {currentStep} of {totalSteps}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
          <div className="flex items-center gap-3">
            {currentStep < totalSteps ? (
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

