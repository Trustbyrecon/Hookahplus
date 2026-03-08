"use client";

import React, { useState } from "react";
import { CreditCard, QrCode, CreditCard as StripeIcon, MapPin } from "lucide-react";
import { Button } from "../ui/button";
import { inferWorkflowType, isProvisionalWorkflow } from "../../lib/onboarding/workflow-inference";
import type { WorkflowSetupAnswers } from "../../types/onboarding";

type WorkflowSetupStepProps = {
  loungeId: string;
  onWorkflowCreated: (workflowType: string) => Promise<void>;
};

const POS_OPTIONS: { value: WorkflowSetupAnswers["posType"]; label: string; icon: React.ReactNode }[] = [
  { value: "square", label: "Square", icon: <CreditCard className="w-5 h-5" /> },
  { value: "clover", label: "Clover", icon: <CreditCard className="w-5 h-5" /> },
  { value: "toast", label: "Toast", icon: <CreditCard className="w-5 h-5" /> },
  { value: "manual", label: "Manual / No POS yet", icon: <CreditCard className="w-5 h-5" /> },
];

export function WorkflowSetupStep({ loungeId, onWorkflowCreated }: WorkflowSetupStepProps) {
  const [answers, setAnswers] = useState<WorkflowSetupAnswers>({
    posType: "manual",
    qrPreordersEnabled: false,
    stripeCheckoutEnabled: false,
    multiLocation: false,
  });
  const [isCreating, setIsCreating] = useState(false);

  const workflowType = inferWorkflowType(answers);
  const provisional = isProvisionalWorkflow(answers);

  const handleConfirm = async () => {
    setIsCreating(true);
    try {
      await onWorkflowCreated(workflowType);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-zinc-800/50 border border-zinc-700 rounded-xl">
      <h2 className="text-xl font-semibold text-white mb-2">Set up your lounge</h2>
      <p className="text-zinc-400 text-sm mb-6">
        Tell us about your setup so we can tailor the onboarding steps.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">POS type</label>
          <div className="grid grid-cols-2 gap-3">
            {POS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAnswers((a) => ({ ...a, posType: opt.value }))}
                className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                  answers.posType === opt.value
                    ? "border-teal-500 bg-teal-500/10 text-teal-300"
                    : "border-zinc-600 bg-zinc-800/50 text-zinc-400 hover:border-zinc-500"
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={answers.qrPreordersEnabled ?? false}
              onChange={(e) => setAnswers((a) => ({ ...a, qrPreordersEnabled: e.target.checked }))}
              className="rounded border-zinc-600 text-teal-500 focus:ring-teal-500"
            />
            <span className="text-sm text-zinc-300">QR preorders enabled</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={answers.stripeCheckoutEnabled ?? false}
              onChange={(e) => setAnswers((a) => ({ ...a, stripeCheckoutEnabled: e.target.checked }))}
              className="rounded border-zinc-600 text-teal-500 focus:ring-teal-500"
            />
            <span className="text-sm text-zinc-300">Stripe checkout enabled</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={answers.multiLocation ?? false}
              onChange={(e) => setAnswers((a) => ({ ...a, multiLocation: e.target.checked }))}
              className="rounded border-zinc-600 text-teal-500 focus:ring-teal-500"
            />
            <span className="text-sm text-zinc-300">Multi-location</span>
          </label>
        </div>

        <div className="p-4 bg-zinc-900/50 border border-zinc-700 rounded-lg">
          <p className="text-sm text-zinc-400 mb-1">We've selected:</p>
          <p className="text-teal-400 font-medium">{workflowType.replace(/_/g, " ")}</p>
          <p className="text-xs text-zinc-500 mt-1">You can change this later.</p>
          {provisional && (
            <p className="text-xs text-amber-400 mt-2">
              No POS selected. You can add one later.
            </p>
          )}
        </div>

        <Button onClick={handleConfirm} disabled={isCreating} className="w-full">
          {isCreating ? "Creating..." : "Continue to onboarding"}
        </Button>
      </div>
    </div>
  );
}
