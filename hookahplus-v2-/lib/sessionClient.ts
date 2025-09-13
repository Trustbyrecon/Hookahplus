/**
 * Client utility for the durable session API
 * Provides type-safe methods for session management
 */

import crypto from "crypto";

export type SessionSource = "QR" | "RESERVE" | "WALK_IN";
export type SessionState = "PENDING" | "ACTIVE" | "PAUSED" | "CLOSED" | "CANCELED";

export interface SessionData {
  loungeId: string;
  source: SessionSource;
  externalRef: string;
  customerPhone?: string;
  flavorMix?: any;
}

export interface SessionUpdate {
  expectedVersion: number;
  state?: SessionState;
  flavorMix?: any;
  note?: string;
}

export interface Session {
  id: string;
  externalRef: string | null;
  source: SessionSource;
  trustSignature: string;
  state: SessionState;
  customerPhone: string | null;
  flavorMix: any;
  loungeId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  events: SessionEvent[];
}

export interface SessionEvent {
  id: string;
  type: string;
  payloadSeal: string;
  data: any;
  createdAt: string;
}

class SessionClient {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        "x-idempotency-key": crypto.randomUUID(),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return response.json();
  }

  /**
   * Create a new session (idempotent)
   */
  async createSession(data: SessionData): Promise<{ session: Session }> {
    return this.makeRequest("/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Get a session by ID
   */
  async getSession(id: string): Promise<{ session: Session }> {
    return this.makeRequest(`/sessions/${id}`);
  }

  /**
   * Update a session with optimistic concurrency control
   */
  async updateSession(id: string, update: SessionUpdate): Promise<{ session: Session }> {
    return this.makeRequest(`/sessions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(update),
    });
  }

  /**
   * List sessions with optional filters
   */
  async listSessions(filters: {
    state?: SessionState;
    loungeId?: string;
    customerPhone?: string;
  } = {}): Promise<{ sessions: Session[]; count: number }> {
    const params = new URLSearchParams();
    if (filters.state) params.set("state", filters.state);
    if (filters.loungeId) params.set("loungeId", filters.loungeId);
    if (filters.customerPhone) params.set("customerPhone", filters.customerPhone);

    const queryString = params.toString();
    return this.makeRequest(`/sessions${queryString ? `?${queryString}` : ""}`);
  }

  /**
   * Create a QR session
   */
  async createQRSession(
    loungeId: string,
    qrToken: string,
    customerPhone?: string,
    flavorMix?: any
  ): Promise<{ session: Session }> {
    return this.createSession({
      loungeId,
      source: "QR",
      externalRef: `qr:${qrToken}`,
      customerPhone,
      flavorMix,
    });
  }

  /**
   * Create a reservation session
   */
  async createReservationSession(
    loungeId: string,
    reservationId: string,
    customerPhone?: string,
    flavorMix?: any
  ): Promise<{ session: Session }> {
    return this.createSession({
      loungeId,
      source: "RESERVE",
      externalRef: `res:${reservationId}`,
      customerPhone,
      flavorMix,
    });
  }

  /**
   * Create a walk-in session
   */
  async createWalkInSession(
    loungeId: string,
    customerPhone?: string,
    flavorMix?: any
  ): Promise<{ session: Session }> {
    return this.createSession({
      loungeId,
      source: "WALK_IN",
      externalRef: `walkin:${crypto.randomUUID()}`,
      customerPhone,
      flavorMix,
    });
  }

  /**
   * Start a session (PENDING → ACTIVE)
   */
  async startSession(sessionId: string, currentVersion: number): Promise<{ session: Session }> {
    return this.updateSession(sessionId, {
      expectedVersion: currentVersion,
      state: "ACTIVE",
      note: "Session started",
    });
  }

  /**
   * Pause a session (ACTIVE → PAUSED)
   */
  async pauseSession(sessionId: string, currentVersion: number, reason?: string): Promise<{ session: Session }> {
    return this.updateSession(sessionId, {
      expectedVersion: currentVersion,
      state: "PAUSED",
      note: reason || "Session paused",
    });
  }

  /**
   * Close a session (any state → CLOSED)
   */
  async closeSession(sessionId: string, currentVersion: number, reason?: string): Promise<{ session: Session }> {
    return this.updateSession(sessionId, {
      expectedVersion: currentVersion,
      state: "CLOSED",
      note: reason || "Session closed",
    });
  }

  /**
   * Update flavor mix
   */
  async updateFlavorMix(
    sessionId: string,
    currentVersion: number,
    flavorMix: any,
    note?: string
  ): Promise<{ session: Session }> {
    return this.updateSession(sessionId, {
      expectedVersion: currentVersion,
      flavorMix,
      note: note || "Flavor mix updated",
    });
  }
}

// Export singleton instance
export const sessionClient = new SessionClient();

// Export class for custom instances
export { SessionClient };
