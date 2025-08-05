"use client";

import { useEffect, useState } from "react";
import OnboardingModal from "../../components/OnboardingModal";

export default function Onboarding() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Simulated trigger: layout detected without zones
    setShowModal(true);
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-charcoal text-goldLumen font-sans">
      <h1 className="text-3xl font-display font-bold mb-4 text-ember">Lounge Onboarding</h1>
      <p className="font-sans">Start configuring your lounge with Hookah+.</p>
      {showModal && <OnboardingModal onComplete={() => setShowModal(false)} />}
    </main>
  );
}
