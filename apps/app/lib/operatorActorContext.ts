import type { NextRequest } from 'next/server';
import { getCurrentRole, getCurrentUser } from './auth';
import type { OperatorTrustTier } from './operatorTrustPolicy';

export interface OperatorActorContext {
  userId?: string;
  role?: string;
  trustTier: OperatorTrustTier;
}

export function deriveOperatorTrustTier(role?: string | null): OperatorTrustTier {
  const r = (role || '').toLowerCase();
  switch (r) {
    case 'owner':
      return 4;
    case 'admin':
    case 'manager':
      return 3;
    case 'staff':
      return 2;
    case 'viewer':
    default:
      return 1;
  }
}

/** Browser / cookie-authenticated operator (e.g. POST /api/operator/chat). API-key-only actions omit this and default to tier 1. */
export async function resolveOperatorActorContext(req: NextRequest): Promise<OperatorActorContext> {
  const user = await getCurrentUser(req);
  const role = await getCurrentRole(req);
  return {
    userId: user?.id,
    role: role ?? undefined,
    trustTier: deriveOperatorTrustTier(role),
  };
}
