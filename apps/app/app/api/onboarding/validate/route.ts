import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireRole } from "../../../../lib/auth";
import { validateStep } from "../../../../lib/onboarding/validators";
import { computePercentComplete } from "../../../../lib/onboarding/orchestrator";

export async function POST(req: NextRequest) {
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

  let body: { workflowId?: string; stepKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const workflowId = (body.workflowId ?? "").trim();
  const stepKey = (body.stepKey ?? "").trim();

  if (!workflowId || !stepKey) {
    return NextResponse.json({ error: "workflowId and stepKey are required" }, { status: 400 });
  }

  try {
    const step = await prisma.onboardingStep.findUnique({
      where: { workflowId_stepKey: { workflowId, stepKey } },
    });

    if (!step) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    const data = (step.dataJson as Record<string, unknown>) ?? {};
    const result = validateStep(stepKey, data);

    await prisma.onboardingStep.update({
      where: { workflowId_stepKey: { workflowId, stepKey } },
      data: {
        status: result.status,
        errorsJson: result.errors,
        warningsJson: result.warnings,
      },
    });

    const allSteps = await prisma.onboardingStep.findMany({
      where: { workflowId },
      orderBy: { orderIndex: "asc" },
    });

    const stepsForPercent = allSteps.map((s) => ({
      stepKey: s.stepKey,
      title: s.title,
      status: s.stepKey === stepKey ? result.status : s.status,
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
      status: result.status,
      errors: result.errors,
      warnings: result.warnings,
    });
  } catch (err) {
    console.error("[Onboarding POST validate]", err);
    return NextResponse.json(
      { error: "Failed to validate", details: err instanceof Error ? err.message : "Unknown" },
      { status: 500 }
    );
  }
}
