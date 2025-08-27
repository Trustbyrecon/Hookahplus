"use client";

import { useState, useEffect } from "react";
import type { FireSession, DeliveryZone, Action, User, TrustLevel } from "@/app/lib/workflow";
import { nextStateWithTrust, TrustError } from "@/app/lib/workflow";
import { logAction } from "@/app/lib/audit";
import { demoUsers, canPerformAction, getUserDisplayInfo } from "@/app/lib/users";

// Enhanced session interface with new fields
interface EnhancedFireSession extends FireSession {
  flavor: string;
  addOns: string[];
  currentAmount: number;
  assignedStaff?: string;
  sessionStartTime?: number;
  bohState?: "WARMING_UP" | "READY_FOR_PICKUP" | "PICKED_UP" | "DELIVERED";
  sessionTimer?: number;
  guestTimerDisplay?: boolean; // New: Control guest timer visibility
}

// Available flavors for selection
const AVAILABLE_FLAVORS = [
  "Double Apple", "Mint", "Blue Mist", "Grape", "Lemon", 
  "Peach", "Watermelon", "Rose", "Cardamom", "Vanilla",
  "Strawberry", "Pineapple", "Mango", "Cherry", "Orange"
];

// Available add-ons for selection
const AVAILABLE_ADDONS = [
  "Ice", "Extra Heat", "Premium Coal", "Fruit", "Herbs",
  "Honey", "Mint Leaves", "Lemon Slices", "Orange Peel"
];

function toast(msg: string, kind: "ok" | "warn" | "err" = "ok") {
  // simple, replace with your toast lib
  console[kind === "ok" ? "log" : kind === "warn" ? "warn" : "error"]("[toast]", msg);
}

// Enhanced demo sessions with new fields
const PRE_GENERATED_SESSIONS: EnhancedFireSession[] = [
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
    createdAt: Date.now() - 300000,
    updatedAt: Date.now(),
    flavor: "Double Apple + Mint",
    addOns: ["Ice", "Extra Heat"],
    currentAmount: 25.99,
    assignedStaff: "Alex Runner",
    sessionStartTime: Date.now() - 300000,
    sessionTimer: 300,
    guestTimerDisplay: true
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
    createdAt: Date.now() - 600000,
    updatedAt: Date.now(),
    flavor: "Blue Mist",
    addOns: ["Ice"],
    currentAmount: 18.99,
    assignedStaff: "Sarah Server",
    sessionStartTime: Date.now() - 600000,
    sessionTimer: 600,
    guestTimerDisplay: false
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
    createdAt: Date.now() - 900000,
    updatedAt: Date.now(),
    flavor: "Grape + Peach",
    addOns: ["Extra Heat", "Premium Coal"],
    currentAmount: 32.99,
    assignedStaff: "Mike Manager",
    sessionStartTime: Date.now() - 900000,
    sessionTimer: 900,
    guestTimerDisplay: true
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
    createdAt: Date.now() - 1200000,
    updatedAt: Date.now(),
    flavor: "Strawberry + Vanilla",
    addOns: ["Ice", "Extra Heat", "Premium Coal"],
    currentAmount: 28.99,
    assignedStaff: "Lisa Lead",
    sessionStartTime: Date.now() - 1200000,
    sessionTimer: 1200,
    guestTimerDisplay: true
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
    createdAt: Date.now() - 1800000,
    updatedAt: Date.now(),
    flavor: "Lemon + Mint",
    addOns: ["Ice"],
    currentAmount: 22.99,
    assignedStaff: "Tom Trainer",
    sessionStartTime: Date.now() - 1800000,
    sessionTimer: 1800,
    guestTimerDisplay: false
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
    createdAt: Date.now() - 240000,
    updatedAt: Date.now(),
    flavor: "Rose + Cardamom",
    addOns: ["Premium Coal", "Extra Heat"],
    currentAmount: 35.99,
    assignedStaff: "Alex Runner",
    sessionStartTime: Date.now() - 240000,
    sessionTimer: 240,
    guestTimerDisplay: true
  }
];

