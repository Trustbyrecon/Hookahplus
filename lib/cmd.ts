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
  claimPrep: (sessionId: string, actor: "boh"|"system" = "boh") => 
    sendCmd(sessionId, "CLAIM_PREP", {}, actor),
  
  heatUp: (sessionId: string, actor: "boh"|"system" = "boh") => 
    sendCmd(sessionId, "HEAT_UP", {}, actor),
  
  readyForDelivery: (sessionId: string, note?: string, actor: "boh"|"system" = "boh") => 
    sendCmd(sessionId, "READY_FOR_DELIVERY", { note }, actor),
  
  // FOH commands
  deliverNow: (sessionId: string, actor: "foh"|"system" = "foh") => 
    sendCmd(sessionId, "DELIVER_NOW", {}, actor),
  
  markDelivered: (sessionId: string, actor: "foh"|"system" = "foh") => 
    sendCmd(sessionId, "MARK_DELIVERED", {}, actor),
  
  startActive: (sessionId: string, actor: "foh"|"system" = "foh") => 
    sendCmd(sessionId, "START_ACTIVE", {}, actor),
  
  // Common commands
  remake: (sessionId: string, reason?: string, actor: "foh"|"boh"|"system" = "foh") => 
    sendCmd(sessionId, "REMAKE", { reason }, actor),
  
  moveTable: (sessionId: string, newTable: string, actor: "foh"|"system" = "foh") => 
    sendCmd(sessionId, "MOVE_TABLE", { table: newTable }, actor),
  
  staffHold: (sessionId: string, reason?: string, actor: "foh"|"boh"|"system" = "foh") => 
    sendCmd(sessionId, "STAFF_HOLD", { reason }, actor),
  
  unhold: (sessionId: string, actor: "foh"|"boh"|"system" = "foh") => 
    sendCmd(sessionId, "UNHOLD", {}, actor),
  
  closeSession: (sessionId: string, actor: "foh"|"system" = "foh") => 
    sendCmd(sessionId, "CLOSE_SESSION", {}, actor),
  
  // Payment commands
  confirmPayment: (sessionId: string, intentId?: string, actor: "system"|"agent" = "system") => 
    sendCmd(sessionId, "PAYMENT_CONFIRMED", { intentId }, actor),
  
  failPayment: (sessionId: string, reason?: string, actor: "system"|"agent" = "system") => 
    sendCmd(sessionId, "PAYMENT_FAILED", { reason }, actor),
  
  void: (sessionId: string, reason?: string, actor: "foh"|"system" = "foh") => 
    sendCmd(sessionId, "VOID", { reason }, actor),
  
  // Refund commands
  requestRefund: (sessionId: string, reason?: string, actor: "foh"|"system" = "foh") => 
    sendCmd(sessionId, "REFUND_REQUEST", { reason }, actor),
  
  completeRefund: (sessionId: string, actor: "foh"|"system" = "foh") => 
    sendCmd(sessionId, "REFUND_COMPLETE", {}, actor),
};
