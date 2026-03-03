import { NextRequest, NextResponse } from "next/server";
import { hasRole } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";

/**
 * GET /api/admin/pos/ops
 *
 * Operational snapshot for POS: ticket exceptions + reconciliation health.
 * Query:
 * - loungeId?: string
 * - take?: number (default 20, max 100)
 */
export async function GET(req: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV !== "production";
    const isAdmin = isDev ? true : await hasRole(req, ["admin", "owner"]);
    if (!isAdmin) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const loungeId = searchParams.get("loungeId") || null;

    const takeRaw = searchParams.get("take");
    const take = Math.max(1, Math.min(100, takeRaw ? Number(takeRaw) : 20));

    let sessionIdsForLounge: string[] = [];
    if (loungeId) {
      const sessions = await prisma.session.findMany({
        where: { loungeId },
        select: { id: true },
        take: 5000,
      });
      sessionIdsForLounge = sessions.map((s) => s.id);
    }

    // Ticket counts (attached to lounge sessions)
    const whereTicketsForLounge: any = loungeId ? { sessionId: { in: sessionIdsForLounge } } : {};
    const totalTicketsForLounge = await prisma.posTicket.count({ where: whereTicketsForLounge });
    const unassignedTicketsGlobal = await prisma.posTicket.count({ where: { sessionId: null } });

    const statusBucketsForLounge = await prisma.posTicket.groupBy({
      by: ["status"],
      where: whereTicketsForLounge,
      _count: { _all: true },
      orderBy: { status: "asc" },
    });

    // Recent tickets (include unassigned; if loungeId set, include both unassigned + attached-to-lounge)
    const recentTickets = await prisma.posTicket.findMany({
      where:
        loungeId
          ? {
              OR: [{ sessionId: null }, { sessionId: { in: sessionIdsForLounge } }],
            }
          : {},
      orderBy: { updatedAt: "desc" },
      take,
    });

    // Reconciliation (scoped via sessionId)
    let reconciliation = null as
      | null
      | {
          total: number;
          matched: number;
          orphaned: number;
          reconciliationRate: number;
        };

    if (loungeId) {
      const whereRecon = sessionIdsForLounge.length > 0 ? { sessionId: { in: sessionIdsForLounge } } : { sessionId: { in: [] as string[] } };
      const total = await prisma.settlementReconciliation.count({ where: whereRecon });
      const matched = await prisma.settlementReconciliation.count({ where: { ...whereRecon, status: "matched" } as any });
      const orphaned = await prisma.settlementReconciliation.count({ where: { ...whereRecon, status: "orphaned" } as any });
      reconciliation = {
        total,
        matched,
        orphaned,
        reconciliationRate: total > 0 ? matched / total : 0,
      };
    }

    return NextResponse.json({
      success: true,
      loungeId,
      totals: {
        ticketsForLounge: totalTicketsForLounge,
        unassignedTicketsGlobal,
      },
      statusBucketsForLounge: statusBucketsForLounge.map((b) => ({ status: b.status, count: b._count._all })),
      reconciliation,
      recentTickets,
    });
  } catch (error) {
    console.error("[pos][ops] error", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch POS ops snapshot",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

