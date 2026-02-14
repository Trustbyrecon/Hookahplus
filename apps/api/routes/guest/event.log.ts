// apps/api/routes/guest/event.log.ts
import { append } from "../../modules/trust/ghostlog";
type Req = { type: string; payload: any };

export async function POST(req: Request) {
  const body = (await req.json()) as Req;
  if (!body?.type) return new Response(JSON.stringify({ error: "type required" }), { status: 400 });
  const { ghostHash } = append(body.type, body.payload ?? {});
  return Response.json({ ok: true, ghostHash });
}
