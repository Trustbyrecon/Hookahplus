import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { executeOperatorTool } from './operatorToolExecutor';
import { executePendingOperatorAction } from './operatorPendingExecution';
import { verifyOperatorActionsApiKey } from './operatorActionsAuth';
import type { OperatorToolName, OperatorToolResult } from './operatorTypes';

export async function readJsonBody(req: NextRequest): Promise<Record<string, unknown>> {
  try {
    const b = await req.json();
    return b && typeof b === 'object' && !Array.isArray(b) ? (b as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function loungeIdFromBody(body: Record<string, unknown>): string | undefined {
  const v = body.loungeId;
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

export async function withOperatorActionsAuth(
  req: NextRequest,
  run: () => Promise<OperatorToolResult>
): Promise<NextResponse> {
  const auth = verifyOperatorActionsApiKey(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const result = await run();
  return NextResponse.json(result, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function runTool(
  req: NextRequest,
  tool: OperatorToolName,
  body: Record<string, unknown>
): Promise<OperatorToolResult> {
  const scope = loungeIdFromBody(body);
  return executeOperatorTool(tool, body, req, scope);
}

export async function runConfirm(req: NextRequest, actionKey: string): Promise<OperatorToolResult> {
  return executePendingOperatorAction(actionKey, req);
}
