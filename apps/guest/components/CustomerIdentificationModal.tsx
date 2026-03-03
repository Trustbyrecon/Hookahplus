'use client';

import React, { useState, useEffect } from 'react';
import { X, Phone, User, CheckCircle } from 'lucide-react';
import Button from './Button';
import Card from './Card';

interface CustomerIdentificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhoneSubmit: (phone: string, name?: string) => void;
  existingPhone?: string;
  existingName?: string;
}

export default function CustomerIdentificationModal({
  isOpen,
  onClose,
  onPhoneSubmit,
  existingPhone,
  existingName
}: CustomerIdentificationModalProps) {
  const [phone, setPhone] = useState(existingPhone || '');
  const [name, setName] = useState(existingName || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Load from localStorage if available
      const storedPhone = localStorage.getItem('hookahplus_customer_phone');
      const storedName = localStorage.getItem('hookahplus_customer_name');
      if (storedPhone) setPhone(storedPhone);
      if (storedName) setName(storedName);
    }
  }, [isOpen]);

  const validatePhone = (phoneNumber: string): boolean => {
    // Basic phone validation: accepts formats like +1234567890, (123) 456-7890, 123-456-7890, etc.
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    // Store in localStorage
    localStorage.setItem('hookahplus_customer_phone', phone);
    if (name.trim()) {
      localStorage.setItem('hookahplus_customer_name', name);
    }

    onPhoneSubmit(phone, name.trim() || undefined);
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {existingPhone ? 'Update Your Info' : 'Welcome to Hookah+'}
          </h2>
          <p className="text-zinc-400 text-sm">
            {existingPhone
              ? 'Update your phone number to continue tracking your sessions'
              : 'Enter your phone number to track your sessions and earn rewards'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              We'll use this to remember your sessions and preferences
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Name (Optional)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              leftIcon={<CheckCircle className="w-4 h-4" />}
            >
              {existingPhone ? 'Update' : 'Continue'}
            </Button>
            {!existingPhone && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
              >
                Skip
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

