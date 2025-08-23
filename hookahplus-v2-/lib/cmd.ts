// lib/cmd.ts
export async function sendCmd(
  sessionId: string, 
  cmd: string, 
  data: any = {}, 
  actor: "foh"|"boh"|"system"|"agent" = "agent"
) {
  return fetch(`/api/sessions/${sessionId}/command`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": `${sessionId}:${cmd}:${Date.now()}`
    },
    body: JSON.stringify({ cmd, data, actor })
  }).then(r => r.json());
}

// Convenience functions for common commands
export const sessionCommands = {
  // BOH commands
  claimPrep: (sessionId: string, data?: any) => sendCmd(sessionId, "CLAIM_PREP", data, "boh"),
  heatUp: (sessionId: string, data?: any) => sendCmd(sessionId, "HEAT_UP", data, "boh"),
  readyForDelivery: (sessionId: string, data?: any) => sendCmd(sessionId, "READY_FOR_DELIVERY", data, "boh"),
  
  // FOH commands
  deliverNow: (sessionId: string, data?: any) => sendCmd(sessionId, "DELIVER_NOW", data, "foh"),
  markDelivered: (sessionId: string, data?: any) => sendCmd(sessionId, "MARK_DELIVERED", data, "foh"),
  startActive: (sessionId: string, data?: any) => sendCmd(sessionId, "START_ACTIVE", data, "foh"),
  
  // Common commands
  remake: (sessionId: string, reason: string, actor: "foh"|"boh" = "foh") => 
    sendCmd(sessionId, "REMAKE", { reason }, actor),
  staffHold: (sessionId: string, reason: string, actor: "foh"|"boh" = "foh") => 
    sendCmd(sessionId, "STAFF_HOLD", { reason }, actor),
  closeSession: (sessionId: string, data?: any) => sendCmd(sessionId, "CLOSE_SESSION", data, "foh"),
};
