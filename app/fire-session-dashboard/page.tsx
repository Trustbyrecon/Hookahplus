"use client";

import { useState } from "react";
import type { FireSession, DeliveryZone, Action, User, TrustLevel } from "@/app/lib/workflow";
import { nextStateWithTrust, TrustError } from "@/app/lib/workflow";
import { logAction } from "@/app/lib/audit";
import { demoUsers, canPerformAction, getUserDisplayInfo } from "@/app/lib/users";

function toast(msg:string, kind:"ok"|"warn"|"err"="ok"){
  // simple, replace with your toast lib
  console[kind==="ok"?"log":kind==="warn"?"warn":"error"]("[toast]", msg);
}

// Pre-generated demo sessions for static export compatibility
const PRE_GENERATED_SESSIONS: FireSession[] = [
  {
    id: "session-1",
    table: "T1",
    customerLabel: "VIP Customer",
    durationMin: 45,
    bufferSec: 8,
    zone: "A",
    items: 2,
    etaMin: 7,
    position: "VIP",
    state: "READY",
    createdAt: new Date(Date.now() - 300000),
    updatedAt: new Date()
  },
  {
    id: "session-2",
    table: "T2",
    customerLabel: "Window Seat",
    durationMin: 60,
    bufferSec: 12,
    zone: "B",
    items: 1,
    etaMin: 5,
    position: "Window",
    state: "OUT",
    createdAt: new Date(Date.now() - 600000),
    updatedAt: new Date()
  },
  {
    id: "session-3",
    table: "T3",
    customerLabel: "Bar Regular",
    durationMin: 30,
    bufferSec: 6,
    zone: "C",
    items: 3,
    etaMin: 3,
    position: "Bar",
    state: "DELIVERED",
    createdAt: new Date(Date.now() - 900000),
    updatedAt: new Date()
  },
  {
    id: "session-4",
    table: "T4",
    customerLabel: "Center Table",
    durationMin: 75,
    bufferSec: 15,
    zone: "D",
    items: 2,
    etaMin: 8,
    position: "Center",
    state: "ACTIVE",
    createdAt: new Date(Date.now() - 1200000),
    updatedAt: new Date()
  },
  {
    id: "session-5",
    table: "T5",
    customerLabel: "Corner Booth",
    durationMin: 90,
    bufferSec: 10,
    zone: "E",
    items: 1,
    etaMin: 4,
    position: "Corner",
    state: "CLOSE",
    createdAt: new Date(Date.now() - 1800000),
    updatedAt: new Date()
  },
  {
    id: "session-6",
    table: "T6",
    customerLabel: "Premium Guest",
    durationMin: 55,
    bufferSec: 9,
    zone: "A",
    items: 2,
    etaMin: 6,
    position: "VIP",
    state: "READY",
    createdAt: new Date(Date.now() - 240000),
    updatedAt: new Date()
  }
];

// Demo data generator for additional sessions
function generateDemoSessions(count: number = 6): FireSession[] {
  const zones: DeliveryZone[] = ["A", "B", "C", "D", "E"];
  const positions = ["VIP", "Window", "Bar", "Center", "Corner"];
  const states: FireSession["state"][] = ["READY", "OUT", "DELIVERED", "ACTIVE", "CLOSE"];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `session-${i + 7}`,
    table: `T${i + 7}`,
    customerLabel: `Customer ${i + 7}`,
    durationMin: Math.floor(Math.random() * 60) + 30,
    bufferSec: Math.floor(Math.random() * 15) + 5,
    zone: zones[Math.floor(Math.random() * zones.length)],
    items: Math.floor(Math.random() * 3) + 1,
    etaMin: Math.floor(Math.random() * 10) + 5,
    position: positions[Math.floor(Math.random() * positions.length)],
    state: states[Math.floor(Math.random() * states.length)],
    createdAt: new Date(Date.now() - Math.random() * 86400000),
    updatedAt: new Date()
  }));
}

