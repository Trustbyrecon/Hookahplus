"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import type { OnboardingWorkflow } from "../../../types/onboarding";

type LoungeIdentityStepProps = {
  workflow: OnboardingWorkflow;
  stepData: Record<string, unknown>;
  onSaveDraft: (stepKey: string, data: Record<string, unknown>) => Promise<void>;
};

export function LoungeIdentityStep({ workflow, stepData, onSaveDraft }: LoungeIdentityStepProps) {
  const [data, setData] = useState({
    loungeName: (stepData.loungeName as string) ?? "",
    ownerName: (stepData.ownerName as string) ?? "",
    managerContact: (stepData.managerContact as string) ?? "",
    address: (stepData.address as string) ?? "",
    timezone: (stepData.timezone as string) ?? "America/New_York",
    hours: (stepData.hours as Record<string, { open: string; close: string }>) ?? {},
  });

  const handleSave = () => {
    onSaveDraft("lounge_identity", data);
  };

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white">Lounge Identity</h3>

      <Card className="bg-zinc-900/50 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-base text-zinc-300">Lounge Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Lounge name</label>
            <input
              type="text"
              value={data.loungeName}
              onChange={(e) => setData((d) => ({ ...d, loungeName: e.target.value }))}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white"
              placeholder="Your lounge name"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Owner name</label>
            <input
              type="text"
              value={data.ownerName}
              onChange={(e) => setData((d) => ({ ...d, ownerName: e.target.value }))}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white"
              placeholder="Owner name"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Manager contact</label>
            <input
              type="text"
              value={data.managerContact}
              onChange={(e) => setData((d) => ({ ...d, managerContact: e.target.value }))}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white"
              placeholder="Email or phone"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-base text-zinc-300">Location & Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Address</label>
            <input
              type="text"
              value={data.address}
              onChange={(e) => setData((d) => ({ ...d, address: e.target.value }))}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white"
              placeholder="Street address"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Timezone</label>
            <select
              value={data.timezone}
              onChange={(e) => setData((d) => ({ ...d, timezone: e.target.value }))}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white"
            >
              <option value="America/New_York">Eastern</option>
              <option value="America/Chicago">Central</option>
              <option value="America/Denver">Mountain</option>
              <option value="America/Los_Angeles">Pacific</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} variant="outline" size="sm">
        Save draft
      </Button>
    </div>
  );
}
