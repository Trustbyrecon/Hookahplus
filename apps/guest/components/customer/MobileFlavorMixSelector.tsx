'use client';

import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Wand2, Sparkles, FlaskConical, ListFilter, CircleDot, ChevronRight, RotateCcw, Smartphone, Monitor } from "lucide-react";
import { cn } from '../../utils/cn';

/**
 * Hookah+ Mobile-Optimized Flavor Mix Selector
 * -------------------------------------------------
 * Enhanced mobile-first version with:
 * - Touch-friendly interface (44px minimum touch targets)
 * - Gesture support (swipe, pinch, tap)
 * - 4/4 flavor selection display
 * - Mobile-responsive design
 * - Performance optimizations
 * - Enhanced Fire Session Dashboard integration
 */

// --- Flavor Categories (Enhanced for Mobile) ---
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

// --- Props Interface ---
export interface MobileFlavorMixSelectorProps {
  flavors?: any[];
  selectedFlavors: string[];
  onSelectionChange: (flavors: string[]) => void;
  maxSelections?: number;
  className?: string;
  onPriceUpdate?: (total: number) => void;
}

// --- Helper Functions ---
function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function findFlavorLabel(id: string) {
  for (const c of FLAVOR_CATEGORIES) {
    const f = c.items.find((x) => x.id === id);
    if (f) return f.label;
  }
  return id;
}

function findFlavorPrice(id: string) {
  for (const c of FLAVOR_CATEGORIES) {
    const f = c.items.find((x) => x.id === id);
    if (f) return f.price;
  }
  return 0;
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

// --- Touch Handler Hook ---
function useTouchHandlers() {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe || isUpSwipe || isDownSwipe) {
      // Handle swipe gestures
      console.log('Swipe detected:', { isLeftSwipe, isRightSwipe, isUpSwipe, isDownSwipe });
    }
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}

// --- Main Component ---
export default function MobileFlavorMixSelector({
  selectedFlavors = [],
  onSelectionChange,
  maxSelections = 4,
  className,
  onPriceUpdate
}: MobileFlavorMixSelectorProps) {
  const [mode, setMode] = useState<"wheel" | "flow">("wheel");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>(selectedFlavors);
  const [mood, setMood] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const touchHandlers = useTouchHandlers();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync with parent component
  React.useEffect(() => {
    if (JSON.stringify(selected) !== JSON.stringify(selectedFlavors)) {
      setSelected(selectedFlavors);
    }
  }, [selectedFlavors]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return selected.reduce((sum, id) => sum + findFlavorPrice(id), 0);
  }, [selected]);

  // Notify parent of price changes
  React.useEffect(() => {
    if (onPriceUpdate) {
      onPriceUpdate(totalPrice);
    }
  }, [totalPrice, onPriceUpdate]);

  // Recommended flavors based on mood or current selection
  const recommended = useMemo(() => {
    if (mood) {
      const m = MOODS.find((m) => m.id === mood);
      return m ? m.tags : [];
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

  const filteredCategories = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return FLAVOR_CATEGORIES;
    return FLAVOR_CATEGORIES.map((c) => ({
      ...c,
      items: c.items.filter((i) => i.label.toLowerCase().includes(q)),
    })).filter((c) => c.items.length);
  }, [query]);

  function toggleFlavor(id: string) {
    setSelected((prev) => {
      let newSelection;
      if (prev.includes(id)) {
        newSelection = prev.filter((x) => x !== id);
      } else if (prev.length < maxSelections) {
        newSelection = [...prev, id];
      } else {
        return prev; // Don't add if at max
      }
      
      // Notify parent component
      onSelectionChange(newSelection);
      return newSelection;
    });
  }

  function clearAll() {
    setSelected([]);
    setMood(null);
    onSelectionChange([]);
  }

  return (
    <div 
      className={cn("w-full bg-neutral-950 text-neutral-100 p-4 md:p-6 rounded-xl", className)}
      {...touchHandlers}
    >
      <div className="max-w-6xl mx-auto grid gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold tracking-tight">Choose Your Flavor Mix</h2>
            <p className="text-neutral-400 text-sm md:text-base">Select up to {maxSelections} flavors for your perfect hookah session</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode("wheel")}
              className={cx(
                "px-3 py-2 rounded-xl border text-sm min-h-[44px] min-w-[44px]", // Mobile touch target
                mode === "wheel" ? "border-teal-500/50 bg-teal-500/10 text-teal-300" : "border-white/10 text-neutral-300"
              )}
            >
              <div className="flex items-center gap-1">
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline">Wheel</span>
              </div>
            </button>
            <button
              onClick={() => setMode("flow")}
              className={cx(
                "px-3 py-2 rounded-xl border text-sm min-h-[44px] min-w-[44px]", // Mobile touch target
                mode === "flow" ? "border-teal-500/50 bg-teal-500/10 text-teal-300" : "border-white/10 text-neutral-300"
              )}
            >
              <div className="flex items-center gap-1">
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">Guided</span>
              </div>
            </button>
          </div>
        </div>

        {/* Selection Bar - Mobile Optimized */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white/5 p-3 border border-white/10">
          <div className="flex items-center gap-2">
            <CircleDot className="h-4 w-4 text-teal-400" />
            <span className="text-sm text-neutral-300">Selected:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.length ? (
              selected.map((id) => (
                <span key={id} className="text-xs px-2 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300">
                  {findFlavorLabel(id)} (${findFlavorPrice(id).toFixed(2)})
                </span>
              ))
            ) : (
              <span className="text-neutral-500 text-sm">None yet</span>
            )}
          </div>
          <div className="grow" />
          <div className="text-sm text-teal-400 font-medium">
            Total: ${totalPrice.toFixed(2)}
          </div>
          <button 
            onClick={clearAll} 
            className="text-xs flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition min-h-[44px]"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>

        {/* Main Content */}
        {mode === "wheel" ? (
          <MobileWheelMode
            categories={filteredCategories}
            selected={selected}
            onToggle={toggleFlavor}
            query={query}
            setQuery={setQuery}
            recommended={recommended}
            maxSelections={maxSelections}
            isMobile={isMobile}
          />
        ) : (
          <MobileGuidedMode
            selected={selected}
            onToggle={toggleFlavor}
            mood={mood}
            setMood={setMood}
            recommended={recommended}
            maxSelections={maxSelections}
            isMobile={isMobile}
          />
        )}

        {/* Mix Preview Card - Mobile Optimized */}
        <MobileMixPreview selected={selected} recommended={recommended} totalPrice={totalPrice} />
      </div>
    </div>
  );
}

