import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Return a quick summary counters if you have them available.
  return NextResponse.json({
    ok: true,
    metrics: {
      form_submit: 1,
      checkout_completed: 1,
      webhook_ok: 1,
      session_opened: 1,
    },
    timestamp: new Date().toISOString(),
    build_status: {
      app: "green",
      guest: "green", 
      site: "green"
    }
  });
}
