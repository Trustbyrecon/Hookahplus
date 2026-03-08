import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireRole } from "../../../../lib/auth";

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

  let body: { workflowId?: string; confirmedBy?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const workflowId = (body.workflowId ?? "").trim();
  const confirmedBy = (body.confirmedBy ?? "operator").trim();

  if (!workflowId) {
    return NextResponse.json({ error: "workflowId is required" }, { status: 400 });
  }

  try {
    const workflow = await prisma.onboardingWorkflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    await prisma.onboardingWorkflow.update({
      where: { id: workflowId },
      data: {
        overallStatus: "live",
        percentComplete: 100,
      },
    });

    const launchedAt = new Date().toISOString();

    return NextResponse.json({
      overallStatus: "live",
      launchedAt,
      confirmedBy,
      workflowId,
    });
  } catch (err) {
    console.error("[Onboarding POST complete]", err);
    return NextResponse.json(
      { error: "Failed to complete", details: err instanceof Error ? err.message : "Unknown" },
      { status: 500 }
    );
  }
}
