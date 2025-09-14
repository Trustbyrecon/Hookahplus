// hookahplus-v2-/components/EnhancedCreateSession.tsx
"use client";

import { useState, useEffect } from 'react';
import { flagManager } from '@/lib/flag-manager';

interface EnhancedCreateSessionProps {
  onSessionCreated?: (sessionId: string) => void;
  onFlagCreated?: (flagId: string) => void;
}

export default function EnhancedCreateSession({ 
  onSessionCreated, 
  onFlagCreated 
}: EnhancedCreateSessionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    tableId: 'T-001',
    customerName: '',
    flavor: 'Blue Mist',
    amount: 100, // $1.00 in cents for test
    testMode: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Available flavors for selection
  const AVAILABLE_FLAVORS = [
    "Blue Mist", "Double Apple", "Mint Fresh", "Strawberry", "Peach Wave",
    "Grape", "Lemon", "Watermelon", "Rose", "Cardamom", "Vanilla",
    "Pineapple", "Mango", "Cherry", "Orange"
  ];

  // Available table IDs
  const AVAILABLE_TABLES = [
    { id: 'T-001', type: 'VIP', location: 'Window Side', capacity: 4 },
    { id: 'T-002', type: 'Standard', location: 'Center', capacity: 2 },
    { id: 'T-003', type: 'Standard', location: 'Corner', capacity: 2 },
    { id: 'T-004', type: 'Premium', location: 'Patio', capacity: 6 },
    { id: 'T-005', type: 'Standard', location: 'Bar Side', capacity: 2 }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.tableId) {
      newErrors.tableId = 'Table ID is required';
    }

    if (!formData.flavor) {
      newErrors.flavor = 'Flavor is required';
    }

    if (formData.amount < 100) {
      newErrors.amount = 'Amount must be at least $1.00';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateSession = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Create session in Supabase
      const response = await fetch('/api/sessions-supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableId: formData.tableId,
          customerName: formData.customerName,
          customerPhone: '+1 (555) 123-4567', // Default for test
          customerEmail: 'test@hookahplus.com', // Default for test
          flavors: [formData.flavor],
          totalAmount: formData.amount,
          source: 'staff',
          metadata: {
            testMode: formData.testMode,
            createdBy: 'staff',
            createdAt: new Date().toISOString()
          },
          specialInstructions: formData.testMode ? 'TEST TRANSACTION - $1.00' : '',
          estimatedPrepTime: 15
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session');
      }

      const data = await response.json();
      const sessionId = data.session?.id;

      if (sessionId) {
        console.log('✅ Enhanced session created:', sessionId);
        
        // Show success animation
        showSuccessAnimation();
        
        // Call callback
        if (onSessionCreated) {
          onSessionCreated(sessionId);
        }

        // Close modal after delay
        setTimeout(() => {
          setIsOpen(false);
          resetForm();
        }, 2000);
      }

    } catch (error: any) {
      console.error('❌ Failed to create session:', error);
      
      // Create flag for failed session creation
      const flag = flagManager.createFlag({
        sessionId: `failed_${Date.now()}`,
        tableId: formData.tableId,
        flagType: 'equipment_issue',
        severity: 'high',
        description: `Failed to create session: ${error.message}`,
        reportedBy: 'system',
        metadata: { error: error.message, formData }
      });

      if (onFlagCreated) {
        onFlagCreated(flag.id);
      }

      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccessAnimation = () => {
    // Add visual feedback for successful session creation
    const button = document.getElementById('create-session-btn');
    if (button) {
      button.classList.add('animate-pulse', 'bg-green-600');
      setTimeout(() => {
        button.classList.remove('animate-pulse', 'bg-green-600');
      }, 2000);
    }
  };

  const resetForm = () => {
    setFormData({
      tableId: 'T-001',
      customerName: '',
      flavor: 'Blue Mist',
      amount: 100,
      testMode: true
    });
    setErrors({});
  };

  const handleFlagManager = () => {
    // Create a test flag to demonstrate the flow
    const flag = flagManager.createFlag({
      sessionId: `test_${Date.now()}`,
      tableId: formData.tableId,
      flagType: 'equipment_issue',
      severity: 'high',
      description: 'Test flag created from Create Session',
      reportedBy: 'staff',
      metadata: { source: 'create_session' }
    });

    // Immediately escalate to edge case
    const edgeCase = flagManager.escalateToEdgeCase(flag.id, 'staff');
    
    if (edgeCase) {
      console.log('🚨 Flag escalated to edge case:', edgeCase.id);
      
      // Show alert
      alert(`🚨 Flag Manager Activated!\n\nFlag: ${flag.id}\nEdge Case: ${edgeCase.id}\n\nCheck Admin Dashboard for alerts.`);
    }

    if (onFlagCreated) {
      onFlagCreated(flag.id);
    }
  };

  return (
    <>
      {/* Create Session Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
      >
        <span className="text-xl">🔥</span>
        <span>NEW Create Session</span>
        <span className="text-xs bg-green-500 px-2 py-1 rounded-full">$1 Test</span>
      </button>

      {/* Enhanced Create Session Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1433] border border-[#2a3570] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🔥</div>
                <div>
                  <h2 className="text-xl font-bold text-[#8ff4c2]">Create New Session</h2>
                  <p className="text-sm text-[#aab6ff]">Enhanced for $1 Test Transactions</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#aab6ff] hover:text-[#e9ecff] transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Table ID */}
              <div>
                <label className="block text-sm font-medium text-[#aab6ff] mb-2">
                  Table ID *
                </label>
                <select
                  value={formData.tableId}
                  onChange={(e) => handleInputChange('tableId', e.target.value)}
                  className="w-full bg-[#1a1f3a] border border-[#2a3570] rounded-lg px-3 py-2 text-[#e9ecff] focus:border-[#8ff4c2] focus:outline-none"
                >
                  {AVAILABLE_TABLES.map(table => (
                    <option key={table.id} value={table.id}>
                      {table.id} - {table.type} ({table.location})
                    </option>
                  ))}
                </select>
                {errors.tableId && (
                  <p className="text-red-400 text-xs mt-1">{errors.tableId}</p>
                )}
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-[#aab6ff] mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full bg-[#1a1f3a] border border-[#2a3570] rounded-lg px-3 py-2 text-[#e9ecff] focus:border-[#8ff4c2] focus:outline-none"
                />
                {errors.customerName && (
                  <p className="text-red-400 text-xs mt-1">{errors.customerName}</p>
                )}
              </div>

              {/* Flavor */}
              <div>
                <label className="block text-sm font-medium text-[#aab6ff] mb-2">
                  Flavor *
                </label>
                <select
                  value={formData.flavor}
                  onChange={(e) => handleInputChange('flavor', e.target.value)}
                  className="w-full bg-[#1a1f3a] border border-[#2a3570] rounded-lg px-3 py-2 text-[#e9ecff] focus:border-[#8ff4c2] focus:outline-none"
                >
                  {AVAILABLE_FLAVORS.map(flavor => (
                    <option key={flavor} value={flavor}>{flavor}</option>
                  ))}
                </select>
                {errors.flavor && (
                  <p className="text-red-400 text-xs mt-1">{errors.flavor}</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-[#aab6ff] mb-2">
                  Amount (cents) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', parseInt(e.target.value) || 0)}
                    min="100"
                    step="100"
                    className="w-full bg-[#1a1f3a] border border-[#2a3570] rounded-lg px-3 py-2 text-[#e9ecff] focus:border-[#8ff4c2] focus:outline-none"
                  />
                  <div className="absolute right-3 top-2 text-xs text-[#aab6ff]">
                    ${(formData.amount / 100).toFixed(2)}
                  </div>
                </div>
                {errors.amount && (
                  <p className="text-red-400 text-xs mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Test Mode Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="testMode"
                  checked={formData.testMode}
                  onChange={(e) => handleInputChange('testMode', e.target.checked)}
                  className="w-4 h-4 text-[#8ff4c2] bg-[#1a1f3a] border-[#2a3570] rounded focus:ring-[#8ff4c2]"
                />
                <label htmlFor="testMode" className="text-sm text-[#aab6ff]">
                  Test Mode ($1.00 transaction)
                </label>
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateSession}
                disabled={isLoading}
                id="create-session-btn"
                className="flex-1 bg-[#8ff4c2] text-[#0e1220] px-4 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-[#7ee4b2]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0e1220] mr-2"></div>
                    Creating Session...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">🔥</span>
                    Create Session
                    {formData.testMode && (
                      <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                        $1 Test
                      </span>
                    )}
                  </div>
                )}
              </button>
              
              <button
                onClick={handleFlagManager}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                title="Test Flag Manager → Edge Case → Admin Alert flow"
              >
                🚩 Flag
              </button>
            </div>

            {/* Test Mode Info */}
            {formData.testMode && (
              <div className="mt-4 p-3 bg-green-900/20 border border-green-500 rounded-lg">
                <div className="text-sm text-green-300">
                  <div className="font-medium mb-1">🧪 Test Mode Active</div>
                  <div className="text-xs">
                    • $1.00 transaction for testing<br/>
                    • Full workflow validation<br/>
                    • Safe for live launch preparation
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
