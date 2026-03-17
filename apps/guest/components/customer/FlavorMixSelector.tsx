'use client';

import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Wand2, Sparkles, FlaskConical, ListFilter, CircleDot, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from '../../utils/cn';

/**
 * Hookah+ Flavor Mix Selector — Wheel + Guided Flow
 * -------------------------------------------------
 * Enhanced version for Guest Build integration
 * Features:
 * - Wheel Mode (radial flavor wheel with category segments)
 * - Flow Mode (psychology-driven guided choices: mood → palette → mix)
 * - Integration with existing cart system
 * - Mobile-responsive design
 * - Real-time pricing updates
 */

// --- Flavor Categories (Enhanced for Hookah+) ---
const FLAVOR_CATEGORIES = [
  {
    id: "mint",
    label: "Mint & Cool",
    hue: 176,
    tier: "standard",
    items: [
      { id: "mint", label: "Classic Mint", price: 2.0 },
      { id: "ice-mint", label: "Ice Mint", price: 2.0 },
      { id: "spearmint", label: "Spearmint", price: 2.0 },
      { id: "menthol", label: "Menthol Burst", price: 2.5 },
    ],
  },
  {
    id: "fruit",
    label: "Fruity",
    hue: 18,
    tier: "standard",
    items: [
      { id: "mango", label: "Mango", price: 2.0 },
      { id: "peach", label: "Peach", price: 2.0 },
      { id: "watermelon", label: "Watermelon", price: 2.0 },
      { id: "grape", label: "Grape", price: 2.0 },
      { id: "berry", label: "Mixed Berry", price: 2.5 },
    ],
  },
  {
    id: "citrus",
    label: "Citrus",
    hue: 48,
    tier: "standard",
    items: [
      { id: "lemon", label: "Lemon", price: 2.0 },
      { id: "orange", label: "Orange", price: 2.0 },
      { id: "lime", label: "Lime", price: 2.0 },
      { id: "tangerine", label: "Tangerine", price: 2.5 },
    ],
  },
  {
    id: "dessert",
    label: "Dessert",
    hue: 300,
    tier: "medium",
    items: [
      { id: "vanilla", label: "Vanilla", price: 3.0 },
      { id: "caramel", label: "Caramel", price: 3.0 },
      { id: "chocolate", label: "Chocolate", price: 3.5 },
      { id: "cookie", label: "Cookie Dough", price: 3.5 },
    ],
  },
  {
    id: "spice",
    label: "Spice & Bold",
    hue: 12,
    tier: "medium",
    items: [
      { id: "double-apple", label: "Double Apple", price: 3.0 },
      { id: "cinnamon", label: "Cinnamon", price: 3.0 },
      { id: "cardamom", label: "Cardamom", price: 3.5 },
      { id: "anise", label: "Anise", price: 3.5 },
    ],
  },
  {
    id: "premium",
    label: "Premium",
    hue: 272,
    tier: "premium",
    items: [
      { id: "vodka-infused", label: "Vodka-Infused", price: 4.0 },
      { id: "whiskey-barrel", label: "Whiskey Barrel", price: 4.0 },
      { id: "boutique-import", label: "Boutique Import", price: 4.5 },
      { id: "rose", label: "Rose", price: 4.0 },
    ],
  },
];

const MOODS = [
  { id: "chill", label: "Chill & Smooth", tags: ["mint", "vanilla", "rose"], description: "Relaxing, mellow experience" },
  { id: "sweet", label: "Sweet Treat", tags: ["mango", "peach", "caramel"], description: "Indulgent, dessert-like" },
  { id: "fresh", label: "Fresh & Zesty", tags: ["lemon", "lime", "watermelon"], description: "Bright, energizing" },
  { id: "bold", label: "Bold & Spiced", tags: ["double-apple", "cinnamon", "cardamom"], description: "Strong, complex flavors" },
];

type MasterMeters = {
  smoothness: number;
  sweetness: number;
  freshness: number;
  strength: number;
  balanceScore: number;
};

const MASTER_PROFILES: Record<string, { base: string; accents: string[] }> = {
  chill: { base: "mint", accents: ["vanilla", "rose", "watermelon"] },
  sweet: { base: "vanilla", accents: ["mango", "peach", "caramel"] },
  fresh: { base: "lemon", accents: ["lime", "ice-mint", "watermelon"] },
  bold: { base: "double-apple", accents: ["double-apple", "cinnamon", "cardamom"] },
};

