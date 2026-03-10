"use client";

import React, { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import GlobalNavigation from "../../../components/GlobalNavigation";
import { OnboardingShell } from "../../../components/onboarding/OnboardingShell";

function OnboardingPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const loungeId = (params?.loungeId as string) ?? "";
  const isDemoMode = searchParams?.get("mode") === "demo";

  if (!loungeId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <GlobalNavigation />
        <div className="max-w-4xl mx-auto p-8">
          <p className="text-zinc-400">Invalid lounge. Please select a lounge.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <OnboardingShell loungeId={loungeId} demoMode={isDemoMode} />
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
        </div>
      }
    >
      <OnboardingPageContent />
    </Suspense>
  );
}
