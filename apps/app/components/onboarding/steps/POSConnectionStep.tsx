"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import type { OnboardingWorkflow } from "../../../types/onboarding";

type POSConnectionStepProps = {
  workflow: OnboardingWorkflow;
  stepData: Record<string, unknown>;
  onSaveDraft: (stepKey: string, data: Record<string, unknown>) => Promise<void>;
};

const POS_OPTIONS = [
  { value: "square", label: "Square" },
  { value: "clover", label: "Clover" },
  { value: "toast", label: "Toast" },
  { value: "manual", label: "Manual" },
];

export function POSConnectionStep({ workflow, stepData, onSaveDraft }: POSConnectionStepProps) {
  const [data, setData] = useState({
    posType: (stepData.posType as string) ?? "manual",
    credentials: (stepData.credentials as Record<string, string>) ?? {},
  });

  const handleSave = () => {
    onSaveDraft("pos_connection", data);
  };

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white">POS Connection</h3>

      <Card className="bg-zinc-900/50 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-base text-zinc-300">POS type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {POS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setData((d) => ({ ...d, posType: opt.value }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  data.posType === opt.value
                    ? "bg-teal-600 text-white"
                    : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {data.posType !== "manual" && (
        <Card className="bg-zinc-900/50 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-base text-zinc-300">Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-400">
              Connect your {data.posType} account. Integration guide will be shown after selection.
            </p>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleSave} variant="outline" size="sm">
        Save draft
      </Button>
    </div>
  );
}
