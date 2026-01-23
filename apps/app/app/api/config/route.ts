import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

/**
 * GET /api/config
 *
 * Minimal, fail-open config endpoint for client feature gating.
 *
 * Query:
 * - loungeId?: string
 *
 * Flags (tenant/lounged-scoped via OrgSetting):
 * - feature.operator_session_notes[:<loungeId>] = "true" | "false"
 *
 * Defaults:
 * - If config fetch fails or setting not found -> false (safe default, doesn't break golden path)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const loungeId = searchParams.get('loungeId')?.trim() || undefined;

    const keysToTry = loungeId
      ? [
          `feature.operator_session_notes:${loungeId}`,
          `feature.operator_session_notes`,
        ]
      : [`feature.operator_session_notes`];

    let value: string | null = null;
    for (const key of keysToTry) {
      const setting = await prisma.orgSetting.findUnique({
        where: { key },
        select: { value: true, isActive: true },
      });
      if (setting && setting.isActive !== false) {
        value = setting.value;
        break;
      }
    }

    const enableCloseNoteModal = String(value).toLowerCase() === 'true';

    return NextResponse.json({
      success: true,
      loungeId: loungeId || null,
      featureFlags: {
        enableCloseNoteModal,
      },
    });
  } catch (error) {
    // Fail-open: if config cannot be fetched, default off (non-blocking)
    return NextResponse.json({
      success: true,
      loungeId: null,
      featureFlags: {
        enableCloseNoteModal: false,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

