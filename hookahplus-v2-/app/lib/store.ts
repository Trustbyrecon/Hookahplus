// app/lib/store.ts
import { FireSession } from "./workflow";

type Store = { byId: Map<string, FireSession> };

const g = globalThis as any;
if (!g.__FIRE_STORE__) g.__FIRE_STORE__ = { byId: new Map() } as Store;
export const store: Store = g.__FIRE_STORE__;

export function allSessions(): FireSession[] {
  return [...store.byId.values()].sort((a,b)=> (b.updatedAt - a.updatedAt));
}
export function upsertSession(s: FireSession) { store.byId.set(s.id, s); }
export function getSession(id: string) { return store.byId.get(id); }
export function clearStore() { store.byId.clear(); }
