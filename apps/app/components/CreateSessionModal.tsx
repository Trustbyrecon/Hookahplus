"use client";

import React, { useState } from 'react';
import { X, User, Phone, Clock, Flame, DollarSign, Users, FileText, MapPin } from 'lucide-react';
import { TableSelector } from './TableSelector';
import { TableType } from '../lib/tableTypes';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession: (sessionData: SessionData) => void;
}

interface SessionData {
  tableId: string;
  tableType: TableType;
  customerName: string;
  customerPhone: string;
  sessionType: string;
  flavor: string;
  amount: number;
  bohStaff: string;
  fohStaff: string;
  notes: string;
  timerDuration: number; // in minutes
}

const sessionTypes = [
  { value: 'walk-in', label: 'Walk-in', icon: <User className="w-4 h-4" /> },
  { value: 'reservation', label: 'Reservation', icon: <Clock className="w-4 h-4" /> },
  { value: 'vip', label: 'VIP', icon: <Flame className="w-4 h-4" /> }
];

const flavors = [
  'Blue Mist',
  'Double Apple',
  'Mint Fresh',
  'Strawberry Mojito',
  'Peach Wave',
  'Watermelon Mint',
  'Custom Mix'
];

const bohStaff = [
  'Mike Rodriguez',
  'Sarah Chen',
  'Alex Johnson',
  'Maria Garcia'
];

const fohStaff = [
  'John Smith',
  'Emily Davis',
  'David Wilson',
  'Lisa Brown'
];

const timerDurations = [
  { value: 30, label: '30 minutes', description: 'Standard session' },
  { value: 45, label: '45 minutes', description: 'Extended session' },
  { value: 60, label: '1 hour', description: 'Premium session' },
  { value: 90, label: '1.5 hours', description: 'VIP session' },
  { value: 120, label: '2 hours', description: 'Ultimate session' }
];

