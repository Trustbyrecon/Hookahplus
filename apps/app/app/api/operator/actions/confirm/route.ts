import type { NextRequest } from 'next/server';
import { operatorFail } from '../../../../../lib/operatorToolResult';
import { readJsonBody, runConfirm, withOperatorActionsAuth } from '../../../../../lib/operatorActionsHttp';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  return withOperatorActionsAuth(req, async () => {
    const body = await readJsonBody(req);
    const actionKey = body.actionKey;
    if (typeof actionKey !== 'string' || !actionKey.trim()) {
      return operatorFail('end_session', 'validation_error', 'actionKey is required');
    }
    return runConfirm(req, actionKey.trim());
  });
}
