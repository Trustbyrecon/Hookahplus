"use client";

import { useState, useEffect } from "react";
import type { FireSession, User, TrustLevel, DeliveryZone } from "@/app/lib/workflow";
import { demoUsers, canPerformAction } from "@/app/lib/users";

// Enhanced session types for admin management
interface AdminSession extends FireSession {
  paymentStatus: "pending" | "confirmed" | "failed";
  paymentMethod?: string;
  flavorCombinations: string[];
  specialRequests?: string;
  runnerId?: string;
  estimatedCompletion?: number;
  customerNotes?: string;
  priority: "low" | "medium" | "high" | "urgent";
}

// Demo flavor combinations
const FLAVOR_COMBINATIONS = [
  "Double Apple + Mint",
  "Grape + Peach",
  "Strawberry + Watermelon",
  "Blueberry + Vanilla",
  "Orange + Cinnamon",
  "Pineapple + Coconut",
  "Cherry + Lemon",
  "Mango + Passion Fruit",
  "Raspberry + Chocolate",
  "Peach + Honey"
];

// Generate enhanced demo sessions with flavor data
function generateEnhancedDemoSessions(count: number = 10): AdminSession[] {
  const zones = ["A", "B", "C", "D", "E"];
  const positions = ["VIP", "Window", "Bar", "Center", "Corner", "Patio"];
  const states = ["READY", "OUT", "DELIVERED", "ACTIVE", "CLOSE"];
  const priorities = ["low", "medium", "high", "urgent"];
  const paymentMethods = ["card", "cash", "mobile"];
  
  return Array.from({ length: count }, (_, i) => {
    const flavorCount = Math.floor(Math.random() * 3) + 1;
    const flavors: string[] = [];
    for (let j = 0; j < flavorCount; j++) {
      const randomFlavor = FLAVOR_COMBINATIONS[Math.floor(Math.random() * FLAVOR_COMBINATIONS.length)];
      if (!flavors.includes(randomFlavor)) {
        flavors.push(randomFlavor);
      }
    }
    
    return {
      id: `admin_${Date.now()}_${i}`,
      table: `T-${Math.floor(Math.random() * 20) + 1}`,
      customerLabel: `customer_${Math.floor(Math.random() * 900) + 100}`,
      durationMin: Math.floor(Math.random() * 60) + 30,
      bufferSec: [5, 10, 15][Math.floor(Math.random() * 3)],
      zone: zones[Math.floor(Math.random() * zones.length)] as DeliveryZone,
      items: Math.floor(Math.random() * 3) + 1,
      etaMin: Math.floor(Math.random() * 10) + 5,
      position: positions[Math.floor(Math.random() * positions.length)],
      state: states[Math.floor(Math.random() * states.length)] as FireSession["state"],
      createdAt: Date.now() - Math.random() * 86400000,
      updatedAt: Date.now(),
      paymentStatus: ["pending", "confirmed", "failed"][Math.floor(Math.random() * 3)] as "pending" | "confirmed" | "failed",
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      flavorCombinations: flavors,
      specialRequests: Math.random() > 0.7 ? ["Extra ice", "Light on flavor", "Strong mix"][Math.floor(Math.random() * 3)] : undefined,
      runnerId: Math.random() > 0.5 ? `runner_${Math.floor(Math.random() * 5) + 1}` : undefined,
      estimatedCompletion: Date.now() + (Math.random() * 3600000),
      customerNotes: Math.random() > 0.8 ? "VIP customer - handle with care" : undefined,
      priority: priorities[Math.floor(Math.random() * priorities.length)] as "low" | "medium" | "high" | "urgent"
    };
  });
}