export default function FireSessionDashboard(){
  const [sessions, setSessions] = useState<FireSession[]>(PRE_GENERATED_SESSIONS);
  const [busy, setBusy] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(demoUsers[0]);
  const [showUserSelector, setShowUserSelector] = useState(false);

  function postAction(id: string, action: Action) {
    try {
      setBusy(true);

      // Check if user can perform this action
      if (!canPerformAction(currentUser, action.type)) {
        toast(`Insufficient permissions for ${action.type}`, "err");
        return;
      }

      // Find the session
      const sessionIndex = sessions.findIndex(s => s.id === id);
      if (sessionIndex === -1) {
        toast("Session not found", "err");
        return;
      }

      const previousSession = { ...sessions[sessionIndex] };

      // Apply the action with trust validation
      let updatedSession: FireSession;
      try {
        updatedSession = nextStateWithTrust(previousSession, action, currentUser);
      } catch (e: any) {
        if (e instanceof TrustError) {
          toast(`Trust validation failed: ${e.message}`, "err");
          return;
        } else {
          toast(`Action failed: ${e.message}`, "err");
          return;
        }
      }

      // Log the action for audit
      logAction(currentUser, action, previousSession, updatedSession);

      // Update the sessions array
      const newSessions = [...sessions];
      newSessions[sessionIndex] = updatedSession;
      setSessions(newSessions);

      toast("Action executed successfully");
    } catch (e: any) {
      toast(e.message || "Action failed", "err");
    } finally {
      setBusy(false);
    }
  }

  function populate(count = 6) {
    const additionalSessions = generateDemoSessions(count);
    const allSessions = [...PRE_GENERATED_SESSIONS, ...additionalSessions];
    setSessions(allSessions);
    toast(`Floor populated with ${allSessions.length} sessions`);
  }

  function resetToDefault() {
    setSessions(PRE_GENERATED_SESSIONS);
    toast("Reset to default sessions");
  }

  return (
    <div className="min-h-screen bg-[#0e1220] text-[#e9ecff] p-4">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Fire Session Dashboard</h1>
          <p className="text-sm text-[#aab6ff]">
            AI Agents: Collaborating • Workflow: Session • Trust: {currentUser.trustLevel}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* User Selector */}
          <div className="relative">
            <button
              onClick={() => setShowUserSelector(!showUserSelector)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2a3570] bg-[#17204a] hover:bg-[#1b2658]"
            >
              <span className="text-sm">{currentUser.name}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                currentUser.trustLevel === 'ADMIN' ? 'bg-red-900/30 text-red-300 border-red-700' :
                currentUser.trustLevel === 'VERIFIED' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700' :
                'bg-green-900/30 text-green-300 border-green-700'
              }`}>
                {currentUser.trustLevel}
              </span>
              <span className="text-xs text-[#aab6ff]">({currentUser.role})</span>
            </button>

            {showUserSelector && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-[#0f1433] border border-[#2a3570] rounded-lg shadow-lg z-10">
                <div className="p-3 border-b border-[#2a3570]">
                  <h3 className="text-sm font-medium text-[#e9ecff]">Select User</h3>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {demoUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setCurrentUser(user);
                        setShowUserSelector(false);
                      }}
                      className={`w-full text-left p-3 hover:bg-[#1b2658] border-b border-[#2a3570] ${
                        currentUser.id === user.id ? 'bg-[#1b2658]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#e9ecff]">{user.name}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          user.trustLevel === 'ADMIN' ? 'bg-red-900/30 text-red-300 border-red-700' :
                          user.trustLevel === 'VERIFIED' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700' :
                          'bg-green-900/30 text-green-300 border-green-700'
                        }`}>
                          {user.trustLevel}
                        </span>
                      </div>
                      <div className="text-xs text-[#aab6ff] mt-1">{user.role}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={()=>populate()}
              className="rounded-lg border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658]"
              disabled={!canPerformAction(currentUser, "deliver")}
            >
              Populate Floor Sessions (Demo)
            </button>
            <button onClick={()=>resetToDefault()} className="rounded-lg border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658]">Reset</button>
            <button onClick={()=>setSessions([...sessions])} className="rounded-lg border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658]">Refresh</button>
          </div>
        </div>
      </header>

      {sessions.length === 0 ? (
        <div className="text-sm text-[#aab6ff]">No sessions yet. Click "Populate Floor Sessions" to get started!</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {sessions.map(s => (
            <Card key={s.id} s={s} postAction={postAction} user={currentUser} busy={busy}/>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({children}:{children:React.ReactNode}){ return <span className="inline-block rounded-md border border-[#2a3570] bg-[#18204a] px-2.5 py-1 text-xs text-[#dfe6ff] mr-2 mt-1">{children}</span>; }

function Card({ s, postAction, user, busy }:{
  s: FireSession;
  busy: boolean;
  user: User;
  postAction: (id:string, action:Action)=>void;
}){
  const disabled = (t:Action["type"]) => {
    const stateAllowed = allowed(s.state).includes(t);
    const userCanPerform = canPerformAction(user, t);
    return !stateAllowed || !userCanPerform || busy;
  };

  function allowed(state:FireSession["state"]): Action["type"][] {
    const map:any = {
      READY: ["DELIVER_NOW","MARK_OUT","SET_BUFFER","SET_ZONE","CANCEL","ADD_ITEM"],
      OUT: ["MARK_DELIVERED","SET_BUFFER","SET_ZONE","REASSIGN_RUNNER","CANCEL","UNDO"],
      DELIVERED: ["START_ACTIVE","UNDO"],
      ACTIVE: ["CLOSE","EXTEND_MIN","ADD_ITEM","UNDO"],
      CLOSE: ["UNDO"]
    };
    return map[state];
  }

  // Get trust requirement for tooltip
  const getTrustRequirement = (actionType: Action["type"]) => {
    const trustMap: Record<Action["type"], TrustLevel> = {
      "DELIVER_NOW": "BASIC",
      "MARK_OUT": "BASIC",
      "MARK_DELIVERED": "VERIFIED",
      "START_ACTIVE": "VERIFIED",
      "CLOSE": "ADMIN",
      "SET_BUFFER": "BASIC",
      "SET_ZONE": "BASIC",
      "ADD_ITEM": "BASIC",
      "EXTEND_MIN": "VERIFIED",
      "UNDO": "VERIFIED",
      "REASSIGN_RUNNER": "VERIFIED",
      "CANCEL": "ADMIN"
    };
    return trustMap[actionType];
  };

  return (
    <div className="rounded-xl border border-[#2a2f4a] bg-[#0f1433] p-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Table {s.table}</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8ff4c2]">{s.state}</span>
          <span className="text-xs text-[#aab6ff]">• Trust: {user.trustLevel}</span>
        </div>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-[#b8c2ff]">
        <div>Customer: <span className="text-[#e9ecff]">{s.customerLabel}</span></div>
        <div>Position: <span className="text-[#e9ecff]">{s.position}</span></div>
        <div>Duration: {s.durationMin}m</div>
        <div>ETA: {s.etaMin}m</div>
        <div>Items: {s.items}</div>
      </div>

      <div className="mt-2 flex flex-wrap">
        <Chip>Delivery Buffer: <b>{s.bufferSec}s</b></Chip>
        <Chip>Zone: <b>{s.zone}</b></Chip>
      </div>

      {/* Actions */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {/* Primary flow */}
        <button
          disabled={disabled("DELIVER_NOW")}
          onClick={()=>postAction(s.id,{type:"DELIVER_NOW"})}
          className="rounded-md border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40"
          title={`Requires ${getTrustRequirement("DELIVER_NOW")} trust level`}
        >
          Deliver Now
        </button>
        <button
          disabled={disabled("MARK_OUT")}
          onClick={()=>postAction(s.id,{type:"MARK_OUT"})}
          className="rounded-md border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40"
          title={`Requires ${getTrustRequirement("MARK_OUT")} trust level`}
        >
          Mark Out
        </button>

        <button disabled={disabled("MARK_DELIVERED")} onClick={()=>postAction(s.id,{type:"MARK_DELIVERED"})} className="rounded-md border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40">Mark Delivered</button>
        <button disabled={disabled("START_ACTIVE")} onClick={()=>postAction(s.id,{type:"START_ACTIVE"})} className="rounded-md border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40">Start Active</button>

        <button
          disabled={disabled("CLOSE")}
          onClick={()=>postAction(s.id,{type:"CLOSE"})}
          className="rounded-md border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40"
          title={`Requires ${getTrustRequirement("CLOSE")} trust level`}
        >
          Close
        </button>
        <button
          disabled={disabled("UNDO")}
          onClick={()=>postAction(s.id,{type:"UNDO"})}
          className="rounded-md border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40"
          title={`Requires ${getTrustRequirement("UNDO")} trust level`}
        >
          Undo
        </button>

        {/* Controls */}
        {[5,10,15].map(sec=>(
          <button key={sec} disabled={disabled("SET_BUFFER")} onClick={()=>postAction(s.id,{type:"SET_BUFFER", value:sec})} className="rounded-md border border-[#2a3570] bg-[#0f183f] px-3 py-2 text-sm hover:bg-[#18204a] disabled:opacity-40">Buffer {sec}s</button>
        ))}
        {(["A","B","C","D","E"] as DeliveryZone[]).map(z=>(
          <button key={z} disabled={disabled("SET_ZONE")} onClick={()=>postAction(s.id,{type:"SET_ZONE", value:z})} className={`rounded-md border border-[#2a3570] px-3 py-2 text-sm hover:bg-[#18204a] disabled:opacity-40 ${s.zone===z ? "bg-[#1b2658]" : "bg-[#0f183f]"}`}>Zone {z}</button>
        ))}

        {/* Secondary */}
        <button disabled={disabled("ADD_ITEM")} onClick={()=>postAction(s.id,{type:"ADD_ITEM", value:1})} className="rounded-md border border-[#2a3570] bg-[#0f183f] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40">+ Item</button>
        <button disabled={disabled("EXTEND_MIN")} onClick={()=>postAction(s.id,{type:"EXTEND_MIN", value:5})} className="rounded-md border border-[#2a3570] bg-[#0f183f] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40">Extend 5m</button>
        <button disabled={disabled("REASSIGN_RUNNER")} onClick={()=>postAction(s.id,{type:"REASSIGN_RUNNER", value:"runner_2"})} className="rounded-md border border-[#2a3570] bg-[#0f183f] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40">Reassign Runner</button>
        <button disabled={disabled("CANCEL")} onClick={()=>postAction(s.id,{type:"CANCEL"})} className="rounded-md border border-rose-800 bg-rose-900/30 px-3 py-2 text-sm hover:bg-rose-900/50 disabled:opacity-40">Cancel</button>
      </div>
    </div>
  );
}