export default function CreateSessionModal({ isOpen, onClose, onCreateSession }: CreateSessionModalProps) {
  const [formData, setFormData] = useState<SessionData>({
    tableId: 'table-001',
    tableType: {} as TableType,
    customerName: 'John Smith',
    customerPhone: '+1 (555) 123-4567',
    sessionType: 'walk-in',
    flavor: 'Blue Mist',
    amount: 30,
    bohStaff: '',
    fohStaff: '',
    notes: '',
    timerDuration: 60 // Default to 1 hour
  });

  const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
  const [showTableSelector, setShowTableSelector] = useState(false);

  const [errors, setErrors] = useState<Partial<Record<keyof SessionData, string>>>({});

  const handleInputChange = (field: keyof SessionData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTableSelect = (table: TableType) => {
    setSelectedTable(table);
    setFormData(prev => ({
      ...prev,
      tableId: table.id,
      tableType: table,
      amount: 30 * table.priceMultiplier // Adjust price based on table type
    }));
    setShowTableSelector(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SessionData, string>> = {};
    
    if (!formData.tableId.trim()) newErrors.tableId = 'Table ID is required';
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!formData.sessionType) newErrors.sessionType = 'Session type is required';
    if (!formData.flavor) newErrors.flavor = 'Flavor is required';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.timerDuration || formData.timerDuration <= 0) newErrors.timerDuration = 'Session duration is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onCreateSession(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700 bg-zinc-800/50">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Flame className="w-6 h-6 mr-2 text-orange-400" />
            Create New Session
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Table Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Table Selection *
                </label>
                <div className="space-y-2">
                  {selectedTable ? (
                    <div className="p-3 bg-zinc-800/80 border border-zinc-500 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{selectedTable.icon}</span>
                          <div>
                            <div className="text-white font-medium">{selectedTable.name}</div>
                            <div className="text-sm text-zinc-400 capitalize">{selectedTable.type} • {selectedTable.capacity} people • {selectedTable.location}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedTable.availability === 'available' ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
                          }`}>
                            {selectedTable.availability}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowTableSelector(!showTableSelector)}
                            className="text-teal-400 hover:text-teal-300"
                          >
                            <MapPin className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowTableSelector(true)}
                      className="w-full p-3 bg-zinc-800/80 border border-zinc-500 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>Select a table...</span>
                      </div>
                    </button>
                  )}
                  
                  {showTableSelector && (
                    <div className="max-h-96 overflow-y-auto">
                      <TableSelector
                        selectedTableId={selectedTable?.id}
                        onTableSelect={handleTableSelect}
                        showAvailability={true}
                        showCapacity={true}
                        showPricing={true}
                        className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
                      />
                    </div>
                  )}
                </div>
                {errors.tableId && (
                  <p className="text-red-400 text-sm mt-1">{errors.tableId}</p>
                )}
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-semibold">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  className={`w-full px-4 py-3 bg-zinc-800/80 border rounded-lg text-white placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.customerName ? 'border-red-500' : 'border-zinc-500'
                  }`}
                  placeholder="Enter customer name"
                />
                {errors.customerName && (
                  <p className="text-red-400 text-sm mt-1">{errors.customerName}</p>
                )}
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-semibold">
                  Customer Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800/80 border border-zinc-500 rounded-lg text-white placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Session Type */}
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-semibold">
                  Session Type *
                </label>
                <select
                  value={formData.sessionType}
                  onChange={(e) => handleInputChange('sessionType', e.target.value)}
                  className={`w-full px-4 py-3 bg-zinc-800/80 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.sessionType ? 'border-red-500' : 'border-zinc-500'
                  }`}
                >
                  {sessionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.sessionType && (
                  <p className="text-red-400 text-sm mt-1">{errors.sessionType}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Flavor */}
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-semibold">
                  Flavor *
                </label>
                <select
                  value={formData.flavor}
                  onChange={(e) => handleInputChange('flavor', e.target.value)}
                  className={`w-full px-4 py-3 bg-zinc-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.flavor ? 'border-red-500' : 'border-zinc-500'
                  }`}
                >
                  {flavors.map((flavor) => (
                    <option key={flavor} value={flavor}>
                      {flavor}
                    </option>
                  ))}
                </select>
                {errors.flavor && (
                  <p className="text-red-400 text-sm mt-1">{errors.flavor}</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-semibold">
                  Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    className={`w-full pl-10 pr-4 py-3 bg-zinc-800 border rounded-lg text-white placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.amount ? 'border-red-500' : 'border-zinc-500'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-400 text-sm mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Timer Duration */}
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-semibold">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Session Duration *
                </label>
                <select
                  value={formData.timerDuration}
                  onChange={(e) => handleInputChange('timerDuration', parseInt(e.target.value))}
                  className={`w-full px-4 py-3 bg-zinc-800/80 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.timerDuration ? 'border-red-500' : 'border-zinc-500'
                  }`}
                >
                  {timerDurations.map((duration) => (
                    <option key={duration.value} value={duration.value}>
                      {duration.label} - {duration.description}
                    </option>
                  ))}
                </select>
                {errors.timerDuration && (
                  <p className="text-red-400 text-sm mt-1">{errors.timerDuration}</p>
                )}
              </div>

              {/* Assign BOH Staff */}
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-semibold">
                  Assign BOH Staff
                </label>
                <select
                  value={formData.bohStaff}
                  onChange={(e) => handleInputChange('bohStaff', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select BOH Staff</option>
                  {bohStaff.map((staff) => (
                    <option key={staff} value={staff}>
                      {staff}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assign FOH Staff */}
              <div>
                <label className="block text-sm font-medium text-white mb-2 font-semibold">
                  Assign FOH Staff
                </label>
                <select
                  value={formData.fohStaff}
                  onChange={(e) => handleInputChange('fohStaff', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select FOH Staff</option>
                  {fohStaff.map((staff) => (
                    <option key={staff} value={staff}>
                      {staff}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Session Notes - Full Width */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2 font-semibold">
              <FileText className="w-4 h-4 inline mr-2" />
              Session Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-500 rounded-lg text-white placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              placeholder="Add any special instructions or notes for this session..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Flame className="w-4 h-4 inline mr-2" />
              NEW Create Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
