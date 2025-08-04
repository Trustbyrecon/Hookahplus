export interface SessionFlow {
  live: boolean;
}

export interface FlavorState {
  mix: boolean;
}

export interface LoyaltyState {
  preview: boolean;
}

export function triggerIgnitionModal() {
  console.log("You've lit the session path. Loyalty, memory, and reflex are now live. Watch your EP Score evolve.");
}

export function updateEPScore(score: number) {
  console.log(`EP Score updated to ${score}`);
}

export function reflexPulseEffect(effect: string) {
  console.log(`Reflex pulse: ${effect}`);
}

export function sessionIgnition(sessionFlow: SessionFlow, flavor: FlavorState, loyalty: LoyaltyState) {
  if (sessionFlow.live && flavor.mix && loyalty.preview) {
    triggerIgnitionModal();
    updateEPScore(9.2);
    reflexPulseEffect('aura-flare');
  }
}
