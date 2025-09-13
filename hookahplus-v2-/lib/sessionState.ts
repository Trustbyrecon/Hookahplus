<<<<<<< HEAD
=======
// lib/sessionState.ts
>>>>>>> 076f5b4944bb4d1a7c37cd5caa69740b3cb806df
export type SessionState =
  | "NEW"
  | "PAID_PENDING_AUTH"
  | "PAID_CONFIRMED"
  | "QUEUED_PREP"
  | "PREP_IN_PROGRESS"
  | "HEAT_UP"
  | "READY_FOR_DELIVERY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "ACTIVE"
  | "CLOSE_PENDING"
  | "CLOSED"
  | "FAILED_PAYMENT"
  | "STOCK_BLOCKED"
  | "REMAKE_REQUESTED"
  | "RELOCATE_TABLE"
  | "STAFF_HOLD"
  | "REFUND_REQUESTED"
  | "REFUNDED"
  | "VOIDED";

export type ActorRole = "foh" | "boh" | "system" | "agent";

export type Session = {
  id: string;
  state: SessionState;
  table: string;
  items: Array<{ sku: string; qty: number; notes?: string }>;
  payment: { status: "started" | "confirmed" | "failed"; intentId?: string };
  timers: { heatUpStart?: number; deliveredAt?: number; expiresAt?: number };
  flags: { vip?: boolean; ageVerified?: boolean; allergy?: string | null };
<<<<<<< HEAD
  meta: { createdBy: string; loungeId: string; trustLock?: string };
=======
  meta: { createdBy: string; loungeId: string; trustLock?: string; customerId?: string };
>>>>>>> 076f5b4944bb4d1a7c37cd5caa69740b3cb806df
  audit: Array<SessionEvent>;
};

export type Command =
  | "CLAIM_PREP"
  | "HEAT_UP"
  | "READY_FOR_DELIVERY"
  | "DELIVER_NOW"
  | "MARK_DELIVERED"
  | "START_ACTIVE"
  | "ADD_COAL_SWAP"
  | "MOVE_TABLE"
  | "CLOSE_SESSION"
  | "REMAKE"
  | "STOCK_BLOCKED"
  | "STAFF_HOLD"
  | "UNHOLD"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_FAILED"
  | "VOID"
  | "REFUND_REQUEST"
  | "REFUND_COMPLETE";

export type SessionEvent = {
  id: string;
  type: "session.state.changed" | "session.command" | "session.note";
  ts: number;
  actor: { role: ActorRole; userId?: string };
  sessionId: string;
  from?: SessionState;
  to?: SessionState;
  cmd?: Command;
  reason?: string;
  meta?: Record<string, any>;
  idempotencyKey?: string;
};

// ---------------- In-memory store (swap with DB later) ----------------
const store = new Map<string, Session>();

export function getSession(id: string) {
  return store.get(id) || null;
}

export function putSession(s: Session) {
  store.set(s.id, s);
  return s;
}

<<<<<<< HEAD
export function getAllSessions(): Session[] {
  return Array.from(store.values());
}

