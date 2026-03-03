// apps/api/modules/identity/pii.store.ts
import crypto from "crypto";

type PII = { piiId: string; phone?: string; email?: string; createdAt: string };
const PII_MEM = new Map<string, PII>();

export class PIIStore {
  async storePII(input: { phone?: string; email?: string }) {
    const piiId = "P_" + crypto.randomBytes(8).toString("hex");
    PII_MEM.set(piiId, { piiId, ...input, createdAt: new Date().toISOString() });
    return piiId;
  }
}
