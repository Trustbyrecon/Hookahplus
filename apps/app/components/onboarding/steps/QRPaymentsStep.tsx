"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import type { OnboardingWorkflow } from "../../../types/onboarding";

type QRPaymentsStepProps = {
  workflow: OnboardingWorkflow;
  stepData: Record<string, unknown>;
  onSaveDraft: (stepKey: string, data: Record<string, unknown>) => Promise<void>;
};

export function QRPaymentsStep({ workflow, stepData, onSaveDraft }: QRPaymentsStepProps) {
  const [data, setData] = useState({
    qrEnabled: (stepData.qrEnabled as boolean) ?? true,
    preorderEnabled: (stepData.preorderEnabled as boolean) ?? false,
    stripeConnected: (stepData.stripeConnected as boolean) ?? false,
  });

  const handleSave = () => {
    onSaveDraft("qr_payments", data);
  };

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white">QR & Payments</h3>

      <Card className="bg-zinc-900/50 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-base text-zinc-300">QR setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.qrEnabled}
              onChange={(e) => setData((d) => ({ ...d, qrEnabled: e.target.checked }))}
              className="rounded border-zinc-600 text-teal-500"
            />
            <span className="text-sm text-zinc-300">QR enabled</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.preorderEnabled}
              onChange={(e) => setData((d) => ({ ...d, preorderEnabled: e.target.checked }))}
              className="rounded border-zinc-600 text-teal-500"
            />
            <span className="text-sm text-zinc-300">Preorder enabled</span>
          </label>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-base text-zinc-300">Stripe</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.stripeConnected}
              onChange={(e) => setData((d) => ({ ...d, stripeConnected: e.target.checked }))}
              className="rounded border-zinc-600 text-teal-500"
            />
            <span className="text-sm text-zinc-300">Stripe connected</span>
          </label>
        </CardContent>
      </Card>

      <Button onClick={handleSave} variant="outline" size="sm">
        Save draft
      </Button>
    </div>
  );
}