// CODIGO preset mixes (from pilot config)
export const CODIGO_PRESETS = [
  { id: '1', name: "Noor Al Ein", flavors: ['Lemon Mint', 'Blackberry', 'Ice'] },
  { id: '2', name: "Shah's Eclipse", flavors: ['Black Grape', 'Blueberry', 'Cooling Mint'] },
  { id: '3', name: 'Zarafshan Gold', flavors: ['Honeydew Melon', 'Pear', 'Soft Vanilla'] },
  { id: '4', name: 'Lailat Al Ward', flavors: ['Pomegranate', 'Blood Orange', 'Raspberry'] },
  { id: '5', name: 'Noor al-Layl', flavors: ['Blueberry', 'Soft Vanilla', 'Cooling Mint'] },
];

// --- Props Interface ---
export interface FlavorMixSelectorProps {
  flavors?: any[];
  selectedFlavors: string[];
  onSelectionChange: (flavors: string[]) => void;
  maxSelections?: number;
  className?: string;
  onPriceUpdate?: (total: number) => void;
  /** Lounge presets (e.g. CODIGO 5 presets). When set, shows preset selector above wheel. */
  presets?: Array<{ id: string; name: string; flavors: string[] }>;
  /** Custom flavors from lounge config (e.g. CODIGO menu). When set, hides generic categories and shows only these + presets. */
  customFlavors?: string[];
  /** When true, flavor add-ons are $0 (included in flat fee). */
  flavorAddOnFree?: boolean;
}

// --- Helper Functions ---
function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function findFlavorLabel(id: string, customFlavors?: string[]) {
  // Custom flavors use name as id (e.g. "Lemon Mint"); when in custom mode, unknown ids are display names
  if (customFlavors) {
    if (customFlavors.includes(id)) return id;
    for (const c of FLAVOR_CATEGORIES) {
      const f = c.items.find((x) => x.id === id);
      if (f) return f.label;
    }
    return id; // Preset flavor names not in customFlavors - use as display
  }
  for (const c of FLAVOR_CATEGORIES) {
    const f = c.items.find((x) => x.id === id);
    if (f) return f.label;
  }
  return id;
}

function findFlavorPrice(id: string, flavorAddOnFree?: boolean, customFlavors?: string[]) {
  if (flavorAddOnFree) return 0;
  if (customFlavors?.includes(id)) return 0;
  for (const c of FLAVOR_CATEGORIES) {
    const f = c.items.find((x) => x.id === id);
    if (f) return f.price;
  }
  return 0;
}

function findFlavorCategory(id: string) {
  for (const c of FLAVOR_CATEGORIES) {
    if (c.items.some((x) => x.id === id)) return c;
  }
  return null;
}

function computeMasterMeters(selected: string[]): MasterMeters {
  if (!selected.length) {
    return {
      smoothness: 0,
      sweetness: 0,
      freshness: 0,
      strength: 0,
      balanceScore: 0,
    };
  }

  let mintCount = 0;
  let fruitCount = 0;
  let citrusCount = 0;
  let dessertCount = 0;
  let spiceCount = 0;
  let premiumCount = 0;
  let hasRose = false;

  for (const id of selected) {
    const cat = findFlavorCategory(id);
    if (!cat) continue;

    switch (cat.id) {
      case "mint":
        mintCount++;
        break;
      case "fruit":
        fruitCount++;
        break;
      case "citrus":
        citrusCount++;
        break;
      case "dessert":
        dessertCount++;
        break;
      case "spice":
        spiceCount++;
        break;
      case "premium":
        premiumCount++;
        if (id === "rose") hasRose = true;
        break;
      default:
        break;
    }
  }

  const total =
    mintCount + fruitCount + citrusCount + dessertCount + spiceCount + premiumCount || 1;

  const smoothnessRaw = mintCount + dessertCount + (hasRose ? 1 : 0);
  const sweetnessRaw = fruitCount + dessertCount;
  const freshnessRaw = mintCount + citrusCount;
  const strengthRaw = spiceCount + premiumCount;

  const smoothness = Math.min(100, Math.round((smoothnessRaw / total) * 100));
  const sweetness = Math.min(100, Math.round((sweetnessRaw / total) * 100));
  const freshness = Math.min(100, Math.round((freshnessRaw / total) * 100));
  const strength = Math.min(100, Math.round((strengthRaw / total) * 100));

  const baseScore = Math.min(100, 30 + selected.length * 22);
  const counts = [mintCount, fruitCount, citrusCount, dessertCount, spiceCount, premiumCount].filter(
    (v) => v > 0
  );
  const maxCategoryCount = counts.length ? Math.max(...counts) : 0;
  const imbalanceRatio = total ? maxCategoryCount / total : 0;
  const imbalancePenalty = imbalanceRatio > 0.7 ? (imbalanceRatio - 0.7) * 40 : 0;
  const diversityBonus = counts.length >= 3 ? 5 : 0;

  const balanceScore = Math.round(
    Math.max(30, Math.min(100, baseScore - imbalancePenalty + diversityBonus))
  );

  return {
    smoothness,
    sweetness,
    freshness,
    strength,
    balanceScore,
  };
}

