<<<<<<< HEAD
export async function sendCmd(
  id: string, 
  cmd: string, 
  data: any = {}, 
  actor: "foh" | "boh" | "system" | "agent" = "agent"
) {
  return fetch(`/api/sessions/${id}/command`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": `${id}:${cmd}:${Date.now()}`
=======
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
>>>>>>> 076f5b4944bb4d1a7c37cd5caa69740b3cb806df
    },
    body: JSON.stringify({ cmd, data, actor })
  }).then(r => r.json());
}

<<<<<<< HEAD
export async function getSession(sessionId: string) {
  const response = await fetch(`/api/sessions/${sessionId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to fetch session: ${response.status}`);
  }
  
  return response.json();
}

export async function getAllSessions(params?: { state?: string; table?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.state) searchParams.append('state', params.state);
  if (params?.table) searchParams.append('table', params.table);
  
  const url = `/api/sessions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to fetch sessions: ${response.status}`);
  }
  
  return response.json();
}

export async function createSession(data: { 
  table: string; 
  items?: Array<{ sku: string; qty: number; notes?: string }>;
  createdBy?: string;
  loungeId?: string;
}) {
  const response = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to create session: ${response.status}`);
  }
  
  return response.json();
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
=======
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
>>>>>>> 076f5b4944bb4d1a7c37cd5caa69740b3cb806df
};