export default function AdminControlCenter() {
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AdminSession | null>(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [currentUser] = useState(demoUsers.find(u => u.role === "MANAGER") || demoUsers[0]);
  const [popularFlavors, setPopularFlavors] = useState<{ flavor: string; count: number }[]>([]);

  // Generate popular flavors from sessions
  useEffect(() => {
    if (sessions.length > 0) {
      const flavorCounts: Record<string, number> = {};
      sessions.forEach(session => {
        session.flavorCombinations.forEach(flavor => {
          flavorCounts[flavor] = (flavorCounts[flavor] || 0) + 1;
        });
      });
      
      const sortedFlavors = Object.entries(flavorCounts)
        .map(([flavor, count]) => ({ flavor, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      setPopularFlavors(sortedFlavors);
    }
  }, [sessions]);

  function seedDemoSessions(count: number = 10) {
    const newSessions = generateEnhancedDemoSessions(count);
    setSessions(prev => [...prev, ...newSessions]);
  }

  function seedSingleSession() {
    const newSession = generateEnhancedDemoSessions(1)[0];
    setSessions(prev => [...prev, newSession]);
  }

  function refreshData() {
    // Simulate data refresh
    setSessions(prev => [...prev]);
  }

  function viewSessionDetails(session: AdminSession) {
    setSelectedSession(session);
    setShowSessionDetails(true);
  }

  function updateSessionStatus(sessionId: string, newState: string) {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, state: newState as any, updatedAt: Date.now() } : s
    ));
  }

  function assignRunner(sessionId: string, runnerId: string) {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, runnerId, updatedAt: Date.now() } : s
    ));
  }

  function updatePriority(sessionId: string, priority: string) {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, priority: priority as any, updatedAt: Date.now() } : s
    ));
  }

  // Calculate session statistics
  const sessionStats = {
    total: sessions.length,
    live: sessions.filter(s => s.state !== "CLOSE").length,
    totalOrders: sessions.filter(s => s.paymentStatus === "confirmed").length,
    revenue: sessions.filter(s => s.paymentStatus === "confirmed").length * 25.99 // Mock price
  };

  // Group sessions by state
  const sessionBreakdown = sessions.reduce((acc, session) => {
    acc[session.state] = (acc[session.state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-[#0e1220] text-[#e9ecff] p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#e9ecff]">Admin Control Center</h1>
            <p className="text-lg text-[#aab6ff]">Live Session Management & Analytics Dashboard</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#8ff4c2]">Role: {currentUser.role}</div>
            <div className="text-xs text-[#aab6ff]">Trust Level: {currentUser.trustLevel}</div>
          </div>
        </div>
      </header>

      {/* Reflex Bloom Roadmap */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-[#e9ecff]">Reflex Bloom Roadmap</h2>
        <p className="text-sm text-[#aab6ff] mb-4">MVP Launch - Reflexive Kanban Flow</p>
        
        <div className="grid grid-cols-5 gap-4">
          {/* Seed */}
          <div className="bg-[#0f1433] border border-[#2a3570] rounded-lg p-4">
            <h3 className="text-sm font-medium text-[#8ff4c2] mb-2">Seed</h3>
            <div className="bg-[#1b2658] rounded p-2 mb-2">
              <div className="text-xs text-[#e9ecff]">MB-008: Reflexive Kanban Integration</div>
              <button className="w-full mt-2 bg-[#2a3570] text-[#e9ecff] text-xs px-2 py-1 rounded hover:bg-[#1b2658]">
                Activate
              </button>
            </div>
          </div>

          {/* Activate */}
          <div className="bg-[#0f1433] border border-[#2a3570] rounded-lg p-4">
            <h3 className="text-sm font-medium text-[#ffd700] mb-2">Activate</h3>
            <div className="bg-[#1b2658] rounded p-2 mb-2">
              <div className="text-xs text-[#e9ecff]">MB-004: Stripe Payment Integration</div>
              <div className="text-xs text-[#ffd700]">Reflex Score: 65</div>
              <button className="w-full mt-2 bg-[#2a3570] text-[#e9ecff] text-xs px-2 py-1 rounded hover:bg-[#1b2658]">
                Reflect
              </button>
            </div>
            <div className="bg-[#1b2658] rounded p-2">
              <div className="text-xs text-[#e9ecff]">MB-007: Dynamic Navigation System</div>
              <div className="text-xs text-[#ffd700]">Reflex Score: 73</div>
              <button className="w-full mt-2 bg-[#2a3570] text-[#e9ecff] text-xs px-2 py-1 rounded hover:bg-[#1b2658]">
                Reflect
              </button>
            </div>
          </div>

          {/* Reflect */}
          <div className="bg-[#0f1433] border border-[#2a3570] rounded-lg p-4">
            <h3 className="text-sm font-medium text-[#ff8c00] mb-2">Reflect</h3>
            <div className="bg-[#1b2658] rounded p-2 mb-2">
              <div className="text-xs text-[#e9ecff]">MB-003: Mobile QR Workflow</div>
              <div className="text-xs text-[#ff8c00]">Reflex Score: 78</div>
              <button className="w-full mt-2 bg-[#2a3570] text-[#e9ecff] text-xs px-2 py-1 rounded hover:bg-[#1b2658]">
                Trust Lock
              </button>
            </div>
            <div className="bg-[#1b2658] rounded p-2">
              <div className="text-xs text-[#e9ecff]">MB-006: RCI Calculator & Trust Core</div>
              <div className="text-xs text-[#ff8c00]">Reflex Score: 68</div>
              <button className="w-full mt-2 bg-[#2a3570] text-[#e9ecff] text-xs px-2 py-1 rounded hover:bg-[#1b2658]">
                Trust Lock
              </button>
            </div>
          </div>

          {/* Trust Lock */}
          <div className="bg-[#0f1433] border border-[#2a3570] rounded-lg p-4">
            <h3 className="text-sm font-medium text-[#ff6b6b] mb-2">Trust Lock</h3>
            <div className="bg-[#1b2658] rounded p-2 mb-2">
              <div className="text-xs text-[#e9ecff]">MB-002: Session UI Trust Loop</div>
              <div className="text-xs text-[#ff6b6b]">Reflex Score: 60</div>
              <button className="w-full mt-2 bg-[#2a3570] text-[#e9ecff] text-xs px-2 py-1 rounded hover:bg-[#1b2658]">
                Bloom
              </button>
            </div>
            <div className="bg-[#1b2658] rounded p-2">
              <div className="text-xs text-[#e9ecff]">MB-005: Admin Control Center</div>
              <div className="text-xs text-[#ff6b6b]">Reflex Score: 62</div>
              <button className="w-full mt-2 bg-[#2a3570] text-[#e9ecff] text-xs px-2 py-1 rounded hover:bg-[#1b2658]">
                Bloom
              </button>
            </div>
          </div>

          {/* Bloomed */}
          <div className="bg-[#0f1433] border border-[#2a3570] rounded-lg p-4">
            <h3 className="text-sm font-medium text-[#8ff4c2] mb-2">Bloomed</h3>
            <div className="bg-[#1b2658] rounded p-2">
              <div className="text-xs text-[#e9ecff]">MB-001: Fire Session State Machine</div>
              <div className="text-xs text-[#8ff4c2]">Bloomed: 8/24/2025</div>
              <button className="w-full mt-2 bg-[#8ff4c2] text-[#0e1220] text-xs px-2 py-1 rounded hover:bg-[#7ee4b2]">
                Complete
              </button>
            </div>
          </div>
        </div>

        {/* Bloom Log Summary */}
        <div className="mt-4 flex gap-4 text-sm">
          <span className="text-[#8ff4c2]">Bloomed: 1</span>
          <span className="text-[#ff6b6b]">Trust Locked: 2</span>
          <span className="text-[#ff8c00]">Active: 2</span>
          <span className="text-[#8ff4c2]">Seeded: 1</span>
        </div>
      </section>

      {/* Control Actions */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-[#e9ecff]">Control Actions</h2>
        <div className="flex gap-4">
          <button
            onClick={() => seedDemoSessions(10)}
            className="bg-[#2a3570] text-[#e9ecff] px-4 py-2 rounded-lg hover:bg-[#1b2658] transition-colors"
          >
            Seed 10 Demo Sessions
          </button>
          <button
            onClick={() => seedSingleSession()}
            className="bg-[#2a3570] text-[#e9ecff] px-4 py-2 rounded-lg hover:bg-[#1b2658] transition-colors"
          >
            Seed Single Session
          </button>
          <button
            onClick={refreshData}
            className="bg-[#2a3570] text-[#e9ecff] px-4 py-2 rounded-lg hover:bg-[#1b2658] transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </section>

      {/* KPIs and Session Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* KPIs */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4 text-[#e9ecff]">Key Performance Indicators</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0f1433] border border-[#2a3570] rounded-lg p-4">
              <div className="text-2xl font-bold text-[#8ff4c2]">{sessionStats.total}</div>
              <div className="text-sm text-[#aab6ff]">Total Sessions</div>
            </div>
            <div className="bg-[#0f1433] border border-[#2a3570] rounded-lg p-4">
              <div className="text-2xl font-bold text-[#ffd700]">{sessionStats.live}</div>
              <div className="text-sm text-[#aab6ff]">Live Sessions</div>
            </div>
            <div className="bg-[#0f1433] border border-[#2a3570] rounded-lg p-4">
              <div className="text-2xl font-bold text-[#ff8c00]">{sessionStats.totalOrders}</div>
              <div className="text-sm text-[#aab6ff]">Total Orders</div>
            </div>
            <div className="bg-[#0f1433] border border-[#2a3570] rounded-lg p-4">
              <div className="text-2xl font-bold text-[#8ff4c2]">${sessionStats.revenue.toFixed(2)}</div>
              <div className="text-sm text-[#aab6ff]">Revenue</div>
            </div>
          </div>
        </div>

        {/* Session Breakdown */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4 text-[#e9ecff]">Session Status Breakdown</h2>
          <div className="bg-[#0f1433] border border-[#2a3570] rounded-lg p-4">
            <div className="space-y-2">
              {Object.entries(sessionBreakdown).map(([state, count]) => (
                <div key={state} className="flex justify-between items-center">
                  <span className="text-sm text-[#aab6ff]">{state.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-medium text-[#e9ecff]">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Flavors */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4 text-[#e9ecff]">Popular Flavor Combinations</h2>
          <div className="bg-[#0f1433] border border-[#2a3570] rounded-lg p-4">
            {popularFlavors.length > 0 ? (
              <div className="space-y-2">
                {popularFlavors.map((flavor, index) => (
                  <div key={flavor.flavor} className="flex justify-between items-center">
                    <span className="text-sm text-[#aab6ff]">{flavor.flavor}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#2a3570] rounded-full h-2">
                        <div 
                          className="bg-[#8ff4c2] h-2 rounded-full" 
                          style={{ width: `${(flavor.count / Math.max(...popularFlavors.map(f => f.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-[#e9ecff]">{flavor.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-[#aab6ff]">No flavor data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Live Sessions Table */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-[#e9ecff]">Live Sessions</h2>
        <div className="bg-[#0f1433] border border-[#2a3570] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1b2658]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#e9ecff]">Session ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#e9ecff]">Table</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#e9ecff]">State</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#e9ecff]">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#e9ecff]">Payment</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#e9ecff]">Flavors</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#e9ecff]">Priority</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#e9ecff]">Created</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#e9ecff]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a3570]">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-[#1b2658]">
                    <td className="px-4 py-3 text-sm text-[#aab6ff] font-mono">{session.id.slice(0, 12)}...</td>
                    <td className="px-4 py-3 text-sm text-[#e9ecff]">{session.table}</td>
                                         <td className="px-4 py-3">
                       <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                         session.state === "ACTIVE" ? "bg-blue-900/30 text-blue-300" :
                         session.state === "CLOSE" ? "bg-gray-900/30 text-gray-300" :
                         session.state === "DELIVERED" ? "bg-green-900/30 text-green-300" :
                         "bg-yellow-900/30 text-yellow-300"
                       }`}>
                         {session.state}
                       </span>
                     </td>
                    <td className="px-4 py-3 text-sm text-[#e9ecff]">{session.customerLabel}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        session.paymentStatus === "confirmed" ? "bg-green-900/30 text-green-300" :
                        session.paymentStatus === "pending" ? "bg-yellow-900/30 text-yellow-300" :
                        "bg-red-900/30 text-red-300"
                      }`}>
                        {session.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#aab6ff]">
                      <div className="flex flex-wrap gap-1">
                        {session.flavorCombinations.slice(0, 2).map((flavor, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-[#2a3570] rounded">
                            {flavor.split(' + ')[0]}
                          </span>
                        ))}
                        {session.flavorCombinations.length > 2 && (
                          <span className="px-2 py-1 text-xs bg-[#2a3570] rounded">
                            +{session.flavorCombinations.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        session.priority === "urgent" ? "bg-red-900/30 text-red-300" :
                        session.priority === "high" ? "bg-orange-900/30 text-orange-300" :
                        session.priority === "medium" ? "bg-yellow-900/30 text-yellow-300" :
                        "bg-green-900/30 text-green-300"
                      }`}>
                        {session.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#aab6ff]">
                      {new Date(session.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => viewSessionDetails(session)}
                        className="bg-[#2a3570] text-[#e9ecff] text-xs px-3 py-1 rounded hover:bg-[#1b2658] transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Session Details Modal */}
      {showSessionDetails && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0f1433] border border-[#2a3570] rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#e9ecff]">Session Details</h3>
              <button
                onClick={() => setShowSessionDetails(false)}
                className="text-[#aab6ff] hover:text-[#e9ecff]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-sm font-medium text-[#aab6ff] mb-2">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-[#aab6ff]">Session ID:</span> <span className="text-[#e9ecff]">{selectedSession.id}</span></div>
                  <div><span className="text-[#aab6ff]">Table:</span> <span className="text-[#e9ecff]">{selectedSession.table}</span></div>
                  <div><span className="text-[#aab6ff]">Customer:</span> <span className="text-[#e9ecff]">{selectedSession.customerLabel}</span></div>
                  <div><span className="text-[#aab6ff]">Position:</span> <span className="text-[#e9ecff]">{selectedSession.position}</span></div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#aab6ff] mb-2">Status & Priority</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-[#aab6ff]">State:</span> <span className="text-[#e9ecff]">{selectedSession.state}</span></div>
                  <div><span className="text-[#aab6ff]">Priority:</span> <span className="text-[#e9ecff]">{selectedSession.priority}</span></div>
                  <div><span className="text-[#aab6ff]">Payment:</span> <span className="text-[#e9ecff]">{selectedSession.paymentStatus}</span></div>
                  <div><span className="text-[#aab6ff]">Zone:</span> <span className="text-[#e9ecff]">{selectedSession.zone}</span></div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-[#aab6ff] mb-2">Flavor Combinations</h4>
              <div className="flex flex-wrap gap-2">
                {selectedSession.flavorCombinations.map((flavor, index) => (
                  <span key={index} className="px-3 py-1 bg-[#2a3570] text-[#e9ecff] rounded-full text-sm">
                    {flavor}
                  </span>
                ))}
              </div>
            </div>

            {selectedSession.specialRequests && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-[#aab6ff] mb-2">Special Requests</h4>
                <div className="bg-[#1b2658] p-3 rounded text-sm text-[#e9ecff]">
                  {selectedSession.specialRequests}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h4 className="text-sm font-medium text-[#aab6ff] mb-2">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                                 <select
                   value={selectedSession.state}
                   onChange={(e) => updateSessionStatus(selectedSession.id, e.target.value)}
                   className="bg-[#1b2658] border border-[#2a3570] rounded px-3 py-2 text-sm text-[#e9ecff]"
                 >
                   <option value="READY">Ready</option>
                   <option value="OUT">Out</option>
                   <option value="DELIVERED">Delivered</option>
                   <option value="ACTIVE">Active</option>
                   <option value="CLOSE">Close</option>
                 </select>
                <select
                  value={selectedSession.priority}
                  onChange={(e) => updatePriority(selectedSession.id, e.target.value)}
                  className="bg-[#1b2658] border border-[#2a3570] rounded px-3 py-2 text-sm text-[#e9ecff]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <select
                  value={selectedSession.runnerId || ""}
                  onChange={(e) => assignRunner(selectedSession.id, e.target.value)}
                  className="bg-[#1b2658] border border-[#2a3570] rounded px-3 py-2 text-sm text-[#e9ecff]"
                >
                  <option value="">No Runner</option>
                  <option value="runner_1">Runner 1</option>
                  <option value="runner_2">Runner 2</option>
                  <option value="runner_3">Runner 3</option>
                </select>
                <button
                  onClick={() => setShowSessionDetails(false)}
                  className="bg-[#2a3570] text-[#e9ecff] px-3 py-2 rounded hover:bg-[#1b2658] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
