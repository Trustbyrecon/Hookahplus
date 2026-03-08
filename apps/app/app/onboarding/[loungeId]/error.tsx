"use client";

import React, { useEffect } from "react";
import GlobalNavigation from "../../../components/GlobalNavigation";
import { Button } from "../../../components/ui/button";
import { AlertCircle } from "lucide-react";

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Onboarding error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle className="w-16 h-16 text-red-500" />
          <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
          <p className="text-zinc-400 text-center max-w-md">{error.message}</p>
          <Button onClick={reset} variant="outline">
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