function getSweetnessLabel(value: number) {
  if (value >= 67) return "High";
  if (value >= 34) return "Medium";
  if (value > 0) return "Low";
  return "Neutral";
}

function getStrengthLabel(value: number) {
  if (value >= 67) return "Strong";
  if (value >= 34) return "Medium";
  if (value > 0) return "Light";
  return "Neutral";
}

type VibeLevel = 'low' | 'medium' | 'high';

function getRecommendationsFromVibe(profile: { balance: VibeLevel; sweetness: VibeLevel; strength: VibeLevel }): string[][] {
  const { balance, sweetness, strength } = profile;
  const count = balance === 'low' ? 2 : balance === 'medium' ? 3 : 4;

  const sweetLow = ['mint', 'lemon', 'lime', 'ice-mint'];
  const sweetMed = ['watermelon', 'grape', 'vanilla', 'berry'];
  const sweetHigh = ['mango', 'peach', 'caramel', 'vanilla'];

  const strongLow = ['mint', 'watermelon', 'vanilla', 'peach'];
  const strongMed = ['berry', 'lemon', 'grape', 'lime'];
  const strongHigh = ['double-apple', 'cinnamon', 'cardamom', 'rose'];

  const pick = (arr: string[], n: number) => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(n, shuffled.length));
  };

  const sweetnessPool = sweetness === 'low' ? sweetLow : sweetness === 'high' ? sweetHigh : sweetMed;
  const strengthPool = strength === 'low' ? strongLow : strength === 'high' ? strongHigh : strongMed;

  const rec1 = [...new Set([...pick(sweetnessPool, 2), ...pick(strengthPool, count - 2)])].slice(0, count);
  const rec2 = [...new Set([...pick(sweetnessPool, 1), ...pick(strengthPool, count - 1)])].slice(0, count);
  const rec3 = [...new Set([...pick(sweetnessPool, count - 1), ...pick(strengthPool, 1)])].slice(0, count);

  const result = [rec1, rec2, rec3].map((r) => {
    return r.length >= count ? r : [...r, ...pick(sweetMed, count - r.length)].slice(0, count);
  });
  return result;
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