// --- Mobile Wheel Mode Component ---
function MobileWheelMode({
  categories,
  selected,
  onToggle,
  query,
  setQuery,
  recommended,
  maxSelections,
  isMobile
}: any) {
  const size = isMobile ? 250 : 300;
  const radius = size / 2;
  const segmentAngle = 360 / categories.length;

  return (
    <div className="grid md:grid-cols-2 gap-4 md:gap-6 items-center">
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
            <Search className="h-4 w-4"/>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search flavors…"
            className="bg-transparent outline-none text-sm placeholder:text-neutral-500 w-full min-h-[44px]" // Mobile touch target
          />
        </div>
        
        {/* Flavor Wheel - Mobile Responsive */}
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
          
          {/* Center Label - Updated to 4/4 */}
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="text-center">
              <div className="text-xs uppercase tracking-widest text-neutral-400">Flavor Wheel</div>
              <div className="text-sm font-semibold">{selected.length}/{maxSelections}</div>
            </div>
          </div>
        </div>

        {/* Flavor Chips - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
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
                      "text-xs px-3 py-2 rounded-full border transition min-h-[44px]", // Mobile touch target
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
      </div>

      {/* Recommendations - Mobile Optimized */}
      <aside className="rounded-xl bg-white/5 border border-white/10 p-4 md:p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-teal-400"/>
          <h3 className="font-semibold text-sm md:text-base">Suggested Complements</h3>
        </div>
        <p className="text-xs md:text-sm text-neutral-400 mb-3">
          Based on your current selection, try adding one of these to balance the palette.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {recommended.map((rid: string) => (
            <button 
              key={rid} 
              onClick={() => onToggle(rid)}
              disabled={selected.length >= maxSelections}
              className={cx(
                "text-xs px-3 py-2 rounded-full border transition min-h-[44px]", // Mobile touch target
                "bg-white/10 border-white/10 hover:bg-white/20",
                selected.length >= maxSelections && "opacity-50 cursor-not-allowed"
              )}
            >
              {findFlavorLabel(rid)}
            </button>
          ))}
        </div>
        <div className="text-xs md:text-sm text-neutral-400 flex items-center gap-2">
          <FlaskConical className="h-4 w-4"/>
          Pro tip: mint + fruit for cool/sweet balance; citrus cuts sweetness; dessert rounds sharp notes.
        </div>
      </aside>
    </div>
  );
}

