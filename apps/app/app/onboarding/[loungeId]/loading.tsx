import React from "react";
import GlobalNavigation from "../../../components/GlobalNavigation";

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <div className="h-64 bg-zinc-800/50 rounded-xl animate-pulse" />
          </div>
          <div className="col-span-6 space-y-4">
            <div className="h-12 bg-zinc-800/50 rounded-xl animate-pulse w-2/3" />
            <div className="h-32 bg-zinc-800/50 rounded-xl animate-pulse" />
            <div className="h-64 bg-zinc-800/50 rounded-xl animate-pulse" />
          </div>
          <div className="col-span-3">
            <div className="h-32 bg-zinc-800/50 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
