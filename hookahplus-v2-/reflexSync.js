function startReflection() {
  const isReturning = localStorage.getItem("user_visited_before");
  const tier = localStorage.getItem("trust_tier") || "Tier I";

  logGhost("reflex_entry", { timestamp: Date.now(), isReturning, tier });

  // Trigger whisper or modal if Tier VII
  if (tier === "Tier VII") {
    showWhisper("Welcome back. Your loyalty is encoded. Enjoy your journey.");
  }

  localStorage.setItem("user_visited_before", true);
  window.location.href = "/"; // or dashboard, if staff
}
