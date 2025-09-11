// Chooses the DB-backed store when BADGES_V1_USE_DB=true,
// otherwise falls back to in-memory demo store.
const useDb = process.env.BADGES_V1_USE_DB === "true";
let mod: any;
// Top-level await is supported in Next.js server files
if (useDb) {
  mod = await import("./badgeStores.db");
} else {
  mod = await import("./badgeStores");
}
export const addEvent = mod.addEvent;
export const listEvents = mod.listEvents;
export const listEventsAtVenue = mod.listEventsAtVenue;
export const listAwards = mod.listAwards;
export const alreadyAwarded = mod.alreadyAwarded;
export const putAward = mod.putAward;
