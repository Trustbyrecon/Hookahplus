"use client";

/**
 * Pre-Order wizard — staged flow aligned with Hookah+ product language.
 * Uses source RESERVE + full session payload for operator clarity (not bare QR resolver).
 * Structured tableNotes JSON block for CLARK / analytics extensibility.
 */
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ShoppingCart,
  DollarSign,
  Sparkles,
  AlertCircle,
  Clock,
  Flame,
  TestTube,
  Shield,
  Lock,
  ChevronRight,
  ChevronLeft,
  Users,
  Wine,
  ClipboardCheck,
} from 'lucide-react';
import FlavorWheelSelector from './FlavorWheelSelector';
import Card from './Card';
import Button from './Button';
import PreorderStepIndicator from './preorder/PreorderStepIndicator';
import type { PreorderStage, PreorderOperatorMetadata } from '../lib/preorder/types';
import { buildPreorderTableNotes } from '../lib/preorder/types';
import { flavorIdsToDisplayLabels } from '../lib/preorder/flavor-display';

export interface PreorderEntryProps {
  tableId?: string;
  loungeId?: string;
  className?: string;
  showTestMode?: boolean;
  /** Table display name from floor plan */
  tableLabel?: string;
  zoneLabel?: string;
  capacity?: number;
}

const SAMPLE_ADDONS = [
  { id: 'extra-coals', name: 'Extra coals', price: 5, hint: 'Second round' },
  { id: 'premium-coals', name: 'Premium coals', price: 10, hint: 'Longer burn' },
  { id: 'flavor-boost', name: 'Flavor boost', price: 5, hint: 'Richer profile' },
];

const SESSION_DURATIONS = [
  { value: 30, label: '30' },
  { value: 45, label: '45' },
  { value: 60, label: '60' },
  { value: 90, label: '90' },
  { value: 120, label: '120' },
];

