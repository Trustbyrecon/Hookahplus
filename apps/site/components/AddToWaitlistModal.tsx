'use client';

import React, { useState } from 'react';
import { X, User, Phone, Users, Star, FileText, Loader2 } from 'lucide-react';

interface WaitlistEntry {
  id: string;
  name: string;
  phone: string;
  partySize: number;
  priority: 'VIP' | 'NORMAL';
  notes?: string;
  createdAt: string;
  waitTime?: number; // minutes
}

interface AddToWaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (entry: Omit<WaitlistEntry, 'id' | 'createdAt'>) => void;
}

export default function AddToWaitlistModal({
  isOpen,
  onClose,
  onAdd
}: AddToWaitlistModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [priority, setPriority] = useState<'VIP' | 'NORMAL'>('NORMAL');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setName('');
      setPhone('');
      setPartySize(2);
      setPriority('NORMAL');
      setNotes('');
      setError(null);
    }
  }, [isOpen]);

  // Handle Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const formatPhone = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const validatePhone = (phoneNumber: string): boolean => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Please enter customer name');
      return;
    }

    if (!phone.trim()) {
      setError('Please enter phone number');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    if (partySize < 1 || partySize > 20) {
      setError('Party size must be between 1 and 20');
      return;
    }

    setIsSubmitting(true);

    try {
      // Clean phone number for storage
      const cleanedPhone = phone.replace(/\D/g, '');
      const phoneWithCountryCode = cleanedPhone.startsWith('1') && cleanedPhone.length === 11
        ? `+${cleanedPhone}`
        : `+1${cleanedPhone}`;

      // Create waitlist entry
      const entry: Omit<WaitlistEntry, 'id' | 'createdAt'> = {
        name: name.trim(),
        phone: phoneWithCountryCode,
        partySize,
        priority,
        notes: notes.trim() || undefined,
      };

      onAdd(entry);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add to waitlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden relative">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center border border-yellow-500/30">
                <Users className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Add to Waitlist</h2>
                <p className="text-sm text-zinc-400">Customer information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="waitlist-name" className="block text-sm font-medium text-zinc-300 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Customer Name <span className="text-red-400">*</span>
              </label>
              <input
                id="waitlist-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                placeholder="John Doe"
                disabled={isSubmitting}
              />
            </div>

            {/* Phone Input */}
            <div>
              <label htmlFor="waitlist-phone" className="block text-sm font-medium text-zinc-300 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                id="waitlist-phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                required
                maxLength={14}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                placeholder="(555) 123-4567"
                disabled={isSubmitting}
              />
            </div>

            {/* Party Size Input */}
            <div>
              <label htmlFor="waitlist-party-size" className="block text-sm font-medium text-zinc-300 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Party Size <span className="text-red-400">*</span>
              </label>
              <input
                id="waitlist-party-size"
                type="number"
                value={partySize}
                onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                required
                min={1}
                max={20}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                disabled={isSubmitting}
              />
            </div>

            {/* Priority Toggle */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <Star className="w-4 h-4 inline mr-1" />
                Priority
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPriority('NORMAL')}
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-2.5 rounded-lg border transition-all ${
                    priority === 'NORMAL'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                      : 'bg-zinc-900 border-zinc-600 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('VIP')}
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-2.5 rounded-lg border transition-all ${
                    priority === 'VIP'
                      ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                      : 'bg-zinc-900 border-zinc-600 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  <Star className="w-4 h-4 inline mr-1" />
                  VIP
                </button>
              </div>
            </div>

            {/* Notes Input */}
            <div>
              <label htmlFor="waitlist-notes" className="block text-sm font-medium text-zinc-300 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Notes <span className="text-zinc-500 text-xs">(optional)</span>
              </label>
              <textarea
                id="waitlist-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 resize-none"
                placeholder="Special requests, table preferences, etc."
                disabled={isSubmitting}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    Add to Waitlist
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full text-sm text-zinc-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export type { WaitlistEntry };

