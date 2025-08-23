"use client";

import React, { useMemo, useRef, useState } from "react";

type Badge = { code: "EXPLORER" | "MIX" | "LOYAL" | string; label: string; hint: string };
type Profile = {
  hid: string;
  name: string;
  phone: string;
  email: string;
  tier: string;
  prefs: string[];
  suggest: string[];
  badges: Badge[];
  notesL: string[];
  notesN: string[];
  loyalty: number; // 0–100
  catalog: string[];
};

const demoProfile: Profile = {
  hid: "HID-AVA-28-TX",
  name: "Ava Thompson",
  phone: "+1 512‑555‑0194",
  email: "ava@byteforge.dev",
  tier: "Gold",
  prefs: ["Double Apple + Mint", "Blue Mist + Lemon", "Grape + Ice"],
  suggest: ["Seat by window", "Cooler pull / low heat", "Offer Lemon Ice add‑on"],
  badges: [
    { code: "EXPLORER", label: "Explorer", hint: "Visited 3+ venues" },
    { code: "MIX", label: "Mix Master", hint: "10 unique combos" },
    { code: "LOYAL", label: "Loyalist", hint: "10 sessions at a venue" }
  ],
  notesL: ["Friends arrive ~15m later", "Allergic to pineapple mixes"],
  notesN: ["Seated for TV for game nights", "prefer cooler pulls"],
  loyalty: 72,
  catalog: ["Double Apple", "Mint", "Blue Mist", "Grape", "Lemon", "Peach", "Watermelon", "Ice", "Mango"],
};