// --- Main Component ---
export default function FlavorMixSelector({
  selectedFlavors = [],
  onSelectionChange,
  maxSelections = 4,
  className,
  onPriceUpdate,
  presets,
  customFlavors,
  flavorAddOnFree = false,
}: FlavorMixSelectorProps) {
  const [mode, setMode] = useState<"wheel" | "flow">("wheel");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>(selectedFlavors);
  const [mood, setMood] = useState<string | null>(null);
  const [vibeProfile, setVibeProfile] = useState<{ balance: VibeLevel; sweetness: VibeLevel; strength: VibeLevel }>({
    balance: 'medium',
    sweetness: 'medium',
    strength: 'medium',
  });
  const [eatDrink, setEatDrink] = useState("");
  const prevSelectedRef = React.useRef<string[]>(selectedFlavors);
  const onSelectionChangeRef = React.useRef(onSelectionChange);

  // Keep callback ref up to date
  React.useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  // Sync with parent component
  React.useEffect(() => {
    if (JSON.stringify(selected) !== JSON.stringify(selectedFlavors)) {
      setSelected(selectedFlavors);
      prevSelectedRef.current = selectedFlavors;
    }
  }, [selectedFlavors]);

  // Calculate total price (flavorAddOnFree = $0 for CODIGO)
  const totalPrice = useMemo(() => {
    return selected.reduce((sum, id) => sum + findFlavorPrice(id, flavorAddOnFree, customFlavors), 0);
  }, [selected, flavorAddOnFree, customFlavors]);

  // Notify parent of price changes
  React.useEffect(() => {
    if (onPriceUpdate) {
      onPriceUpdate(totalPrice);
    }
  }, [totalPrice, onPriceUpdate]);

  // Recommended flavors based on mood or current selection
  const recommended = useMemo(() => {
    if (mood) {
      const profile = MASTER_PROFILES[mood];
      if (profile) {
        return profile.accents;
      }
    }
    // Fallback: suggest complements
    const s = new Set(selected);
    const out = new Set<string>();
    if (Array.from(s).some((id) => ["mint", "ice-mint", "spearmint", "menthol"].includes(id))) {
      ["watermelon", "grape", "berry"].forEach((x) => out.add(x));
    }
    if (Array.from(s).some((id) => ["lemon", "lime", "orange"].includes(id))) {
      ["vanilla", "mango"].forEach((x) => out.add(x));
    }
    if (!out.size) ["vanilla", "mango", "lemon"].forEach((x) => out.add(x));
    return Array.from(out);
  }, [mood, selected]);

  // When customFlavors provided (CODIGO), use menu flavors instead of generic categories
  const filteredCategories = useMemo(() => {
    const q = query.toLowerCase();
    if (customFlavors && customFlavors.length > 0) {
      const filtered = q ? customFlavors.filter((f) => f.toLowerCase().includes(q)) : customFlavors;
      if (filtered.length === 0) return [];
      return [{
        id: 'menu',
        label: 'Menu Flavors',
        hue: 38,
        tier: 'standard' as const,
        items: filtered.map((name) => ({ id: name, label: name, price: 0 })),
      }];
    }
    if (!q) return FLAVOR_CATEGORIES;
    return FLAVOR_CATEGORIES.map((c) => ({
      ...c,
      items: c.items.filter((i) => i.label.toLowerCase().includes(q)),
    })).filter((c) => c.items.length);
  }, [query, customFlavors]);

  // Call callback only when selected actually changes (not when callback reference changes)
  React.useEffect(() => {
    const prevSelected = prevSelectedRef.current;
    const currentSelected = selected;
    
    // Only call callback if selection actually changed
    if (JSON.stringify(prevSelected) !== JSON.stringify(currentSelected)) {
      prevSelectedRef.current = currentSelected;
      // Use ref to avoid dependency on callback function reference
      onSelectionChangeRef.current(currentSelected);
    }
  }, [selected]); // Only depend on selected, not onSelectionChange

  function toggleFlavor(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      } else if (prev.length < maxSelections) {
        return [...prev, id];
      } else {
        return prev; // Don't add if at max
      }
    });
  }

  function clearAll() {
    setSelected([]);
    setMood(null);
    setVibeProfile({ balance: 'medium', sweetness: 'medium', strength: 'medium' });
    setEatDrink("");
  }

  const handlePresetClick = (preset: { id: string; name: string; flavors: string[] }) => {
    const isActive = JSON.stringify(selected.sort()) === JSON.stringify([...preset.flavors].sort());
    if (isActive) {
      setSelected([]);
      onSelectionChangeRef.current([]);
    } else {
      setSelected(preset.flavors);
      onSelectionChangeRef.current(preset.flavors);
    }
  };

  return (
    <div className={cn("w-full bg-neutral-950 text-neutral-100 p-6 rounded-xl", className)}>
      <div className="max-w-6xl mx-auto grid gap-6">
        {/* Preset Mixes (CODIGO) - primary choice, low cognitive load */}
        {presets && presets.length > 0 && (
          <div className="rounded-xl bg-white/5 border border-amber-500/30 p-4">
            <h3 className="font-semibold text-amber-200 mb-2">Pick a mix</h3>
            <p className="text-sm text-neutral-400 mb-3">
              Tap a preset or build your own below.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {presets.map((preset) => {
                const isActive = JSON.stringify([...selected].sort()) === JSON.stringify([...preset.flavors].sort());
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetClick(preset)}
                    className={cx(
                      "rounded-xl p-4 border-2 text-left transition-all",
                      isActive
                        ? "border-amber-400 bg-amber-500/20 text-amber-100"
                        : "border-white/10 bg-white/5 hover:border-amber-500/40 hover:bg-amber-500/10 text-neutral-200"
                    )}
                  >
                    <div className="font-medium text-sm">{preset.name}</div>
                    <div className="text-xs text-neutral-400 mt-1">
                      {preset.flavors.join(' + ')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Header - simplified for CODIGO (presets) to reduce cognitive load */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Choose Your Flavor Mix</h2>
            <p className="text-neutral-400">
              {presets?.length
                ? `Pick a preset or add up to ${maxSelections} flavors.`
                : customFlavors?.length
                ? `Choose up to ${maxSelections} flavors from our menu.`
                : `Choose up to ${maxSelections} flavors. Explore with the Wheel or let a Shisha Master craft your mix.`}
            </p>
          </div>
          {!customFlavors?.length && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMode("wheel")}
                className={cx(
                  "px-3 py-2 rounded-xl border text-sm",
                  mode === "wheel" ? "border-teal-500/50 bg-teal-500/10 text-teal-300" : "border-white/10 text-neutral-300"
                )}
              >
                Wheel
              </button>
              <button
                onClick={() => setMode("flow")}
                className={cx(
                  "px-3 py-2 rounded-xl border text-sm",
                  mode === "flow"
                    ? "border-amber-400/60 bg-amber-500/10 text-amber-300"
                    : "border-white/10 text-neutral-300"
                )}
              >
                Shisha Master
              </button>
            </div>
          )}
        </div>

        {/* Selection Bar - compact for CODIGO when presets */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white/5 p-3 border border-white/10">
          <div className="flex items-center gap-2">
            <CircleDot className="h-4 w-4 text-teal-400" />
            <span className="text-sm text-neutral-300">{presets?.length ? 'Your mix:' : 'Selected:'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.length ? (
              selected.map((id) => (
                <span key={id} className="text-xs px-2 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300">
                  {findFlavorLabel(id, customFlavors)}{!flavorAddOnFree ? ` ($${findFlavorPrice(id, false, customFlavors).toFixed(2)})` : ''}
                </span>
              ))
            ) : (
              <span className="text-neutral-500 text-sm">{presets?.length ? 'Tap a preset above' : 'None yet'}</span>
            )}
          </div>
          {!presets?.length && (
            <>
              <div className="grow" />
              <div className="text-sm text-teal-400 font-medium">Total: ${totalPrice.toFixed(2)}</div>
              <button 
                onClick={clearAll} 
                className="text-xs flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </>
          )}
          {presets?.length && selected.length > 0 && (
            <button 
              onClick={clearAll} 
              className="text-xs ml-auto flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <RotateCcw className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        {/* Main Content - when customFlavors, only show wheel (menu flavors) */}
        {mode === "wheel" || customFlavors?.length ? (
          <WheelMode
            categories={filteredCategories}
            selected={selected}
            onToggle={toggleFlavor}
            query={query}
            setQuery={setQuery}
            recommended={recommended}
            maxSelections={maxSelections}
            customFlavors={customFlavors}
          />
        ) : (
          <GuidedMode
            selected={selected}
            onToggle={toggleFlavor}
            onApplyRec={(ids: string[]) => {
              setSelected(ids);
              onSelectionChangeRef.current(ids);
            }}
            mood={mood}
            setMood={setMood}
            recommended={recommended}
            maxSelections={maxSelections}
            vibeProfile={vibeProfile}
            setVibeProfile={setVibeProfile}
            eatDrink={eatDrink}
            setEatDrink={setEatDrink}
            customFlavors={customFlavors}
          />
        )}

        {/* Mix Preview - hidden for CODIGO to reduce cognitive load */}
        {!presets?.length && (
          <MixPreview selected={selected} recommended={recommended} totalPrice={totalPrice} customFlavors={customFlavors} />
        )}
      </div>
    </div>
  );
}

// --- Wheel Mode Component ---
function WheelMode({
  categories,
  selected,
  onToggle,
  query,
  setQuery,
  recommended,
  maxSelections,
  customFlavors,
}: any) {
  const size = customFlavors?.length ? 240 : 300; // Smaller wheel for CODIGO (fewer segments)
  const radius = size / 2;
  const segmentAngle = categories.length ? 360 / categories.length : 360;

  const isPresetsOnly = customFlavors && categories.length <= 1;

  return (
    <div className={cn("grid gap-6 items-start", isPresetsOnly ? "grid-cols-1" : "md:grid-cols-2")}>
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
            <Search className="h-4 w-4"/>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search flavors…"
            className="bg-transparent outline-none text-sm placeholder:text-neutral-500 w-full"
          />
        </div>
        
        {/* Flavor Wheel - hidden for CODIGO (presets + menu flavors only) */}
        {!isPresetsOnly && (
        <div className="relative mx-auto mb-4" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
            {categories.map((c: any, i: number) => {
              const start = i * segmentAngle - 90;
              const end = start + segmentAngle;
              const large = end - start <= 180 ? 0 : 1;
              const x1 = radius + radius * Math.cos(toRad(start));
              const y1 = radius + radius * Math.sin(toRad(start));
              const x2 = radius + radius * Math.cos(toRad(end));
              const y2 = radius + radius * Math.sin(toRad(end));

              const path = `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
              const active = c.items.some((it: any) => selected.includes(it.id));
              return (
                <g key={c.id}>
                  <path 
                    d={path} 
                    fill={`hsl(${c.hue} 90% ${active ? 30 : 18}% / ${active ? 0.9 : 0.5})`} 
                    stroke="hsla(0,0%,100%,0.08)" 
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      // Auto-select first flavor in category if none selected
                      if (!c.items.some((it: any) => selected.includes(it.id))) {
                        onToggle(c.items[0].id);
                      }
                    }}
                  />
                </g>
              );
            })}
            <circle cx={radius} cy={radius} r={radius * 0.42} fill="rgba(10,10,12,.85)" stroke="hsla(0,0%,100%,.1)" />
          </svg>
          
          {/* Center Label */}
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="text-center">
              <div className="text-xs uppercase tracking-widest text-neutral-400">Flavor Wheel</div>
              <div className="text-sm font-semibold">{selected.length}/{maxSelections}</div>
            </div>
          </div>
        </div>
        )}

        {/* Flavor Chips - mobile-friendly for CODIGO (larger touch targets) */}
        {isPresetsOnly ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.flatMap((c: any) => c.items).map((it: any) => (
              <button
                key={it.id}
                onClick={() => onToggle(it.id)}
                disabled={!selected.includes(it.id) && selected.length >= maxSelections}
                className={cx(
                  "text-sm px-3 py-2.5 rounded-xl border transition touch-manipulation",
                  selected.includes(it.id)
                    ? "bg-teal-500/20 border-teal-500/30 text-teal-300"
                    : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 active:bg-white/15",
                  !selected.includes(it.id) && selected.length >= maxSelections && "opacity-50 cursor-not-allowed"
                )}
              >
                {it.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {categories.map((c: any) => (
              <div key={c.id} className="rounded-xl p-3 border border-white/10 bg-white/5">
                <div className="text-xs mb-2 text-neutral-300" style={{ color: `hsl(${c.hue} 80% 70%)` }}>
                  {c.label}
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.items.map((it: any) => (
                    <button
                      key={it.id}
                      onClick={() => onToggle(it.id)}
                      disabled={!selected.includes(it.id) && selected.length >= maxSelections}
                      className={cx(
                        "text-xs px-2 py-1 rounded-full border transition",
                        selected.includes(it.id)
                          ? "bg-teal-500/20 border-teal-500/30 text-teal-300"
                          : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10",
                        !selected.includes(it.id) && selected.length >= maxSelections && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {it.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations - hide for CODIGO (presets are the main choice) */}
      {!isPresetsOnly && (
      <aside className="rounded-xl bg-white/5 border border-white/10 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-teal-400"/>
          <h3 className="font-semibold">Suggested Complements</h3>
        </div>
        <p className="text-sm text-neutral-400 mb-3">
          Based on your current selection, try adding one of these to balance the palette.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {recommended.map((rid: string) => (
            <button 
              key={rid} 
              onClick={() => onToggle(rid)}
              disabled={selected.length >= maxSelections}
              className={cx(
                "text-xs px-2 py-1 rounded-full border transition",
                "bg-white/10 border-white/10 hover:bg-white/20",
                selected.length >= maxSelections && "opacity-50 cursor-not-allowed"
              )}
            >
              {findFlavorLabel(rid, customFlavors)}
            </button>
          ))}
        </div>
        <div className="text-sm text-neutral-400 flex items-center gap-2">
          <FlaskConical className="h-4 w-4"/>
          Pro tip: mint + fruit for cool/sweet balance; citrus cuts sweetness; dessert rounds sharp notes.
        </div>
      </aside>
      )}
    </div>
  );
}

// --- Guided Mode Component ---
const VIBE_LEVELS: { id: VibeLevel; label: string }[] = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
];

function GuidedMode({
  selected,
  onToggle,
  onApplyRec,
  mood,
  setMood,
  recommended,
  maxSelections,
  vibeProfile,
  setVibeProfile,
  eatDrink,
  setEatDrink,
  customFlavors,
}: any) {
  const masterRecs = useMemo(
    () => getRecommendationsFromVibe(vibeProfile),
    [vibeProfile.balance, vibeProfile.sweetness, vibeProfile.strength]
  );
  return (
    <div className="space-y-4">
      {/* Master Header Strip */}
      <div className="rounded-xl bg-gradient-to-r from-zinc-900/80 to-zinc-900/40 border border-amber-500/40 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-amber-500/15 border border-amber-400/60 grid place-items-center">
            <Sparkles className="h-4 w-4 text-amber-300" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-300">
              Shisha Master Guidance
            </div>
            <div className="text-xs text-neutral-300">
              Pick a vibe, then I’ll recommend a base and complements for a balanced bowl.
            </div>
          </div>
        </div>
        {/* Selectable Vibe Profile: Balance, Sweetness, Strength */}
        <div className="flex flex-wrap gap-4">
          {(['balance', 'sweetness', 'strength'] as const).map((key) => (
            <div key={key} className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wide text-neutral-400">
                {key === 'balance' ? 'Balance' : key === 'sweetness' ? 'Sweetness' : 'Strength'}
              </span>
              <div className="flex gap-1">
                {VIBE_LEVELS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setVibeProfile((p: any) => ({ ...p, [key]: id }))}
                    className={cx(
                      "px-2 py-1 rounded-lg text-xs border transition",
                      vibeProfile[key] === id
                        ? "bg-amber-500/20 border-amber-400/50 text-amber-200"
                        : "bg-black/40 border-white/10 text-neutral-300 hover:bg-white/10"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Eat/Drink Question */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] uppercase tracking-wide text-neutral-400">
            What did you have to eat and drink?
          </label>
          <input
            type="text"
            value={eatDrink}
            onChange={(e) => setEatDrink(e.target.value)}
            placeholder="e.g. coffee, dessert, spicy food..."
            className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-amber-500/40 focus:outline-none"
          />
        </div>

        {/* 3 Recommendations based on vibe profile */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] uppercase tracking-wide text-amber-300">3 Recommendations for you</span>
          <div className="flex flex-wrap gap-2">
            {masterRecs.map((rec, idx) => (
              <button
                key={idx}
                onClick={() => onApplyRec(rec.slice(0, maxSelections))}
                className="flex flex-wrap gap-1 px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 text-xs transition"
              >
                {rec.map((id) => findFlavorLabel(id, customFlavors)).join(' + ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Step 1: Mood */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 className="h-4 w-4 text-teal-400" />
            <h3 className="font-semibold">1. Choose your vibe</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMood(m.id)}
                className={cx(
                  "rounded-xl p-3 border text-left transition",
                  mood === m.id
                    ? "bg-teal-500/20 border-teal-500/30"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                <div className="text-sm font-medium">{m.label}</div>
                <div className="mt-1 text-[11px] text-neutral-400">{m.description}</div>
              </button>
            ))}
          </div>
          <div className="mt-3 text-[11px] text-amber-100/80 border border-amber-500/40 rounded-lg px-3 py-2 bg-amber-500/5">
            <span className="font-semibold mr-1">Master tip:</span>
            Smooth bowls pair best with one creamy base and one fruit accent.
          </div>
        </div>

        {/* Step 2: Palette Selection */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <ListFilter className="h-4 w-4 text-teal-400" />
            <h3 className="font-semibold">2. Choose your notes</h3>
          </div>
          {(() => {
            const activeProfile = mood ? MASTER_PROFILES[mood] : null;
            const baseIds = activeProfile ? [activeProfile.base] : [];
            const accentSource = activeProfile ? activeProfile.accents : recommended;
            const accentIds = accentSource.filter(
              (id: string, idx: number, arr: string[]) =>
                arr.indexOf(id) === idx && !baseIds.includes(id)
            );

            const renderChip = (id: string, variant: "base" | "accent") => (
              <button
                key={id}
                onClick={() => onToggle(id)}
                disabled={!selected.includes(id) && selected.length >= maxSelections}
                className={cx(
                  "text-xs px-2 py-1 rounded-full border transition",
                  selected.includes(id)
                    ? "bg-teal-500/20 border-teal-500/30 text-teal-300"
                    : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10",
                  !selected.includes(id) &&
                    selected.length >= maxSelections &&
                    "opacity-50 cursor-not-allowed",
                  variant === "base" && "border-amber-400/50 bg-amber-500/10 text-amber-200"
                )}
              >
                {findFlavorLabel(id)}
              </button>
            );

            return (
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-neutral-400 mb-1">
                    Base note (pick 1)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {baseIds.length ? (
                      baseIds.map((id: string) => renderChip(id, "base"))
                    ) : (
                      <span className="text-[11px] text-neutral-500">
                        Pick a vibe to see a master-recommended base.
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-neutral-400 mb-1">
                    Accents (pick up to {Math.max(1, maxSelections - 1)})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {accentIds.length ? (
                      accentIds.map((id: string) => renderChip(id, "accent"))
                    ) : (
                      <span className="text-[11px] text-neutral-500">
                        Start with a base or use the Wheel to discover accents.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
          <div className="text-[11px] text-neutral-500 mt-3">
            Master note: Smooth bowls pair best with one creamy base and one fruit accent.
          </div>
        </div>

        {/* Step 3: Confirm */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <ChevronRight className="h-4 w-4 text-teal-400" />
            <h3 className="font-semibold">3. Seal the bowl</h3>
          </div>
          <div className="text-sm text-neutral-400 mb-2">
            This saves your mix to your session for the lounge.
          </div>
          <div className="text-xs text-neutral-500 mb-4">
            Selected: {selected.length} flavor{selected.length !== 1 ? "s" : ""}
          </div>
          <button
            disabled={selected.length === 0}
            className={cx(
              "mt-auto rounded-xl px-4 py-3 border transition",
              selected.length > 0
                ? "border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200"
                : "border-white/10 bg-white/5 text-neutral-500 cursor-not-allowed"
            )}
          >
            {selected.length > 0 ? "Seal Mix" : "Select Flavors First"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Mix Preview Component ---
function MixPreview({ selected, recommended, totalPrice, customFlavors }: any) {
  const meters = computeMasterMeters(selected);

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-teal-400" />
        <h3 className="font-semibold">Master Preview</h3>
      </div>
      <p className="text-sm text-neutral-400 mb-3">
        A quick look at your bowl profile and master-suggested complements.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-neutral-400 mb-1">Your bowl profile</div>
          <div className="mb-3">
            <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
              <span>Smoothness</span>
              <span>{meters.smoothness}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-neutral-900 overflow-hidden">
              <div
                className="h-full rounded-full bg-teal-400"
                style={{ width: `${meters.smoothness}%` }}
              />
            </div>
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
              <span>Sweetness</span>
              <span>{meters.sweetness}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-neutral-900 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-400"
                style={{ width: `${meters.sweetness}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
              <span>Freshness</span>
              <span>{meters.freshness}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-neutral-900 overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan-400"
                style={{ width: `${meters.freshness}%` }}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="text-xs text-neutral-400 mb-1">Master complements</div>
          <div className="flex flex-wrap gap-2">
            {recommended.map((id: string) => (
              <span
                key={id}
                className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300"
              >
                {findFlavorLabel(id, customFlavors)}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.join("-") || "empty"}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="relative w-32 h-32 rounded-full border border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-teal-500/5 grid place-items-center"
            >
              <div className="text-center">
                <div className="text-xs text-neutral-400">Balance Score</div>
                <div className="text-2xl font-semibold text-teal-300">
                  {meters.balanceScore}
                </div>
                <div className="text-xs text-neutral-500">${totalPrice.toFixed(2)}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