export function getSessionsByState(state: SessionState): Session[] {
  return getAllSessions().filter(s => s.state === state);
=======
export function getAllSessions() {
  return Array.from(store.values());
}

export function getSessionsByState(state: SessionState) {
  return Array.from(store.values()).filter(s => s.state === state);
}

export function getSessionsByTable(table: string) {
  return Array.from(store.values()).filter(s => s.table === table);
>>>>>>> 076f5b4944bb4d1a7c37cd5caa69740b3cb806df
}

// seed helper (for local testing)
export function seedSession(id = "sess_demo", table = "T-12") {
  if (!store.has(id)) {
    putSession({
      id,
      state: "NEW",
      table,
      items: [{ sku: "hookah.session", qty: 1 }],
      payment: { status: "confirmed" },
      timers: {},
      flags: {},
      meta: { createdBy: "system", loungeId: "lounge_demo", trustLock: "TLH-v1::seed" },
      audit: [],
    });
  }
  return getSession(id)!;
}

<<<<<<< HEAD
=======
// Generate multiple demo sessions for testing
export function seedMultipleSessions() {
  const tables = ["T-1", "T-2", "T-3", "T-4", "T-5", "T-6", "T-7", "T-8", "T-9", "T-10"];
  const states: SessionState[] = ["NEW", "PAID_CONFIRMED", "PREP_IN_PROGRESS", "HEAT_UP", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED", "ACTIVE", "CLOSE_PENDING", "CLOSED"];
  
  tables.forEach((table, index) => {
    const sessionId = `demo_${table}_${Date.now()}`;
    const state = states[index % states.length];
    
    putSession({
      id: sessionId,
      state,
      table,
      items: [{ sku: "hookah.session", qty: 1 }],
      payment: { status: "confirmed" },
      timers: {
        heatUpStart: state === "HEAT_UP" ? Date.now() - Math.random() * 300000 : undefined,
        deliveredAt: state === "DELIVERED" || state === "ACTIVE" ? Date.now() - Math.random() * 600000 : undefined,
      },
      flags: { vip: Math.random() > 0.7, ageVerified: true },
      meta: { 
        createdBy: "system", 
        loungeId: "lounge_demo", 
        trustLock: "TLH-v1::seed",
        customerId: `customer_${Math.floor(Math.random() * 1000)}`
      },
      audit: [{
        id: `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        type: "session.state.changed",
        ts: Date.now() - Math.random() * 3600000, // Random time in last hour
        actor: { role: "system" },
        sessionId,
        from: "NEW",
        to: state,
        cmd: "PAYMENT_CONFIRMED",
      }],
    });
  });
}

// Get live sessions (all non-closed sessions)
export function getLiveSessions() {
  return Array.from(store.values()).filter(s => 
    !["CLOSED", "REFUNDED", "VOIDED"].includes(s.state)
  );
}

// Get sessions by status for reporting
export function getSessionsByStatus() {
  const sessions = getAllSessions();
  const statusCounts: Record<SessionState, number> = {} as any;
  
  // Initialize all states to 0
  const allStates: SessionState[] = [
    "NEW", "PAID_PENDING_AUTH", "PAID_CONFIRMED", "QUEUED_PREP", "PREP_IN_PROGRESS",
    "HEAT_UP", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED", "ACTIVE",
    "CLOSE_PENDING", "CLOSED", "FAILED_PAYMENT", "STOCK_BLOCKED", "REMAKE_REQUESTED",
    "RELOCATE_TABLE", "STAFF_HOLD", "REFUND_REQUESTED", "REFUNDED", "VOIDED"
  ];
  
  allStates.forEach(state => statusCounts[state] = 0);
  
  sessions.forEach(session => {
    statusCounts[session.state]++;
  });
  
  return statusCounts;
}

>>>>>>> 076f5b4944bb4d1a7c37cd5caa69740b3cb806df
// ---------------- Transition map ----------------
const allowed: Record<SessionState, Partial<Record<Command, SessionState>>> = {
  NEW: {
    PAYMENT_CONFIRMED: "PAID_CONFIRMED",
    PAYMENT_FAILED: "FAILED_PAYMENT",
    VOID: "VOIDED",
  },
  PAID_PENDING_AUTH: {
    PAYMENT_CONFIRMED: "PAID_CONFIRMED",
    PAYMENT_FAILED: "FAILED_PAYMENT",
  },
  PAID_CONFIRMED: {
    // system will auto-queue; or allow manual
    CLAIM_PREP: "PREP_IN_PROGRESS",
    // optional: QUEUED_PREP step if you want explicit queue state
  },
  QUEUED_PREP: {
    CLAIM_PREP: "PREP_IN_PROGRESS",
    STAFF_HOLD: "STAFF_HOLD",
  },
  PREP_IN_PROGRESS: {
    HEAT_UP: "HEAT_UP",
    STOCK_BLOCKED: "STOCK_BLOCKED",
    REMAKE: "PREP_IN_PROGRESS", // self-loop with reason updates
    STAFF_HOLD: "STAFF_HOLD",
  },
  HEAT_UP: {
    READY_FOR_DELIVERY: "READY_FOR_DELIVERY",
    REMAKE: "PREP_IN_PROGRESS",
    STAFF_HOLD: "STAFF_HOLD",
  },
  READY_FOR_DELIVERY: {
    DELIVER_NOW: "OUT_FOR_DELIVERY",
    MOVE_TABLE: "READY_FOR_DELIVERY", // update meta only
    STAFF_HOLD: "STAFF_HOLD",
  },
  OUT_FOR_DELIVERY: {
    MARK_DELIVERED: "DELIVERED",
    MOVE_TABLE: "OUT_FOR_DELIVERY",
    STAFF_HOLD: "STAFF_HOLD",
  },
  DELIVERED: {
    START_ACTIVE: "ACTIVE",
    REMAKE: "PREP_IN_PROGRESS",
    REFUND_REQUEST: "REFUND_REQUESTED",
  },
  ACTIVE: {
    CLOSE_SESSION: "CLOSE_PENDING",
    REMAKE: "PREP_IN_PROGRESS",
    ADD_COAL_SWAP: "ACTIVE", // side-effect only
  },
  CLOSE_PENDING: {
    CLOSE_SESSION: "CLOSED", // idempotent close
    REFUND_REQUEST: "REFUND_REQUESTED",
  },
  CLOSED: {},
  FAILED_PAYMENT: { VOID: "VOIDED" },
  STOCK_BLOCKED: {
    CLAIM_PREP: "PREP_IN_PROGRESS",
    STAFF_HOLD: "STAFF_HOLD",
  },
  REMAKE_REQUESTED: { CLAIM_PREP: "PREP_IN_PROGRESS" }, // not used if you loop directly
  RELOCATE_TABLE: {}, // transient (we simply update meta and return)
  STAFF_HOLD: { UNHOLD: "PREP_IN_PROGRESS" }, // or last-known-safe state
  REFUND_REQUESTED: { REFUND_COMPLETE: "REFUNDED" },
  REFUNDED: {},
  VOIDED: {},
};

// ---------------- TrustLock checks (stub) ----------------
function verifyTrustLock(session: Session, cmd: Command, data?: any): { ok: boolean; reason?: string } {
  // Example rule: if table or items change *after* PAID_CONFIRMED, require dual-ack (not implemented here).
  if (session.state !== "NEW" && session.payment.status === "confirmed") {
    if (cmd === "MOVE_TABLE" && data?.table && data.table !== session.table) {
      // mark for dual-ack in meta in a real system
      return { ok: true };
    }
  }
  return { ok: true };
}

// ---------------- Reducer ----------------
export function reduce(session: Session, cmd: Command, actor: ActorRole, data: any = {}) {
  // trustlock gate
  const trust = verifyTrustLock(session, cmd, data);
  if (!trust.ok) {
    const e = new Error(trust.reason || "TrustLock violation");
    (e as any).code = 423;
    throw e;
  }

  const from = session.state;
  const to = (allowed[from] || {})[cmd];

  if (!to) {
    const e = new Error(`Invalid transition from ${from} via ${cmd}`);
    (e as any).code = 409;
    throw e;
  }

  // side effects
  if (cmd === "HEAT_UP") session.timers.heatUpStart = Date.now();
  if (cmd === "MARK_DELIVERED") session.timers.deliveredAt = Date.now();
  if (cmd === "MOVE_TABLE" && data?.table) session.table = data.table;
  if (cmd === "ADD_COAL_SWAP") {
    // you'd enqueue a coal task here
  }
<<<<<<< HEAD
=======
  if (cmd === "PAYMENT_CONFIRMED") {
    // Update payment status and session data
    session.payment.status = "confirmed";
    if (data.table) session.table = data.table;
    if (data.customerId) session.meta.customerId = data.customerId;
    if (data.flavor) {
      session.items = [{ sku: `hookah.${data.flavor.toLowerCase().replace(' ', '.')}`, qty: 1, notes: data.flavor }];
    }
    if (data.amount) {
      session.payment.intentId = `intent_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
  }
>>>>>>> 076f5b4944bb4d1a7c37cd5caa69740b3cb806df

  session.state = to;

  // append audit
  session.audit.push({
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type: "session.state.changed",
    ts: Date.now(),
    actor: { role: actor },
    sessionId: session.id,
    from,
    to,
    cmd,
    meta: data || {},
  });

  return session;
}
<<<<<<< HEAD

// ---------------- Utility functions ----------------
export function getAvailableCommands(state: SessionState): Command[] {
  return Object.keys(allowed[state] || {}) as Command[];
}

export function getStateDisplayName(state: SessionState): string {
  const names: Record<SessionState, string> = {
    NEW: "New Session",
    PAID_PENDING_AUTH: "Payment Pending",
    PAID_CONFIRMED: "Payment Confirmed",
    QUEUED_PREP: "Queued for Prep",
    PREP_IN_PROGRESS: "Prep in Progress",
    HEAT_UP: "Heating Up",
    READY_FOR_DELIVERY: "Ready for Delivery",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    ACTIVE: "Active Session",
    CLOSE_PENDING: "Closing Session",
    CLOSED: "Session Closed",
    FAILED_PAYMENT: "Payment Failed",
    STOCK_BLOCKED: "Stock Blocked",
    REMAKE_REQUESTED: "Remake Requested",
    RELOCATE_TABLE: "Table Relocated",
    STAFF_HOLD: "Staff Hold",
    REFUND_REQUESTED: "Refund Requested",
    REFUNDED: "Refunded",
    VOIDED: "Voided",
  };
  return names[state] || state;
}

export function getStateColor(state: SessionState): string {
  const colors: Record<SessionState, string> = {
    NEW: "bg-gray-100 text-gray-800",
    PAID_PENDING_AUTH: "bg-yellow-100 text-yellow-800",
    PAID_CONFIRMED: "bg-blue-100 text-blue-800",
    QUEUED_PREP: "bg-orange-100 text-orange-800",
    PREP_IN_PROGRESS: "bg-purple-100 text-purple-800",
    HEAT_UP: "bg-red-100 text-red-800",
    READY_FOR_DELIVERY: "bg-green-100 text-green-800",
    OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-emerald-100 text-emerald-800",
    ACTIVE: "bg-teal-100 text-teal-800",
    CLOSE_PENDING: "bg-amber-100 text-amber-800",
    CLOSED: "bg-slate-100 text-slate-800",
    FAILED_PAYMENT: "bg-red-100 text-red-800",
    STOCK_BLOCKED: "bg-orange-100 text-orange-800",
    REMAKE_REQUESTED: "bg-pink-100 text-pink-800",
    RELOCATE_TABLE: "bg-cyan-100 text-cyan-800",
    STAFF_HOLD: "bg-yellow-100 text-yellow-800",
    REFUND_REQUESTED: "bg-rose-100 text-rose-800",
    REFUNDED: "bg-gray-100 text-gray-800",
    VOIDED: "bg-slate-100 text-slate-800",
  };
  return colors[state] || "bg-gray-100 text-gray-800";
}
=======
>>>>>>> 076f5b4944bb4d1a7c37cd5caa69740b3cb806df
