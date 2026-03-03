'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { User, Mail, Phone, ArrowRight } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Check if already registered
  React.useEffect(() => {
    const guestInfo = localStorage.getItem('guestInfo');
    if (guestInfo) {
      try {
        const info = JSON.parse(guestInfo);
        if (info.phone || info.email) {
          // Already registered, redirect to lounge
          const loungeId = searchParams.get('loungeId') || 'default-lounge';
          router.push(`/guest/${loungeId}`);
          return;
        }
      } catch (e) {
        // Invalid data, continue to registration
      }
    }
    setIsChecking(false);
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate at least one contact method
      if (!formData.phone && !formData.email) {
        setError('Please provide either a phone number or email address');
        setIsSubmitting(false);
        return;
      }

      // Get existing guest ID from localStorage or create new
      let guestId = localStorage.getItem('guestId');
      const deviceId = localStorage.getItem('deviceId') || `device_${Date.now()}`;
      
      if (!guestId) {
        guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('guestId', guestId);
      }

      // Save guest info to localStorage
      const guestInfo = {
        guestId,
        deviceId,
        name: formData.name || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        registeredAt: new Date().toISOString(),
      };

      localStorage.setItem('guestInfo', JSON.stringify(guestInfo));

      // Register with backend
      const response = await fetch('/api/guest/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId,
          deviceId,
          name: formData.name || undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const result = await response.json();

      // Redirect to guest lounge or return URL
      const loungeId = searchParams.get('loungeId') || 'default-lounge';
      const returnUrl = searchParams.get('return') || `/guest/${loungeId}`;
      
      router.push(returnUrl);

    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Checking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Join Hookah+</h1>
          <p className="text-zinc-400">Quick registration so we can remember you</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name (Optional) */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
              <User className="inline w-4 h-4 mr-2" />
              Name (Optional)
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Your name"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-zinc-300 mb-2">
              <Phone className="inline w-4 h-4 mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-zinc-900 text-zinc-400">or</span>
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
              <Mail className="inline w-4 h-4 mr-2" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-6"
            disabled={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {isSubmitting ? 'Registering...' : 'Continue'}
          </Button>

          {/* Skip Option */}
          <button
            type="button"
            onClick={() => {
              const loungeId = searchParams.get('loungeId') || 'default-lounge';
              router.push(`/guest/${loungeId}`);
            }}
            className="w-full text-center text-sm text-zinc-400 hover:text-zinc-300 mt-4"
          >
            Skip for now
          </button>
        </form>

        <div className="mt-6 text-xs text-zinc-500 text-center">
          Your information is stored locally and helps us personalize your experience
        </div>
      </Card>
    </div>
  );
}

export default function GuestRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
