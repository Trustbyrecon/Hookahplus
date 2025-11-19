'use client';

import React, { useState, useEffect } from 'react';
import { X, Gift, CheckCircle, Loader2 } from 'lucide-react';
import Button from './Button';

interface RewardsSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (guestInfo: { name: string; phone: string; guestId?: string }) => void;
  sessionId?: string;
  loungeId?: string;
}

export default function RewardsSignupModal({
  isOpen,
  onClose,
  onSuccess,
  sessionId,
  loungeId
}: RewardsSignupModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if guest is already registered
  useEffect(() => {
    if (isOpen) {
      const guestInfoStr = localStorage.getItem('guestInfo');
      if (guestInfoStr) {
        try {
          const guestInfo = JSON.parse(guestInfoStr);
          if (guestInfo.name && guestInfo.phone) {
            // Guest is already registered, pre-fill form
            setName(guestInfo.name);
            setPhone(guestInfo.phone);
            setEmail(guestInfo.email || '');
          }
        } catch (e) {
          console.warn('Failed to parse guestInfo:', e);
        }
      }
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
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

  const validatePhone = (phoneNumber: string): boolean => {
    // Basic phone validation - accepts various formats
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  const formatPhone = (value: string): string => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);

    try {
      // Clean phone number for storage (remove formatting)
      const cleanedPhone = phone.replace(/\D/g, '');
      const phoneWithCountryCode = cleanedPhone.startsWith('1') && cleanedPhone.length === 11
        ? `+${cleanedPhone}`
        : `+1${cleanedPhone}`;

      // Create guest profile
      const response = await fetch('/api/guest/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phoneWithCountryCode,
          email: email.trim() || undefined,
          sessionId,
          loungeId: loungeId || 'default-lounge',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
        throw new Error(errorData.error || 'Failed to register for rewards');
      }

      const data = await response.json();

      // Store guest info in localStorage
      const guestInfo = {
        guestId: data.guestId || data.id,
        name: name.trim(),
        phone: phoneWithCountryCode,
        email: email.trim() || undefined,
        deviceId: data.deviceId || localStorage.getItem('deviceId'),
      };

      localStorage.setItem('guestInfo', JSON.stringify(guestInfo));

      // Update deviceId if provided
      if (data.deviceId) {
        localStorage.setItem('deviceId', data.deviceId);
      }

      setSuccess(true);

      // Call onSuccess callback after a brief delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess({
            name: name.trim(),
            phone: phoneWithCountryCode,
            guestId: data.guestId || data.id,
          });
        }
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Rewards signup error:', err);
      setError(err.message || 'Failed to sign up for rewards. Please try again.');
    } finally {
      setIsLoading(false);
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
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        </div>

        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center border border-teal-500/30">
                <Gift className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Join Rewards Program</h2>
                <p className="text-sm text-zinc-400">Unlock exclusive benefits</p>
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
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Welcome to Rewards!</h3>
              <p className="text-zinc-400 text-sm">
                You're all set. Start earning points on every visit!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Benefits List */}
              <div className="mb-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <p className="text-sm font-semibold text-teal-300 mb-2">What you'll get:</p>
                <ul className="space-y-1.5 text-xs text-zinc-400">
                  <li className="flex items-center gap-2">
                    <span className="text-teal-400">✓</span>
                    <span>Earn points on every session</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-teal-400">✓</span>
                    <span>Track your favorite flavors</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-teal-400">✓</span>
                    <span>Get exclusive offers & discounts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-teal-400">✓</span>
                    <span>Never lose your session history</span>
                  </li>
                </ul>
              </div>

              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>

              {/* Phone Input */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-zinc-300 mb-2">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  maxLength={14}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="(555) 123-4567"
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-zinc-500">We'll send you updates about your rewards</p>
              </div>

              {/* Email Input (Optional) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                  Email <span className="text-zinc-500 text-xs">(optional)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="john@example.com"
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-zinc-500">Get special offers and session summaries</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 space-y-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing Up...
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      Join Rewards Program
                    </>
                  )}
                </Button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-sm text-zinc-400 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  Maybe later
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

