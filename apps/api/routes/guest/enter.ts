// apps/api/routes/guest/enter.ts
import { identityService } from "../../modules/identity/identity.service";
import { append } from "../../modules/trust/ghostlog";

type Req = { loungeId: string; ref?: string; u?: string };
export async function POST(req: Request) {
  const body = (await req.json()) as Req;
  if (!body.loungeId) return new Response(JSON.stringify({ error: "loungeId required" }), { status: 400 });

  const guestId = await identityService.resolveOrCreateGuest(body.u);
  await identityService.touchVenue(guestId, body.loungeId);

  const payload = { type: "guest.entered", guestId, loungeId: body.loungeId, ref: body.ref };
  const { ghostHash } = append("guest.entered", payload);

  // sessionId can be created in session.start later; return shell for now
  return Response.json({ guestId, sessionId: null, flags: {}, ghostHash });
}
