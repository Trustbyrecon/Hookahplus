"use client";

import React, { useState } from "react";
import PartnershipTiers from "../../components/PartnershipTiers";
import PayoutSummary from "../../components/partners/PayoutSummary";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Users, DollarSign, BarChart3, Settings } from "lucide-react";

export default function PartnershipPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const partnerId = "demo-partner"; // Replace with real partner ID from auth

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Partnership Dashboard</h1>
              <p className="text-green-100 text-lg">
                Track your referrals, earnings, and unlock new tiers
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button className="bg-white text-green-600 hover:bg-green-50">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-neutral-800">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tiers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Tiers
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Referrals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-400">Total Referrals</p>
                      <p className="text-3xl font-bold text-green-400">17</p>
                    </div>
                    <Users className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-400">Active Lounges</p>
                      <p className="text-3xl font-bold text-blue-400">12</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-400">30-Day Velocity</p>
                      <p className="text-3xl font-bold text-purple-400">6</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-400">Quality Score</p>
                      <p className="text-3xl font-bold text-yellow-400">71%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-neutral-800 border-neutral-700">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>New referral: Lounge "Smoke & Mirrors"</span>
                    </div>
                    <span className="text-sm text-neutral-400">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Payout processed: $125.00</span>
                    </div>
                    <span className="text-sm text-neutral-400">1 day ago</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>Reached Silver tier milestone</span>
                    </div>
                    <span className="text-sm text-neutral-400">3 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tiers">
            <PartnershipTiers />
          </TabsContent>

          <TabsContent value="earnings">
            <PayoutSummary partnerId={partnerId} />
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <Card className="bg-neutral-800 border-neutral-700">
              <CardHeader>
                <CardTitle>Your Referral Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-lg">
                    <div>
                      <code className="text-sm font-mono">ref_abc123</code>
                      <p className="text-xs text-neutral-400">Created 2 days ago</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-400">5 uses</span>
                      <Button size="sm" variant="outline">Copy</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-lg">
                    <div>
                      <code className="text-sm font-mono">ref_def456</code>
                      <p className="text-xs text-neutral-400">Created 1 week ago</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-400">12 uses</span>
                      <Button size="sm" variant="outline">Copy</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
