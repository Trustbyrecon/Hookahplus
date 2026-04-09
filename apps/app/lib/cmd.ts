// apps/app/lib/cmd.ts
// Minimal command sender for orchestrator demo flows.
// H+ Operator (GPT tools) maps the same verbs via lib/operatorToolExecutor.ts → POST /api/sessions and /api/sessions/[id]/command.

export type CmdActor = "foh" | "boh" | "system" | "agent";

export async function sendCmd(
  id: string,
  cmd: string,
  data: any = {},
  actor: CmdActor = "agent"
) {
  const res = await fetch(`/api/sessions/${id}/command`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Keep the orchestrator idempotency header contract.
      "Idempotency-Key": `${id}:${cmd}:${Date.now()}`,
    },
    body: JSON.stringify({ cmd, data, actor }),
  });

  // Always return JSON (even for non-2xx); callers can inspect { error }.
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    json = { error: "Non-JSON response", status: res.status };
  }

  return { ...json, _httpStatus: res.status };
}

