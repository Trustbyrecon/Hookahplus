import { createPendingMultiStepOperatorAction } from './operatorConfirmation';
import type { OperatorActorContext } from './operatorActorContext';
import { prisma } from './db';
import { evaluateOperatorChainTrustDecision } from './operatorChainTrustPolicy';
import { operatorFail, operatorNeedsConfirmation, operatorSuccess } from './operatorToolResult';
import type { OperatorToolResult } from './operatorTypes';

export async function getUsualFlavorsForCustomer(
  loungeId: string,
  customerName: string
): Promise<string[]> {
  const rollup = await prisma.customerMemory.findFirst({
    where: {
      loungeId,
      OR: [
        { customerRef: { contains: customerName, mode: 'insensitive' } },
        { customerName: { contains: customerName, mode: 'insensitive' } },
      ],
    },
    orderBy: { updatedAt: 'desc' },
  });

  if (rollup?.recentFlavors?.length) {
    return rollup.recentFlavors.slice(0, 8);
  }
  return ['Classic Mint'];
}

export interface ExecuteMoveThenCloseChainArgs {
  actor: OperatorActorContext;
  loungeId?: string;
  sessionId: string;
  fromTable?: string;
  destinationTable: string;
  confidence: 'high' | 'medium' | 'low';
  customerRef?: string;
}

/**
 * Move then close: one combined confirmation. Chain always includes high-risk close → never auto-runs.
 */
export async function executeMoveThenCloseChain(
  args: ExecuteMoveThenCloseChainArgs
): Promise<OperatorToolResult> {
  const { actor, loungeId, sessionId, fromTable, destinationTable, confidence, customerRef } = args;

  const trustDecision = evaluateOperatorChainTrustDecision({
    trustTier: actor.trustTier,
    steps: [
      { tool: 'move_table', riskLevel: 'medium', confidence, ambiguous: false },
      { tool: 'end_session', riskLevel: 'high', confidence, ambiguous: false },
    ],
  });

  const pending = createPendingMultiStepOperatorAction(
    [
      {
        tool: 'move_table',
        args: {
          session_id: sessionId,
          destination_table: destinationTable,
        },
      },
      {
        tool: 'end_session',
        args: {
          session_id: sessionId,
        },
      },
    ],
    loungeId
  );

  return operatorNeedsConfirmation(
    'move_table',
    `Move to Table ${destinationTable} and close session after?`,
    {
      required: true,
      actionKey: pending.actionKey,
      prompt: `Move to Table ${destinationTable} and close session after?`,
    },
    {
      chainIntent: 'move_then_close',
      riskLevel: trustDecision.highestRisk,
      trustTier: actor.trustTier,
      confidence: trustDecision.lowestConfidence,
      autoConfirmed: false,
      trustReason: trustDecision.reason,
      chainTrust: trustDecision,
      fromTable,
      destinationTable,
      customerRef,
    },
    `[CHAIN?] move_then_close session=${sessionId} → ${destinationTable}`
  );
}

export interface ExecuteStartUsualChainArgs {
  actor: OperatorActorContext;
  loungeId?: string;
  customerName?: string;
  table: string;
  confidence: 'high' | 'medium' | 'low';
  startSessionFromUsual: () => Promise<{
    ok: boolean;
    message: string;
    flavors?: string[];
  }>;
  suggestUpsell: () => Promise<string | null>;
}

export async function executeStartUsualChain(
  args: ExecuteStartUsualChainArgs
): Promise<OperatorToolResult> {
  const { actor, loungeId, customerName, table, confidence, startSessionFromUsual, suggestUpsell } =
    args;

  const trustDecision = evaluateOperatorChainTrustDecision({
    trustTier: actor.trustTier,
    steps: [
      { tool: 'resolve_session_context', riskLevel: 'low', confidence },
      { tool: 'get_customer_memory', riskLevel: 'low', confidence },
      { tool: 'start_session', riskLevel: 'medium', confidence },
      { tool: 'suggest_upsell', riskLevel: 'low', confidence },
    ],
  });

  if (!trustDecision.autoRun) {
    return operatorFail(
      'start_session',
      'validation_error',
      'Unable to auto-run usual-session chain under current policy.',
      {
        chainIntent: 'start_usual_session',
        riskLevel: trustDecision.highestRisk,
        trustTier: actor.trustTier,
        confidence: trustDecision.lowestConfidence,
        trustReason: trustDecision.reason,
      }
    );
  }

  const startResult = await startSessionFromUsual();
  if (!startResult.ok) {
    return operatorFail('start_session', 'error', startResult.message);
  }

  const upsell = await suggestUpsell();

  const message = [startResult.message, upsell].filter(Boolean).join('\n\n');

  return operatorSuccess(
    'start_session',
    message,
    {
      chainIntent: 'start_usual_session',
      table,
      customerName,
      loungeId,
      flavors: startResult.flavors ?? [],
    },
    {
      chained: true,
      autoConfirmed: true,
      riskLevel: trustDecision.highestRisk,
      trustTier: actor.trustTier,
      confidence: trustDecision.lowestConfidence,
      trustReason: trustDecision.reason,
    }
  );
}
