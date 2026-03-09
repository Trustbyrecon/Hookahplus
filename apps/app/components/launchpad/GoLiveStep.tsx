'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, Mail, Phone, Lock, Link as LinkIcon, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { clientClient, isSupabaseConfigured } from '../../lib/supabase-client';

interface GoLiveStepProps {
  sessionToken: string;
  onBack?: () => void;
}

export function GoLiveStep({ sessionToken, onBack }: GoLiveStepProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    useMagicLink: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [readiness, setReadiness] = useState<any>(null);
  const [readinessLoading, setReadinessLoading] = useState(false);
  const [locationsMeta, setLocationsMeta] = useState<any>(null);
  const [locationsLoading, setLocationsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Load location draft/provision state for preflight summary.
  useEffect(() => {
    if (!sessionToken) return;
    setLocationsLoading(true);
    fetch(`/api/launchpad/locations?token=${encodeURIComponent(sessionToken)}&includeChecklist=1`)
      .then((r) => r.json())
      .then((data) => setLocationsMeta(data))
      .catch(() => setLocationsMeta(null))
      .finally(() => setLocationsLoading(false));
  }, [sessionToken]);

  const isMultiLocation = Boolean(locationsMeta?.session?.multiLocationEnabled) && Array.isArray(locationsMeta?.locations) && locationsMeta.locations.length > 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!formData.email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateEmail(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    if (!formData.useMagicLink && !formData.password) {
      setErrors({ password: 'Password is required or use magic link' });
      return;
    }

    if (!formData.useMagicLink && formData.password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/launchpad/create-lounge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: sessionToken,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.useMagicLink ? undefined : formData.password,
          useMagicLink: formData.useMagicLink,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Show detailed error message
        const errorMsg = result.details || result.error || 'Failed to create account';
        console.error('[Go Live] Error response:', result);
        throw new Error(errorMsg);
      }

      // Auto sign-in when using password so Onboarding Engine and Dashboard work immediately
      if (!formData.useMagicLink && formData.password && isSupabaseConfigured()) {
        try {
          const { error } = await clientClient().auth.signInWithPassword({
            email: formData.email.trim(),
            password: formData.password,
          });
          if (error) console.warn('[Go Live] Auto sign-in failed:', error.message);
        } catch (e) {
          console.warn('[Go Live] Auto sign-in error:', e);
        }
      }

      setResult(result);
    } catch (error: any) {
      console.error('[Go Live] Error:', error);
      setErrors({ submit: error.message || 'Failed to complete setup' });
      setIsSubmitting(false);
    }
  };

  // Fetch readiness after successful provisioning
  useEffect(() => {
    const loungeId = result?.loungeId;
    if (!loungeId) return;
    setReadinessLoading(true);
    fetch(`/api/launchpad/readiness?loungeId=${encodeURIComponent(loungeId)}&token=${encodeURIComponent(sessionToken)}`)
      .then((r) => r.json())
      .then((data) => setReadiness(data))
      .catch(() => setReadiness(null))
      .finally(() => setReadinessLoading(false));
  }, [result?.loungeId, sessionToken]);

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Go Live</h2>
        <p className="text-zinc-400 text-sm">
          You're ready. Let's turn it on.
        </p>
      </div>

      {result?.success && result?.loungeId ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-900/20 border border-green-600/40 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-white">Lounge created successfully</div>
                <div className="text-sm text-zinc-300 mt-1">
                  {formData.useMagicLink
                    ? 'We sent you a magic link to finish signing in and open admin.'
                    : 'Your account is created. Continue to your dashboard.'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-zinc-800/60 border border-zinc-700 rounded-lg">
            <div className="font-semibold text-white mb-2">Lounge ID</div>
            <div className="flex items-center gap-2">
              <code className="text-sm text-teal-300 font-mono bg-zinc-900/60 px-2 py-1 rounded break-all">
                {result.loungeId}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(result.loungeId);
                }}
                className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-zinc-300"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Use this ID to access the Onboarding Engine or share with your team.
            </p>
          </div>

          <div className="p-4 bg-zinc-800/60 border border-zinc-700 rounded-lg">
            <div className="font-semibold text-white mb-2">GMV Readiness</div>
            {readinessLoading ? (
              <div className="text-sm text-zinc-400">Checking setup…</div>
            ) : readiness?.success ? (
              <div className="space-y-2">
                <div className="text-xs text-zinc-400">
                  {readiness.score.ok}/{readiness.score.total} checks complete
                </div>
                <ul className="space-y-2 text-sm">
                  {readiness.checklist?.map((c: any) => (
                    <li key={c.id} className="flex items-start gap-2">
                      <span className="mt-0.5">{c.ok ? '✅' : '⬜'}</span>
                      <div>
                        <div className="text-white">{c.label}</div>
                        <div className="text-xs text-zinc-400">{c.detail}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-sm text-zinc-400">Readiness checks unavailable.</div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push(`/onboarding/${result.loungeId}`)}
              className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg text-white font-semibold transition-colors"
            >
              <Target className="w-4 h-4" />
              Continue to Onboarding
            </button>
            <button
              type="button"
              onClick={() => router.push(`/dashboard?lounge=${result.loungeId}&welcome=true`)}
              className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 rounded-lg text-white font-semibold transition-colors"
            >
              Open Dashboard
            </button>
            <a
              href={`/api/launchpad/download/playbook/${result.loungeId}`}
              className="px-6 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white hover:border-teal-500 transition-colors inline-flex items-center"
            >
              Download Staff Playbook
            </a>
          </div>

          {Array.isArray(result.assetsByLocation) && result.assetsByLocation.length > 1 && (
            <div className="p-4 bg-zinc-800/60 border border-zinc-700 rounded-lg">
              <div className="font-semibold text-white mb-2">Locations provisioned</div>
              <div className="space-y-2">
                {result.assetsByLocation.map((loc: any) => (
                  <div key={loc.loungeId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-zinc-950/30 border border-zinc-800 rounded px-3 py-2">
                    <div className="min-w-0">
                      <div className="text-sm text-white font-medium truncate">{loc.loungeName || loc.loungeId}</div>
                      <div className="text-xs text-zinc-400">{loc.loungeId}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={loc.dashboardUrl || `/dashboard/${encodeURIComponent(loc.loungeId)}`}
                        className="text-xs px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded hover:border-teal-500 transition-colors"
                      >
                        Dashboard
                      </a>
                      <a
                        href={`/api/launchpad/download/playbook/${encodeURIComponent(loc.loungeId)}`}
                        className="text-xs px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded hover:border-teal-500 transition-colors"
                      >
                        Playbook
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
      <div className="space-y-6">
      {/* What You'll Get */}
      <div className="p-4 bg-teal-900/20 border border-teal-600/50 rounded-lg">
        <h3 className="font-semibold text-white mb-3">You now have:</h3>
        <ul className="space-y-2 text-sm text-teal-200">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Live session tracking
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Flavor & mix memory
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Staff shift handoff
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Add-on capture
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Owner visibility
          </li>
        </ul>
      </div>

      {/* Multi-location preflight summary */}
      {isMultiLocation && (
        <div className="p-4 bg-zinc-800/60 border border-zinc-700 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-semibold text-white">You’re about to create multiple locations</div>
              <div className="text-xs text-zinc-400 mt-1">
                Per-location: name, tables/sections, hours. Shared: flavors, rules, staff roles, POS.
              </div>
            </div>
            {locationsLoading && <div className="text-xs text-zinc-500">Loading…</div>}
          </div>
          <div className="mt-3 space-y-2">
            {Array.isArray(locationsMeta?.locations) && locationsMeta.locations.map((loc: any, idx: number) => (
              <div key={`${idx}-${loc.loungeId || loc.name}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-zinc-950/30 border border-zinc-800 rounded px-3 py-2">
                <div className="min-w-0">
                  <div className="text-sm text-white font-medium truncate">{loc.name}</div>
                  <div className="text-xs text-zinc-400">
                    {loc.tablesCount ? `${loc.tablesCount} tables` : 'Tables: —'}
                    {typeof loc.sectionsCount === 'number' ? ` • ${loc.sectionsCount} sections` : ''}
                  </div>
                </div>
                <div className="text-xs text-zinc-500">
                  {loc.provisioned ? 'Provisioned' : 'Draft'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                setErrors({});
              }}
              className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
              placeholder="owner@example.com"
              required
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Phone (Optional) */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Phone (optional)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        {/* Authentication Method */}
        <div>
          <label className="flex items-center gap-3 p-4 bg-zinc-800 border border-zinc-600 rounded-lg cursor-pointer hover:border-teal-500 transition-colors mb-4">
            <input
              type="checkbox"
              checked={formData.useMagicLink}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  useMagicLink: e.target.checked,
                  password: '', // Clear password when switching
                }))
              }
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
            />
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-teal-400" />
              <span className="text-sm text-white">Use magic link instead of password</span>
            </div>
          </label>

          {!formData.useMagicLink && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, password: e.target.value }));
                    setErrors({});
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                  placeholder="Minimum 8 characters"
                  minLength={8}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-zinc-400">
                Password must be at least 8 characters
              </p>
            </div>
          )}
        </div>

        {errors.submit && (
          <div className="p-3 bg-red-900/20 border border-red-600/50 rounded-lg">
            <p className="text-sm text-red-200">{errors.submit}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-zinc-700">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white hover:border-teal-500 transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating account...' : 'Go Live Tonight'}
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </form>
      </div>
      )}
    </div>
  );
}

