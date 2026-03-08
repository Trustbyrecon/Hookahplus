"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import type { OnboardingWorkflow } from "../../../types/onboarding";

type GoLiveCheckStepProps = {
  workflow: OnboardingWorkflow;
  stepData: Record<string, unknown>;
  onSaveDraft: (stepKey: string, data: Record<string, unknown>) => Promise<void>;
};

export function GoLiveCheckStep({ workflow, stepData, onSaveDraft }: GoLiveCheckStepProps) {
  const [data, setData] = useState({
    pricingValid: (stepData.pricingValid as boolean) ?? false,
    posVerified: (stepData.posVerified as boolean) ?? false,
    qrTested: (stepData.qrTested as boolean) ?? false,
    testTransactionSuccess: (stepData.testTransactionSuccess as boolean) ?? false,
    operatorApproved: (stepData.operatorApproved as boolean) ?? false,
  });

  const handleSave = () => {
    onSaveDraft("go_live_check", data);
  };

  const checklist = [
    { key: "pricingValid", label: "Pricing valid", value: data.pricingValid },
    { key: "posVerified", label: "POS verified or skipped", value: data.posVerified },
    { key: "qrTested", label: "QR tested", value: data.qrTested },
    { key: "testTransactionSuccess", label: "Test transaction successful", value: data.testTransactionSuccess },
    { key: "operatorApproved", label: "Operator approved", value: data.operatorApproved },
  ];

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white">Go Live Check</h3>

      <Card className="bg-zinc-900/50 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-base text-zinc-300">Readiness checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {checklist.map((item) => (
            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={item.value}
                onChange={(e) =>
                  setData((d) => ({ ...d, [item.key]: e.target.checked }))
                }
                className="rounded border-zinc-600 text-teal-500"
              />
              <span className="text-sm text-zinc-300">{item.label}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-base text-zinc-300">Launch confirmation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-400 mb-4">
            When all checks pass, you can launch your lounge.
          </p>
        </CardContent>
      </Card>

      <Button onClick={handleSave} variant="outline" size="sm">
        Save draft
      </Button>
    </div>
  );
}
