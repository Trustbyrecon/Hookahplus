"use client";
import { useState } from "react";
import type { FireSession, DeliveryZone, Action } from "@/app/lib/workflow";

function toast(msg:string, kind:"ok"|"warn"|"err"="ok"){
  // simple, replace with your toast lib
  console[kind==="ok"?"log":kind==="warn"?"warn":"error"]("[toast]", msg);
}

// Demo data generator
function generateDemoSessions(count: number = 12): FireSession[] {
  const zones: DeliveryZone[] = ["A", "B", "C", "D", "E"];
  const positions = ["Main (2,3)", "Bar (3,1)", "Patio (1,4)"];
  const states: FireSession["state"][] = ["READY", "OUT", "DELIVERED", "ACTIVE"];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `demo-${i + 1}`,
    table: `T-${1 + Math.floor(Math.random() * 12)}`,
    customerLabel: `customer_${Math.floor(Math.random() * 900) + 100}`,
    durationMin: Math.floor(Math.random() * 60),
    bufferSec: [5, 10, 15][Math.floor(Math.random() * 3)],
    zone: zones[Math.floor(Math.random() * zones.length)],
    items: Math.floor(Math.random() * 3) + 1,
    etaMin: [2, 3, 5][Math.floor(Math.random() * 3)],
    position: positions[Math.floor(Math.random() * positions.length)],
    state: states[Math.floor(Math.random() * states.length)],
    createdAt: Date.now() - Math.random() * 3600000,
    updatedAt: Date.now()
  }));
}

export default function FireSessionDashboard(){
  const [sessions, setSessions] = useState<FireSession[]>([]);
  const [busy, setBusy] = useState(false);

  function postAction(id: string, action: Action) {
    try {
      setBusy(true);
      
      // Find the session
      const sessionIndex = sessions.findIndex(s => s.id === id);
      if (sessionIndex === -1) {
        toast("Session not found", "err");
        return;
      }

      // Create a copy of the session
      const session = { ...sessions[sessionIndex] };
      
      // Apply the action (simplified workflow logic)
      switch (action.type) {
        case "DELIVER_NOW":
        case "MARK_OUT":
          if (session.state === "READY") {
            session.state = "OUT";
            session.etaMin = Math.max(1, session.etaMin);
          }
          break;
        case "MARK_DELIVERED":
          if (session.state === "OUT") {
            session.state = "DELIVERED";
          }
          break;
        case "START_ACTIVE":
          if (session.state === "DELIVERED") {
            session.state = "ACTIVE";
          }
          break;
        case "CLOSE":
          session.state = "CLOSE";
          break;
        case "SET_BUFFER":
          session.bufferSec = Math.max(0, action.value);
          break;
        case "SET_ZONE":
          session.zone = action.value;
          break;
        case "ADD_ITEM":
          session.items = Math.max(0, session.items + action.value);
          break;
        case "EXTEND_MIN":
          session.durationMin += action.value;
          break;
        case "UNDO":
          // Simple undo logic
          if (session.state === "OUT") session.state = "READY";
          else if (session.state === "DELIVERED") session.state = "OUT";
          else if (session.state === "ACTIVE") session.state = "DELIVERED";
          else if (session.state === "CLOSE") session.state = "ACTIVE";
          break;
      }
      
      session.updatedAt = Date.now();
      
      // Update the sessions array
      const newSessions = [...sessions];
      newSessions[sessionIndex] = session;
      setSessions(newSessions);
      
      toast("Updated");
    } catch (e: any) {
      toast(e.message || "Action failed", "err");
    } finally {
      setBusy(false);
    }
  }

  function populate(count = 12) {
    const newSessions = generateDemoSessions(count);
    setSessions(newSessions);
    toast("Floor populated");
  }

  return (
    <div className="min-h-screen bg-[#0e1220] text-[#e9ecff] p-4">
      <header className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-lg font-semibold">Fire Session Dashboard</h1>
          <p className="text-xs text-[#aab6ff]">AI Agents: Collaborating • Workflow: Session</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>populate()} className="rounded-lg border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658]">Populate Floor Sessions (Demo)</button>
          <button onClick={()=>setSessions([...sessions])} className="rounded-lg border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658]">Refresh</button>
        </div>
      </header>

      {sessions.length === 0 ? (
        <div className="text-sm text-[#aab6ff]">No sessions yet. Click "Populate Floor Sessions" to get started!</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {sessions.map(s => (
            <Card key={s.id} s={s} postAction={postAction} busy={busy}/>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({children}:{children:React.ReactNode}){ return <span className="inline-block rounded-md border border-[#2a3570] bg-[#18204a] px-2.5 py-1 text-xs text-[#dfe6ff] mr-2 mt-1">{children}</span>; }

function Card({ s, postAction, busy }:{
  s: FireSession;
  busy: boolean;
  postAction: (id:string, action:Action)=>void;
}){
  const disabled = (t:Action["type"]) => !allowed(s.state).includes(t) || busy;
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

  return (
    <div className="rounded-xl border border-[#2a2f4a] bg-[#0f1433] p-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Table {s.table}</div>
        <span className="text-xs text-[#8ff4c2]">{s.state}</span>
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
        <button disabled={disabled("DELIVER_NOW")} onClick={()=>postAction(s.id,{type:"DELIVER_NOW"})} className="rounded-md border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40">Deliver Now</button>
        <button disabled={disabled("MARK_OUT")} onClick={()=>postAction(s.id,{type:"MARK_OUT"})} className="rounded-md border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40">Mark Out</button>

        <button disabled={disabled("MARK_DELIVERED")} onClick={()=>postAction(s.id,{type:"MARK_DELIVERED"})} className="rounded-md border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40">Mark Delivered</button>
        <button disabled={disabled("START_ACTIVE")} onClick={()=>postAction(s.id,{type:"START_ACTIVE"})} className="rounded-md border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40">Start Active</button>

        <button disabled={disabled("CLOSE")} onClick={()=>postAction(s.id,{type:"CLOSE"})} className="rounded-md border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40">Close</button>
        <button disabled={disabled("UNDO")} onClick={()=>postAction(s.id,{type:"UNDO"})} className="rounded-md border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40">Undo</button>

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
