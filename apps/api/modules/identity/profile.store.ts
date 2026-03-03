// apps/api/modules/identity/profile.store.ts
type Profile = {
  guestId: string;
  anon: boolean;
  lastSeenVenueId?: string;
  badges: string[];
  sessions: string[]; // sessionIds
  createdAt: string;
  updatedAt: string;
  piiId?: string; // never exposed to operators
};

// Replace with real DB adapter. This is in-memory stub with TODOs.
const MEM = new Map<string, Profile>();
const TOKEN_TO_GUEST = new Map<string, string>(); // if you bind ephem tokens

export class Profiles {
  async findByToken(token: string): Promise<string | null> {
    return TOKEN_TO_GUEST.get(token) ?? null;
  }

  async create(p: Profile) {
    MEM.set(p.guestId, p);
  }

  async get(guestId: string): Promise<Profile | null> {
    return MEM.get(guestId) ?? null;
  }

  async update(guestId: string, patch: Partial<Profile>) {
    const cur = MEM.get(guestId);
    if (!cur) return;
    MEM.set(guestId, { ...cur, ...patch });
  }

  async linkPII(guestId: string, piiId: string) {
    const cur = MEM.get(guestId);
    if (!cur) return;
    MEM.set(guestId, { ...cur, piiId });
  }
}
