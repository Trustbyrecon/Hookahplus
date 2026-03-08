import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/db";
import { requireRole } from "../../../../lib/auth";
import { computePercentComplete } from "../../../../lib/onboarding/orchestrator";

export async function PATCH(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    try {
      await requireRole(req, ["owner", "admin", "staff"]);
    } catch (authError) {
      return NextResponse.json(
        { error: "Authentication required", details: authError instanceof Error ? authError.message : "Unknown" },
        { status: 401 }
      );
    }
  }

  let body: { workflowId?: string; stepKey?: string; data?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const workflowId = (body.workflowId ?? "").trim();
  const stepKey = (body.stepKey ?? "").trim();
  const data = body.data;

  if (!workflowId || !stepKey) {
    return NextResponse.json({ error: "workflowId and stepKey are required" }, { status: 400 });
  }

  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "data must be an object" }, { status: 400 });
  }

  try {
    const step = await prisma.onboardingStep.findUnique({
      where: { workflowId_stepKey: { workflowId, stepKey } },
      include: { workflow: true },
    });

    if (!step) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    const existingData = (step.dataJson as Record<string, unknown>) ?? {};
    const mergedData = { ...existingData, ...data };

    await prisma.onboardingStep.update({
      where: { workflowId_stepKey: { workflowId, stepKey } },
      data: {
        dataJson: mergedData as Prisma.InputJsonValue,
        status: step.status === "not_started" ? "in_progress" : step.status,
      },
    });

    const allSteps = await prisma.onboardingStep.findMany({
      where: { workflowId },
      orderBy: { orderIndex: "asc" },
    });

    const stepsForPercent = allSteps.map((s) => ({
      stepKey: s.stepKey,
      title: s.title,
      status: (s.stepKey === stepKey && s.status === "not_started" ? "in_progress" : s.status) as "complete" | "skipped" | "in_progress" | "not_started",
      order: s.orderIndex,
      required: s.required,
      data: {},
      errors: [],
      warnings: [],
    }));
    const percentComplete = computePercentComplete(stepsForPercent);

    await prisma.onboardingWorkflow.update({
      where: { id: workflowId },
      data: { percentComplete },
    });

    return NextResponse.json({
      success: true,
      stepKey,
      workflowId,
    });
  } catch (err) {
    console.error("[Onboarding PATCH step]", err);
    return NextResponse.json(
      { error: "Failed to save step", details: err instanceof Error ? err.message : "Unknown" },
      { status: 500 }
    );
  }
}
