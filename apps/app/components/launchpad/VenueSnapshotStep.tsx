'use client';

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { VenueSnapshotData } from '../../types/launchpad';

interface VenueSnapshotStepProps {
  initialData?: VenueSnapshotData;
  onComplete: (data: VenueSnapshotData) => void;
  onBack?: () => void;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function VenueSnapshotStep({ initialData, onComplete, onBack }: VenueSnapshotStepProps) {
  const defaultLocationName = initialData?.loungeName || '';
  const [formData, setFormData] = useState<VenueSnapshotData>({
    loungeName: initialData?.loungeName || '',
    organizationName: initialData?.organizationName || '',
    multiLocationEnabled: Boolean(initialData?.multiLocationEnabled),
    locations: Array.isArray(initialData?.locations) && initialData.locations.length > 0
      ? initialData.locations
      : [{ name: defaultLocationName || 'Location 1', tablesCount: initialData?.tablesCount || 0, sectionsCount: initialData?.sectionsCount || 0, operatingHours: initialData?.operatingHours || {} }],
    operatorType: initialData?.operatorType || 'brick_and_mortar',
    operatingHours: initialData?.operatingHours || {},
    tablesCount: initialData?.tablesCount || 0,
    sectionsCount: initialData?.sectionsCount || 0,
    baseSessionPrice: initialData?.baseSessionPrice || 0,
    primaryGoal: initialData?.primaryGoal || 'all_above',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const isMobile = formData.operatorType === 'mobile';
  const locations = formData.locations || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.loungeName.trim()) {
      newErrors.loungeName = 'Lounge name is required';
    }
    if (formData.tablesCount <= 0) {
      newErrors.tablesCount = 'Please enter a valid number of tables';
    }
    if (formData.baseSessionPrice <= 0) {
      newErrors.baseSessionPrice = 'Please enter a valid base session price';
    }
    if (formData.multiLocationEnabled) {
      if (!formData.organizationName?.trim()) {
        newErrors.organizationName = 'Organization name is required for multi-location operators';
      }
      if (locations.length < 2) {
        newErrors.locations = 'Add at least 2 locations for multi-location onboarding';
      }
      const hasInvalidLocation = locations.some((loc) => !loc.name?.trim() || (loc.tablesCount || 0) <= 0);
      if (hasInvalidLocation) {
        newErrors.locations = 'Each location must include a name and table count';
      }
    }

    // Check at least one day has hours (only for brick-and-mortar)
    if (formData.operatorType === 'brick_and_mortar') {
      const hasHours = Object.values(formData.operatingHours || {}).some(
        (hours) => hours !== null
      );
      if (!hasHours) {
        newErrors.operatingHours = 'Please set operating hours for at least one day';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onComplete({
      ...formData,
      locations: formData.multiLocationEnabled ? locations : undefined,
      organizationName: formData.multiLocationEnabled ? (formData.organizationName || formData.loungeName) : undefined,
    });
  };

  const addLocation = () => {
    setFormData((prev) => ({
      ...prev,
      locations: [
        ...(prev.locations || []),
        {
          name: `Location ${(prev.locations || []).length + 1}`,
          tablesCount: prev.tablesCount || 1,
          sectionsCount: prev.sectionsCount || 0,
          operatingHours: prev.operatingHours || {},
        },
      ],
    }));
  };

  const updateLocation = (idx: number, patch: Partial<NonNullable<VenueSnapshotData['locations']>[number]>) => {
    setFormData((prev) => ({
      ...prev,
      locations: (prev.locations || []).map((loc, i) => (i === idx ? { ...loc, ...patch } : loc)),
    }));
  };

  const removeLocation = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      locations: (prev.locations || []).filter((_, i) => i !== idx),
    }));
  };

  const updateHours = (day: string, field: 'open' | 'close', value: string) => {
    setFormData((prev) => ({
      ...prev,
      operatingHours: {
        ...(prev.operatingHours || {}),
        [day]: {
          ...(prev.operatingHours?.[day] || { open: '', close: '' }),
          [field]: value,
        },
      },
    }));
  };

  const toggleDayClosed = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      operatingHours: {
        ...(prev.operatingHours || {}),
        [day]: prev.operatingHours?.[day] === null ? { open: '17:00', close: '02:00' } : null,
      },
    }));
  };

  const copyHoursToDays = (sourceDay: string, targetDays: string[]) => {
    const sourceHours = formData.operatingHours?.[sourceDay];
    if (!sourceHours || sourceHours === null) return;

    setFormData((prev) => {
      const newHours = { ...(prev.operatingHours || {}) };
      targetDays.forEach((day) => {
        newHours[day] = { ...sourceHours };
      });
      return {
        ...prev,
        operatingHours: newHours,
      };
    });
  };

  const copyMondayToWeekdays = () => {
    copyHoursToDays('monday', ['tuesday', 'wednesday', 'thursday']);
  };

  const copyFridayToSaturday = () => {
    copyHoursToDays('friday', ['saturday']);
  };

  const copyToSunday = (sourceDay: string) => {
    copyHoursToDays(sourceDay, ['sunday']);
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Venue Snapshot</h2>
        <p className="text-zinc-400 text-sm">
          Set the rules once. We'll run them every night.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Operator Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Operator Type *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.operatorType === 'brick_and_mortar'
                  ? 'border-teal-500 bg-teal-500/10'
                  : 'border-zinc-600 bg-zinc-800 hover:border-zinc-500'
              }`}
            >
              <input
                type="radio"
                name="operatorType"
                value="brick_and_mortar"
                checked={formData.operatorType === 'brick_and_mortar'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    operatorType: e.target.value as 'brick_and_mortar' | 'mobile',
                  }))
                }
                className="sr-only"
              />
              <span className="text-2xl">🏢</span>
              <span className="text-sm font-medium text-zinc-300">Brick & Mortar</span>
              <span className="text-xs text-zinc-400 text-center">Fixed location lounge</span>
            </label>
            <label
              className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.operatorType === 'mobile'
                  ? 'border-teal-500 bg-teal-500/10'
                  : 'border-zinc-600 bg-zinc-800 hover:border-zinc-500'
              }`}
            >
              <input
                type="radio"
                name="operatorType"
                value="mobile"
                checked={formData.operatorType === 'mobile'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    operatorType: e.target.value as 'brick_and_mortar' | 'mobile',
                  }))
                }
                className="sr-only"
              />
              <span className="text-2xl">🚐</span>
              <span className="text-sm font-medium text-zinc-300">Mobile Operator</span>
              <span className="text-xs text-zinc-400 text-center">Events & on-location service</span>
            </label>
          </div>
        </div>

        {/* Lounge Name */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            {isMobile ? 'Business Name' : 'Lounge name'} *
          </label>
          <input
            type="text"
            value={formData.loungeName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, loungeName: e.target.value }))
            }
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
            placeholder={isMobile ? "Your Mobile Hookah Business Name" : "Your Hookah Lounge Name"}
            required
          />
          {errors.loungeName && (
            <p className="mt-1 text-sm text-red-400">{errors.loungeName}</p>
          )}
        </div>

        <div className="bg-zinc-800/60 border border-zinc-700 rounded-lg p-4">
          <label className="flex items-center gap-3 text-sm text-zinc-200">
            <input
              type="checkbox"
              checked={Boolean(formData.multiLocationEnabled)}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  multiLocationEnabled: e.target.checked,
                  organizationName: e.target.checked ? prev.organizationName || prev.loungeName : '',
                  locations: e.target.checked
                    ? (prev.locations && prev.locations.length > 0
                      ? prev.locations
                      : [{ name: prev.loungeName || 'Location 1', tablesCount: prev.tablesCount || 1, sectionsCount: prev.sectionsCount || 0, operatingHours: prev.operatingHours || {} }])
                    : prev.locations,
                }))
              }
              className="w-4 h-4"
            />
            This operator manages multiple locations
          </label>
          {formData.multiLocationEnabled && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Organization name *</label>
                <input
                  type="text"
                  value={formData.organizationName || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, organizationName: e.target.value }))}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white"
                  placeholder="Aliethia Hospitality Group"
                />
                {errors.organizationName && <p className="mt-1 text-sm text-red-400">{errors.organizationName}</p>}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-300">Location list</p>
                  <button type="button" onClick={addLocation} className="px-3 py-1 text-xs bg-teal-600 rounded-lg">Add location</button>
                </div>
                {locations.map((loc, idx) => (
                  <div key={`${idx}-${loc.name}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 border border-zinc-700 rounded-lg">
                    <input
                      type="text"
                      value={loc.name}
                      onChange={(e) => updateLocation(idx, { name: e.target.value })}
                      className="md:col-span-6 px-3 py-2 bg-zinc-900 border border-zinc-600 rounded text-white"
                      placeholder={`Location ${idx + 1} name`}
                    />
                    <input
                      type="number"
                      min="1"
                      value={loc.tablesCount || ''}
                      onChange={(e) => updateLocation(idx, { tablesCount: parseInt(e.target.value, 10) || 0 })}
                      className="md:col-span-3 px-3 py-2 bg-zinc-900 border border-zinc-600 rounded text-white"
                      placeholder="Tables"
                    />
                    <input
                      type="number"
                      min="0"
                      value={loc.sectionsCount || ''}
                      onChange={(e) => updateLocation(idx, { sectionsCount: parseInt(e.target.value, 10) || 0 })}
                      className="md:col-span-2 px-3 py-2 bg-zinc-900 border border-zinc-600 rounded text-white"
                      placeholder="Sections"
                    />
                    <button
                      type="button"
                      onClick={() => removeLocation(idx)}
                      disabled={locations.length <= 1}
                      className="md:col-span-1 px-3 py-2 bg-zinc-700 rounded text-xs disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {errors.locations && <p className="text-sm text-red-400">{errors.locations}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Operating Hours - Only for Brick & Mortar */}
        {!isMobile && (
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Operating hours * (Used for shift handoff and session timing)
          </label>
          <div className="mb-3 flex flex-wrap gap-2">
            {formData.operatingHours?.monday && formData.operatingHours.monday !== null && (
              <button
                type="button"
                onClick={copyMondayToWeekdays}
                className="px-3 py-1.5 text-xs bg-teal-600/20 border border-teal-600/50 text-teal-400 rounded-lg hover:bg-teal-600/30 transition-colors"
                title="Copy Monday hours to Tue, Wed, Thu"
              >
                Copy Mon → Tue-Thu
              </button>
            )}
            {formData.operatingHours?.friday && formData.operatingHours.friday !== null && (
              <button
                type="button"
                onClick={copyFridayToSaturday}
                className="px-3 py-1.5 text-xs bg-teal-600/20 border border-teal-600/50 text-teal-400 rounded-lg hover:bg-teal-600/30 transition-colors"
                title="Copy Friday hours to Saturday"
              >
                Copy Fri → Sat
              </button>
            )}
          </div>
          <div className="space-y-2">
            {DAYS.map((day) => {
              const hours = formData.operatingHours?.[day];
              const isClosed = hours === null;

              return (
                <div key={day} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-zinc-400 capitalize">{day}</div>
                  {isClosed ? (
                    <button
                      type="button"
                      onClick={() => toggleDayClosed(day)}
                      className="px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-400 hover:border-teal-500 transition-colors"
                    >
                      Closed
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={hours?.open || ''}
                        onChange={(e) => updateHours(day, 'open', e.target.value)}
                        className="px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                      />
                      <span className="text-zinc-400">to</span>
                      <input
                        type="time"
                        value={hours?.close || ''}
                        onChange={(e) => updateHours(day, 'close', e.target.value)}
                        className="px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
                      />
                      {day !== 'sunday' && (
                        <button
                          type="button"
                          onClick={() => copyToSunday(day)}
                          className="px-2 py-1 text-xs bg-zinc-700 border border-zinc-600 text-zinc-300 rounded hover:border-teal-500 transition-colors"
                          title="Copy to Sunday"
                        >
                          → Sun
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleDayClosed(day)}
                        className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {errors.operatingHours && (
            <p className="mt-2 text-sm text-red-400">{errors.operatingHours}</p>
          )}
        </div>
        )}

        {/* Tables & Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              {isMobile ? 'Equipment sets / simultaneous events' : 'Tables / sections'} * 
              <span className="text-zinc-400 text-xs ml-2">(Rough count is fine. You can adjust later.)</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.tablesCount || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  tablesCount: parseInt(e.target.value, 10) || 0,
                }))
              }
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
              placeholder="12"
              required
            />
            {errors.tablesCount && (
              <p className="mt-1 text-sm text-red-400">{errors.tablesCount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Sections (optional)
            </label>
            <input
              type="number"
              min="0"
              value={formData.sectionsCount || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sectionsCount: parseInt(e.target.value, 10) || 0,
                }))
              }
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none"
              placeholder="3"
            />
          </div>
        </div>

        {/* Base Session Price */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Base session price * (Default price. Add-ons come next.)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={(formData.baseSessionPrice / 100).toFixed(2)}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  baseSessionPrice: Math.round(parseFloat(e.target.value) * 100) || 0,
                }))
              }
              className="w-full pl-8 pr-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-teal-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="30.00"
              required
            />
          </div>
          {errors.baseSessionPrice && (
            <p className="mt-1 text-sm text-red-400">{errors.baseSessionPrice}</p>
          )}
        </div>

        {/* Primary Goal */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Primary goal (choose one) *
          </label>
          <div className="space-y-2">
            {[
              { value: 'reduce_comped', label: 'Reduce comped sessions' },
              { value: 'speed_checkout', label: 'Speed up checkout' },
              { value: 'capture_preferences', label: 'Capture repeat guest preferences' },
              { value: 'all_above', label: 'All of the above' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-4 bg-zinc-800 border border-zinc-600 rounded-lg cursor-pointer hover:border-teal-500 transition-colors"
              >
                <input
                  type="radio"
                  name="primaryGoal"
                  value={option.value}
                  checked={formData.primaryGoal === option.value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      primaryGoal: e.target.value as VenueSnapshotData['primaryGoal'],
                    }))
                  }
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-zinc-300">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-zinc-700">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white hover:border-teal-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg text-white font-semibold transition-colors"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

