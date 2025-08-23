"use client";
import { useEffect, useState } from "react";
import LoungeLayout from "../../components/LoungeLayout";
import HookahRoomDashboard from "../../components/HookahRoomDashboard";
import GlobalNavigation from "../../components/GlobalNavigation";

type Session = {
  id: string;
  tableId?: string;
  flavor?: string;
  amount: number;
  status: string;
  createdAt: number;
  sessionStartTime?: number;
  sessionDuration?: number;
  coalStatus?: "active" | "needs_refill" | "burnt_out";
  addOnFlavors?: string[];
  baseRate?: number;
  addOnRate?: number;
  totalRevenue?: number;
  customerName?: string;
  customerId?: string;
  customerPreferences?: {
    favoriteFlavors?: string[];
    sessionDuration?: number;
    addOnPreferences?: string[];
    notes?: string;
  };
  previousSessions?: string[];
  tableType?: "high_boy" | "table" | "2x_booth" | "4x_booth" | "8x_sectional" | "4x_sofa";
  tablePosition?: { x: number; y: number };
  refillTimerStart?: number;
  sessionPauseTime?: number;
  totalPausedTime?: number;
  // Delivery workflow fields
  deliveryStatus?: "preparing" | "ready" | "delivered";
  deliveryStartTime?: number;
  actualDeliveryTime?: number;
  hookahRoomStaff?: string;
  deliveryConfirmedBy?: string;
  deliveryConfirmedAt?: number;
};

