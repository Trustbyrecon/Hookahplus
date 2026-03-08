import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireRole, getCurrentTenant } from "../../../../lib/auth";
import { getStepsForWorkflow } from "../../../../lib/onboarding/workflow-config";
import { computePercentComplete } from "../../../../lib/onboarding/orchestrator";
import type { OnboardingWorkflow, OnboardingStep } from "../../../../types/onboarding";

function mapDbToWorkflow(
  w: { id: string; loungeId: string; tenantId: string | null; workflowType: string; overallStatus: string; currentStepKey: string; percentComplete: number; createdAt: Date; updatedAt: Date; steps: Array<{ stepKey: string; title: string; status: string; orderIndex: number; required: boolean; dataJson: unknown; errorsJson: unknown; warningsJson: unknown; blockingReason: string | null; updatedAt: Date }> }
): OnboardingWorkflow {
  const steps: OnboardingStep[] = w.steps.map((s) => ({
    stepKey: s.stepKey,
    title: s.title,
    status: s.status as OnboardingStep["status"],
    order: s.orderIndex,
    required: s.required,
    data: (s.dataJson as Record<string, unknown>) ?? {},
    errors: Array.isArray(s.errorsJson) ? (s.errorsJson as string[]) : [],
    warnings: Array.isArray(s.warningsJson) ? (s.warningsJson as string[]) : [],
    blockingReason: s.blockingReason ?? undefined,
    updatedAt: s.updatedAt.toISOString(),
  }));

  return {
    workflowId: w.id,
    loungeId: w.loungeId,
    tenantId: w.tenantId,
    workflowType: w.workflowType,
    overallStatus: w.overallStatus as OnboardingWorkflow["overallStatus"],
    currentStepKey: w.currentStepKey,
    steps,
    percentComplete: w.percentComplete,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
  };
}

export async function GET(req: NextRequest) {
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

  const { searchParams } = new URL(req.url);
  const loungeId = searchParams.get("loungeId")?.trim();
  if (!loungeId) {
    return NextResponse.json({ error: "loungeId is required" }, { status: 400 });
  }

  try {
    const workflow = await prisma.onboardingWorkflow.findUnique({
      where: { loungeId },
      include: { steps: { orderBy: { orderIndex: "asc" } } },
    });

    if (!workflow) {
      return NextResponse.json({ workflow: null, loungeId }, { status: 200 });
    }

    return NextResponse.json({
      workflow: mapDbToWorkflow(workflow),
      loungeId,
    });
  } catch (err) {
    console.error("[Onboarding GET workflow]", err);
    return NextResponse.json(
      { error: "Failed to load workflow", details: err instanceof Error ? err.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let tenantId: string | null = null;
  if (process.env.NODE_ENV === "production") {
    try {
      await requireRole(req, ["owner", "admin", "staff"]);
      tenantId = await getCurrentTenant(req);
    } catch (authError) {
      return NextResponse.json(
        { error: "Authentication required", details: authError instanceof Error ? authError.message : "Unknown" },
        { status: 401 }
      );
    }
  }

  let body: { loungeId?: string; workflowType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const loungeId = (body.loungeId ?? "").trim();
  const workflowType = (body.workflowType ?? "manual_basic").trim();

  if (!loungeId) {
    return NextResponse.json({ error: "loungeId is required" }, { status: 400 });
  }

  try {
    let workflow = await prisma.onboardingWorkflow.findUnique({
      where: { loungeId },
      include: { steps: { orderBy: { orderIndex: "asc" } } },
    });

    if (workflow) {
      return NextResponse.json({
        workflow: mapDbToWorkflow(workflow),
        loungeId,
      });
    }

    const stepKeys = getStepsForWorkflow(workflowType);
    const stepTitles: Record<string, string> = {
      lounge_identity: "Lounge Identity",
      pricing_lock: "Pricing Lock",
      pos_connection: "POS Connection",
      qr_payments: "QR & Payments",
      go_live_check: "Go Live Check",
    };

    workflow = await prisma.onboardingWorkflow.create({
      data: {
        loungeId,
        tenantId: tenantId ?? undefined,
        workflowType,
        overallStatus: "in_progress",
        currentStepKey: stepKeys[0] ?? "lounge_identity",
        percentComplete: 0,
        steps: {
          create: stepKeys.map((key, idx) => ({
            stepKey: key,
            title: stepTitles[key] ?? key,
            status: idx === 0 ? "in_progress" : "not_started",
            orderIndex: idx,
            required: key !== "pos_connection" || workflowType !== "manual_basic",
            dataJson: {},
            errorsJson: [],
            warningsJson: [],
          })),
        },
      },
      include: { steps: { orderBy: { orderIndex: "asc" } } },
    });

    return NextResponse.json({
      workflow: mapDbToWorkflow(workflow),
      loungeId,
    });
  } catch (err) {
    console.error("[Onboarding POST workflow]", err);
    return NextResponse.json(
      { error: "Failed to create workflow", details: err instanceof Error ? err.message : "Unknown" },
      { status: 500 }
    );
  }
}

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

  let body: { workflowId?: string; currentStepKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const workflowId = (body.workflowId ?? "").trim();
  const currentStepKey = (body.currentStepKey ?? "").trim();

  if (!workflowId || !currentStepKey) {
    return NextResponse.json({ error: "workflowId and currentStepKey are required" }, { status: 400 });
  }

  try {
    const workflow = await prisma.onboardingWorkflow.update({
      where: { id: workflowId },
      data: { currentStepKey },
      include: { steps: { orderBy: { orderIndex: "asc" } } },
    });
    return NextResponse.json({
      workflow: mapDbToWorkflow(workflow),
      loungeId: workflow.loungeId,
    });
  } catch (err) {
    console.error("[Onboarding PATCH workflow]", err);
    return NextResponse.json(
      { error: "Failed to update workflow", details: err instanceof Error ? err.message : "Unknown" },
      { status: 500 }
    );
  }
}
