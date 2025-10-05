// Chooses the DB-backed store when BADGES_V1_USE_DB=true,
// otherwise falls back to in-memory demo store.
const useDb = process.env.BADGES_V1_USE_DB === "true";

// Use dynamic imports with async functions
export const addEvent = async (event: any) => {
  const mod = useDb ? await import("./badgeStores.db") : await import("./badgeStores");
  return mod.addEvent(event);
};

export const listEvents = async (profileId: string) => {
  const mod = useDb ? await import("./badgeStores.db") : await import("./badgeStores");
  return mod.listEvents(profileId);
};

export const listEventsAtVenue = async (profileId: string, venueId: string) => {
  const mod = useDb ? await import("./badgeStores.db") : await import("./badgeStores");
  return mod.listEventsAtVenue(profileId, venueId);
};

export const listAwards = async (profileId: string, venueId?: string) => {
  const mod = useDb ? await import("./badgeStores.db") : await import("./badgeStores");
  // Both stores only take profileId parameter
  return mod.listAwards(profileId);
};

export const alreadyAwarded = async (profileId: string, badgeId: string, venueId?: string) => {
  const mod = useDb ? await import("./badgeStores.db") : await import("./badgeStores");
  return mod.alreadyAwarded(profileId, badgeId, venueId);
};

export const putAward = async (args: any) => {
  const mod = useDb ? await import("./badgeStores.db") : await import("./badgeStores");
  return mod.putAward(args);
};