// Demo data generator for additional sessions
function generateDemoSessions(count: number = 6): EnhancedFireSession[] {
  const zones: DeliveryZone[] = ["A", "B", "C", "D", "E"];
  const positions = ["VIP", "Window", "Bar", "Center", "Corner"];
  const states: FireSession["state"][] = ["READY", "OUT", "DELIVERED", "ACTIVE", "CLOSE"];
  const flavors = ["Double Apple", "Mint", "Blue Mist", "Grape", "Lemon", "Peach", "Watermelon", "Rose", "Cardamom"];
  const addOns = ["Ice", "Extra Heat", "Premium Coal", "Fruit", "Herbs"];
  const staff = ["Alex Runner", "Sarah Server", "Mike Manager", "Lisa Lead", "Tom Trainer"];
  
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
    createdAt: Date.now() - Math.random() * 86400000,
    updatedAt: Date.now(),
    flavor: flavors[Math.floor(Math.random() * flavors.length)],
    addOns: addOns.slice(0, Math.floor(Math.random() * 3) + 1),
    currentAmount: Math.floor(Math.random() * 20) + 15.99,
    assignedStaff: staff[Math.floor(Math.random() * staff.length)],
    sessionStartTime: Date.now() - Math.random() * 86400000,
    sessionTimer: Math.floor(Math.random() * 1800),
    guestTimerDisplay: Math.random() > 0.5
  }));
}

