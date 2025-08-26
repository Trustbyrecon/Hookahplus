// app/api/fire-sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { allSessions, upsertSession, clearStore } from "@/app/lib/store";
import type { DeliveryZone, FireSession } from "@/app/lib/workflow";

function rnd<T>(arr: T[]) { return arr[Math.floor(Math.random()*arr.length)]; }
function id(n=6){ return Math.random().toString(36).slice(2,2+n); }

export async function GET() {
  return NextResponse.json({ sessions: allSessions() });
}

export async function POST(req: NextRequest) {
  const { count = 8, reset = false } = await req.json().catch(()=>({}));
  if (reset) clearStore();

  const zones: DeliveryZone[] = ["A","B","C","D","E"];
  for (let i=0;i<count;i++){
    const t = `T-${1+Math.floor(Math.random()*12)}`;
    const now = Date.now();
    const s: FireSession = {
      id: id(),
      table: t,
      customerLabel: `customer_${Math.floor(Math.random()*900)+100}`,
      durationMin: Math.floor(Math.random()*60),
      bufferSec: rnd([5,10,15]),
      zone: rnd(zones),
      items: rnd([1,2,3]),
      etaMin: rnd([2,3,5]),
      position: rnd(["Main (2,3)","Bar (3,1)","Patio (1,4)"]),
      state: rnd(["READY","OUT","DELIVERED","ACTIVE"]) as any,
      createdAt: now,
      updatedAt: now
    };
    upsertSession(s);
  }
  return NextResponse.json({ ok: true, total: allSessions().length });
}
