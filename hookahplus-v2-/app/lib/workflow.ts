// app/lib/workflow.ts
export type SessionState = "READY" | "OUT" | "DELIVERED" | "ACTIVE" | "CLOSE";
export type DeliveryZone = "A" | "B" | "C" | "D" | "E";

// Trust system types
export type TrustLevel = "NONE" | "BASIC" | "VERIFIED" | "ADMIN";
export type UserRole = "STAFF" | "RUNNER" | "SUPERVISOR" | "MANAGER" | "OWNER";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  trustLevel: TrustLevel;
  permissions: string[];
}

export interface FireSession {
  id: string;
  table: string;               // e.g., "T-5"
  customerLabel: string;       // "customer_683"
  durationMin: number;
  bufferSec: number;           // 5|10|15...
  zone: DeliveryZone;
  items: number;
  etaMin: number;
  position: string;            // "Main (2,3)"
  state: SessionState;
  createdAt: number;
  updatedAt: number;
}

export type Action =
  | { type: "DELIVER_NOW" }
  | { type: "MARK_OUT" }
  | { type: "MARK_DELIVERED" }
  | { type: "START_ACTIVE" }
  | { type: "CLOSE" }
  | { type: "CANCEL" }
  | { type: "SET_BUFFER"; value: number }
  | { type: "SET_ZONE"; value: DeliveryZone }
  | { type: "UNDO" }
  | { type: "REASSIGN_RUNNER"; value: string }
  | { type: "ADD_ITEM"; value: number }
  | { type: "EXTEND_MIN"; value: number };

// Trust requirements for each action
export const trustRequirements: Record<Action["type"], TrustLevel> = {
  "DELIVER_NOW": "BASIC",
  "MARK_OUT": "BASIC", 
  "MARK_DELIVERED": "VERIFIED",
  "START_ACTIVE": "VERIFIED",
  "CLOSE": "ADMIN",
  "SET_BUFFER": "BASIC",
  "SET_ZONE": "BASIC",
  "ADD_ITEM": "BASIC",
  "EXTEND_MIN": "VERIFIED",
  "UNDO": "VERIFIED",
  "REASSIGN_RUNNER": "VERIFIED",
  "CANCEL": "ADMIN"
};

export const allowed: Record<SessionState, Action["type"][]> = {
  READY: ["DELIVER_NOW","MARK_OUT","SET_BUFFER","SET_ZONE","CANCEL","ADD_ITEM"],
  OUT: ["MARK_DELIVERED","SET_BUFFER","SET_ZONE","REASSIGN_RUNNER","CANCEL","UNDO"],
  DELIVERED: ["START_ACTIVE","UNDO"],
  ACTIVE: ["CLOSE","EXTEND_MIN","ADD_ITEM","UNDO"],
  CLOSE: ["UNDO"]
};

export class FSMError extends Error {
  code: string;
  constructor(code: string, msg: string) { super(msg); this.code = code; }
}

export class TrustError extends Error {
  code: string;
  requiredTrust: TrustLevel;
  userTrust: TrustLevel;
  
  constructor(code: string, msg: string, requiredTrust: TrustLevel, userTrust: TrustLevel) { 
    super(msg); 
    this.code = code; 
    this.requiredTrust = requiredTrust;
    this.userTrust = userTrust;
  }
}

// Trust validation function
export function hasTrustLevel(userTrust: TrustLevel, requiredTrust: TrustLevel): boolean {
  const trustHierarchy: Record<TrustLevel, number> = {
    "NONE": 0,
    "BASIC": 1,
    "VERIFIED": 2,
    "ADMIN": 3
  };
  
  return trustHierarchy[userTrust] >= trustHierarchy[requiredTrust];
}

export function assertAllowed(state: SessionState, action: Action["type"]) {
  if (!allowed[state].includes(action)) {
    throw new FSMError("ACTION_NOT_ALLOWED", `Action ${action} not allowed from ${state}`);
  }
}

// Enhanced workflow with trust validation
export function nextStateWithTrust(session: FireSession, action: Action, user: User): FireSession {
  // Check if action is allowed from current state
  assertAllowed(session.state, action.type);
  
  // Check trust level
  const requiredTrust = trustRequirements[action.type];
  if (!hasTrustLevel(user.trustLevel, requiredTrust)) {
    throw new TrustError(
      "INSUFFICIENT_TRUST", 
      `Action ${action.type} requires ${requiredTrust} trust level, but user has ${user.trustLevel}`,
      requiredTrust,
      user.trustLevel
    );
  }
  
  // Execute the action
  return nextState(session, action);
}

export function nextState(session: FireSession, action: Action): FireSession {
  switch (action.type) {
    case "DELIVER_NOW":
    case "MARK_OUT":
      assertAllowed(session.state, "MARK_OUT");
      return { ...session, state: "OUT", etaMin: Math.max(1, session.etaMin), updatedAt: Date.now() };
    case "MARK_DELIVERED":
      assertAllowed(session.state, "MARK_DELIVERED");
      return { ...session, state: "DELIVERED", updatedAt: Date.now() };
    case "START_ACTIVE":
      assertAllowed(session.state, "START_ACTIVE");
      return { ...session, state: "ACTIVE", updatedAt: Date.now() };
    case "CLOSE":
      assertAllowed(session.state, "CLOSE");
      return { ...session, state: "CLOSE", updatedAt: Date.now() };
    case "CANCEL":
      // cancel → CLOSE regardless of prior (idempotent)
      return { ...session, state: "CLOSE", updatedAt: Date.now() };
    case "SET_BUFFER":
      assertAllowed(session.state, "SET_BUFFER");
      return { ...session, bufferSec: Math.max(0, action.value), updatedAt: Date.now() };
    case "SET_ZONE":
      assertAllowed(session.state, "SET_ZONE");
      return { ...session, zone: action.value, updatedAt: Date.now() };
    case "ADD_ITEM":
      return { ...session, items: Math.max(0, session.items + action.value), updatedAt: Date.now() };
    case "EXTEND_MIN":
      assertAllowed(session.state, "EXTEND_MIN");
      return { ...session, durationMin: session.durationMin + action.value, updatedAt: Date.now() };
    case "REASSIGN_RUNNER":
      // no state change; event only
      return { ...session, updatedAt: Date.now() };
    case "UNDO":
      // business rule: step back one hop in flow
      const back: Record<SessionState, SessionState> = {
        READY: "READY",
        OUT: "READY",
        DELIVERED: "OUT",
        ACTIVE: "DELIVERED",
        CLOSE: "ACTIVE"
      };
      return { ...session, state: back[session.state], updatedAt: Date.now() };
    default:
      return session;
  }
}
