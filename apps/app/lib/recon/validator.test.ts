import { describe, expect, it } from "vitest";
import { validateActionIntent } from "./validator";

describe("recon validator", () => {
  it("accepts recon.session.multi_active drift intent", () => {
    const result = validateActionIntent({
      action_type: "recon.session.multi_active",
      lounge_id: "Aliethia",
      location_id: "T-007",
      window: {
        from: new Date(Date.now() - 60_000).toISOString(),
        to: new Date().toISOString(),
      },
      evidence: {
        sample_ids: ["sess_1", "sess_2"],
        reason: "multiple_active_sessions_detected",
      },
      risk_hints: ["operational_mapping_integrity"],
      severity: "critical",
      timestamp: new Date().toISOString(),
      idempotency_key: "recon.session.multi_active:Aliethia:T-007:sess_1,sess_2",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.action_type).toBe("recon.session.multi_active");
    }
  });

  it("rejects drift intents without window", () => {
    const result = validateActionIntent({
      action_type: "recon.session.multi_active",
      lounge_id: "Aliethia",
      timestamp: new Date().toISOString(),
      idempotency_key: "bad-intent",
    });

    expect(result.success).toBe(false);
  });
});

