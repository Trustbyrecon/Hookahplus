"use client";

import { useEffect, useState } from "react";
import OnboardingModal from "../components/OnboardingModal";

export default function Onboarding() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Simulated trigger: layout detected without zones
    setShowModal(true);
  }, []);

  return (
 codex/add-moodbook-fonts-to-components
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white font-sans">
      <h1 className="text-3xl font-display font-bold mb-4">Lounge Onboarding</h1>
      <p className="font-sans">Start configuring your lounge with Hookah+.</p>

    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-charcoal text-goldLumen">
      <h1 className="text-3xl font-bold mb-4">Lounge Onboarding</h1>
      <p>Start configuring your lounge with Hookah+.</p>
 main
      {showModal && <OnboardingModal onComplete={() => setShowModal(false)} />}
    </main>
  );
}
