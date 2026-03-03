// apps/web/app/layout-preview/page.tsx
"use client";

import HookahFlowPreview from "../../components/HookahFlowPreview";

export default function LayoutPreviewPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <div className="px-4 py-6 border-b border-teal-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-teal-300">Layout Preview</h1>
              <p className="text-zinc-400">React Flow visualization with mock SeatingMap.json + Routes.json</p>
            </div>
            <div className="flex gap-4">
              <a 
                href="/dashboard" 
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ← Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <HookahFlowPreview />
      </div>
    </main>
  );
}
