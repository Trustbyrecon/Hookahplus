// apps/dashboard/app/floor-dashboard/page.tsx
"use client";

import FloorQueue from '../../components/FloorQueue';

export default function FloorDashboard() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-teal-300 mb-2">Floor Dashboard</h1>
          <p className="text-zinc-400">Real-time floor queue management and session tracking</p>
        </div>

        <FloorQueue />

        {/* Additional Floor Dashboard Components */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h2 className="text-xl font-semibold text-blue-300 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Generate Mobile QR
              </button>
              <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                Emergency Override
              </button>
              <button className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors">
                Staff Alert
              </button>
            </div>
          </div>

          {/* Floor Status */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h2 className="text-xl font-semibold text-green-300 mb-4">Floor Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-300">Tables Available</span>
                <span className="text-white font-medium">12/15</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-300">Staff On Duty</span>
                <span className="text-white font-medium">8/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-300">Avg Service Time</span>
                <span className="text-white font-medium">45m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-300">Revenue Today</span>
                <span className="text-white font-medium">$2,450</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">Recent Activity</h2>
            <div className="space-y-2 text-sm">
              <div className="text-zinc-300">T-001 session completed</div>
              <div className="text-zinc-300">B-002 refill requested</div>
              <div className="text-zinc-300">T-003 coals needed</div>
              <div className="text-zinc-300">New customer added to queue</div>
              <div className="text-zinc-300">Staff shift change</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