export default function SessionsDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refillTimers, setRefillTimers] = useState<Record<string, number>>({});
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'success' | 'error', timestamp: number}>>([]);

  // Function to add table positions to sessions
  function addTablePositions(sessions: Session[]): Session[] {
    const tablePositions = [
      { x: 50, y: 100 },   // T-1
      { x: 150, y: 100 },  // T-2
      { x: 250, y: 100 },  // T-3
      { x: 350, y: 100 },  // T-4
      { x: 450, y: 100 },  // T-5
      { x: 550, y: 100 },  // T-6
      { x: 50, y: 200 },   // T-7
      { x: 150, y: 200 },  // T-8
      { x: 250, y: 200 },  // T-9
      { x: 350, y: 200 },  // T-10
      { x: 450, y: 200 },  // T-11
      { x: 550, y: 200 },  // T-12
      { x: 50, y: 300 },   // Bar-1
      { x: 150, y: 300 },  // Bar-2
      { x: 250, y: 300 },  // Bar-3
      { x: 350, y: 300 },  // Bar-4
      { x: 450, y: 300 },  // Bar-5
      { x: 550, y: 300 },  // Bar-6
    ];

    return sessions.map((session, index) => ({
      ...session,
      tablePosition: tablePositions[index % tablePositions.length],
      tableType: session.tableType || (session.tableId?.startsWith('Bar') ? 'high_boy' : 'table'),
      coalStatus: session.coalStatus || 'active'
    }));
  }

  // Function to generate demo sessions with table positions
  function generateDemoSessions(): Session[] {
    const demoSessions: Session[] = [
      {
        id: 'demo-1',
        tableId: 'T-7',
        flavor: 'Blue Mist',
        amount: 3200,
        status: 'active',
        createdAt: Date.now(),
        sessionStartTime: Date.now() - 1800000, // 30 minutes ago
        sessionDuration: 1800000,
        coalStatus: 'active',
        customerName: 'Demo Customer 1',
        tableType: 'table',
        tablePosition: { x: 50, y: 200 },
        deliveryStatus: 'delivered',
        deliveryStartTime: Date.now() - 2000000, // 33 minutes ago
        actualDeliveryTime: Date.now() - 1980000, // 33 minutes ago
        hookahRoomStaff: 'John D.',
        deliveryConfirmedBy: 'Sarah M.',
        deliveryConfirmedAt: Date.now() - 1980000
      },
      {
        id: 'demo-2',
        tableId: 'Bar-3',
        flavor: 'Mint Storm',
        amount: 4500,
        status: 'active',
        createdAt: Date.now() - 900000, // 15 minutes ago
        sessionStartTime: Date.now() - 900000,
        sessionDuration: 900000,
        coalStatus: 'needs_refill',
        customerName: 'Demo Customer 2',
        tableType: 'high_boy',
        tablePosition: { x: 250, y: 300 },
        deliveryStatus: 'ready',
        deliveryStartTime: Date.now() - 1200000, // 20 minutes ago
        hookahRoomStaff: 'Mike R.'
      },
      {
        id: 'demo-3',
        tableId: 'T-12',
        flavor: 'Double Apple',
        amount: 2800,
        status: 'active',
        createdAt: Date.now() - 3600000, // 1 hour ago
        sessionStartTime: Date.now() - 3600000,
        sessionDuration: 3600000,
        coalStatus: 'burnt_out',
        customerName: 'Demo Customer 3',
        tableType: 'table',
        tablePosition: { x: 550, y: 200 },
        deliveryStatus: 'preparing',
        deliveryStartTime: Date.now() - 3500000, // 58 minutes ago
        hookahRoomStaff: 'Lisa K.'
      }
    ];

    return demoSessions;
  }

  async function fetchSessions() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/sessions", { 
        cache: "no-store",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const json = await res.json();
      if (json.success) {
        const sessionsWithPositions = addTablePositions(json.sessions || []);
        setSessions(sessionsWithPositions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      // Fallback to demo data with positions
      const demoSessions = generateDemoSessions();
      setSessions(demoSessions);
    } finally {
      setIsLoading(false);
    }
  }

  // Update refill timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      const timers: Record<string, number> = {};
      sessions.forEach(session => {
        if (session.coalStatus === 'needs_refill' && session.refillTimerStart) {
          const elapsed = Date.now() - session.refillTimerStart;
          const remaining = 10000 - elapsed; // 10 seconds total
          timers[session.id] = Math.max(0, Math.ceil(remaining / 1000));
        }
      });
      setRefillTimers(timers);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessions]);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Function to get table type display name
  function getTableTypeDisplay(tableType?: string) {
    switch (tableType) {
      case 'high_boy': return 'High Boy';
      case 'table': return 'Table';
      case '2x_booth': return '2x Booth';
      case '4x_booth': return '4x Booth';
      case '8x_sectional': return '8x Sectional';
      case '4x_sofa': return '4x Sofa';
      default: return 'Table';
    }
  }

  // Function to get table type color
  function getTableTypeColor(tableType?: string) {
    switch (tableType) {
      case 'high_boy': return 'text-blue-400';
      case 'table': return 'text-green-400';
      case '2x_booth': return 'text-yellow-400';
      case '4x_booth': return 'text-orange-400';
      case '8x_sectional': return 'text-purple-400';
      case '4x_sofa': return 'text-pink-400';
      default: return 'text-gray-400';
    }
  }

  // Function to get coal status color
  function getCoalStatusColor(status?: string) {
    switch (status) {
      case 'active': return 'bg-green-600 text-white';
      case 'needs_refill': return 'bg-yellow-600 text-white';
      case 'burnt_out': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  }

  // Function to get coal status text
  function getCoalStatusText(status: string) {
    switch (status) {
      case 'active': return 'ACTIVE';
      case 'needs_refill': return 'NEEDS REFILL';
      case 'burnt_out': return 'BURNT OUT';
      default: return 'UNKNOWN';
    }
  }

  // Function to get session timer
  function getSessionTimer(startTime: number, duration: number, coalStatus?: string, refillStart?: number, totalPaused?: number) {
    if (coalStatus === 'burnt_out') {
      return 'PAUSED';
    }
    
    const now = Date.now();
    const elapsed = now - startTime;
    const adjustedElapsed = totalPaused ? elapsed - totalPaused : elapsed;
    
    const hours = Math.floor(adjustedElapsed / 3600000);
    const minutes = Math.floor((adjustedElapsed % 3600000) / 60000);
    const seconds = Math.floor((adjustedElapsed % 60000) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Function to handle coal actions (refill, resume, etc.)
  async function handleCoalAction(sessionId: string, currentStatus?: string) {
    try {
      let newStatus: "active" | "needs_refill" | "burnt_out";
      let refillTimerStart: number | undefined;
      
      if (currentStatus === 'needs_refill') {
        newStatus = 'active'; // Complete refill
        refillTimerStart = undefined;
      } else if (currentStatus === 'burnt_out') {
        newStatus = 'active'; // Resume session
        refillTimerStart = undefined;
      } else {
        newStatus = 'needs_refill'; // Request refill
        refillTimerStart = Date.now();
      }



      // Update local state immediately for better UX
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { 
              ...s, 
              coalStatus: newStatus,
              refillTimerStart,
              sessionPauseTime: undefined,
              totalPausedTime: s.totalPausedTime || 0
            }
          : s
      ));

      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_coal_status',
          sessionId,
          data: { 
            status: newStatus,
            refillTimerStart,
            sessionPauseTime: undefined
          }
        })
      });

      if (res.ok) {
        const actionText = newStatus === 'needs_refill' ? 'Refill requested' : 
                          newStatus === 'active' ? 'Session resumed' : 'Refill completed';
        showNotification(`${actionText} for ${sessions.find(s => s.id === sessionId)?.tableId || 'table'}`, 'success');
        
        // Small delay to show the state change before refreshing
        setTimeout(() => {
          fetchSessions();
        }, 500);
      }
    } catch (error) {
      console.error('Error updating coal status:', error);
      // Revert local state on error
      await fetchSessions();
    }
  }

  // Function to show notifications
  function showNotification(message: string, type: 'success' | 'error' = 'success') {
    const id = Math.random().toString(36).substr(2, 9);
    const notification = { id, message, type, timestamp: Date.now() };
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }

  // Function to generate demo data
  function generateDemoData() {
    const newDemoSessions = generateDemoSessions();
    setSessions(newDemoSessions);
    showNotification('Demo data generated successfully!', 'success');
  }

  // Function to simulate mobile QR workflow order
  function generateMobileOrder() {
    const mobileOrder: Session = {
      id: `mobile-${Date.now()}`,
      tableId: `T-${Math.floor(Math.random() * 12) + 1}`,
      flavor: 'Double Apple + Mint',
      amount: 3200,
      status: 'active',
      createdAt: Date.now(),
      sessionStartTime: Date.now(),
      sessionDuration: 0,
      coalStatus: 'active',
      customerName: `Mobile Customer ${Math.floor(Math.random() * 100) + 1}`,
      customerId: `cust_${Math.random().toString(36).substr(2, 9)}`,
      tableType: 'table',
      tablePosition: { x: 50 + Math.floor(Math.random() * 500), y: 100 + Math.floor(Math.random() * 200) },
      deliveryStatus: 'delivered',
      deliveryStartTime: Date.now() - 300000, // 5 minutes ago
      actualDeliveryTime: Date.now() - 240000, // 4 minutes ago
      hookahRoomStaff: 'John D.',
      deliveryConfirmedBy: 'Sarah M.',
      deliveryConfirmedAt: Date.now() - 240000
    };

    setSessions(prev => [mobileOrder, ...prev]);
    showNotification(`Mobile order created for ${mobileOrder.tableId}! Customer completed QR workflow.`, 'success');
  }

  // Function to end session
  async function endSession(sessionId: string) {
    try {
      // Update local state immediately for better UX
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, status: 'ended', coalStatus: 'burnt_out' as const }
          : s
      ));

      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end_session',
          sessionId
        })
      });

      if (res.ok) {
        showNotification(`Session ended for ${sessions.find(s => s.id === sessionId)?.tableId || 'table'}`, 'success');
        await fetchSessions(); // Refresh data
      }
    } catch (error) {
      console.error('Error ending session:', error);
      showNotification('Failed to end session', 'error');
      // Revert local state on error
      await fetchSessions();
    }
  }

  // Function to confirm delivery
  async function confirmDelivery(sessionId: string) {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm_delivery',
          sessionId,
          data: { 
            confirmedBy: 'Staff Member',
            confirmedAt: Date.now()
          }
        })
      });

      if (res.ok) {
        await fetchSessions(); // Refresh data
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <GlobalNavigation />
      <div className="p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-2 border-teal-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🌿</div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-teal-400 drop-shadow-lg">HOOKAH+</h1>
                  <h2 className="text-xl text-zinc-300 drop-shadow-md">PREP ROOM DASHBOARD</h2>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={fetchSessions}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-800 disabled:to-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 hover:scale-105 disabled:scale-100"
                >
                  {isLoading ? '🔄' : '🔄'} Refresh
                </button>
                <div className="text-sm text-zinc-400">
                  {sessions.length} Active Sessions
                </div>
                <div className="text-sm text-purple-400 font-medium">
                  🌐 {sessions.filter(s => s.customerId).length} Network Customers
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="fixed top-20 right-4 z-50 space-y-2">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300 ${
                    notification.type === 'success' 
                      ? 'bg-green-600 border border-green-500' 
                      : 'bg-red-600 border border-red-500'
                  }`}
                >
                  {notification.message}
                </div>
              ))}
            </div>
          )}

          {/* Session Summary */}
          {sessions.length > 0 && (
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-2 border-teal-600 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-teal-300 drop-shadow-md">Session Summary</h3>
                <div className="flex gap-3">
                  <button
                    onClick={generateDemoData}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25 hover:scale-105"
                  >
                    🎲 Generate Demo Data
                  </button>
                  <button
                    onClick={generateMobileOrder}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                  >
                    📱 Simulate Mobile Order
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {sessions.filter(s => s.coalStatus === 'active').length}
                  </div>
                  <div className="text-zinc-400 text-sm">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {sessions.filter(s => s.coalStatus === 'needs_refill').length}
                  </div>
                  <div className="text-zinc-400 text-sm">Need Refill</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {sessions.filter(s => s.coalStatus === 'burnt_out').length}
                  </div>
                  <div className="text-zinc-400 text-sm">Paused (Burnt Out)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    ${(sessions.reduce((sum, s) => sum + (s.totalRevenue || s.amount), 0) / 100).toFixed(2)}
                  </div>
                  <div className="text-zinc-400 text-sm">Total Revenue</div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile QR Workflow */}
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-2 border-emerald-600 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-emerald-300 mb-4 drop-shadow-md">📱 Mobile QR Workflow - Customer Journey</h3>
            <p className="text-zinc-400 mb-6 text-center">Staff can see the complete customer experience from QR scan to confirmation</p>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {/* Step 1: QR Scan */}
              <div className="bg-zinc-800 rounded-lg p-4 text-center border border-emerald-600/30">
                <div className="text-3xl mb-2">📱</div>
                <div className="text-sm font-semibold text-emerald-300">1. QR Scan</div>
                <div className="text-xs text-zinc-400 mt-1">Customer scans table QR</div>
              </div>
              
              {/* Step 2: Flavor Selection */}
              <div className="bg-zinc-800 rounded-lg p-4 text-center border border-emerald-600/30">
                <div className="text-3xl mb-2">🍃</div>
                <div className="text-sm font-semibold text-emerald-300">2. Flavor Pick</div>
                <div className="text-xs text-zinc-400 mt-1">AI recommendations</div>
              </div>
              
              {/* Step 3: Checkout */}
              <div className="bg-zinc-800 rounded-lg p-4 text-center border border-emerald-600/30">
                <div className="text-3xl mb-2">💳</div>
                <div className="text-sm font-semibold text-emerald-300">3. Stripe Pay</div>
                <div className="text-xs text-zinc-400 mt-1">Secure payment</div>
              </div>
              
              {/* Step 4: Confirmation */}
              <div className="bg-zinc-800 rounded-lg p-4 text-center border border-emerald-600/30">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-sm font-semibold text-emerald-300">4. Confirm</div>
                <div className="text-xs text-zinc-400 mt-1">Instant notification</div>
              </div>
              
              {/* Step 5: Dashboard */}
              <div className="bg-zinc-800 rounded-lg p-4 text-center border border-emerald-600/30">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-sm font-semibold text-emerald-300">5. Monitor</div>
                <div className="text-xs text-zinc-400 mt-1">Real-time tracking</div>
              </div>
            </div>
            
            <div className="text-center">
              <a
                href="/demo-flow"
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 hover:scale-105"
              >
                🎯 Experience Full Customer Journey
              </a>
            </div>
          </div>

          {/* Mobile Order Status */}
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-2 border-pink-600 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-pink-300 mb-4 drop-shadow-md">📱 Mobile Order Status</h3>
            
            {/* 1-Minute Timer for Mobile Order Simulation */}
            <div className="mb-4 bg-zinc-800 rounded-lg p-4 border border-pink-600/30">
              <div className="flex items-center justify-between">
                <div className="text-pink-300 font-medium">⏱️ Mobile Order Simulation Timer</div>
                <div className="text-2xl font-bold text-pink-400" id="mobileTimer">01:00</div>
                <button
                  onClick={() => {
                    // Reset timer to 1 minute
                    let timeLeft = 60;
                    const timerElement = document.getElementById('mobileTimer');
                    const interval = setInterval(() => {
                      timeLeft--;
                      if (timerElement) {
                        const minutes = Math.floor(timeLeft / 60);
                        const seconds = timeLeft % 60;
                        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                      }
                      
                      if (timeLeft <= 0) {
                        clearInterval(interval);
                        if (timerElement) timerElement.textContent = "00:00";
                        // Auto-generate mobile order when timer expires
                        const mobileOrder = {
                          id: `mobile_${Date.now()}`,
                          tableId: `T-${Math.floor(Math.random() * 10) + 1}`,
                          flavor: ['Double Apple', 'Mint', 'Strawberry', 'Grape'][Math.floor(Math.random() * 4)],
                          amount: 2500 + Math.floor(Math.random() * 2000),
                          status: 'paid',
                          createdAt: Date.now(),
                          customerName: `Auto Customer ${Math.floor(Math.random() * 100)}`,
                          customerId: `cust_${Math.floor(Math.random() * 1000)}`
                        };
                        
                        // Create session and show notification
                        const sessionId = `mobile_${mobileOrder.tableId}_${Date.now()}`;
                        fetch(`/api/sessions/${sessionId}/command`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ 
                            cmd: "PAYMENT_CONFIRMED",
                            data: { 
                              table: mobileOrder.tableId,
                              customerId: mobileOrder.customerId,
                              flavor: mobileOrder.flavor,
                              amount: mobileOrder.amount
                            }
                          })
                        }).then(() => {
                          showNotification(`⏰ Timer expired! Auto-generated mobile order for ${mobileOrder.tableId}`, 'success');
                          // Refresh sessions to show new order
                          setTimeout(() => window.location.reload(), 1000);
                        });
                      }
                    }, 1000);
                  }}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  🔄 Reset Timer
                </button>
              </div>
              <div className="text-xs text-zinc-400 mt-2 text-center">
                Timer automatically generates mobile orders for FOH/BOH transparency
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-zinc-800 rounded-lg p-4 text-center border border-pink-600/30">
                <div className="text-2xl font-bold text-pink-400">
                  {sessions.filter(s => s.status === 'active' && s.coalStatus === 'active').length}
                </div>
                <div className="text-sm text-zinc-400">Active Orders</div>
                <div className="text-xs text-pink-300 mt-1">Mobile + Staff</div>
              </div>
              
              <div className="bg-zinc-800 rounded-lg p-4 text-center border border-pink-600/30">
                <div className="text-2xl font-bold text-blue-400">
                  {sessions.filter(s => s.customerId).length}
                </div>
                <div className="text-sm text-zinc-400">Mobile Orders</div>
                <div className="text-xs text-blue-300 mt-1">QR Code Customers</div>
              </div>
              
              <div className="bg-zinc-800 rounded-lg p-4 text-center border border-pink-600/30">
                <div className="text-2xl font-bold text-green-400">
                  {sessions.filter(s => s.deliveryStatus === 'delivered').length}
                </div>
                <div className="text-sm text-zinc-400">Delivered</div>
                <div className="text-xs text-green-300 mt-1">Ready to Start</div>
              </div>
              
              <div className="bg-zinc-800 rounded-lg p-4 text-center border border-pink-600/30">
                <div className="text-2xl font-bold text-purple-400">
                  ${(sessions.reduce((sum, s) => sum + (s.totalRevenue || s.amount), 0) / 100).toFixed(2)}
                </div>
                <div className="text-sm text-zinc-400">Mobile Revenue</div>
                <div className="text-xs text-purple-300 mt-1">Today's Total</div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <div className="text-sm text-zinc-400">
                💡 <strong>Pro Tip:</strong> Mobile orders appear automatically when customers complete QR workflow
              </div>
              <div className="text-xs text-pink-300 mt-2">
                🔗 <strong>FOH/BOH Link:</strong> Orders sync instantly across all dashboards for transparency
              </div>
            </div>
          </div>

          {/* Mobile Workflow Simulation */}
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-2 border-cyan-600 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4 drop-shadow-md">🎬 Live Mobile Workflow Simulation</h3>
            <p className="text-zinc-400 mb-6 text-center">Watch a customer go through the complete QR workflow in real-time</p>
            
            <div className="bg-zinc-800 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Step 1: QR Scan */}
                <div className="text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <div className="text-sm font-semibold text-cyan-300">QR Scan</div>
                  <div className="text-xs text-zinc-400 mt-1">Customer scans table</div>
                  <div className="mt-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 mx-auto"></div>
                  </div>
                </div>
                
                {/* Step 2: Flavor Selection */}
                <div className="text-center">
                  <div className="text-4xl mb-2">🍃</div>
                  <div className="text-sm font-semibold text-cyan-300">Flavor Pick</div>
                  <div className="text-xs text-zinc-400 mt-1">AI recommendations</div>
                  <div className="mt-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 mx-auto"></div>
                  </div>
                </div>
                
                {/* Step 3: Checkout */}
                <div className="text-center">
                  <div className="text-4xl mb-2">💳</div>
                  <div className="text-sm font-semibold text-cyan-300">Stripe Pay</div>
                  <div className="text-xs text-zinc-400 mt-1">Secure payment</div>
                  <div className="mt-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 mx-auto"></div>
                  </div>
                </div>
                
                {/* Step 4: Confirmation */}
                <div className="text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <div className="text-sm font-semibold text-cyan-300">Confirm</div>
                  <div className="text-xs text-zinc-400 mt-1">Instant notification</div>
                  <div className="mt-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 mx-auto"></div>
                  </div>
                </div>
                
                {/* Step 5: Dashboard */}
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div className="text-sm font-semibold text-cyan-300">Monitor</div>
                  <div className="text-xs text-zinc-400 mt-1">Real-time tracking</div>
                  <div className="mt-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 mx-auto"></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <div className="text-sm text-green-400 mb-2">
                  ✅ <strong>Workflow Complete!</strong> Customer order appears in sessions above
                </div>
                <div className="text-xs text-zinc-400">
                  This simulates the complete customer journey from QR scan to order confirmation
                </div>
              </div>
            </div>
          </div>

          {/* Sessions Grid */}
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-2 border-yellow-600 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-yellow-300 mb-4 drop-shadow-md">Active Sessions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <div 
                  key={session.id} 
                  id={`session-${session.id}`}
                  className={`bg-zinc-900 border-2 rounded-xl p-6 space-y-4 transition-all duration-200 ${
                    session.status === 'ended' 
                      ? 'border-red-600 bg-zinc-800/50' 
                      : session.coalStatus === 'needs_refill'
                      ? 'border-yellow-500 bg-zinc-900'
                      : session.coalStatus === 'burnt_out'
                      ? 'border-orange-500 bg-zinc-900'
                      : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
                  }`}
                >
                  {/* Table Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {session.tableId || 'Unknown Table'}
                      </h3>
                      <div className={`text-sm font-medium ${getTableTypeColor(session.tableType)}`}>
                        {getTableTypeDisplay(session.tableType)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-zinc-400">
                        #{session.id.slice(-6)}
                      </div>
                      <div className="text-xs text-teal-400 font-medium">
                        {session.customerName || 'Staff Customer'}
                      </div>
                      {session.customerId && (
                        <div className="text-xs text-blue-400 font-medium mt-1 flex items-center gap-1">
                          📱 Mobile Order
                        </div>
                      )}
                      {session.status === 'ended' && (
                        <div className="text-xs text-red-400 font-medium mt-1">
                          SESSION ENDED
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="text-center">
                    <div className="text-3xl font-mono font-bold text-teal-400">
                      {getSessionTimer(
                        session.sessionStartTime || 0, 
                        session.sessionDuration || 0,
                        session.coalStatus,
                        session.refillTimerStart,
                        session.totalPausedTime
                      )}
                    </div>
                    <div className="text-sm text-zinc-400">
                      {session.coalStatus === 'burnt_out' ? 'Session Paused' : 'Session Timer'}
                    </div>
                    {session.status === 'ended' && (
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                          ENDED
                        </span>
                      </div>
                    )}
                    
                    {/* Mobile Workflow Progress */}
                    {session.customerId && (
                      <div className="mt-3">
                        <div className="text-xs text-blue-400 mb-1">Mobile Workflow Progress</div>
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-xs text-green-400 mt-1">Complete ✓</div>
                      </div>
                    )}
                  </div>

                  {/* Flavor */}
                  <div className="bg-gradient-to-r from-purple-900 to-purple-800 border border-purple-600 rounded-lg p-3">
                    <div className="text-sm text-purple-300 mb-1">Current Flavor</div>
                    <div className="text-white font-medium text-lg">
                      {session.flavor || 'Choose flavors'}
                    </div>
                    {session.addOnFlavors && session.addOnFlavors.length > 0 && (
                      <div className="mt-2 text-sm text-purple-200">
                        + {session.addOnFlavors.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Coal Status */}
                  <div className="bg-gradient-to-r from-blue-900 to-blue-800 border border-blue-600 rounded-lg p-3">
                    <div className="text-sm text-blue-300 mb-2">Status</div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold text-center ${getCoalStatusColor(session.coalStatus)}`}>
                      {getCoalStatusText(session.coalStatus || 'unknown')}
                    </div>
                    {session.coalStatus === 'needs_refill' && refillTimers[session.id] !== undefined && (
                      <div className="mt-2 text-center">
                        <div className="text-xs text-zinc-400 mb-1">Auto-burnout in:</div>
                        <div className={`text-lg font-mono font-bold ${
                          refillTimers[session.id] <= 3 ? 'text-red-400' : 
                          refillTimers[session.id] <= 6 ? 'text-yellow-400' : 'text-orange-400'
                        }`}>
                          {refillTimers[session.id]}s
                        </div>
                        <div className="mt-1">
                          <div className="w-full bg-zinc-700 rounded-full h-1">
                            <div 
                              className={`h-1 rounded-full transition-all duration-1000 ${
                                refillTimers[session.id] <= 3 ? 'bg-red-500' : 
                                refillTimers[session.id] <= 6 ? 'bg-yellow-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${(refillTimers[session.id] / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCoalAction(session.id, session.coalStatus)}
                      disabled={session.status === 'ended'}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        session.coalStatus === 'needs_refill'
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-500/25'
                          : session.coalStatus === 'burnt_out'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25'
                          : 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-orange-500/25'
                      } ${session.status === 'ended' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                    >
                      {session.coalStatus === 'needs_refill' 
                        ? '✅ Complete Refill' 
                        : session.coalStatus === 'burnt_out'
                        ? '▶️ Resume Session'
                        : '🔥 Request Refill'
                      }
                    </button>
                    <button
                      onClick={() => endSession(session.id)}
                      disabled={session.status === 'ended'}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        session.status === 'ended' 
                          ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                          : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/25 hover:scale-105'
                      }`}
                    >
                      {session.status === 'ended' ? 'Session Ended' : '⏹️ End Session'}
                    </button>
                  </div>

                  {/* Delivery Status */}
                  {session.deliveryStatus && (
                    <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 border border-indigo-600 rounded-lg p-3">
                      <div className="text-sm text-indigo-300 mb-2">Delivery Status</div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold text-center ${
                        session.deliveryStatus === 'preparing' ? 'bg-blue-600 text-white' :
                        session.deliveryStatus === 'ready' ? 'bg-green-600 text-white' :
                        session.deliveryStatus === 'delivered' ? 'bg-purple-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {session.deliveryStatus.toUpperCase()}
                      </div>
                      {session.deliveryStatus === 'ready' && (
                        <div className="mt-2 text-center">
                          <button
                            onClick={() => confirmDelivery(session.id)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Confirm Delivery
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Amount */}
                  <div className="bg-gradient-to-r from-green-900 to-green-800 border border-green-600 rounded-lg p-3">
                    <div className="text-sm text-green-300 mb-1">Current Amount</div>
                    <div className="text-white font-bold text-2xl">
                      ${((session.totalRevenue || session.amount) / 100).toFixed(2)}
                    </div>
                  </div>

                  {/* ScreenCoder Integration Info */}
                  {session.tablePosition && (
                    <div className="bg-gradient-to-r from-cyan-900 to-cyan-800 border border-cyan-600 rounded-lg p-3">
                      <div className="text-sm text-cyan-300 mb-1">ScreenCoder Position</div>
                      <div className="text-xs text-cyan-200">
                        X: {session.tablePosition.x}, Y: {session.tablePosition.y}
                      </div>
                      <div className="text-xs text-cyan-400 mt-1 font-medium">
                        Click to view lounge layout
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Hookah Room Dashboard */}
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-2 border-purple-600 rounded-xl shadow-lg">
            <HookahRoomDashboard />
          </div>

          {/* Lounge Layout */}
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-2 border-blue-600 rounded-xl shadow-lg">
            <LoungeLayout 
              sessions={sessions} 
              onTableClick={(session) => {
                // Scroll to session card
                const sessionElement = document.getElementById(`session-${session.id}`);
                if (sessionElement) {
                  sessionElement.scrollIntoView({ behavior: 'smooth' });
                }
              }} 
            />
          </div>


        </div>
      </div>
    </main>
  );
}
