import type { EventRecord, Award, EventType } from "./badgeTypes";

// In-memory stores for demo/fallback mode
const events: EventRecord[] = [];
const awards: Award[] = [];

export async function addEvent(e: EventRecord) {
  events.push(e);
}

export async function listEvents(profileId: string) {
  return events.filter(e => e.profileId === profileId);
}

export async function listEventsAtVenue(profileId: string, venueId?: string | null) {
  return events.filter(e => 
    e.profileId === profileId && 
    (venueId === null ? e.venueId === null : e.venueId === venueId)
  );
}

export async function listAwards(profileId: string) {
  return awards.filter(a => a.profileId === profileId && !a.revoked);
}

export async function alreadyAwarded(profileId: string, badgeId: string, venueId?: string | null) {
  return awards.some(a => 
    a.profileId === profileId && 
    a.badgeId === badgeId && 
    (venueId === null ? a.venueId === null : a.venueId === venueId) &&
    !a.revoked
  );
}

export async function putAward(a: Award) {
  awards.push(a);
}