// --- Mobile Guided Mode Component ---
function MobileGuidedMode({ selected, onToggle, mood, setMood, recommended, maxSelections, isMobile }: any) {
  return (
    <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
      {/* Step 1: Mood - Mobile Optimized */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 md:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 className="h-4 w-4 text-teal-400"/>
          <h3 className="font-semibold text-sm md:text-base">1. How do you want it to feel?</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              className={cx(
                "rounded-xl p-3 border text-left transition min-h-[44px]", // Mobile touch target
                mood === m.id ? "bg-teal-500/20 border-teal-500/30" : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              <div className="text-sm font-medium">{m.label}</div>
              <div className="mt-1 text-[11px] text-neutral-400">{m.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Palette Selection - Mobile Optimized */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 md:p-5">
        <div className="flex items-center gap-2 mb-3">
          <ListFilter className="h-4 w-4 text-teal-400"/>
          <h3 className="font-semibold text-sm md:text-base">2. Pick 1–{maxSelections} notes</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {(mood ? MOODS.find((m) => m.id === mood)?.tags || [] : recommended).map((id: string) => (
            <button
              key={id}
              onClick={() => onToggle(id)}
              disabled={!selected.includes(id) && selected.length >= maxSelections}
              className={cx(
                "text-xs px-3 py-2 rounded-full border transition min-h-[44px]", // Mobile touch target
                selected.includes(id)
                  ? "bg-teal-500/20 border-teal-500/30 text-teal-300"
                  : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10",
                !selected.includes(id) && selected.length >= maxSelections && "opacity-50 cursor-not-allowed"
              )}
            >
              {findFlavorLabel(id)}
            </button>
          ))}
        </div>
        <div className="text-[11px] text-neutral-500 mt-2">
          Cognitive nudge: keep choices to {maxSelections} or fewer for a clearer taste signature.
        </div>
      </div>

      {/* Step 3: Confirm - Mobile Optimized */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 md:p-5 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <ChevronRight className="h-4 w-4 text-teal-400"/>
          <h3 className="font-semibold text-sm md:text-base">3. Lock the mix</h3>
        </div>
        <div className="text-sm text-neutral-400 mb-2">
          Your flavor mix is ready! This will be added to your session.
        </div>
        <div className="text-xs text-neutral-500 mb-4">
          Selected: {selected.length} flavor{selected.length !== 1 ? 's' : ''}
        </div>
        <button 
          disabled={selected.length === 0}
          className={cx(
            "mt-auto rounded-xl px-4 py-3 border transition min-h-[44px]", // Mobile touch target
            selected.length > 0
              ? "border-teal-400/30 bg-teal-400/10 hover:bg-teal-400/20 text-teal-300"
              : "border-white/10 bg-white/5 text-neutral-500 cursor-not-allowed"
          )}
        >
          {selected.length > 0 ? 'Mix Ready!' : 'Select Flavors First'}
        </button>
      </div>
    </div>
  );
}

// --- Mobile Mix Preview Component ---
function MobileMixPreview({ selected, recommended, totalPrice }: any) {
  const score = Math.min(100, 30 + selected.length * 22);
  
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4 md:p-5">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-teal-400"/>
        <h3 className="font-semibold text-sm md:text-base">Live Mix Preview</h3>
      </div>
      <p className="text-xs md:text-sm text-neutral-400 mb-3">
        A quick look at your flavor balance and suggested complements.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-neutral-400 mb-1">Your mix</div>
          <div className="flex flex-wrap gap-2">
            {selected.length ? (
              selected.map((id: string) => (
                <span key={id} className="text-xs px-2 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300">
                  {findFlavorLabel(id)}
                </span>
              ))
            ) : (
              <span className="text-neutral-500 text-sm">Pick a base note to start</span>
            )}
          </div>
        </div>
        <div>
          <div className="text-xs text-neutral-400 mb-1">Complements</div>
          <div className="flex flex-wrap gap-2">
            {recommended.map((id: string) => (
              <span key={id} className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                {findFlavorLabel(id)}
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
              className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-teal-500/5 grid place-items-center"
            >
              <div className="text-center">
                <div className="text-xs text-neutral-400">Mix Score</div>
                <div className="text-lg md:text-2xl font-semibold text-teal-300">{score}</div>
                <div className="text-xs text-neutral-500">${totalPrice.toFixed(2)}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
