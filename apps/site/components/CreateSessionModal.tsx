'use client';

import React, { useState } from 'react';
import { X, Plus, Users, Phone, CreditCard, Flame } from 'lucide-react';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sessionData: any) => void;
  isDemoMode?: boolean;
}

export default function CreateSessionModal({ isOpen, onClose, onSave, isDemoMode = false }: CreateSessionModalProps) {
  const [sessionData, setSessionData] = useState({
    table: '',
    customerName: '',
    customerPhone: '',
    sessionType: 'walk-in',
    basePrice: 30,
    addons: [] as string[]
  });

  const tables = ['T-001', 'T-002', 'T-003', 'T-004', 'T-005', 'T-006'];
  const addons = [
    { id: 'mint', label: 'Mint', price: 2.50 },
    { id: 'mango', label: 'Mango', price: 2.00 },
    { id: 'strawberry', label: 'Strawberry', price: 2.00 },
    { id: 'peach', label: 'Peach', price: 2.50 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(sessionData);
    // In demo mode, don't close immediately - let the success handler close it
    // In production mode, close immediately after save
    if (!isDemoMode) {
      onClose();
      // Reset form
      setSessionData({
        table: '',
        customerName: '',
        customerPhone: '',
        sessionType: 'walk-in',
        basePrice: 30,
        addons: []
      });
    }
  };

  if (!isOpen) return null;

  const total = sessionData.basePrice + sessionData.addons.reduce((sum, addon) => {
    const item = addons.find(a => a.id === addon);
    return sum + (item?.price || 0);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700 sticky top-0 bg-zinc-900">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-400" />
            Create New Session{isDemoMode ? ' (Demo)' : ''}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Session Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Session Details</h3>
              
              {/* Table Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Table Selection *
                </label>
                <select
                  value={sessionData.table}
                  onChange={(e) => setSessionData({ ...sessionData, table: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">Select a table...</option>
                  {tables.map(table => (
                    <option key={table} value={table}>{table}</option>
                  ))}
                </select>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Customer Name *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    value={sessionData.customerName}
                    onChange={(e) => setSessionData({ ...sessionData, customerName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter customer name"
                    required
                  />
                </div>
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Customer Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="tel"
                    value={sessionData.customerPhone}
                    onChange={(e) => setSessionData({ ...sessionData, customerPhone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Session Type */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Session Type *
                </label>
                <select
                  value={sessionData.sessionType}
                  onChange={(e) => setSessionData({ ...sessionData, sessionType: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="walk-in">Walk-in</option>
                  <option value="reservation">Reservation</option>
                  <option value="vip">VIP</option>
                </select>
              </div>

              {/* Total Price */}
              <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-white">Total:</span>
                  <span className="text-2xl font-bold text-orange-400">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Flavor Add-ons */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Flavor Add-ons (Optional)</h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {addons.map(addon => (
                  <label
                    key={addon.id}
                    className="flex items-center justify-between p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={sessionData.addons.includes(addon.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSessionData({ ...sessionData, addons: [...sessionData.addons, addon.id] });
                          } else {
                            setSessionData({ ...sessionData, addons: sessionData.addons.filter(id => id !== addon.id) });
                          }
                        }}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <span className="text-white">{addon.label}</span>
                    </div>
                    <span className="text-teal-400 font-medium">${addon.price.toFixed(2)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-zinc-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {isDemoMode ? 'Try Demo Session' : 'Create Session'}
            </button>
          </div>
          
          {isDemoMode && (
            <div className="mt-4 p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg">
              <p className="text-xs text-zinc-400 text-center">
                💡 This is a demo experience. Complete onboarding to create real sessions and manage your lounge.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

