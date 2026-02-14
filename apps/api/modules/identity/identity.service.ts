// apps/api/modules/identity/identity.service.ts
import { Profiles } from "./profile.store";
import { PIIStore } from "./pii.store";
import { nanoid } from "nanoid";

export class IdentityService {
  constructor(private profiles = new Profiles(), private pii = new PIIStore()) {}

  async resolveOrCreateGuest(guestToken?: string) {
    // guestToken is ephemeral; if not present, mint new guestId
    const guestId = guestToken ? await this.profiles.findByToken(guestToken) : null;
    if (guestId) return guestId;

    const newGuestId = "G_" + nanoid(16);
    await this.profiles.create({
      guestId: newGuestId,
      anon: true,
      badges: [],
      sessions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return newGuestId;
  }

  async touchVenue(guestId: string, loungeId: string) {
    await this.profiles.update(guestId, { lastSeenVenueId: loungeId, updatedAt: new Date().toISOString() });
  }

  // Optional: link PII on consent
  async linkPII(guestId: string, phoneOrEmail: { phone?: string; email?: string }) {
    const piiId = await this.pii.storePII(phoneOrEmail);
    await this.profiles.linkPII(guestId, piiId);
    return { guestId, piiId };
  }
}

export const identityService = new IdentityService();
