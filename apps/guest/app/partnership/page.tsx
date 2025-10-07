'use client';

import React, { useState } from 'react';
import GlobalNavigation from '../../components/GlobalNavigation';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  Star, 
  Calculator, 
  TrendingUp, 
  Users, 
  DollarSign,
  Percent,
  Calendar,
  Target,
  Award,
  BarChart3
} from 'lucide-react';

export default function PartnershipPage() {
  const [roiInputs, setRoiInputs] = useState({
    monthlyRevenue: 50000,
    referralCount: 10,
    averageOrderValue: 150,
    conversionRate: 0.15
  });

  const [revenueShareInputs, setRevenueShareInputs] = useState({
    monthlyRevenue: 50000,
    referralRevenue: 7500,
    revenueShareRate: 5
  });

  const calculateROI = () => {
    const { monthlyRevenue, referralCount, averageOrderValue, conversionRate } = roiInputs;
    
    const monthlyReferralRevenue = referralCount * averageOrderValue * conversionRate;
    const annualReferralRevenue = monthlyReferralRevenue * 12;
    const annualTotalRevenue = monthlyRevenue * 12;
    const revenueIncrease = (annualReferralRevenue / annualTotalRevenue) * 100;
    
    return {
      monthlyReferralRevenue,
      annualReferralRevenue,
      revenueIncrease,
      breakEvenMonths: monthlyRevenue / monthlyReferralRevenue
    };
  };

  const calculateRevenueShare = () => {
    const { monthlyRevenue, referralRevenue, revenueShareRate } = revenueShareInputs;
    
    const monthlyShare = (referralRevenue * revenueShareRate) / 100;
    const annualShare = monthlyShare * 12;
    const totalReferralValue = referralRevenue * 12;
    const netRevenue = (referralRevenue - monthlyShare) * 12;
    
    return {
      monthlyShare,
      annualShare,
      totalReferralValue,
      netRevenue,
      sharePercentage: (monthlyShare / referralRevenue) * 100
    };
  };

  const roiResults = calculateROI();
  const revenueShareResults = calculateRevenueShare();

  const partnershipTiers = [
    {
      name: 'Bronze Partner',
      minReferrals: 5,
      revenueShare: 3,
      benefits: ['Basic analytics', 'Email support', 'Marketing materials'],
      color: 'from-amber-500 to-orange-500'
    },
    {
      name: 'Silver Partner',
      minReferrals: 15,
      revenueShare: 4,
      benefits: ['Advanced analytics', 'Priority support', 'Custom marketing', 'Co-branded materials'],
      color: 'from-gray-400 to-gray-600'
    },
    {
      name: 'Gold Partner',
      minReferrals: 30,
      revenueShare: 5,
      benefits: ['Premium analytics', 'Dedicated support', 'White-label options', 'Revenue sharing'],
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      name: 'Platinum Partner',
      minReferrals: 50,
      revenueShare: 6,
      benefits: ['Enterprise analytics', '24/7 support', 'API access', 'Custom integrations'],
      color: 'from-purple-400 to-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation currentPage="partnership" />
      
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Hookah+ Partnership Program</h1>
          <p className="text-zinc-400 text-lg">Join our network and earn 5% revenue share on every referral</p>
        </div>

        {/* ROI Calculator */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Calculator className="w-8 h-8 text-primary-400" />
              <h2 className="text-2xl font-bold">ROI Calculator</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Input Your Numbers</h3>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Current Monthly Revenue ($)
                  </label>
                  <input
                    type="number"
                    value={roiInputs.monthlyRevenue}
                    onChange={(e) => setRoiInputs(prev => ({ ...prev, monthlyRevenue: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Monthly Referrals
                  </label>
                  <input
                    type="number"
                    value={roiInputs.referralCount}
                    onChange={(e) => setRoiInputs(prev => ({ ...prev, referralCount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Average Order Value ($)
                  </label>
                  <input
                    type="number"
                    value={roiInputs.averageOrderValue}
                    onChange={(e) => setRoiInputs(prev => ({ ...prev, averageOrderValue: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Conversion Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={roiInputs.conversionRate * 100}
                    onChange={(e) => setRoiInputs(prev => ({ ...prev, conversionRate: Number(e.target.value) / 100 }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Projected Results</h3>
                
                <div className="space-y-3">
                  <div className="p-4 bg-zinc-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Monthly Referral Revenue</span>
                      <span className="text-green-400 font-bold">
                        ${roiResults.monthlyReferralRevenue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Annual Referral Revenue</span>
                      <span className="text-green-400 font-bold">
                        ${roiResults.annualReferralRevenue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Revenue Increase</span>
                      <span className="text-primary-400 font-bold">
                        {roiResults.revenueIncrease.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Break-even Time</span>
                      <span className="text-blue-400 font-bold">
                        {roiResults.breakEvenMonths.toFixed(1)} months
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Revenue Share Calculator */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <DollarSign className="w-8 h-8 text-green-400" />
              <h2 className="text-2xl font-bold">5% Revenue Share Calculator</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Your Referral Performance</h3>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Monthly Referral Revenue ($)
                  </label>
                  <input
                    type="number"
                    value={revenueShareInputs.referralRevenue}
                    onChange={(e) => setRevenueShareInputs(prev => ({ ...prev, referralRevenue: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Revenue Share Rate (%)
                  </label>
                  <input
                    type="number"
                    value={revenueShareInputs.revenueShareRate}
                    onChange={(e) => setRevenueShareInputs(prev => ({ ...prev, revenueShareRate: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Your Earnings</h3>
                
                <div className="space-y-3">
                  <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Monthly Share</span>
                      <span className="text-green-400 font-bold text-xl">
                        ${revenueShareResults.monthlyShare.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Annual Share</span>
                      <span className="text-green-400 font-bold text-xl">
                        ${revenueShareResults.annualShare.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Total Referral Value</span>
                      <span className="text-blue-400 font-bold">
                        ${revenueShareResults.totalReferralValue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Net Revenue (After Share)</span>
                      <span className="text-primary-400 font-bold">
                        ${revenueShareResults.netRevenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Partnership Tiers */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Award className="w-8 h-8 text-yellow-400" />
              <h2 className="text-2xl font-bold">Partnership Tiers</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {partnershipTiers.map((tier, index) => (
                <div key={index} className="bg-zinc-800 rounded-lg p-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tier.color} flex items-center justify-center mb-4`}>
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{tier.name}</h3>
                  <p className="text-sm text-zinc-400 mb-4">
                    Min {tier.minReferrals} referrals/month
                  </p>
                  
                  <div className="text-2xl font-bold text-primary-400 mb-4">
                    {tier.revenueShare}% Revenue Share
                  </div>
                  
                  <ul className="space-y-2 text-sm text-zinc-300">
                    {tier.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => alert(`Apply for ${tier.name}`)}
                  >
                    Apply Now
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* CTA Section */}
        <Card>
          <div className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="text-zinc-400 text-lg mb-6">
              Join our partnership program and start earning 5% revenue share on every referral
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => alert('Partnership application started')}
                leftIcon={<Star className="w-5 h-5" />}
              >
                Apply for Partnership
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.location.href = '/support'}
                leftIcon={<Users className="w-5 h-5" />}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}