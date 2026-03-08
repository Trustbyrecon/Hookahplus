"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import type { OnboardingWorkflow } from "../../../types/onboarding";

type PricingLockStepProps = {
  workflow: OnboardingWorkflow;
  stepData: Record<string, unknown>;
  onSaveDraft: (stepKey: string, data: Record<string, unknown>) => Promise<void>;
};

export function PricingLockStep({ workflow, stepData, onSaveDraft }: PricingLockStepProps) {
  const [data, setData] = useState({
    pricingMode: (stepData.pricingMode as string) ?? "flat_fee",
    baseSessionPrice: (stepData.baseSessionPrice as number) ?? 30,
    premiumFlavorEnabled: (stepData.premiumFlavorEnabled as boolean) ?? false,
    marginAmount: (stepData.marginAmount as number) ?? 0,
  });

  const handleSave = () => {
    onSaveDraft("pricing_lock", data);
  };

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white">Pricing Lock</h3>

      <Card className="bg-zinc-900/50 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-base text-zinc-300">Pricing mode</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={data.pricingMode}
            onChange={(e) => setData((d) => ({ ...d, pricingMode: e.target.value }))}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white"
          >
            <option value="flat_fee">Flat fee</option>
            <option value="timer">Timer-based</option>
          </select>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-base text-zinc-300">Base session price</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="number"
            min={20}
            value={data.baseSessionPrice}
            onChange={(e) => setData((d) => ({ ...d, baseSessionPrice: Number(e.target.value) || 20 }))}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white"
          />
          <p className="text-xs text-zinc-500 mt-1">Minimum $20</p>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-base text-zinc-300">Premium flavors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.premiumFlavorEnabled}
              onChange={(e) => setData((d) => ({ ...d, premiumFlavorEnabled: e.target.checked }))}
              className="rounded border-zinc-600 text-teal-500"
            />
            <span className="text-sm text-zinc-300">Enable premium flavor add-ons</span>
          </label>
          {data.premiumFlavorEnabled && (
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Lounge margin ($)</label>
              <input
                type="number"
                min={0}
                value={data.marginAmount}
                onChange={(e) => setData((d) => ({ ...d, marginAmount: Number(e.target.value) || 0 }))}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} variant="outline" size="sm">
        Save draft
      </Button>
    </div>
  );
}