export default function FireSessionDashboard() {
  const [sessions, setSessions] = useState<EnhancedFireSession[]>(PRE_GENERATED_SESSIONS);
  const [busy, setBusy] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(demoUsers[0]);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [viewMode, setViewMode] = useState<"FOH" | "BOH">("FOH");
  const [showFlavorSelector, setShowFlavorSelector] = useState<string | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Session timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSessions(prevSessions => 
        prevSessions.map(session => {
          if (session.sessionStartTime && session.state === "ACTIVE") {
            const elapsed = Math.floor((Date.now() - session.sessionStartTime) / 1000);
            return { ...session, sessionTimer: elapsed };
          }
          return session;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
      let updatedSession: EnhancedFireSession;
      try {
        const baseSession = nextStateWithTrust(previousSession, action, currentUser);
        // Merge the base session with the enhanced properties
        updatedSession = {
          ...baseSession,
          flavor: previousSession.flavor,
          addOns: previousSession.addOns,
          currentAmount: previousSession.currentAmount,
          assignedStaff: previousSession.assignedStaff,
          sessionStartTime: previousSession.sessionStartTime,
          bohState: previousSession.bohState,
          sessionTimer: previousSession.sessionTimer,
          guestTimerDisplay: previousSession.guestTimerDisplay
        };
        
        // Handle BOH state transitions
        if (action.type === "DELIVER_NOW" || action.type === "MARK_OUT") {
          updatedSession.bohState = "WARMING_UP";
        } else if (action.type === "MARK_DELIVERED") {
          updatedSession.bohState = "READY_FOR_PICKUP";
          // Trigger FOH notification for staff assignment
          toast(`🚨 FOH Alert: Table ${updatedSession.table} is ready for pickup!`, "warn");
        } else if (action.type === "START_ACTIVE") {
          updatedSession.bohState = "PICKED_UP";
          updatedSession.sessionStartTime = Date.now();
          // Enable guest timer display when session becomes active
          updatedSession.guestTimerDisplay = true;
        }
        
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

  // Handle flavor and add-on selection for +item
  function handleAddItem(sessionId: string) {
    if (selectedFlavor && selectedAddons.length > 0) {
      setSessions(prevSessions => 
        prevSessions.map(session => {
          if (session.id === sessionId) {
            const newFlavor = session.flavor + " + " + selectedFlavor;
            const newAddons = [...session.addOns, ...selectedAddons];
            const newAmount = session.currentAmount + 5.99; // Add $5.99 for new item
            
            return {
              ...session,
              flavor: newFlavor,
              addOns: newAddons,
              currentAmount: newAmount,
              items: session.items + 1
            };
          }
          return session;
        })
      );
      
      toast(`Added ${selectedFlavor} with ${selectedAddons.join(", ")} to Table ${sessions.find(s => s.id === sessionId)?.table}`);
      setShowFlavorSelector(null);
      setSelectedFlavor("");
      setSelectedAddons([]);
    } else {
      toast("Please select both flavor and add-ons", "warn");
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

  function autoAssignStaff() {
    const availableStaff = ["Alex Runner", "Sarah Server", "Mike Manager", "Lisa Lead", "Tom Trainer"];
    setSessions(prevSessions => 
      prevSessions.map(session => ({
        ...session,
        assignedStaff: availableStaff[Math.floor(Math.random() * availableStaff.length)]
      }))
    );
    toast("Staff auto-assigned to all sessions");
  }

  // Check if BOH should be displayed (only show for qualified statuses)
  const shouldShowBOH = (session: EnhancedFireSession) => {
    return session.bohState && ["WARMING_UP", "READY_FOR_PICKUP", "PICKED_UP"].includes(session.bohState);
  };

  return (
    <div className="min-h-screen bg-[#0e1220] text-[#e9ecff] p-4">
      {/* Enhanced Navigation Header */}
      <header className="bg-gradient-to-r from-[#1a1f3a] to-[#2a2f4a] border border-[#2a3570] rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🔥</div>
            <div>
              <h1 className="text-3xl font-bold text-[#8ff4c2]">Fire Session Dashboard</h1>
              <p className="text-sm text-[#aab6ff]">
                AI Agents: Collaborating • Workflow: Session • Trust: {currentUser.trustLevel}
              </p>
              <p className="text-xs text-[#8a94a8] mt-1">
                📱 Mobile QR Orders • 🍽️ Table Orders • 🔥 BOH Workflow
              </p>
            </div>
          </div>
          
          {/* FOH/BOH Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex bg-[#17204a] rounded-lg p-1 border border-[#2a3570]">
              <button
                onClick={() => setViewMode("FOH")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "FOH" 
                    ? "bg-[#8ff4c2] text-[#0e1220]" 
                    : "text-[#aab6ff] hover:text-[#e9ecff]"
                }`}
              >
                🎯 Front of House
              </button>
              <button
                onClick={() => setViewMode("BOH")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "BOH" 
                    ? "bg-[#8ff4c2] text-[#0e1220]" 
                    : "text-[#aab6ff] hover:text-[#e9ecff]"
                }`}
              >
                🏪 Back of House
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* User Selector */}
          <div className="relative">
            <button
              onClick={() => setShowUserSelector(!showUserSelector)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a3570] bg-[#17204a] hover:bg-[#1b2658] transition-colors"
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
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#0f1433] border border-[#2a3570] rounded-lg shadow-lg z-10">
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

          <div className="flex gap-3">
            <button
              onClick={() => populate()}
              className="rounded-lg border border-[#2a3570] bg-[#17204a] px-4 py-2 text-sm hover:bg-[#1b2658] transition-colors"
              disabled={!canPerformAction(currentUser, "deliver")}
            >
              🚀 Populate Floor Sessions (Demo)
            </button>
            <button 
              onClick={() => resetToDefault()} 
              className="rounded-lg border border-[#2a3570] bg-[#17204a] px-4 py-2 text-sm hover:bg-[#1b2658] transition-colors"
            >
              🔄 Reset
            </button>
            <button 
              onClick={() => setSessions([...sessions])} 
              className="rounded-lg border border-[#2a3570] bg-[#17204a] px-4 py-2 text-sm hover:bg-[#1b2658] transition-colors"
            >
              📊 Refresh
            </button>
            <button 
              onClick={autoAssignStaff} 
              className="rounded-lg border border-[#2a3570] bg-[#8ff4c2] text-[#0e1220] px-4 py-2 text-sm hover:bg-[#7ee4b2] transition-colors"
            >
              👥 Auto-Assign Staff
            </button>
          </div>
        </div>
      </header>

      {/* View Mode Indicator */}
      <div className="mb-6 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          viewMode === "FOH" 
            ? "bg-blue-900/30 text-blue-300 border border-blue-700" 
            : "bg-amber-900/30 text-amber-300 border border-amber-700"
        }`}>
          {viewMode === "FOH" ? "🎯 Front of House View" : "🏪 Back of House View"}
        </div>
      </div>

      {/* Flavor Selector Modal */}
      {showFlavorSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0f1433] border border-[#2a3570] rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-[#8ff4c2] mb-4">Add New Item</h3>
            
            {/* Flavor Selection */}
            <div className="mb-4">
              <label className="block text-sm text-[#aab6ff] mb-2">Select Flavor:</label>
              <select
                value={selectedFlavor}
                onChange={(e) => setSelectedFlavor(e.target.value)}
                className="w-full bg-[#1a1f3a] border border-[#2a3570] rounded-lg px-3 py-2 text-[#e9ecff]"
              >
                <option value="">Choose a flavor...</option>
                {AVAILABLE_FLAVORS.map(flavor => (
                  <option key={flavor} value={flavor}>{flavor}</option>
                ))}
              </select>
            </div>

            {/* Add-ons Selection */}
            <div className="mb-6">
              <label className="block text-sm text-[#aab6ff] mb-2">Select Add-ons:</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {AVAILABLE_ADDONS.map(addon => (
                  <label key={addon} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedAddons.includes(addon)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAddons([...selectedAddons, addon]);
                        } else {
                          setSelectedAddons(selectedAddons.filter(a => a !== addon));
                        }
                      }}
                      className="rounded border-[#2a3570] bg-[#1a1f3a]"
                    />
                    <span className="text-sm text-[#e9ecff]">{addon}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleAddItem(showFlavorSelector)}
                disabled={!selectedFlavor || selectedAddons.length === 0}
                className="flex-1 bg-[#8ff4c2] text-[#0e1220] px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                Add Item (+$5.99)
              </button>
              <button
                onClick={() => {
                  setShowFlavorSelector(null);
                  setSelectedFlavor("");
                  setSelectedAddons([]);
                }}
                className="flex-1 bg-[#2a3570] text-[#e9ecff] px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔥</div>
          <div className="text-xl text-[#aab6ff] mb-2">No sessions yet</div>
          <div className="text-sm text-[#8a94a8]">Click "Populate Floor Sessions" to get started!</div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map(s => (
            <EnhancedCard 
              key={s.id} 
              s={s} 
              postAction={postAction} 
              user={currentUser} 
              busy={busy}
              viewMode={viewMode}
              shouldShowBOH={shouldShowBOH(s)}
              onShowFlavorSelector={(sessionId) => setShowFlavorSelector(sessionId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) { 
  return <span className="inline-block rounded-md border border-[#2a3570] bg-[#18204a] px-2.5 py-1 text-xs text-[#dfe6ff] mr-2 mt-1">{children}</span>; 
}

function EnhancedCard({ 
  s, 
  postAction, 
  user, 
  busy, 
  viewMode,
  shouldShowBOH,
  onShowFlavorSelector
}: {
  s: EnhancedFireSession;
  busy: boolean;
  user: User;
  postAction: (id: string, action: Action) => void;
  viewMode: "FOH" | "BOH";
  shouldShowBOH: boolean;
  onShowFlavorSelector: (sessionId: string) => void;
}) {
  const disabled = (t: Action["type"]) => {
    const stateAllowed = allowed(s.state).includes(t);
    const userCanPerform = canPerformAction(user, t);
    return !stateAllowed || !userCanPerform || busy;
  };

  function allowed(state: FireSession["state"]): Action["type"][] {
    const map: any = {
      READY: ["DELIVER_NOW", "MARK_OUT", "SET_BUFFER", "SET_ZONE", "CANCEL", "ADD_ITEM"],
      OUT: ["MARK_DELIVERED", "SET_BUFFER", "SET_ZONE", "REASSIGN_RUNNER", "CANCEL", "UNDO"],
      DELIVERED: ["START_ACTIVE", "UNDO"],
      ACTIVE: ["CLOSE", "EXTEND_MIN", "ADD_ITEM", "UNDO"],
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

  // Format session timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Only show BOH content if it should be displayed
  if (viewMode === "BOH" && !shouldShowBOH) {
    return (
      <div className="rounded-xl border border-[#2a2f4a] bg-[#0f1433] p-4 opacity-50">
        <div className="text-center text-[#8a94a8]">
          <div className="text-2xl mb-2">⏳</div>
          <div className="text-sm">Waiting for qualified status...</div>
          <div className="text-xs mt-1">Table {s.table} - {s.state}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#2a2f4a] bg-[#0f1433] p-4 hover:bg-[#1a1f3a] transition-colors">
      {/* Header with Table and Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold text-lg text-[#8ff4c2]">Table {s.table}</div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            s.state === 'READY' ? 'bg-green-900/30 text-green-300 border border-green-700' :
            s.state === 'OUT' ? 'bg-orange-900/30 text-orange-300 border border-orange-700' :
            s.state === 'DELIVERED' ? 'bg-blue-900/30 text-blue-300 border border-blue-700' :
            s.state === 'ACTIVE' ? 'bg-purple-900/30 text-purple-300 border border-purple-700' :
            'bg-gray-900/30 text-gray-300 border border-gray-700'
          }`}>
            {s.state}
          </span>
          <span className="text-xs text-[#aab6ff]">• Trust: {user.trustLevel}</span>
        </div>
      </div>

      {/* Customer and Position Info */}
      <div className="grid grid-cols-2 gap-2 text-sm text-[#b8c2ff] mb-3">
        <div>Customer: <span className="text-[#e9ecff] font-medium">{s.customerLabel}</span></div>
        <div>Position: <span className="text-[#e9ecff] font-medium">{s.position}</span></div>
      </div>

      {/* Session Details */}
      <div className="grid grid-cols-2 gap-2 text-sm text-[#b8c2ff] mb-3">
        <div>Duration: <span className="text-[#e9ecff]">{s.durationMin}m</span></div>
        <div>ETA: <span className="text-[#e9ecff]">{s.etaMin}m</span></div>
        <div>Items: <span className="text-[#e9ecff]">{s.items}</span></div>
        <div>Amount: <span className="text-[#e9ecff] font-medium">${s.currentAmount}</span></div>
      </div>

      {/* Session Timer (if active) */}
      {s.state === "ACTIVE" && s.sessionTimer && (
        <div className="mb-3 p-2 bg-[#1a1f3a] rounded-lg border border-[#2a3570]">
          <div className="text-center">
            <div className="text-lg font-mono text-[#8ff4c2]">{formatTimer(s.sessionTimer)}</div>
            <div className="text-xs text-[#aab6ff]">Session Timer</div>
          </div>
        </div>
      )}

      {/* Guest Timer Display (Real-time for customers) */}
      {s.guestTimerDisplay && s.sessionTimer && (
        <div className="mb-3 p-3 bg-gradient-to-r from-[#1a1f3a] to-[#2a3570] rounded-lg border border-[#8ff4c2]">
          <div className="text-center">
            <div className="text-2xl font-mono text-[#8ff4c2] font-bold">{formatTimer(s.sessionTimer)}</div>
            <div className="text-sm text-[#aab6ff]">Guest Session Timer</div>
            <div className="text-xs text-[#8a94a8] mt-1">Visible to customers via QR/mobile</div>
          </div>
        </div>
      )}

      {/* Flavor and Add-ons */}
      <div className="mb-3">
        <div className="text-sm text-[#b8c2ff] mb-1">Flavor:</div>
        <div className="text-[#e9ecff] font-medium mb-2">{s.flavor}</div>
        {s.addOns.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {s.addOns.map((addon, index) => (
              <span key={index} className="text-xs bg-[#2a3570] text-[#aab6ff] px-2 py-1 rounded">
                {addon}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Assigned Staff */}
      {s.assignedStaff && (
        <div className="mb-3 p-2 bg-[#1a1f3a] rounded-lg border border-[#2a3570]">
          <div className="text-xs text-[#aab6ff] mb-1">Assigned Staff:</div>
          <div className="text-[#e9ecff] font-medium">{s.assignedStaff}</div>
        </div>
      )}

      {/* BOH State (if in BOH view and should be shown) */}
      {viewMode === "BOH" && shouldShowBOH && s.bohState && (
        <div className="mb-3 p-2 bg-[#1a1f3a] rounded-lg border border-[#2a3570]">
          <div className="text-xs text-[#aab6ff] mb-1">BOH Status:</div>
          <div className={`text-[#e9ecff] font-medium ${
            s.bohState === 'WARMING_UP' ? 'text-orange-300' :
            s.bohState === 'READY_FOR_PICKUP' ? 'text-green-300' :
            s.bohState === 'PICKED_UP' ? 'text-blue-300' :
            'text-gray-300'
          }`}>
            {s.bohState.replace('_', ' ')}
          </div>
        </div>
      )}

      {/* Zone (removed delivery buffer) */}
      <div className="mb-3 flex flex-wrap">
        <Chip>Zone: <b>{s.zone}</b></Chip>
      </div>

      {/* Actions - Different for FOH vs BOH */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {viewMode === "FOH" ? (
          // FOH Actions
          <>
            {/* Primary flow */}
            <button
              disabled={disabled("DELIVER_NOW")}
              onClick={() => postAction(s.id, { type: "DELIVER_NOW" })}
              className="rounded-md border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40 transition-colors"
              title={`Requires ${getTrustRequirement("DELIVER_NOW")} trust level`}
            >
              🚀 Deliver Now
            </button>
            <button
              disabled={disabled("MARK_OUT")}
              onClick={() => postAction(s.id, { type: "MARK_OUT" })}
              className="rounded-md border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40 transition-colors"
              title={`Requires ${getTrustRequirement("MARK_OUT")} trust level`}
            >
              📤 Mark Out
            </button>

            <button 
              disabled={disabled("MARK_DELIVERED")} 
              onClick={() => postAction(s.id, { type: "MARK_DELIVERED" })} 
              className="rounded-md border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40 transition-colors"
            >
              ✅ Mark Delivered
            </button>
            <button 
              disabled={disabled("START_ACTIVE")} 
              onClick={() => postAction(s.id, { type: "START_ACTIVE" })} 
              className="rounded-md border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40 transition-colors"
            >
              ▶️ Start Active
            </button>

            <button
              disabled={disabled("CLOSE")}
              onClick={() => postAction(s.id, { type: "CLOSE" })}
              className="rounded-md border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40 transition-colors"
              title={`Requires ${getTrustRequirement("CLOSE")} trust level`}
            >
              🔚 Close
            </button>
            <button
              disabled={disabled("UNDO")}
              onClick={() => postAction(s.id, { type: "UNDO" })}
              className="rounded-md border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40 transition-colors"
              title={`Requires ${getTrustRequirement("UNDO")} trust level`}
            >
              ↩️ Undo
            </button>
          </>
        ) : (
          // BOH Actions
          <>
            <button
              disabled={s.bohState !== "WARMING_UP"}
              onClick={() => postAction(s.id, { type: "MARK_DELIVERED" })}
              className="rounded-md border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40 transition-colors"
            >
              🔥 Ready for Pickup
            </button>
            <button
              disabled={s.bohState !== "READY_FOR_PICKUP"}
              onClick={() => postAction(s.id, { type: "START_ACTIVE" })}
              className="rounded-md border border-[#2a3570] bg-[#17204a] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40 transition-colors"
            >
              📦 Picked Up
            </button>
          </>
        )}

        {/* Common Controls */}
        {[5, 10, 15].map(sec => (
          <button 
            key={sec} 
            disabled={disabled("SET_BUFFER")} 
            onClick={() => postAction(s.id, { type: "SET_BUFFER", value: sec })} 
            className="rounded-md border border-[#2a3570] bg-[#0f183f] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40 transition-colors"
          >
            ⏱️ Buffer {sec}s
          </button>
        ))}
        {(["A", "B", "C", "D", "E"] as DeliveryZone[]).map(z => (
          <button 
            key={z} 
            disabled={disabled("SET_ZONE")} 
            onClick={() => postAction(s.id, { type: "SET_ZONE", value: z })} 
            className={`rounded-md border border-[#2a3570] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40 transition-colors ${
              s.zone === z ? "bg-[#1b2658]" : "bg-[#0f183f]"
            }`}
          >
            🗺️ Zone {z}
          </button>
        ))}

        {/* Secondary Actions */}
        <button 
          disabled={disabled("ADD_ITEM")} 
          onClick={() => onShowFlavorSelector(s.id)} 
          className="rounded-md border border-[#2a3570] bg-[#0f183f] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40 transition-colors"
        >
          ➕ + Item
        </button>
        <button 
          disabled={disabled("EXTEND_MIN")} 
          onClick={() => postAction(s.id, { type: "EXTEND_MIN", value: 5 })} 
          className="rounded-md border border-[#2a3570] bg-[#0f183f] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40 transition-colors"
        >
          ⏰ Extend 5m
        </button>
        <button 
          disabled={disabled("REASSIGN_RUNNER")} 
          onClick={() => postAction(s.id, { type: "REASSIGN_RUNNER", value: "runner_2" })} 
          className="rounded-md border border-[#2a3570] bg-[#0f183f] px-3 py-2 text-sm hover:bg-[#1b2658] disabled:opacity-40 transition-colors"
        >
          👤 Reassign Runner
        </button>
        <button 
          disabled={disabled("CANCEL")} 
          onClick={() => postAction(s.id, { type: "CANCEL" })} 
          className="rounded-md border-rose-800 bg-rose-900/30 px-3 py-2 text-sm hover:bg-rose-900/50 disabled:opacity-40 transition-colors"
        >
          ❌ Cancel
        </button>
      </div>
    </div>
  );
}
