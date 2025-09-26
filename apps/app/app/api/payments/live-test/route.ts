import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "../../../../lib/stripeServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Tiny in-memory rate limit (best-effort per lambda instance)
const hits = new Map<string, { count: number; ts: number }>();
const WINDOW_MS = 30_000; // 30s
const MAX_HITS = 3;

function rateLimit(ip: string) {
  const now = Date.now();
  const curr = hits.get(ip);
  if (!curr || now - curr.ts > WINDOW_MS) {
    hits.set(ip, { count: 1, ts: now });
    return true;
  }
  if (curr.count >= MAX_HITS) return false;
  curr.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  const ipHeader = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
  const ip = ipHeader?.split(",")[0]?.trim() || "unknown";

  if (!rateLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  const adminToken = process.env.ADMIN_TEST_TOKEN;
  const provided = req.headers.get("x-admin-token");
  if (!adminToken || !provided || provided !== adminToken) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({
      amount: 100, // $1.00
      currency: "usd",
      description: "HookahPlus — $1 sandbox live-test",
      metadata: {
        source: "live-test",
        env: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
      },
      automatic_payment_methods: { enabled: true },
      confirm: true,
      payment_method: "pm_card_visa", // TEST-ONLY
    });

    return NextResponse.json({
      ok: true,
      id: intent.id,
      status: intent.status,
      charges:
        intent.charges?.data?.map((c) => ({
          id: c.id,
          status: c.status,
          created: c.created,
        })) ?? [],
    });
  } catch (err: any) {
    console.error("[live-test] error", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Stripe error" },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, route: "payments/live-test" });
}