const PreorderEntry: React.FC<PreorderEntryProps> = ({
  tableId = 'T-001',
  loungeId = 'default-lounge',
  className,
  showTestMode = false,
  tableLabel,
  zoneLabel,
  capacity,
}) => {
  const isCodigo = loungeId === 'CODIGO';
  const draftStartedAtRef = useRef(new Date().toISOString());

  const [stage, setStage] = useState<PreorderStage>('welcome');
  const [selectedFlavorIds, setSelectedFlavorIds] = useState<string[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [pricingModel, setPricingModel] = useState<'flat' | 'time-based'>('flat');
  const [sessionDuration, setSessionDuration] = useState(60);
  const [dollarTestMode, setDollarTestMode] = useState(false);

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [clarkMemoryOptIn, setClarkMemoryOptIn] = useState(false);

  const [loungeConfig, setLoungeConfig] = useState<{
    menuPresets?: Array<{ id: string; name: string; flavors: string[] }>;
    customFlavors?: string[];
    baseSessionPrice?: number;
  } | null>(null);

  const [pricing, setPricing] = useState<{
    basePrice: number;
    flavorAddons: number;
    surgePricing: number;
    total: number;
    breakdown: { base: number; addons: number; surge: number };
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tableTitle = tableLabel || `Table ${tableId}`;
  const skipOptions = isCodigo;

  const maxParty = capacity && capacity > 0 ? Math.min(8, capacity) : 8;
  const partyOptions = useMemo(
    () => Array.from({ length: maxParty }, (_, i) => i + 1),
    [maxParty]
  );

  useEffect(() => {
    if (partySize > maxParty) setPartySize(maxParty);
  }, [maxParty, partySize]);

  useEffect(() => {
    if (!isCodigo) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/lounges/${loungeId}/config`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled || !data.config) return;
        const cfg = data.config;
        const configData = cfg.configData || {};
        const standard = configData.flavors?.standard;
        const customFlavors = Array.isArray(standard)
          ? standard.map((f: { name?: string }) => f?.name).filter(Boolean) as string[]
          : [];
        setLoungeConfig({
          menuPresets: configData.menu_presets || [],
          customFlavors: customFlavors.length > 0 ? customFlavors : undefined,
          baseSessionPrice: cfg.baseSessionPrice != null ? cfg.baseSessionPrice / 100 : undefined,
        });
        setPricingModel('flat');
        setSessionDuration(60);
      } catch {
        /* non-blocking */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loungeId, isCodigo]);

  useEffect(() => {
    const calculatePrice = async () => {
      if (selectedFlavorIds.length === 0) {
        setPricing(null);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/preorder/calculate-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flavors: selectedFlavorIds,
            addOns: selectedAddOns,
            tableId,
            loungeId,
            pricingModel,
            sessionDuration: pricingModel === 'time-based' ? sessionDuration : undefined,
          }),
        });
        if (!response.ok) throw new Error('Failed to calculate price');
        const result = await response.json();
        if (result.success) setPricing(result.data);
        else throw new Error(result.error || 'Failed to calculate price');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    calculatePrice();
  }, [selectedFlavorIds, selectedAddOns, tableId, loungeId, pricingModel, sessionDuration]);

  const handleFlavorSelection = useCallback((flavors: string[]) => {
    setSelectedFlavorIds(flavors);
  }, []);

  const displayFlavorLabels = useMemo(
    () => flavorIdsToDisplayLabels(selectedFlavorIds, loungeConfig?.customFlavors),
    [selectedFlavorIds, loungeConfig?.customFlavors]
  );

  /** Human-readable blend for UI + session.flavor */
  const flavorLineDisplay = useMemo(
    () => displayFlavorLabels.join(' + '),
    [displayFlavorLabels]
  );

  const addOnsTotal = useMemo(
    () =>
      selectedAddOns.reduce((sum, id) => {
        const a = SAMPLE_ADDONS.find((x) => x.id === id);
        return sum + (a?.price || 0);
      }, 0),
    [selectedAddOns]
  );

  const finalTotalDollars = dollarTestMode
    ? 1
    : pricing
      ? pricing.total + addOnsTotal
      : 0;
  const finalTotalCents = Math.round(finalTotalDollars * 100);

  const codigoPresets = useMemo(() => {
    const presets = loungeConfig?.menuPresets || [];
    return presets.map((p) => ({
      id: p.id,
      name: p.name,
      flavors: p.flavors,
      description: p.flavors?.join(' · ') || p.name,
      price: 0,
    }));
  }, [loungeConfig?.menuPresets]);

  const goNext = () => {
    setError(null);
    if (stage === 'welcome') setStage('flavors');
    else if (stage === 'flavors') {
      if (selectedFlavorIds.length === 0) {
        setError('Choose at least one flavor or a signature mix to continue.');
        return;
      }
      setStage(skipOptions ? 'guest' : 'options');
    } else if (stage === 'options') setStage('guest');
    else if (stage === 'guest') {
      if (!guestName.trim()) {
        setError('Please add the name we should use for your table.');
        return;
      }
      setStage('review');
    }
  };

  const goBack = () => {
    setError(null);
    if (stage === 'flavors') setStage('welcome');
    else if (stage === 'options') setStage('flavors');
    else if (stage === 'guest') setStage(skipOptions ? 'flavors' : 'options');
    else if (stage === 'review') setStage('guest');
  };

  const buildOperatorMeta = (): PreorderOperatorMetadata => ({
    channel: 'qr_preorder',
    loungeId,
    tableId,
    draftStartedAt: draftStartedAtRef.current,
    pricingModel,
    sessionDurationMinutes: sessionDuration,
    addOnIds: [...selectedAddOns],
    partySize,
    clarkMemoryOptIn,
    schemaVersion: 1,
  });

  const handlePay = async () => {
    if (selectedFlavorIds.length === 0 || !pricing) {
      setError('Selection incomplete.');
      return;
    }
    setStage('submitting');
    setError(null);
    try {
      const flavorMixForDb = displayFlavorLabels;
      const flavorLine = flavorMixForDb.join(' + ');
      const notes = buildPreorderTableNotes(specialRequests, buildOperatorMeta());

      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          customerName: guestName.trim(),
          customerPhone: guestPhone.trim() || undefined,
          flavor: flavorLine,
          flavorMix: flavorMixForDb,
          amount: finalTotalCents,
          sessionDuration:
            pricingModel === 'time-based' ? sessionDuration * 60 : 60 * 60,
          loungeId,
          source: 'RESERVE',
          externalRef: `hp-preorder-${loungeId}-${tableId}-${Date.now()}`,
          notes,
          pricingModel,
        }),
      });

      if (!sessionResponse.ok) {
        const sessionError = await sessionResponse.json().catch(() => ({}));
        throw new Error(
          sessionError.error || sessionError.details || 'Could not reserve your session'
        );
      }

      const sessionData = await sessionResponse.json();
      const sessionId = sessionData.session?.id || sessionData.id;
      if (!sessionId) throw new Error('Session created but no ID returned');

      const checkoutRes = await fetch('/api/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          flavors: selectedFlavorIds,
          addOns: selectedAddOns,
          tableId,
          loungeId,
          amount: finalTotalCents,
          total: finalTotalDollars,
          pricingModel,
          sessionDuration: pricingModel === 'time-based' ? sessionDuration : undefined,
          dollarTestMode,
          partySize,
        }),
      });

      if (!checkoutRes.ok) {
        const result = await checkoutRes.json();
        throw new Error(result.details || result.error || 'Checkout unavailable');
      }

      const result = await checkoutRes.json();
      if (result.success && result.url) {
        window.location.href = result.url;
        return;
      }
      throw new Error(result.error || 'Invalid checkout response');
    } catch (err) {
      setStage('review');
      setError(err instanceof Error ? err.message : 'Payment could not start');
    }
  };

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const mobileBarClass =
    'lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md p-4 pb-[max(1rem,env(safe-area-inset-bottom))]';

  return (
    <div className={`space-y-6 pb-24 lg:pb-0 ${className}`}>
      {/* Progress */}
      {stage !== 'welcome' && stage !== 'submitting' && (
        <Card variant="outlined" padding="sm" className="border-zinc-800 bg-zinc-950/50">
          <PreorderStepIndicator current={stage} skipOptions={skipOptions} />
        </Card>
      )}

      <Card className="overflow-hidden border-zinc-800/80 shadow-2xl shadow-black/40">
        {/* Decorative top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-600" />

        <div className="p-5 sm:p-8">
          {showTestMode && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <TestTube className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-amber-200">Operator test mode</h3>
                    <p className="text-xs text-amber-200/70 mt-0.5">
                      Charge $1.00 for gateway smoke tests
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDollarTestMode(!dollarTestMode)}
                  className={`shrink-0 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    dollarTestMode
                      ? 'bg-amber-400 text-zinc-900'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {dollarTestMode ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          )}

          {/* —— Welcome —— */}
          {stage === 'welcome' && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-500/90 mb-3">
                  Hookah+ Pre-Order
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                  Reserve your session
                </h2>
                <p className="mt-3 text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xl">
                  Curate your blend, confirm details, and pay securely. Your table team sees the order
                  the moment payment completes—nothing is charged until you finish checkout.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <Wine className="w-5 h-5 text-teal-400 mb-2" />
                  <p className="text-sm font-medium text-white">{tableTitle}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {[zoneLabel, capacity ? `${capacity} guests max` : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <Shield className="w-5 h-5 text-teal-400 mb-2" />
                  <p className="text-sm font-medium text-white">Trusted checkout</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Encrypted payment · PCI via Stripe · No card data on our servers
                  </p>
                </div>
              </div>

              <div className="hidden lg:block">
                <Button
                  onClick={goNext}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold rounded-xl"
                >
                  Begin
                  <ChevronRight className="w-5 h-5 ml-2 inline" />
                </Button>
              </div>
            </div>
          )}

          {/* —— Flavors —— */}
          {stage === 'flavors' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-teal-400" />
                  {isCodigo ? 'Signature blends' : 'Your blend'}
                </h3>
                <p className="text-sm text-zinc-400 mt-2">
                  {isCodigo
                    ? 'House-curated mixes from the lounge menu—or explore individual notes below.'
                    : 'Build up to four notes. Popular picks surface first for faster selection.'}
                </p>
              </div>
              <FlavorWheelSelector
                selectedFlavors={selectedFlavorIds}
                onSelectionChange={(ids, _total) => handleFlavorSelection(ids)}
                maxSelections={4}
                mode="customer"
                customPresets={codigoPresets}
                customFlavors={loungeConfig?.customFlavors || []}
                flavorAddOnFree={isCodigo}
                loungeId={loungeId}
              />
              <div className="hidden lg:flex justify-between pt-2">
                <Button variant="outline" onClick={goBack} className="border-zinc-600">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={goNext}
                  disabled={selectedFlavorIds.length === 0}
                  className="bg-teal-600 hover:bg-teal-500"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* —— Options (non-CODIGO) —— */}
          {stage === 'options' && !isCodigo && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Clock className="w-6 h-6 text-teal-400" />
                  Session & pricing
                </h3>
                <p className="text-sm text-zinc-400 mt-2">
                  Choose how this session is billed. You&apos;ll see the full breakdown on the next step.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPricingModel('flat')}
                  className={`text-left rounded-xl border-2 p-4 transition-all ${
                    pricingModel === 'flat'
                      ? 'border-teal-500 bg-teal-500/10'
                      : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
                  }`}
                >
                  <Flame className="w-5 h-5 text-teal-400 mb-2" />
                  <p className="font-semibold text-white">Flat session</p>
                  <p className="text-xs text-zinc-500 mt-1">One price for the sitting—simple and predictable.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPricingModel('time-based')}
                  className={`text-left rounded-xl border-2 p-4 transition-all ${
                    pricingModel === 'time-based'
                      ? 'border-teal-500 bg-teal-500/10'
                      : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
                  }`}
                >
                  <Clock className="w-5 h-5 text-teal-400 mb-2" />
                  <p className="font-semibold text-white">By the minute</p>
                  <p className="text-xs text-zinc-500 mt-1">Ideal when you want flexibility on length.</p>
                </button>
              </div>

              {pricingModel === 'time-based' && (
                <div>
                  <p className="text-sm font-medium text-zinc-300 mb-2">Duration</p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {SESSION_DURATIONS.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setSessionDuration(d.value)}
                        className={`py-3 rounded-lg border text-sm font-medium ${
                          sessionDuration === d.value
                            ? 'border-teal-500 bg-teal-500/15 text-teal-200'
                            : 'border-zinc-800 text-zinc-400'
                        }`}
                      >
                        {d.label}m
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-zinc-300 mb-3">Enhancements</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SAMPLE_ADDONS.map((addon) => (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddOn(addon.id)}
                      className={`text-left rounded-xl border p-4 transition-all ${
                        selectedAddOns.includes(addon.id)
                          ? 'border-teal-500 bg-teal-500/10'
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <p className="font-medium text-white text-sm">{addon.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{addon.hint}</p>
                      <p className="text-teal-400/90 text-sm mt-2">+${addon.price}</p>
                    </button>
                  ))}
                </div>
              </div>

              {pricing && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                  <div className="flex items-center gap-2 text-zinc-300 text-sm mb-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span className="font-medium text-white">Live estimate</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-white">
                    <span>Estimated total</span>
                    <span>
                      $
                      {(pricing.total + addOnsTotal).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">Final total confirmed before payment.</p>
                </div>
              )}

              <div className="hidden lg:flex justify-between">
                <Button variant="outline" onClick={goBack} className="border-zinc-600">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={goNext} className="bg-teal-600 hover:bg-teal-500">
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* —— CODIGO: compact pricing note on guest path skipped options —— */}
          {stage === 'guest' && isCodigo && pricing && (
            <div className="mb-6 rounded-xl border border-teal-500/20 bg-teal-950/20 p-4">
              <p className="text-sm text-teal-100/90">
                <span className="font-semibold text-white">Lounge pricing</span>
                {loungeConfig?.baseSessionPrice != null
                  ? ` — Session from $${loungeConfig.baseSessionPrice.toFixed(2)}`
                  : ''}
                . Flavors are included in your session price.
              </p>
            </div>
          )}

          {/* —— Guest —— */}
          {stage === 'guest' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-teal-400" />
                  Guest details
                </h3>
                <p className="text-sm text-zinc-400 mt-2">
                  So your team can greet you and coordinate service—phone is optional but helps with updates.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="hp-guest-name" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Name on reservation
                  </label>
                  <input
                    id="hp-guest-name"
                    autoComplete="name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Jordan"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label htmlFor="hp-guest-phone" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Mobile (optional)
                  </label>
                  <input
                    id="hp-guest-phone"
                    type="tel"
                    autoComplete="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+1 · used only for this visit unless you opt in below"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label htmlFor="hp-party" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Party size
                  </label>
                  <select
                    id="hp-party"
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {partyOptions.map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'guest' : 'guests'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="hp-notes" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Notes for the house (optional)
                  </label>
                  <textarea
                    id="hp-notes"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={3}
                    placeholder="Allergies, occasion, pacing preferences…"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-y min-h-[88px]"
                  />
                </div>
                <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/20 p-4">
                  <input
                    type="checkbox"
                    checked={clarkMemoryOptIn}
                    onChange={(e) => setClarkMemoryOptIn(e.target.checked)}
                    className="mt-1 rounded border-zinc-600 text-teal-500 focus:ring-teal-500"
                  />
                  <span>
                    <span className="text-sm font-medium text-zinc-200">Remember my preferences</span>
                    <span className="block text-xs text-zinc-500 mt-1">
                      When Hookah+ memory (CLARK) rolls out at this lounge, we may use this visit to personalize
                      future sessions. You can change this anytime.
                    </span>
                  </span>
                </label>
              </div>

              <div className="hidden lg:flex justify-between">
                <Button variant="outline" onClick={goBack} className="border-zinc-600">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={goNext} className="bg-teal-600 hover:bg-teal-500">
                  Review order
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* —— Review —— */}
          {stage === 'review' && pricing && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <ClipboardCheck className="w-6 h-6 text-teal-400" />
                  Confirm & pay
                </h3>
                <p className="text-sm text-zinc-400 mt-2">
                  You&apos;ll complete payment on Stripe&apos;s secure page. Your crew receives this order as soon as
                  payment succeeds.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 divide-y divide-zinc-800 overflow-hidden">
                <div className="p-4 flex justify-between gap-4">
                  <span className="text-zinc-500 text-sm">Table</span>
                  <span className="text-white font-medium text-right">{tableTitle}</span>
                </div>
                <div className="p-4 flex justify-between gap-4">
                  <span className="text-zinc-500 text-sm">Guest</span>
                  <span className="text-white font-medium text-right">
                    {guestName.trim()}
                    {partySize > 1 ? ` · ${partySize} guests` : ''}
                  </span>
                </div>
                <div className="p-4 flex justify-between gap-4">
                  <span className="text-zinc-500 text-sm">Blend</span>
                  <span className="text-white text-sm text-right leading-snug">{flavorLineDisplay}</span>
                </div>
                {!isCodigo && selectedAddOns.length > 0 && (
                  <div className="p-4 flex justify-between gap-4">
                    <span className="text-zinc-500 text-sm">Enhancements</span>
                    <span className="text-white text-sm text-right">
                      {selectedAddOns
                        .map((id) => SAMPLE_ADDONS.find((a) => a.id === id)?.name)
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
                <div className="p-4 bg-zinc-900/50">
                  <div className="flex justify-between items-baseline">
                    <span className="text-white font-semibold">Total due</span>
                    <span className="text-2xl font-semibold text-teal-300">
                      ${dollarTestMode ? '1.00' : finalTotalDollars.toFixed(2)}
                    </span>
                  </div>
                  {!dollarTestMode && (
                    <div className="mt-3 space-y-1 text-xs text-zinc-500">
                      <div className="flex justify-between">
                        <span>Session</span>
                        <span>${pricing.breakdown.base.toFixed(2)}</span>
                      </div>
                      {pricing.breakdown.addons > 0 && (
                        <div className="flex justify-between">
                          <span>Flavor notes</span>
                          <span>+${pricing.breakdown.addons.toFixed(2)}</span>
                        </div>
                      )}
                      {addOnsTotal > 0 && (
                        <div className="flex justify-between">
                          <span>Add-ons</span>
                          <span>+${addOnsTotal.toFixed(2)}</span>
                        </div>
                      )}
                      {pricing.breakdown.surge > 0 && (
                        <div className="flex justify-between text-amber-400/90">
                          <span>Weekend adjustment</span>
                          <span>+${pricing.breakdown.surge.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-teal-500/80" />
                  Stripe-hosted checkout
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-teal-500/80" />
                  Hookah+ never stores your card
                </span>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-xl flex gap-2 text-red-300 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="hidden lg:flex flex-wrap gap-3">
                <Button variant="outline" onClick={goBack} className="border-zinc-600">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handlePay}
                  disabled={loading}
                  className="flex-1 min-w-[200px] py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 font-semibold rounded-xl"
                >
                  <ShoppingCart className="w-5 h-5 mr-2 inline" />
                  {loading ? 'Preparing checkout…' : `Pay $${dollarTestMode ? '1.00' : finalTotalDollars.toFixed(2)}`}
                </Button>
              </div>
            </div>
          )}

          {/* —— Submitting overlay —— */}
          {stage === 'submitting' && (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white font-medium">Securing your reservation…</p>
              <p className="text-sm text-zinc-500">Connecting to Stripe. Please don&apos;t close this tab.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Mobile sticky CTAs — single bar to avoid overlapping fixed layers */}
      {stage === 'welcome' && (
        <div className={mobileBarClass}>
          <Button
            onClick={goNext}
            className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-900/30"
          >
            Begin
            <ChevronRight className="w-5 h-5 ml-2 inline" />
          </Button>
        </div>
      )}
      {stage === 'flavors' && (
        <div className={`${mobileBarClass} flex gap-2`}>
          <Button variant="outline" onClick={goBack} className="flex-1 py-3.5 border-zinc-600 shrink-0">
            <ChevronLeft className="w-4 h-4 mr-1 inline" />
            Back
          </Button>
          <Button
            onClick={goNext}
            disabled={selectedFlavorIds.length === 0}
            className="flex-[1.6] py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl min-w-0"
          >
            Continue
            <ChevronRight className="w-4 h-4 ml-1 inline" />
          </Button>
        </div>
      )}
      {stage === 'options' && !isCodigo && (
        <div className={`${mobileBarClass} flex gap-2`}>
          <Button variant="outline" onClick={goBack} className="flex-1 py-3.5 border-zinc-600 shrink-0">
            <ChevronLeft className="w-4 h-4 mr-1 inline" />
            Back
          </Button>
          <Button
            onClick={goNext}
            className="flex-[1.6] py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl"
          >
            Continue
            <ChevronRight className="w-4 h-4 ml-1 inline" />
          </Button>
        </div>
      )}
      {stage === 'guest' && (
        <div className={`${mobileBarClass} flex gap-2`}>
          <Button variant="outline" onClick={goBack} className="flex-1 py-3.5 border-zinc-600 shrink-0">
            <ChevronLeft className="w-4 h-4 mr-1 inline" />
            Back
          </Button>
          <Button
            onClick={goNext}
            disabled={!guestName.trim()}
            className="flex-[1.6] py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl"
          >
            Review
            <ChevronRight className="w-4 h-4 ml-1 inline" />
          </Button>
        </div>
      )}
      {stage === 'review' && pricing && (
        <div className={`${mobileBarClass} flex gap-2`}>
          <Button
            variant="outline"
            onClick={goBack}
            disabled={loading}
            className="flex-1 py-3.5 border-zinc-600 shrink-0"
          >
            <ChevronLeft className="w-4 h-4 mr-1 inline" />
            Back
          </Button>
          <Button
            onClick={handlePay}
            disabled={loading}
            className="flex-[1.6] py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl min-w-0"
          >
            <ShoppingCart className="w-4 h-4 mr-1 inline shrink-0" />
            {loading ? 'Wait…' : `Pay $${dollarTestMode ? '1.00' : finalTotalDollars.toFixed(2)}`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PreorderEntry;
