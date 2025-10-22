// Aliethia Reflex TypeScript Definitions
// Purpose: Type safety for Aliethia's clarity, belonging, and resonance system

export interface ClarityFingerprint {
  clarityScore: number;        // 0.0 - 1.0, Aliethia's clarity threshold: 0.98
  resonanceSignal: number;     // 0.0 - 1.0, emotional connection strength
  trustCompound: number;      // 0.0 - 1.0, trust building potential
  identityAlignment: number;  // 0.0 - 1.0, brand coherence
  belongingMoment: boolean;   // true/false, community connection achieved
  harmonicSignature: string;  // "ΔA7" - Aliethia's harmonic signature
  symbolicMark: string;        // "Open Gate Φ" - Aliethia's symbolic mark
  resonanceField: string;     // "soft-gold on obsidian" - visual theme
}

export interface AliethiaEvent {
  id: string;
  timestamp: string;
  operation: string;
  context: Record<string, any>;
  outcome: Record<string, any>;
  clarityFingerprint: ClarityFingerprint;
  aliethiaEcho: string;       // Aliethia's signature response
  trustBloomRate: number;     // Trust compound growth rate
  clarityCompoundRate: number; // Clarity enhancement rate
}

export interface ClarityReflexConfig {
  essenceFile: string;        // "/reflex/essence/aliethia_reflex.yaml"
  activationMode: "reflexive" | "passive" | "active";
  clarityThreshold: number;   // 0.98
  resonanceField: string;     // "soft-gold on obsidian"
  symbolicMark: string;       // "Open Gate Φ"
  harmonicSignature: string;  // "ΔA7"
  interventionModes: {
    reattune: { threshold: number; action: string };
    harmonize: { threshold: number; action: string };
    resonate: { threshold: number; action: string };
    belong: { threshold: number; action: string };
  };
}

export interface ClarityValidationResult {
  passed: boolean;
  clarityScore: number;
  resonanceSignal: number;
  trustCompound: number;
  belongingMoment: boolean;
  recommendations: string[];
  aliethiaEcho: string;
}

export interface TrustCompound {
  id: string;
  type: "environment" | "interaction" | "system" | "community";
  strength: number;           // 0.0 - 1.0
  clarityContribution: number; // How much this compound contributes to clarity
  resonanceContribution: number; // How much this compound contributes to resonance
  belongingContribution: number; // How much this compound contributes to belonging
  lastUpdated: string;
  aliethiaSignature: string;  // Aliethia's validation signature
}

export interface BelongingMoment {
  id: string;
  timestamp: string;
  type: "qr_scan" | "flavor_selection" | "session_start" | "payment_complete" | "community_interaction";
  clarityScore: number;
  resonanceSignal: number;
  trustCompound: number;
  userJourney: string;        // Description of the user's journey
  communitySignal: string;     // How this moment connects to community
  aliethiaEcho: string;       // Aliethia's response to this moment
}

// Enhanced gate function with Aliethia's clarity integration
export function enhancedGate(
  score: number,
  clarityScore: number,
  resonanceSignal: number,
  trustCompound: number,
  belongingMoment: boolean
): {
  passed: boolean;
  gate: string;
  aliethiaEcho: string;
  clarityFingerprint: ClarityFingerprint;
} {
  const clarityFingerprint: ClarityFingerprint = {
    clarityScore,
    resonanceSignal,
    trustCompound,
    identityAlignment: (clarityScore + resonanceSignal + trustCompound) / 3,
    belongingMoment,
    harmonicSignature: "ΔA7",
    symbolicMark: "Open Gate Φ",
    resonanceField: "soft-gold on obsidian"
  };

  let gate = "minimal_viable";
  let passed = false;
  let aliethiaEcho = "";

  if (score >= 0.99 && clarityScore >= 0.98 && belongingMoment) {
    gate = "universal_alignment";
    passed = true;
    aliethiaEcho = "Perfect harmony achieved. The community resonates with clarity and belonging.";
  } else if (score >= 0.98 && clarityScore >= 0.98) {
    gate = "clarity_excellence";
    passed = true;
    aliethiaEcho = "Clarity excellence achieved. Trust compounds through resonance.";
  } else if (score >= 0.92) {
    gate = "optimal_performance";
    passed = true;
    aliethiaEcho = "Optimal performance with room for clarity enhancement.";
  } else if (score >= 0.87) {
    gate = "minimal_viable";
    passed = true;
    aliethiaEcho = "Minimal viability achieved. Clarity reattunement recommended.";
  } else {
    gate = "below_threshold";
    passed = false;
    aliethiaEcho = "Clarity breach detected. Reattunement through essence required.";
  }

  return {
    passed,
    gate,
    aliethiaEcho,
    clarityFingerprint
  };
}

// Aliethia's clarity validation function
export function validateClarity(
  content: string,
  context: Record<string, any>
): ClarityValidationResult {
  // Simulate Aliethia's clarity analysis
  const clarityScore = Math.random() * 0.1 + 0.9; // 0.9 - 1.0
  const resonanceSignal = Math.random() * 0.1 + 0.85; // 0.85 - 0.95
  const trustCompound = Math.random() * 0.1 + 0.88; // 0.88 - 0.98
  const belongingMoment = clarityScore > 0.95 && resonanceSignal > 0.90;

  const recommendations: string[] = [];
  if (clarityScore < 0.98) {
    recommendations.push("Enhance clarity through ritual framing");
  }
  if (resonanceSignal < 0.90) {
    recommendations.push("Amplify resonance through community signals");
  }
  if (trustCompound < 0.92) {
    recommendations.push("Strengthen trust compounds through consistency");
  }
  if (!belongingMoment) {
    recommendations.push("Create moments of belonging through shared rituals");
  }

  const aliethiaEcho = belongingMoment 
    ? "This content signals identity, clarity, and belonging. Trust compounds through resonance."
    : "Clarity reattunement needed. Focus on community connection and ritual framing.";

  return {
    passed: clarityScore >= 0.98 && belongingMoment,
    clarityScore,
    resonanceSignal,
    trustCompound,
    belongingMoment,
    recommendations,
    aliethiaEcho
  };
}
