"use client";
import { useEffect, useState } from 'react';

interface MOATMetrics {
  networkGrowth: {
    totalLounges: number;
    activeConnectors: number;
    revenueShared: number;
    geographicCoverage: string[];
  };
  customerNetwork: {
    totalCustomers: number;
    profiledCustomers: number;
    returningCustomers: number;
    crossLocationCustomers: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    connectorEarnings: number;
    averageRevenuePerLounge: number;
    revenueGrowthRate: number;
  };
}

export default function MOATAnalytics() {
  const [metrics, setMetrics] = useState<MOATMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching MOAT metrics
    setTimeout(() => {
      setMetrics({
        networkGrowth: {
          totalLounges: 12,
          activeConnectors: 8,
          revenueShared: 8750,
          geographicCoverage: ['Los Angeles', 'New York', 'Miami', 'Chicago', 'Houston']
        },
        customerNetwork: {
          totalCustomers: 2847,
          profiledCustomers: 1893,
          returningCustomers: 1247,
          crossLocationCustomers: 892
        },
        revenueMetrics: {
          totalRevenue: 125000,
          connectorEarnings: 8750,
          averageRevenuePerLounge: 10417,
          revenueGrowthRate: 23.5
        }
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-8">
        <div className="text-center text-zinc-400">Loading MOAT Analytics...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-teal-400">MOAT Analytics</h1>
            <p className="text-xl text-zinc-300">Network Effect & Scale Growth Metrics</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-400">Last Updated</div>
            <div className="text-lg font-mono text-teal-400">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Network Growth Overview */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-teal-300 mb-4">Network Growth</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-zinc-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{metrics?.networkGrowth.totalLounges}</div>
              <div className="text-zinc-400 text-sm">Total Lounges</div>
              <div className="text-xs text-green-400 mt-1">+3 this month</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{metrics?.networkGrowth.activeConnectors}</div>
              <div className="text-zinc-400 text-sm">Active Connectors</div>
              <div className="text-xs text-blue-400 mt-1">+2 this month</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">${metrics?.networkGrowth.revenueShared.toLocaleString()}</div>
              <div className="text-zinc-400 text-sm">Revenue Shared</div>
              <div className="text-xs text-purple-400 mt-1">5% program</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-amber-400">{metrics?.networkGrowth.geographicCoverage.length}</div>
              <div className="text-zinc-400 text-sm">Cities Covered</div>
              <div className="text-xs text-amber-400 mt-1">Expanding fast</div>
            </div>
          </div>
        </div>

        {/* Customer Network Effects */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-teal-300 mb-4">Customer Network Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-zinc-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{metrics?.customerNetwork.totalCustomers.toLocaleString()}</div>
              <div className="text-zinc-400 text-sm">Total Customers</div>
              <div className="text-xs text-green-400 mt-1">Network effect</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{metrics?.customerNetwork.profiledCustomers.toLocaleString()}</div>
              <div className="text-zinc-400 text-sm">Profiled Customers</div>
              <div className="text-xs text-blue-400 mt-1">66% of total</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">{metrics?.customerNetwork.returningCustomers.toLocaleString()}</div>
              <div className="text-zinc-400 text-sm">Returning Customers</div>
              <div className="text-xs text-purple-400 mt-1">44% retention</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-amber-400">{metrics?.customerNetwork.crossLocationCustomers.toLocaleString()}</div>
              <div className="text-zinc-400 text-sm">Cross-Location</div>
              <div className="text-xs text-amber-400 mt-1">31% mobility</div>
            </div>
          </div>
        </div>

        {/* Revenue & Growth Metrics */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-teal-300 mb-4">Revenue & Growth Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-zinc-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-400">${(metrics?.revenueMetrics.totalRevenue || 0).toLocaleString()}</div>
              <div className="text-zinc-400 text-sm">Total Revenue</div>
              <div className="text-xs text-green-400 mt-1">All locations</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">${(metrics?.revenueMetrics.averageRevenuePerLounge || 0).toLocaleString()}</div>
              <div className="text-zinc-400 text-sm">Avg per Lounge</div>
              <div className="text-xs text-blue-400 mt-1">Monthly average</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">{metrics?.revenueMetrics.revenueGrowthRate}%</div>
              <div className="text-zinc-400 text-sm">Growth Rate</div>
              <div className="text-xs text-purple-400 mt-1">Month over month</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-amber-400">${(metrics?.revenueMetrics.connectorEarnings || 0).toLocaleString()}</div>
              <div className="text-zinc-400 text-sm">Connector Earnings</div>
              <div className="text-xs text-amber-400 mt-1">5% revenue share</div>
            </div>
          </div>
        </div>

        {/* Geographic Coverage Map */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-teal-300 mb-4">Geographic Coverage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Active Cities</h3>
              <div className="space-y-2">
                {metrics?.networkGrowth.geographicCoverage.map((city, index) => (
                  <div key={city} className="flex items-center justify-between bg-zinc-800 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span className="text-white font-medium">{city}</span>
                    </div>
                    <div className="text-sm text-zinc-400">
                      {Math.floor(Math.random() * 5) + 2} lounges
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Expansion Pipeline</h3>
              <div className="space-y-2">
                {['Seattle', 'Denver', 'Atlanta', 'Phoenix'].map((city) => (
                  <div key={city} className="flex items-center justify-between bg-zinc-800 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <span className="text-white font-medium">{city}</span>
                    </div>
                    <div className="text-sm text-zinc-400">In progress</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MOAT Growth Indicators */}
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">MOAT Growth Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🌐</div>
              <h3 className="text-lg font-semibold text-white mb-2">Network Effects</h3>
              <p className="text-zinc-300 text-sm">
                Each new lounge increases the value of the entire network for customers and lounges alike
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🚀</div>
              <h3 className="text-lg font-semibold text-white mb-2">Scale Acceleration</h3>
              <p className="text-zinc-300 text-sm">
                Community connectors enable rapid geographic expansion through trusted relationships
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🏆</div>
              <h3 className="text-lg font-semibold text-white mb-2">Sustainable Advantage</h3>
              <p className="text-zinc-300 text-sm">
                Building an ecosystem that's difficult to replicate through network effects and data moats
              </p>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-teal-300 mb-4">Next Actions for MOAT Growth</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-800 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-2">Immediate (This Week)</h3>
              <ul className="text-sm text-zinc-300 space-y-1">
                <li>• Deploy current Connector Partnership Program</li>
                <li>• Test real-time data integration</li>
                <li>• Validate MOAT metrics accuracy</li>
              </ul>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-2">Short Term (Next Month)</h3>
              <ul className="text-sm text-zinc-300 space-y-1">
                <li>• Launch connector recruitment campaign</li>
                <li>• Implement automated revenue sharing</li>
                <li>• Add geographic expansion tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
