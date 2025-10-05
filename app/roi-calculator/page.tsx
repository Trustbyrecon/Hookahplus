"use client";

import { useState, useEffect, useMemo } from "react";

export default function ROICalculatorPage() {
  const [sessionPrice, setSessionPrice] = useState(30);
  const [sessionsPerDay, setSessionsPerDay] = useState(20);
  const [operatingCosts, setOperatingCosts] = useState(8000);
  const [roi, setRoi] = useState(0);

  useEffect(() => {
    calculateROI();
  }, [sessionPrice, sessionsPerDay, operatingCosts]);

  const calculateROI = () => {
    const monthlySessions = sessionsPerDay * 30;
    const totalRevenue = monthlySessions * sessionPrice;
    const profit = totalRevenue - operatingCosts;
    const roiValue = operatingCosts > 0 ? (profit / operatingCosts) * 100 : 0;
    setRoi(roiValue);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Hookah+ ROI Calculator
          </h1>
          <p className="text-xl text-gray-300">
            Calculate your potential return on investment with Hookah+
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">Business Parameters</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Price ($)
                </label>
                <input
                  type="number"
                  value={sessionPrice}
                  onChange={(e) => setSessionPrice(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sessions Per Day
                </label>
                <input
                  type="number"
                  value={sessionsPerDay}
                  onChange={(e) => setSessionsPerDay(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monthly Operating Costs ($)
                </label>
                <input
                  type="number"
                  value={operatingCosts}
                  onChange={(e) => setOperatingCosts(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="8000"
                />
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">ROI Analysis</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/20">
                <span className="text-gray-300">Monthly Sessions:</span>
                <span className="text-white font-semibold">{sessionsPerDay * 30}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-white/20">
                <span className="text-gray-300">Monthly Revenue:</span>
                <span className="text-white font-semibold">
                  {formatCurrency(sessionsPerDay * 30 * sessionPrice)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-white/20">
                <span className="text-gray-300">Operating Costs:</span>
                <span className="text-white font-semibold">
                  {formatCurrency(operatingCosts)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-white/20">
                <span className="text-gray-300">Monthly Profit:</span>
                <span className={`font-semibold ${
                  (sessionsPerDay * 30 * sessionPrice - operatingCosts) >= 0 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {formatCurrency(sessionsPerDay * 30 * sessionPrice - operatingCosts)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg px-4">
                <span className="text-white font-semibold text-lg">ROI:</span>
                <span className={`text-2xl font-bold ${
                  roi >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {roi.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-500/20 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Hookah+ Benefits</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Streamlined order management</li>
                <li>• Real-time session tracking</li>
                <li>• Customer analytics</li>
                <li>• Automated billing</li>
                <li>• Staff efficiency tools</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300">
            Get Started with Hookah+
          </button>
        </div>
      </div>
    </div>
  );
}