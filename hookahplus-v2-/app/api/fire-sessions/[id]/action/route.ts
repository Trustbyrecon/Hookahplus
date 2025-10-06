// app/api/fire-sessions/[id]/action/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession, upsertSession } from "@/app/lib/store";
import type { Action } from "@/app/lib/workflow";
import { nextState, assertAllowed, FSMError } from "@/app/lib/workflow";

// Required for static export - generate all possible session IDs
export async function generateStaticParams() {
  // For static export, we need to pre-generate all possible session IDs
  // Return sample IDs that will be generated at build time
  return [
    { id: 'sample-1' },
    { id: 'sample-2' },
    { id: 'sample-3' },
    { id: 'sample-4' },
    { id: 'sample-5' },
  ];
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const body = await req.json().catch(()=> ({}));
  const action = body as Action;
  const current = getSession(id);

  // Edge cases
  if (!current) return NextResponse.json({ error: "NOT_FOUND", message: "Session does not exist" }, { status: 404 });
  try {
    // explicit check improves error clarity
    assertAllowed(current.state, action.type as any);
    const updated = nextState(current, action);
    // business rules
    if (updated.items < 0) throw new FSMError("BAD_ITEMS","Items cannot be negative");
    if (updated.bufferSec < 0) throw new FSMError("BAD_BUFFER","Buffer below zero");
    upsertSession(updated);
    return NextResponse.json({ ok: true, session: updated });
  } catch (e:any) {
    const code = e.code || "ACTION_ERROR";
    return NextResponse.json({ error: code, message: e.message }, { status: code==="ACTION_NOT_ALLOWED" ? 409 : 422 });
  }
}
