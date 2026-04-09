import type { NextRequest } from 'next/server';
import { readJsonBody, runTool, withOperatorActionsAuth } from '../../../../../lib/operatorActionsHttp';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  return withOperatorActionsAuth(req, async () => {
    const body = await readJsonBody(req);
    return runTool(req, 'start_session', body);
  });
}
