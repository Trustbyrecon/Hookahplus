'use client';

import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Wand2, Sparkles, FlaskConical, ListFilter, CircleDot, ChevronRight, RotateCcw, ArrowRight, Play, Clock, Shield, Zap } from "lucide-react";
import PageHero from '../../components/PageHero';
import HookahTrackerDemo from '../../components/HookahTrackerDemo';

/**
 * Hookah+ Flavor Wheel Demo — Site Build Marketing
 * -------------------------------------------------
 * Interactive demo showcasing the flavor wheel experience
 * Features:
 * - Wheel Mode (radial flavor wheel with category segments)
 * - Flow Mode (psychology-driven guided choices)
 * - Marketing-focused design with CTAs
 * - Mobile-responsive
 */

// --- Flavor Categories (Demo Data) ---
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

// --- Main Component ---
export default function FlavorWheelDemo() {
  const [mode, setMode] = useState<"wheel" | "flow">("wheel");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [mood, setMood] = useState<string | null>(null);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return selected.reduce((sum, id) => sum + findFlavorPrice(id), 0);
  }, [selected]);

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
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      } else if (prev.length < 4) {
        return [...prev, id];
      }
      return prev;
    });
  }

  function clearAll() {
    setSelected([]);
    setMood(null);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Hero Section */}
      <PageHero
        headline="Give your guests the flavor experience they'll remember"
        subheadline="Psychology-driven selection, real-time pricing, zero friction"
        benefit={{
          value: "↑ 35% faster flavor selection, ↑ 28% repeat orders",
          description: "Guests love the intuitive experience, you love the results",
          icon: <Sparkles className="w-6 h-6 text-teal-400" />
        }}
        primaryCTA={{
          text: "Contact us for Demo",
          onClick: () => window.open('/contact', '_blank')
        }}
        trustIndicators={[
          { icon: <Shield className="w-4 h-4 text-teal-400" />, text: "Works with existing setup" },
          { icon: <Zap className="w-4 h-4 text-teal-400" />, text: "No hardware required" },
          { icon: <Clock className="w-4 h-4 text-teal-400" />, text: "Setup in minutes" }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {/* Demo Container */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Flavor Mix Selector</h2>
              <p className="text-zinc-400">Select up to 4 flavors for your perfect hookah session</p>
            </div>
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
                  mode === "flow" ? "border-teal-500/50 bg-teal-500/10 text-teal-300" : "border-white/10 text-neutral-300"
                )}
              >
                Guided
              </button>
            </div>
          </div>

          {/* Selection Bar */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white/5 p-3 border border-white/10 mb-8">
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
              className="text-xs flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          {/* Main Content */}
          {mode === "wheel" ? (
            <WheelMode
              categories={filteredCategories}
              selected={selected}
              onToggle={toggleFlavor}
              query={query}
              setQuery={setQuery}
              recommended={recommended}
            />
          ) : (
            <GuidedMode
              selected={selected}
              onToggle={toggleFlavor}
              mood={mood}
              setMood={setMood}
              recommended={recommended}
            />
          )}

          {/* Mix Preview Card */}
          <MixPreview selected={selected} recommended={recommended} totalPrice={totalPrice} />
        </div>

        {/* Hookah Tracker Demo - Guest-Operator Flow */}
        {selected.length > 0 && (
          <div className="mt-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">See the Complete Flow</h3>
              <p className="text-zinc-400">
                Watch how your flavor selection flows from guest to operator. This is what your customers will see after placing an order.
              </p>
            </div>
            
            <HookahTrackerDemo
              sessionId="demo-session-1"
              tableId="T-005"
              flavorMix={selected.map(id => findFlavorLabel(id))}
              onComplete={() => {
                console.log('Demo tracker completed');
              }}
            />
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wand2 className="w-8 h-8 text-teal-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Psychology-Driven</h3>
            <p className="text-zinc-400">Guided choices based on mood and taste preferences for better customer satisfaction.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FlaskConical className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Pricing</h3>
            <p className="text-zinc-400">Instant price calculation and tier-based pricing for maximum revenue optimization.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Seamless Integration</h3>
            <p className="text-zinc-400">Connects seamlessly with your existing payment system, abstracting payment complexity while focusing on experience flow and trust capture.</p>
          </div>
        </div>
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
}: any) {
  const size = 320;
  const radius = size / 2;
  const segmentAngle = 360 / categories.length;

  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4">
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
        
        {/* Flavor Wheel */}
        <div className="relative mx-auto mb-6" style={{ width: size, height: size }}>
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
              <div className="text-sm font-semibold">{selected.length}/3</div>
            </div>
          </div>
        </div>

        {/* Flavor Chips */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                    disabled={!selected.includes(it.id) && selected.length >= 3}
                    className={cx(
                      "text-xs px-2 py-1 rounded-full border transition",
                      selected.includes(it.id)
                        ? "bg-teal-500/20 border-teal-500/30 text-teal-300"
                        : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10",
                      !selected.includes(it.id) && selected.length >= 3 && "opacity-50 cursor-not-allowed"
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

      {/* Recommendations */}
      <aside className="rounded-xl bg-white/5 border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-teal-400"/>
          <h3 className="font-semibold">Suggested Complements</h3>
        </div>
        <p className="text-sm text-neutral-400 mb-4">
          Based on your current selection, try adding one of these to balance the palette.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {recommended.map((rid: string) => (
            <button 
              key={rid} 
              onClick={() => onToggle(rid)}
              disabled={selected.length >= 3}
              className={cx(
                "text-xs px-2 py-1 rounded-full border transition",
                "bg-white/10 border-white/10 hover:bg-white/20",
                selected.length >= 3 && "opacity-50 cursor-not-allowed"
              )}
            >
              {findFlavorLabel(rid)}
            </button>
          ))}
        </div>
        <div className="text-sm text-neutral-400 flex items-center gap-2">
          <FlaskConical className="h-4 w-4"/>
          Pro tip: mint + fruit for cool/sweet balance; citrus cuts sweetness; dessert rounds sharp notes.
        </div>
      </aside>
    </div>
  );
}

// --- Guided Mode Component ---
function GuidedMode({ selected, onToggle, mood, setMood, recommended }: any) {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Step 1: Mood */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="h-4 w-4 text-teal-400"/>
          <h3 className="font-semibold">1. How do you want it to feel?</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              className={cx(
                "rounded-xl p-4 border text-left transition",
                mood === m.id ? "bg-teal-500/20 border-teal-500/30" : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              <div className="text-sm font-medium">{m.label}</div>
              <div className="mt-1 text-[11px] text-neutral-400">{m.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Palette Selection */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ListFilter className="h-4 w-4 text-teal-400"/>
          <h3 className="font-semibold">2. Pick 1–3 notes</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {(mood ? MOODS.find((m) => m.id === mood)?.tags || [] : recommended).map((id: string) => (
            <button
              key={id}
              onClick={() => onToggle(id)}
              disabled={!selected.includes(id) && selected.length >= 3}
              className={cx(
                "text-xs px-2 py-1 rounded-full border transition",
                selected.includes(id)
                  ? "bg-teal-500/20 border-teal-500/30 text-teal-300"
                  : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10",
                !selected.includes(id) && selected.length >= 3 && "opacity-50 cursor-not-allowed"
              )}
            >
              {findFlavorLabel(id)}
            </button>
          ))}
        </div>
        <div className="text-[11px] text-neutral-500 mt-3">
          Cognitive nudge: keep choices to 3 or fewer for a clearer taste signature.
        </div>
      </div>

      {/* Step 3: Confirm */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <ChevronRight className="h-4 w-4 text-teal-400"/>
          <h3 className="font-semibold">3. Lock the mix</h3>
        </div>
        <div className="text-sm text-neutral-400 mb-3">
          Your flavor mix is ready! This demonstrates how it would integrate with your session.
        </div>
        <div className="text-xs text-neutral-500 mb-4">
          Selected: {selected.length} flavor{selected.length !== 1 ? 's' : ''}
        </div>
        <button 
          disabled={selected.length === 0}
          className={cx(
            "mt-auto rounded-xl px-4 py-3 border transition",
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

// --- Mix Preview Component ---
function MixPreview({ selected, recommended, totalPrice }: any) {
  const score = Math.min(100, 30 + selected.length * 22);
  
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-6 mt-8">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-teal-400"/>
        <h3 className="font-semibold">Live Mix Preview</h3>
      </div>
      <p className="text-sm text-neutral-400 mb-4">
        A quick look at your flavor balance and suggested complements.
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <div className="text-xs text-neutral-400 mb-2">Your mix</div>
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
          <div className="text-xs text-neutral-400 mb-2">Complements</div>
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
              className="relative w-32 h-32 rounded-full border border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-teal-500/5 grid place-items-center"
            >
              <div className="text-center">
                <div className="text-xs text-neutral-400">Mix Score</div>
                <div className="text-2xl font-semibold text-teal-300">{score}</div>
                <div className="text-xs text-neutral-500">${totalPrice.toFixed(2)}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