function dl(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function BehavioralMemoryStaffPanel() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [note, setNote] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStamp, setSessionStamp] = useState<string>("");
  const [autoStart, setAutoStart] = useState(false);
  const lookupRef = useRef<HTMLInputElement>(null);

  const onSimulate = () => {
    setProfile(demoProfile);
    if (autoStart) startSession();
    alert(`Simulated HID resolved: ${demoProfile.hid}\nProfile loaded.`);
  };

  const addNote = (scope: "L" | "N") => {
    const t = note.trim();
    if (!t) return alert("Enter a note first.");
    if (!profile) return;
    const updated: Profile = { ...profile };
    if (scope === "L") updated.notesL = [t, ...updated.notesL];
    else updated.notesN = [t, ...updated.notesN];
    setProfile(updated); setNote("");
  };

  const startSession = () => {
    setSessionActive(true);
    setSessionStamp(new Date().toLocaleTimeString());
  };
  const endSession = () => { setSessionActive(false); setSessionStamp(""); };

  const awardBadge = () => {
    const code = prompt("Badge code (e.g., EXPLORER, MIX, LOYAL):", "EXPLORER");
    if (!code || !profile) return;
    const label = code === "MIX" ? "Mix Master" : code === "LOYAL" ? "Loyalist" : "Explorer";
    const hint = code === "MIX" ? "10 unique combos" : code === "LOYAL" ? "10 sessions at a venue" : "Visited 3+ venues";
    setProfile({ ...profile, badges: [...profile.badges, { code, label, hint }] });
  };

  const exportJSON = () => {
    const p = profile ?? demoProfile;
    dl("behavioral_memory_snapshot.json", JSON.stringify(p, null, 2));
  };

  const chip = (txt: string) => (
    <span className="inline-block rounded-md border border-[#2a3570] bg-[#18204a] px-2.5 py-1 text-xs text-[#dfe6ff] mr-2 mt-1">{txt}</span>
  );

  return (
    <div className="min-h-screen bg-[#0e1220] text-[#e9ecff]">
      <header className="flex items-center gap-3 border-b border-[#21274a] bg-gradient-to-b from-[#121737] to-[#0e1230] px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d4af37] font-bold text-[#111]">H+</div>
        <h1 className="text-base font-semibold">Behavioral Memory Staff Panel — Demo</h1>
        <span className="text-xs text-[#aab6ff]">Scan/lookup → load portable preferences, badges, and notes (venue vs network)</span>
      </header>

      <div className="grid h-[calc(100vh-52px)] grid-cols-[360px_1fr]">
        {/* Sidebar */}
        <aside className="overflow-auto border-r border-[#21274a] bg-gradient-to-b from-[#0f1433] to-[#0e1220] p-3">
          <div className="mb-3 rounded-xl border border-[#2a2f4a] bg-[#151a33] p-3">
            <div className="mb-1 text-xs text-[#aab6ff]">Check-in (phone / email / QR code)</div>
            <input ref={lookupRef} className="w-full rounded-lg border border-[#2a2f54] bg-[#0f1433] p-2 text-sm text-[#dfe6ff]" placeholder={"+1 555-867-5309 or guest@email.com"} />
            <div className="h-2" />
            <button onClick={onSimulate} className="w-full rounded-lg border border-[#2a3570] bg-[#17204a] p-2 text-sm hover:bg-[#1b2658]">Simulate Check-in</button>
            <div className="h-2" />
            <label className="flex items-center gap-2 text-xs text-[#b8c2ff]"><input type="checkbox" checked={autoStart} onChange={(e)=>setAutoStart(e.target.checked)} /> Auto-start session</label>
          </div>

          <div className="mb-3 rounded-xl border border-[#2a2f4a] bg-[#151a33] p-3">
            <div className="mb-1 text-xs text-[#aab6ff]">New Note</div>
            <textarea value={note} onChange={(e)=>setNote(e.target.value)} className="min-h-[74px] w-full rounded-lg border border-[#2a2f54] bg-[#0f1433] p-2 text-sm text-[#dfe6ff]" placeholder="e.g., Prefers low heat, mint-forward mix. Allergic to pineapple." />
            <div className="mt-2 flex gap-2">
              <button onClick={()=>addNote("L")} className="w-full rounded-lg border border-[#2a3570] bg-[#17204a] p-2 text-sm hover:bg-[#1b2658]">Add (Lounge scope)</button>
              <button onClick={()=>addNote("N")} className="w-full rounded-lg border border-[#2a3570] bg-[#17204a] p-2 text-sm hover:bg-[#1b2658]">Add (Network scope)</button>
            </div>
          </div>

          <div className="mb-3 rounded-xl border border-[#2a2f4a] bg-[#151a33] p-3">
            <div className="mb-1 text-xs text-[#aab6ff]">Quick Actions</div>
            <div className="flex flex-col gap-2">
              <button onClick={startSession} className="w-full rounded-lg border border-[#2a3570] bg-[#17204a] p-2 text-sm hover:bg-[#1b2658]">Start Session</button>
              <button onClick={endSession} className="w-full rounded-lg border border-[#2a3570] bg-[#17204a] p-2 text-sm hover:bg-[#1b2658]">End Session</button>
              <button onClick={awardBadge} className="w-full rounded-lg border border-[#2a3570] bg-[#17204a] p-2 text-sm hover:bg-[#1b2658]">Award Badge</button>
            </div>
          </div>

          <div className="rounded-xl border border-[#2a2f4a] bg-[#151a33] p-3">
            <div className="mb-1 text-xs text-[#aab6ff]">Export / Share</div>
            <button onClick={exportJSON} className="w-full rounded-lg border border-[#2a3570] bg-[#17204a] p-2 text-sm hover:bg-[#1b2658]">Download JSON Snapshot</button>
          </div>
        </aside>

        {/* Main */}
        <main className="overflow-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Profile */}
            <section className="rounded-xl border border-[#2a2f4a] bg-[#151a33] p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e264f] font-bold text-[#8ff4c2]">
                    {(profile?.name ?? demoProfile.name).slice(0,1)}
                  </div>
                  <div>
                    <div className="font-semibold">{profile?.name ?? "—"}</div>
                    <div className="text-xs text-[#b8c2ff]">{profile ? `${profile.phone} • ${profile.email}` : "—"}</div>
                  </div>
                </div>
                <span className="rounded-full border border-[#2a2f54] bg-[#0f1433] px-3 py-1 text-xs">Tier: {profile?.tier ?? "—"}</span>
              </div>

              <div className="mt-2 text-xs text-[#aab6ff]">Last 3 Preferences</div>
              <div className="mt-1">{(profile?.prefs ?? []).map((pref, i) => <span key={`pref-${i}`}>{chip(pref)}</span>)}</div>
              <div className="mt-2 text-xs text-[#aab6ff]">Suggested Actions</div>
              <div className="mt-1">{(profile?.suggest ?? []).map((s, i) => <span key={`suggest-${i}`}>{chip("→ "+s)}</span>)}</div>
            </section>

            {/* Badges */}
            <section className="rounded-xl border border-[#2a2f4a] bg-[#151a33] p-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Badges</div>
                <div className="text-xs text-[#b8c2ff]">Loyalty progress: {profile?.loyalty ?? 0}%</div>
              </div>
              <div className="mt-1 flex flex-wrap">
                {(profile?.badges ?? []).map(b => (
                  <span key={`${b.code}-${b.label}`} className="mr-2 mt-1 inline-flex items-center gap-2 rounded-md border border-[#2a3570] bg-[#18204a] px-2.5 py-1 text-xs">
                    🏅 <b>{b.label}</b> <span className="text-[#b8c2ff]">— {b.hint}</span>
                  </span>
                ))}
              </div>
            </section>

            {/* Notes L */}
            <section className="rounded-xl border border-[#2a2f4a] bg-[#151a33] p-3">
              <div className="mb-1 flex items-center justify-between"><div className="font-semibold">Notes — Lounge</div>
                <button onClick={()=> profile && setProfile({ ...profile, notesL: [] })} className="rounded-full border border-[#2a2f54] bg-[#0f1433] px-3 py-1 text-xs">Clear</button></div>
              <div>
                {(profile?.notesL ?? []).map((n,i)=> (
                  <div key={`lounge-note-${i}`} className="mt-2 rounded-md border border-[#2a3570] bg-[#18204a] px-3 py-2 text-sm">{n}</div>
                ))}
              </div>
            </section>

            {/* Notes N */}
            <section className="rounded-xl border border-[#2a2f4a] bg-[#151a33] p-3">
              <div className="mb-1 flex items-center justify-between"><div className="font-semibold">Notes — Network</div>
                <button onClick={()=> profile && setProfile({ ...profile, notesN: [] })} className="rounded-full border border-[#2a2f54] bg-[#0f1433] px-3 py-1 text-xs">Clear</button></div>
              <div>
                {(profile?.notesN ?? []).map((n,i)=> (
                  <div key={`network-note-${i}`} className="mt-2 rounded-md border border-[#2a3570] bg-[#18204a] px-3 py-2 text-sm">{n}</div>
                ))}
              </div>
            </section>

            {/* Session */}
            <section className="rounded-xl border border-[#2a2f4a] bg-[#151a33] p-3">
              <div className="flex items-center justify-between"><div className="font-semibold">Session</div>
                <div className="text-xs text-[#b8c2ff]">{sessionActive ? `Session Active: ${sessionStamp}` : "No active session"}</div></div>
              <div className="mt-2 text-xs text-[#aab6ff]">Flavor / Service Selector</div>
              <div className="mt-1 flex flex-wrap">
                {(profile?.catalog ?? demoProfile.catalog).map((item, i) => <span key={`catalog-${i}`}>{chip(item)}</span>)}
              </div>
            </section>

            {/* Venue */}
            <section className="rounded-xl border border-[#2a2f4a] bg-[#151a33] p-3">
              <div className="font-semibold">Venue Context</div>
              <div className="text-xs text-[#b8c2ff]">Venue: Demo Lounge (POS: Clover) • City: Austin, TX</div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
