"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type InvestmentData = {
  initialInvestment: number;
  monthlyExpenses: number;
  monthlyRevenue: number;
  growthRate: number;
  timeHorizon: number;
};

type ProfitProjection = {
  month: number;
  revenue: number;
  expenses: number;
  profit: number;
  cumulativeProfit: number;
  roi: number;
};

export default function ROICalculator() {
  const [investmentData, setInvestmentData] = useState<InvestmentData>({
    initialInvestment: 50000,
    monthlyExpenses: 8000,
    monthlyRevenue: 15000,
    growthRate: 15,
    timeHorizon: 24
  });

  const [projections, setProjections] = useState<ProfitProjection[]>([]);
  const [showResults, setShowResults] = useState(false);

  const calculateProjections = () => {
    const newProjections: ProfitProjection[] = [];
    let cumulativeProfit = -investmentData.initialInvestment;

    for (let month = 1; month <= investmentData.timeHorizon; month++) {
      const monthlyGrowth = Math.pow(1 + investmentData.growthRate / 100, month - 1);
      const revenue = investmentData.monthlyRevenue * monthlyGrowth;
      const expenses = investmentData.monthlyExpenses;
      const profit = revenue - expenses;
      cumulativeProfit += profit;
      const roi = ((cumulativeProfit + investmentData.initialInvestment) / investmentData.initialInvestment - 1) * 100;

      newProjections.push({
        month,
        revenue: Math.round(revenue),
        expenses: Math.round(expenses),
        profit: Math.round(profit),
        cumulativeProfit: Math.round(cumulativeProfit),
        roi: Math.round(roi * 100) / 100
      });
    }

    setProjections(newProjections);
    setShowResults(true);
  };

  useEffect(() => {
    calculateProjections();
  }, [investmentData]);

  const handleInputChange = (field: keyof InvestmentData, value: number) => {
    setInvestmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getROIColor = (roi: number) => {
    if (roi >= 100) return 'text-green-400';
    if (roi >= 50) return 'text-blue-400';
    if (roi >= 0) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getROIIcon = (roi: number) => {
    if (roi >= 100) return '🚀';
    if (roi >= 50) return '📈';
    if (roi >= 0) return '📊';
    return '📉';
  };

  const totalRevenue = projections.reduce((sum, p) => sum + p.revenue, 0);
  const totalExpenses = projections.reduce((sum, p) => sum + p.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses - investmentData.initialInvestment;
  const finalROI = ((totalProfit + investmentData.initialInvestment) / investmentData.initialInvestment - 1) * 100;

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="px-4 py-6 border-b border-teal-500/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-teal-300">ROI Calculator</h1>
              <p className="text-zinc-400">Calculate your Hookah+ investment returns and profit projections</p>
            </div>
            <div className="flex gap-4">
              <Link href="/dashboard" className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors">
                📊 Dashboard
              </Link>
              <Link href="/admin" className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors">
                ⚙️ Admin
              </Link>
              <Link href="/" className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors">
                🏠 Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h2 className="text-xl font-semibold text-teal-300 mb-6">Investment Parameters</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Initial Investment ($)
                  </label>
                  <input
                    type="number"
                    value={investmentData.initialInvestment}
                    onChange={(e) => handleInputChange('initialInvestment', Number(e.target.value))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
                    placeholder="50000"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Total upfront cost for equipment and setup</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Monthly Expenses ($)
                  </label>
                  <input
                    type="number"
                    value={investmentData.monthlyExpenses}
                    onChange={(e) => handleInputChange('monthlyExpenses', Number(e.target.value))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
                    placeholder="8000"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Rent, utilities, staff, supplies, etc.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Monthly Revenue ($)
                  </label>
                  <input
                    type="number"
                    value={investmentData.monthlyRevenue}
                    onChange={(e) => handleInputChange('monthlyRevenue', Number(e.target.value))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
                    placeholder="15000"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Expected monthly sales revenue</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Monthly Growth Rate (%)
                  </label>
                  <input
                    type="number"
                    value={investmentData.growthRate}
                    onChange={(e) => handleInputChange('growthRate', Number(e.target.value))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
                    placeholder="15"
                    step="0.1"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Expected monthly revenue growth percentage</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Time Horizon (Months)
                  </label>
                  <input
                    type="number"
                    value={investmentData.timeHorizon}
                    onChange={(e) => handleInputChange('timeHorizon', Number(e.target.value))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
                    placeholder="24"
                    min="1"
                    max="60"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Number of months to project (1-60)</p>
                </div>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-lg font-semibold text-teal-300 mb-4">Quick Insights</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Monthly Profit:</span>
                  <span className="text-teal-400">
                    ${(investmentData.monthlyRevenue - investmentData.monthlyExpenses).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Break-even Months:</span>
                  <span className="text-yellow-400">
                    {Math.ceil(investmentData.initialInvestment / (investmentData.monthlyRevenue - investmentData.monthlyExpenses))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Profit Margin:</span>
                  <span className="text-blue-400">
                    {(((investmentData.monthlyRevenue - investmentData.monthlyExpenses) / investmentData.monthlyRevenue) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 text-center">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-2xl font-bold text-white">
                  ${totalProfit.toLocaleString()}
                </div>
                <div className="text-sm text-zinc-400">Total Profit</div>
              </div>
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 text-center">
                <div className="text-3xl mb-2">{getROIIcon(finalROI)}</div>
                <div className={`text-2xl font-bold ${getROIColor(finalROI)}`}>
                  {finalROI.toFixed(1)}%
                </div>
                <div className="text-sm text-zinc-400">Total ROI</div>
              </div>
            </div>

            {/* Projection Chart */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-lg font-semibold text-teal-300 mb-4">Profit Projection</h3>
              <div className="h-64 flex items-end justify-between gap-1">
                {projections.slice(0, 12).map((projection) => (
                  <div key={projection.month} className="flex flex-col items-center">
                    <div 
                      className="w-6 bg-teal-500 rounded-t transition-all hover:bg-teal-400 cursor-pointer"
                      style={{ 
                        height: `${Math.max(10, (projection.profit / 10000) * 200)}px`,
                        minHeight: '10px'
                      }}
                      title={`Month ${projection.month}: $${projection.profit.toLocaleString()} profit`}
                    ></div>
                    <div className="text-xs text-zinc-400 mt-2">{projection.month}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-500 text-center mt-2">First 12 months profit projection</p>
            </div>

            {/* Key Metrics */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-lg font-semibold text-teal-300 mb-4">Key Metrics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Revenue:</span>
                  <span className="text-green-400">${totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Expenses:</span>
                  <span className="text-red-400">${totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Initial Investment:</span>
                  <span className="text-yellow-400">${investmentData.initialInvestment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Net Cash Flow:</span>
                  <span className={`font-medium ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${totalProfit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Projections Table */}
        {showResults && (
          <div className="mt-8 bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-teal-300 mb-6">Detailed Monthly Projections</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-2 text-zinc-400">Month</th>
                    <th className="text-right py-2 text-zinc-400">Revenue</th>
                    <th className="text-right py-2 text-zinc-400">Expenses</th>
                    <th className="text-right py-2 text-zinc-400">Profit</th>
                    <th className="text-right py-2 text-zinc-400">Cumulative</th>
                    <th className="text-right py-2 text-zinc-400">ROI %</th>
                  </tr>
                </thead>
                <tbody>
                  {projections.map((projection) => (
                    <tr key={projection.month} className="border-b border-zinc-800/50 hover:bg-zinc-800/50">
                      <td className="py-2 text-zinc-300">{projection.month}</td>
                      <td className="py-2 text-right text-green-400">${projection.revenue.toLocaleString()}</td>
                      <td className="py-2 text-right text-red-400">${projection.expenses.toLocaleString()}</td>
                      <td className={`py-2 text-right font-medium ${projection.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${projection.profit.toLocaleString()}
                      </td>
                      <td className={`py-2 text-right font-medium ${projection.cumulativeProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${projection.cumulativeProfit.toLocaleString()}
                      </td>
                      <td className={`py-2 text-right font-medium ${getROIColor(projection.roi)}`}>
                        {projection.roi.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 text-center">
          <button
            onClick={calculateProjections}
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors mr-4"
          >
            🔄 Recalculate
          </button>
          <Link
            href="/admin"
            className="bg-zinc-700 hover:bg-zinc-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            📊 View Analytics
          </Link>
        </div>
      </div>
    </main>
  );
}
