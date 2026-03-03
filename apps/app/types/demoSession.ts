export type DemoSessionMode = "simulated" | "stripe_test";
export type DemoSessionSource = "onboarding" | "marketing" | "internal_test";

export interface DemoSessionRequest {
  loungeId: string;
  operatorId?: string;
  mode?: DemoSessionMode; // optional, backend decides fallback
  source?: DemoSessionSource;
  sessionData?: {
    tableId?: string;
    customerName?: string;
    customerPhone?: string;
    flavorMix?: string[];
    amount?: number;
    pricingModel?: 'flat' | 'time-based';
    timerDuration?: number;
  };
}

export interface DemoSessionResponse {
  mode: DemoSessionMode;
  status: "ready" | "error";
  checkoutUrl?: string;          // present if stripe_test
  simulatedSessionId?: string;   // present if simulated
  reason?: string;               // why a mode was chosen or why error
  message?: string;              // User-facing message
}

export interface DemoSessionMeta {
  createdAt: string;
  mode: DemoSessionMode;
  loungeId: string;
  operatorId?: string;
  source: DemoSessionSource;
  sessionId?: string;
}

