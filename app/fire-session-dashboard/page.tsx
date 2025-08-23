"use client";

import { useState, useEffect } from "react";
import GlobalNavigation from "../../components/GlobalNavigation";
import { getAllSessions, seedMultipleSessions, type Session, type SessionState } from "@/lib/sessionState";

// Sim Metadata for First-Class User Experience
interface SimMetadata {
  step: number;
  title: string;
  description: string;
  action: string;
  hint: string;
  nextStep?: string;
  isCompleted: boolean;
}

// Enhanced journey steps with operational data
const FOH_JOURNEY: SimMetadata[] = [
  {
    step: 1,
    title: "Welcome to Front of House",
    description: "You're managing customer delivery and table management",
    action: "Generate floor sessions to see live workflow",
    hint: "Click 'Generate 5 Floor Sessions' to populate the floor queue",
    nextStep: "Sessions will appear in Floor Queue",
    isCompleted: false
  },
  {
    step: 2,
    title: "Monitor Floor Queue",
    description: "Watch for sessions ready for delivery",
    action: "Select a session to see available actions",
    hint: "Click on any session card to view details and controls",
    nextStep: "Use Session Controls to manage delivery",
    isCompleted: false
  },
  {
    step: 3,
    title: "Execute Delivery Workflow",
    description: "Move sessions through delivery states with data continuity",
    action: "Use DELIVER_NOW → MARK_DELIVERED → START_ACTIVE",
    hint: "Track customer ID, table position, and workflow execution",
    nextStep: "Monitor active sessions and close when ready",
    isCompleted: false
  },
  {
    step: 4,
    title: "Session Lifecycle Management",
    description: "Handle active sessions and closures with operational tracking",
    action: "Use CLOSE_SESSION for completed sessions",
    hint: "Track session duration, customer satisfaction, and table turnover",
    nextStep: "Return to step 1 for new sessions",
    isCompleted: false
  }
];

const BOH_JOURNEY: SimMetadata[] = [
  {
    step: 1,
    title: "Welcome to Back of House",
    description: "You're managing hookah preparation and prep queue",
    action: "Generate demo data to see prep workflow",
    hint: "Click 'Generate 15 Demo Sessions' to populate the dashboard",
    nextStep: "Sessions will appear in Prep Queue",
    isCompleted: false
  },
  {
    step: 2,
    title: "Monitor Prep Queue",
    description: "Watch for new paid sessions",
    action: "Select a session to begin prep workflow",
    hint: "Click on any session card to view details and controls",
    nextStep: "Use Session Controls to manage prep",
    isCompleted: false
  },
  {
    step: 3,
    title: "Execute Prep Workflow",
    description: "Move sessions through prep states with data tracking",
    action: "Use CLAIM_PREP → HEAT_UP → READY_FOR_DELIVERY",
    hint: "Track customer preferences, flavor mixes, and prep timing",
    nextStep: "Hand off to FOH when ready",
    isCompleted: false
  },
  {
    step: 4,
    title: "Quality Control & Handoff",
    description: "Ensure hookah quality and readiness with operational data",
    action: "Use REMAKE if needed, then READY_FOR_DELIVERY",
    hint: "Track quality metrics, customer feedback, and handoff timing",
    nextStep: "Return to step 1 for new sessions",
    isCompleted: false
  }
];

const FireSessionDashboard = () => {
  const [activeView, setActiveView] = useState<"foh" | "boh">("foh");
  const [selectedRole, setSelectedRole] = useState<string>("staff");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showJourneyGuide, setShowJourneyGuide] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Get current journey based on active view
  const currentJourney = activeView === "foh" ? FOH_JOURNEY : BOH_JOURNEY;
  const currentJourneyStep = currentJourney.find(s => s.step === currentStep);

  // Refresh sessions based on current view
  const refreshSessions = () => {
    const allSessions = getAllSessions();
    console.log("🔄 Refreshing sessions. Total in store:", allSessions.length);
    console.log("📊 All session states:", allSessions.map(s => ({ id: s.id, state: s.state, table: s.table })));
    
    let filteredSessions: Session[] = [];
    
    if (activeView === "foh") {
      // Front of House: sessions ready for delivery, out for delivery, delivered, active, close pending
      // Only show sessions that have progressed through the proper workflow
      filteredSessions = allSessions.filter(s => 
        ["READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED", "ACTIVE", "CLOSE_PENDING"].includes(s.state)
      );
      console.log("🏠 FOH view - filtered sessions:", filteredSessions.length);
    } else {
      // Back of House: sessions in prep, heating, ready for delivery
      // Only show sessions that are in prep workflow
      filteredSessions = allSessions.filter(s => 
        ["PAID_CONFIRMED", "QUEUED_PREP", "PREP_IN_PROGRESS", "HEAT_UP", "READY_FOR_DELIVERY"].includes(s.state)
      );
      console.log("🔧 BOH view - filtered sessions:", filteredSessions.length);
    }
    
    setSessions(filteredSessions);
  };

  useEffect(() => {
    refreshSessions();
    const interval = setInterval(refreshSessions, 5000);
    return () => clearInterval(interval);
  }, [activeView]);

  // Update journey progress based on actions
  useEffect(() => {
    if (sessions.length > 0 && currentStep === 1) {
      markStepComplete(1);
    }
    if (selectedSession && currentStep === 2) {
      markStepComplete(2);
    }
    // Track workflow execution for step 3
    if (currentStep === 3) {
      const workflowExecutions = sessions.filter(s => 
        s.audit.some(a => a.cmd && ['CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE'].includes(a.cmd))
      ).length;
      if (workflowExecutions >= 2) {
        markStepComplete(3);
      }
    }
    // Track session lifecycle completion for step 4
    if (currentStep === 4) {
      const completedSessions = sessions.filter(s => 
        s.state === 'CLOSED' || s.state === 'ACTIVE'
      ).length;
      if (completedSessions >= 1) {
        markStepComplete(4);
      }
    }
  }, [sessions, selectedSession, currentStep]);

  // Enhanced data flow tracking
  const getSessionFlowData = (session: Session) => {
    const flowData = {
      customerId: session.meta.customerId || 'Unknown',
      tablePosition: session.table,
      barGridPosition: getBarGridPosition(session.table),
      sessionDuration: session.audit.length > 0 ? 
        Math.round((Date.now() - session.audit[0].ts) / 60000) : 0,
      workflowSteps: session.audit.filter(a => a.cmd).map(a => a.cmd || ''),
      currentState: session.state,
      estimatedCompletion: getEstimatedCompletion(session.state)
    };
    return flowData;
  };

  // ScreenCoder-inspired bar grid position mapping
  const getBarGridPosition = (tableId: string) => {
    const tableMap: Record<string, { row: number; col: number; zone: string }> = {
      'T-1': { row: 1, col: 1, zone: 'VIP' },
      'T-2': { row: 1, col: 2, zone: 'VIP' },
      'T-3': { row: 2, col: 1, zone: 'Main' },
      'T-4': { row: 2, col: 2, zone: 'Main' },
      'T-5': { row: 2, col: 3, zone: 'Main' },
      'T-6': { row: 3, col: 1, zone: 'Bar' },
      'T-7': { row: 3, col: 2, zone: 'Bar' },
      'T-8': { row: 3, col: 3, zone: 'Bar' },
      'T-9': { row: 4, col: 1, zone: 'Outdoor' },
      'T-10': { row: 4, col: 2, zone: 'Outdoor' }
    };
    return tableMap[tableId] || { row: 0, col: 0, zone: 'Unknown' };
  };

  // Estimate completion time based on current state
  const getEstimatedCompletion = (state: SessionState) => {
    const estimates: Record<string, number> = {
      'PAID_CONFIRMED': 15, // 15 min to prep
      'PREP_IN_PROGRESS': 10, // 10 min to heat
      'HEAT_UP': 8, // 8 min to ready
      'READY_FOR_DELIVERY': 5, // 5 min to deliver
      'OUT_FOR_DELIVERY': 3, // 3 min to delivered
      'DELIVERED': 2, // 2 min to active
      'ACTIVE': 0, // Already active
      'CLOSE_PENDING': 1, // 1 min to close
      'CLOSED': 0 // Already closed
    };
    return estimates[state] || 0;
  };

  const markStepComplete = (step: number) => {
    setCompletedSteps(prev => new Set([...prev, step]));
    if (step < currentJourney.length) {
      setCurrentStep(step + 1);
    }
  };

  // ENHANCED: Generate 5 Floor Sessions specifically for FOH view
  const handleGenerateFloorSessions = async () => {
    // Role-based session generation limits
    const roleLimits: Record<string, number> = {
      'staff': 3,
      'owner': 10,
      'manager': 8,
      'hookah-prep': 5,
      'bar-tender': 5
    };
    
    const sessionLimit = roleLimits[selectedRole] || 5;
    
    setLoading(true);
    try {
      console.log(`🚀 Starting to generate ${sessionLimit} floor sessions for ${selectedRole}...`);
      
      // Generate sessions based on role limit
      for (let i = 0; i < sessionLimit; i++) {
        const tableId = `T-${Math.floor(Math.random() * 20) + 1}`;
        const sessionId = `floor_${tableId}_${Date.now()}_${i}`;
        
        console.log(`📝 Creating session ${i + 1}/5: ${sessionId} for table ${tableId}`);
        
        // Start with PAYMENT_CONFIRMED
        const paymentResponse = await fetch(`/api/sessions/${sessionId}/command`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            cmd: "PAYMENT_CONFIRMED",
            data: { 
              table: tableId,
              customerId: `floor_customer_${Math.floor(Math.random() * 1000)}`,
              flavor: ['Double Apple', 'Mint', 'Strawberry', 'Grape', 'Rose', 'Vanilla'][Math.floor(Math.random() * 6)],
              amount: 2500 + Math.floor(Math.random() * 3000)
            }
          })
        });
        
        if (!paymentResponse.ok) {
          const error = await paymentResponse.json();
          console.error(`❌ Payment confirmation failed for ${sessionId}:`, error);
          continue;
        }
        
        console.log(`✅ Payment confirmed for ${sessionId}`);

        // Progress through BOH workflow to get to floor
        console.log(`🔧 Progressing ${sessionId} through BOH workflow...`);
        
        const claimResponse = await fetch(`/api/sessions/${sessionId}/command`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cmd: "CLAIM_PREP" })
        });
        
        if (!claimResponse.ok) {
          const error = await claimResponse.json();
          console.error(`❌ Claim prep failed for ${sessionId}:`, error);
          continue;
        }
        console.log(`✅ Claim prep successful for ${sessionId}`);
        
        const heatResponse = await fetch(`/api/sessions/${sessionId}/command`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cmd: "HEAT_UP" })
        });
        
        if (!heatResponse.ok) {
          const error = await heatResponse.json();
          console.error(`❌ Heat up failed for ${sessionId}:`, error);
          continue;
        }
        console.log(`✅ Heat up successful for ${sessionId}`);
        
        const readyResponse = await fetch(`/api/sessions/${sessionId}/command`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cmd: "READY_FOR_DELIVERY" })
        });
        
        if (!readyResponse.ok) {
          const error = await readyResponse.json();
          console.error(`❌ Ready for delivery failed for ${sessionId}:`, error);
          continue;
        }
        console.log(`✅ Ready for delivery successful for ${sessionId}`);

        // Randomly distribute floor sessions across different states
        const floorState = Math.random();
        if (floorState > 0.8) {
          // 20% - Ready for Delivery
          // Already in READY_FOR_DELIVERY state
        } else if (floorState > 0.6) {
          // 20% - Out for Delivery
          await fetch(`/api/sessions/${sessionId}/command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cmd: "DELIVER_NOW" })
          });
        } else if (floorState > 0.4) {
          // 20% - Delivered
          await fetch(`/api/sessions/${sessionId}/command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cmd: "DELIVER_NOW" })
          });
          await fetch(`/api/sessions/${sessionId}/command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cmd: "MARK_DELIVERED" })
          });
        } else if (floorState > 0.2) {
          // 20% - Active
          await fetch(`/api/sessions/${sessionId}/command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cmd: "DELIVER_NOW" })
          });
          await fetch(`/api/sessions/${sessionId}/command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cmd: "MARK_DELIVERED" })
          });
          await fetch(`/api/sessions/${sessionId}/command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cmd: "START_ACTIVE" })
          });
        } else {
          // 20% - Close Pending
          await fetch(`/api/sessions/${sessionId}/command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cmd: "DELIVER_NOW" })
          });
          await fetch(`/api/sessions/${sessionId}/command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cmd: "MARK_DELIVERED" })
          });
          await fetch(`/api/sessions/${sessionId}/command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cmd: "START_ACTIVE" })
          });
          await fetch(`/api/sessions/${sessionId}/command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cmd: "CLOSE_SESSION" })
          });
        }
      }
      
      alert(`Generated ${sessionLimit} fire sessions for the floor! Switch to FOH view to see them.`);
      refreshSessions();
      markStepComplete(1);
    } catch (error) {
      console.error("Error generating floor sessions:", error);
      alert("Error generating floor sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDemoData = async () => {
    setLoading(true);
    try {
      console.log("🎯 Starting to generate 15 demo sessions...");
      
      // Generate 15 demo hookah sessions with proper state progression
      for (let i = 0; i < 15; i++) {
        const tableId = `T-${Math.floor(Math.random() * 20) + 1}`;
        const sessionId = `demo_${tableId}_${Date.now()}_${i}`;
        
        console.log(`📝 Creating demo session ${i + 1}/15: ${sessionId} for table ${tableId}`);
        
        // Start with PAYMENT_CONFIRMED to get into proper workflow
        const paymentResponse = await fetch(`/api/sessions/${sessionId}/command`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            cmd: "PAYMENT_CONFIRMED",
            data: { 
              table: tableId,
              customerId: `customer_${Math.floor(Math.random() * 1000)}`,
              flavor: ['Double Apple', 'Mint', 'Strawberry', 'Grape', 'Rose', 'Vanilla'][Math.floor(Math.random() * 6)],
              amount: 2500 + Math.floor(Math.random() * 3000)
            }
          })
        });
        
        if (!paymentResponse.ok) {
          const error = await paymentResponse.json();
          console.error(`❌ Payment confirmation failed for demo ${sessionId}:`, error);
          continue;
        }
        
        console.log(`✅ Payment confirmed for demo ${sessionId}`);

        // Randomly progress some sessions through the workflow
        const randomProgress = Math.random();
        if (randomProgress > 0.7) {
          // Progress to PREP_IN_PROGRESS
          await fetch(`/api/sessions/${sessionId}/command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cmd: "CLAIM_PREP" })
          });
          
          if (randomProgress > 0.85) {
            // Progress to HEAT_UP
            await fetch(`/api/sessions/${sessionId}/command`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cmd: "HEAT_UP" })
            });
            
            if (randomProgress > 0.95) {
              // Progress to READY_FOR_DELIVERY
              await fetch(`/api/sessions/${sessionId}/command`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cmd: "READY_FOR_DELIVERY" })
              });
            }
          }
        }
      }
      
      alert("Generated 15 demo hookah sessions with proper workflow progression! Check both FOH and BOH views.");
      refreshSessions();
      markStepComplete(1);
    } catch (error) {
      console.error("Error generating demo data:", error);
      alert("Error generating demo data");
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state: SessionState) => {
    const colors: Record<string, string> = {
      PAID_CONFIRMED: "bg-blue-500/20 text-blue-300",
      QUEUED_PREP: "bg-yellow-500/20 text-yellow-300",
      PREP_IN_PROGRESS: "bg-orange-500/20 text-orange-300",
      HEAT_UP: "bg-red-500/20 text-red-300",
      READY_FOR_DELIVERY: "bg-emerald-500/20 text-emerald-300",
      OUT_FOR_DELIVERY: "bg-blue-500/20 text-blue-300",
      DELIVERED: "bg-purple-500/20 text-purple-300",
      ACTIVE: "bg-emerald-500/20 text-emerald-300",
      CLOSE_PENDING: "bg-yellow-500/20 text-yellow-300"
    };
    return colors[state] || "bg-zinc-800 text-zinc-400";
  };

  const getStateIcon = (state: SessionState) => {
    const icons: Record<string, string> = {
      PAID_CONFIRMED: "💰",
      QUEUED_PREP: "⏳",
      PREP_IN_PROGRESS: "🔧",
      HEAT_UP: "🔥",
      READY_FOR_DELIVERY: "✅",
      OUT_FOR_DELIVERY: "🚚",
      DELIVERED: "🎯",
      ACTIVE: "🍃",
      CLOSE_PENDING: "⏰"
    };
    return icons[state] || "❓";
  };

  const getPriorityScore = (session: Session) => {
    const priorityMap: Record<string, number> = {
      READY_FOR_DELIVERY: 100,
      OUT_FOR_DELIVERY: 90,
      DELIVERED: 80,
      ACTIVE: 70,
      CLOSE_PENDING: 60,
      HEAT_UP: 50,
      PREP_IN_PROGRESS: 40,
      QUEUED_PREP: 30,
      PAID_CONFIRMED: 20
    };
    return priorityMap[session.state] || 0;
  };

  const sortedSessions = [...sessions].sort((a, b) => getPriorityScore(b) - getPriorityScore(a));

  // ENHANCED: Role-based session controls validation
  const canExecuteCommand = (session: Session, command: string): boolean => {
    // Role-based command permissions
    const rolePermissions: Record<string, string[]> = {
      'staff': ['DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE', 'CLOSE_SESSION'],
      'owner': ['DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE', 'CLOSE_SESSION', 'CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'REMAKE', 'STAFF_HOLD', 'MOVE_TABLE', 'ADD_COAL_SWAP', 'REFUND_REQUEST'],
      'manager': ['DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE', 'CLOSE_SESSION', 'CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'REMAKE', 'STAFF_HOLD', 'MOVE_TABLE', 'ADD_COAL_SWAP', 'REFUND_REQUEST'],
      'hookah-prep': ['CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'REMAKE', 'STAFF_HOLD'],
      'bar-tender': ['DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE', 'CLOSE_SESSION', 'ADD_COAL_SWAP']
    };

    const validCommands: Record<string, string[]> = {
      // FOH commands - Complete Floor Queue flow
      DELIVER_NOW: ["READY_FOR_DELIVERY"],
      MARK_DELIVERED: ["OUT_FOR_DELIVERY"],
      START_ACTIVE: ["DELIVERED"],
      CLOSE_SESSION: ["ACTIVE"],
      
      // BOH commands
      CLAIM_PREP: ["PAID_CONFIRMED"],
      HEAT_UP: ["PREP_IN_PROGRESS"],
      READY_FOR_DELIVERY: ["HEAT_UP"],
      
      // Enhanced common commands
      REMAKE: ["PREP_IN_PROGRESS", "HEAT_UP", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED", "ACTIVE"],
      STAFF_HOLD: ["PREP_IN_PROGRESS", "HEAT_UP", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED", "ACTIVE"],
      MOVE_TABLE: ["READY_FOR_DELIVERY", "OUT_FOR_DELIVERY"],
      ADD_COAL_SWAP: ["ACTIVE"],
      REFUND_REQUEST: ["DELIVERED", "ACTIVE", "CLOSE_PENDING"]
    };

    // Check if user has permission for this command
    const hasPermission = rolePermissions[selectedRole]?.includes(command);
    if (!hasPermission) return false;

    // Check if command is valid for current session state
    return validCommands[command]?.includes(session.state) || false;
  };

  // ENHANCED: Role-based available commands for all states
  const getAvailableCommands = (session: Session): string[] => {
    const commands: string[] = [];
    
    // Role-based command permissions
    const rolePermissions: Record<string, string[]> = {
      'staff': ['DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE', 'CLOSE_SESSION'],
      'owner': ['DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE', 'CLOSE_SESSION', 'CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'REMAKE', 'STAFF_HOLD', 'MOVE_TABLE', 'ADD_COAL_SWAP', 'REFUND_REQUEST'],
      'manager': ['DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE', 'CLOSE_SESSION', 'CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'REMAKE', 'STAFF_HOLD', 'MOVE_TABLE', 'ADD_COAL_SWAP', 'REFUND_REQUEST'],
      'hookah-prep': ['CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'REMAKE', 'STAFF_HOLD'],
      'bar-tender': ['DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE', 'CLOSE_SESSION', 'ADD_COAL_SWAP']
    };
    
    const userPermissions = rolePermissions[selectedRole] || [];
    
    if (activeView === "foh") {
      // Complete FOH Floor Queue flow
      if (session.state === "READY_FOR_DELIVERY" && userPermissions.includes("DELIVER_NOW")) commands.push("DELIVER_NOW");
      if (session.state === "OUT_FOR_DELIVERY" && userPermissions.includes("MARK_DELIVERED")) commands.push("MARK_DELIVERED");
      if (session.state === "DELIVERED" && userPermissions.includes("START_ACTIVE")) commands.push("START_ACTIVE");
      if (session.state === "ACTIVE" && userPermissions.includes("CLOSE_SESSION")) commands.push("CLOSE_SESSION");
    } else {
      // Complete BOH Prep flow
      if (session.state === "PAID_CONFIRMED" && userPermissions.includes("CLAIM_PREP")) commands.push("CLAIM_PREP");
      if (session.state === "PREP_IN_PROGRESS" && userPermissions.includes("HEAT_UP")) commands.push("HEAT_UP");
      if (session.state === "HEAT_UP" && userPermissions.includes("READY_FOR_DELIVERY")) commands.push("READY_FOR_DELIVERY");
    }
    
    // Enhanced common commands for all states
    if (["PREP_IN_PROGRESS", "HEAT_UP", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED", "ACTIVE"].includes(session.state)) {
      if (userPermissions.includes("REMAKE")) commands.push("REMAKE");
      if (userPermissions.includes("STAFF_HOLD")) commands.push("STAFF_HOLD");
    }
    
    // Additional FOH commands
    if (["READY_FOR_DELIVERY", "OUT_FOR_DELIVERY"].includes(session.state)) {
      if (userPermissions.includes("MOVE_TABLE")) commands.push("MOVE_TABLE");
    }
    
    if (session.state === "ACTIVE") {
      if (userPermissions.includes("ADD_COAL_SWAP")) commands.push("ADD_COAL_SWAP");
    }
    
    if (["DELIVERED", "ACTIVE", "CLOSE_PENDING"].includes(session.state)) {
      if (userPermissions.includes("REFUND_REQUEST")) commands.push("REFUND_REQUEST");
    }
    
    return commands;
  };

  // Enhanced command execution with flow tracking
  const executeCommand = async (session: Session, command: string) => {
    if (!canExecuteCommand(session, command)) {
      alert(`Command ${command} is not valid for session in state ${session.state}`);
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${session.id}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          cmd: command,
          actor: activeView === "foh" ? "foh" : "boh",
          flowData: getSessionFlowData(session)
        })
      });

      if (response.ok) {
        // Track workflow execution for journey progress
        if (command && ['CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE'].includes(command)) {
          console.log(`Workflow executed: ${command} for session ${session.id}`);
        }
        
        alert(`Command ${command} executed successfully!`);
        refreshSessions();
        
        // Clear selection if session state changed significantly
        if (["CLOSE_SESSION", "CLOSED"].includes(command)) {
          setSelectedSession(null);
        }
        
        // Check if we should advance journey step
        if (currentStep === 3 && command === 'READY_FOR_DELIVERY') {
          markStepComplete(3);
        }
        if (currentStep === 4 && command === 'CLOSE_SESSION') {
          markStepComplete(4);
        }
      } else {
        const error = await response.json();
        alert(`Command failed: ${error.error}`);
      }
    } catch (error) {
      console.error("Error executing command:", error);
      alert("Error executing command");
    }
  };

  const resetJourney = () => {
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setShowJourneyGuide(true);
  };



  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <GlobalNavigation />
      
      {/* Role Selection Dropdown */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-zinc-400">Role:</span>
              <select 
                className="bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="staff">Staff</option>
                <option value="owner">Owner</option>
                <option value="manager">Manager</option>
                <option value="hookah-prep">Hookah Prep</option>
                <option value="bar-tender">Bar Tender</option>
              </select>
            </div>
            
            {/* FOH/BOH View Toggle */}
            <div className="flex bg-zinc-800 rounded-xl p-1 border border-zinc-700">
              <button
                onClick={() => setActiveView("foh")}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeView === "foh"
                    ? "bg-teal-500 text-zinc-950 shadow-lg"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                }`}
              >
                <span className="text-lg">🍃</span>
                <span>Front of House</span>
              </button>
              <button
                onClick={() => setActiveView("boh")}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeView === "boh"
                    ? "bg-teal-500 text-zinc-950 shadow-lg"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                }`}
              >
                <span className="text-lg">🔧</span>
                <span>Back of House</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-teal-400 mb-2">Fire Session Dashboard</h1>
              <p className="text-zinc-400">Hookah Lounge Session Management</p>
            </div>
            

          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 🗺️ Journey Guide - First-Class Experience */}
        {showJourneyGuide && (
          <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-xl border border-teal-500/20 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-teal-300">🗺️ {activeView === "foh" ? "Front of House" : "Back of House"} Journey Guide</h2>
              <button
                onClick={() => setShowJourneyGuide(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-zinc-400 mb-2">
                <span>Step {currentStep} of {currentJourney.length}</span>
                <span>{Math.round((completedSteps.size / currentJourney.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(completedSteps.size / currentJourney.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Current Step */}
            {currentJourneyStep && (
              <div className="bg-zinc-900 rounded-lg border border-zinc-700 p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-zinc-950 font-bold">
                    {currentStep}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{currentJourneyStep.title}</h3>
                    <p className="text-zinc-300 text-sm mb-2">{currentJourneyStep.description}</p>
                    <div className="bg-teal-500/20 border border-teal-500/30 rounded-lg p-3">
                      <div className="text-teal-300 font-medium text-sm mb-1">🎯 Action Required:</div>
                      <div className="text-white text-sm">{currentJourneyStep.action}</div>
                    </div>
                    {currentJourneyStep.hint && (
                      <div className="mt-2 text-zinc-400 text-xs">
                        💡 <span className="italic">{currentJourneyStep.hint}</span>
                      </div>
                    )}
                    {currentJourneyStep.nextStep && (
                      <div className="mt-2 text-emerald-400 text-xs">
                        ➡️ <span className="italic">Next: {currentJourneyStep.nextStep}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Journey Steps Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {currentJourney.map((step) => (
                <div 
                  key={step.step}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    step.step === currentStep
                      ? 'border-teal-500 bg-teal-500/20'
                      : completedSteps.has(step.step)
                      ? 'border-emerald-500 bg-emerald-500/20'
                      : 'border-zinc-700 bg-zinc-800'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold ${
                    step.step === currentStep
                      ? 'bg-teal-500 text-zinc-950'
                      : completedSteps.has(step.step)
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'bg-zinc-600 text-zinc-300'
                  }`}>
                    {completedSteps.has(step.step) ? '✓' : step.step}
                  </div>
                  <div className="text-xs font-medium text-white mb-1">{step.title}</div>
                  <div className="text-xs text-zinc-400">{step.description}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={resetJourney}
                className="bg-zinc-700 text-white px-4 py-2 rounded-lg hover:bg-zinc-600 transition-colors text-sm"
              >
                🔄 Reset Journey
              </button>
            </div>
          </div>
        )}

        {/* ENHANCED: Control Actions with Floor Session Generation */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
          <h2 className="text-xl font-semibold text-teal-300 mb-4">Control Actions</h2>
          <div className="flex flex-wrap gap-4">
                        {/* NEW: Generate Floor Sessions button - Role-based visibility */}
            {['staff', 'owner', 'manager', 'bar-tender'].includes(selectedRole) && (
              <button
                onClick={handleGenerateFloorSessions}
                disabled={loading}
                className="bg-emerald-500 text-zinc-950 px-6 py-3 rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition-colors font-medium"
              >
                {loading ? "Generating..." : `🔥 Generate ${(() => {
                  const roleLimits: Record<string, number> = {
                    'staff': 3,
                    'owner': 10,
                    'manager': 8,
                    'hookah-prep': 5,
                    'bar-tender': 5
                  };
                  return roleLimits[selectedRole] || 5;
                })()} Floor Sessions`}
              </button>
            )}
            
            {/* Generate Demo Sessions button - Role-based visibility */}
            {['owner', 'manager', 'hookah-prep'].includes(selectedRole) && (
              <button
                onClick={handleGenerateDemoData}
                disabled={loading}
                className="bg-zinc-700 text-white px-6 py-3 rounded-xl hover:bg-zinc-600 transition-colors font-medium"
              >
                {loading ? "Generating..." : "🎯 Generate 15 Demo Sessions"}
              </button>
            )}
            
            <button
              onClick={refreshSessions}
              className="bg-zinc-700 text-white px-6 py-3 rounded-xl hover:bg-zinc-600 transition-colors font-medium"
            >
              🔄 Refresh Dashboard
            </button>
            
            <button
              onClick={() => setShowJourneyGuide(!showJourneyGuide)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-500 transition-colors font-medium"
            >
              {showJourneyGuide ? "🗺️ Hide Guide" : "🗺️ Show Guide"}
            </button>
            

            

          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-teal-500/20 rounded-lg">
                <span className="text-2xl">🍃</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Total Sessions</p>
                <p className="text-2xl font-semibold text-white">{sessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <span className="text-2xl">{activeView === "foh" ? "🏠" : "🔧"}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">{activeView === "foh" ? "Floor Sessions" : "Prep Sessions"}</p>
                <p className="text-2xl font-semibold text-white">{sessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <span className="text-2xl">👤</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-400">Role & Permissions</p>
                <p className="text-lg font-semibold text-white">{selectedRole.replace('-', ' ').toUpperCase()}</p>
                <p className="text-xs text-zinc-400">
                  {(() => {
                    const roleLimits: Record<string, number> = {
                      'staff': 3,
                      'owner': 10,
                      'manager': 8,
                      'hookah-prep': 5,
                      'bar-tender': 5
                    };
                    return `Can generate ${roleLimits[selectedRole] || 5} sessions`;
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Queue */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="px-6 py-4 border-b border-zinc-800">
                <h2 className="text-lg font-semibold text-teal-300">
                  {activeView === "foh" ? "Floor Queue" : "Prep Queue"}
                </h2>
                <p className="text-sm text-zinc-400">
                  {sessions.length} sessions {activeView === "foh" ? "on floor" : "in prep"}
                </p>
              </div>
              <div className="p-6">
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">
                    <div className="text-4xl mb-2">🍃</div>
                    <p>No sessions {activeView === "foh" ? "on floor" : "in prep queue"}</p>
                    <p className="text-sm mt-2">Use the control actions above to generate demo data</p>
                    <div className="mt-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                      <div className="text-teal-300 font-medium mb-2">🚀 Quick Start:</div>
                      <ol className="text-sm text-zinc-400 text-left space-y-1">
                        <li>1. Click "Generate {(() => {
                          const roleLimits: Record<string, number> = {
                            'staff': 3,
                            'owner': 10,
                            'manager': 8,
                            'hookah-prep': 5,
                            'bar-tender': 5
                          };
                          return roleLimits[selectedRole] || 5;
                        })()} Floor Sessions" for FOH view</li>
                        <li>2. Click "Generate 15 Demo Sessions" for BOH view</li>
                        <li>3. Watch sessions appear in the queue</li>
                        <li>4. Select a session to see available actions</li>
                        <li>5. Follow the workflow buttons in order</li>
                      </ol>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-lg ${
                          selectedSession?.id === session.id 
                            ? 'border-teal-500 bg-teal-500/10' 
                            : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                        }`}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getStateIcon(session.state)}</span>
                            <div>
                              <div className="font-medium text-white">
                                Table {session.table}
                              </div>
                              <div className="text-sm text-zinc-400">
                                Session {session.id.slice(-6)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateColor(session.state)}`}>
                              {session.state.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                        
                        {session.meta.customerId && (
                          <div className="mt-2 text-sm text-zinc-400">
                            Customer: {session.meta.customerId}
                          </div>
                        )}

                        {/* Timer info */}
                        {session.timers.heatUpStart && (
                          <div className="mt-2 text-xs text-zinc-500">
                            Heat started: {new Date(session.timers.heatUpStart).toLocaleTimeString()}
                          </div>
                        )}
                        {session.timers.deliveredAt && (
                          <div className="mt-1 text-xs text-zinc-500">
                            Delivered: {new Date(session.timers.deliveredAt).toLocaleTimeString()}
                          </div>
                        )}

                        {/* ENHANCED: Complete Flow indicator */}
                        <div className="mt-2 flex items-center space-x-1">
                          <div className="text-xs text-zinc-500">Flow:</div>
                          {activeView === "foh" ? (
                            <>
                              <span className={`text-xs ${session.state === "READY_FOR_DELIVERY" ? "text-emerald-400" : "text-zinc-500"}`}>Ready</span>
                              <span className="text-zinc-500">→</span>
                              <span className={`text-xs ${session.state === "OUT_FOR_DELIVERY" ? "text-blue-400" : "text-zinc-500"}`}>Out</span>
                              <span className="text-zinc-500">→</span>
                              <span className={`text-xs ${session.state === "DELIVERED" ? "text-purple-400" : "text-zinc-500"}`}>Delivered</span>
                              <span className="text-zinc-500">→</span>
                              <span className={`text-xs ${session.state === "ACTIVE" ? "text-emerald-400" : "text-zinc-500"}`}>Active</span>
                              <span className="text-zinc-500">→</span>
                              <span className={`text-xs ${session.state === "CLOSE_PENDING" ? "text-yellow-400" : "text-zinc-500"}`}>Close</span>
                            </>
                          ) : (
                            <>
                              <span className={`text-xs ${session.state === "PAID_CONFIRMED" ? "text-blue-400" : "text-zinc-500"}`}>Paid</span>
                              <span className="text-zinc-500">→</span>
                              <span className={`text-xs ${session.state === "PREP_IN_PROGRESS" ? "text-orange-400" : "text-zinc-500"}`}>Prep</span>
                              <span className="text-zinc-500">→</span>
                              <span className={`text-xs ${session.state === "HEAT_UP" ? "text-red-400" : "text-zinc-500"}`}>Heat</span>
                              <span className="text-zinc-500">→</span>
                              <span className={`text-xs ${session.state === "READY_FOR_DELIVERY" ? "text-emerald-400" : "text-zinc-500"}`}>Ready</span>
                            </>
                          )}
                        </div>

                        {/* Enhanced Operational Data - Steps 3 & 4 */}
                        {currentStep >= 3 && (
                          <div className="mt-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-zinc-400">Customer:</span>
                                <div className="text-white font-medium">{session.meta.customerId || 'Unknown'}</div>
                              </div>
                              <div>
                                <span className="text-zinc-400">Position:</span>
                                <div className="text-white font-medium">
                                  {(() => {
                                    const pos = getBarGridPosition(session.table);
                                    return `${pos.zone} (${pos.row},${pos.col})`;
                                  })()}
                                </div>
                              </div>
                              <div>
                                <span className="text-zinc-400">Duration:</span>
                                <div className="text-white font-medium">
                                  {session.audit.length > 0 ? 
                                    `${Math.round((Date.now() - session.audit[0].ts) / 60000)}m` : 
                                    'New'
                                  }
                                </div>
                              </div>
                              <div>
                                <span className="text-zinc-400">ETA:</span>
                                <div className="text-white font-medium">
                                  {getEstimatedCompletion(session.state)}m
                                </div>
                              </div>
                            </div>
                            
                            {/* Workflow Progress Bar */}
                            <div className="mt-2">
                              <div className="text-xs text-zinc-400 mb-1">Workflow Progress:</div>
                              <div className="w-full bg-zinc-700 rounded-full h-1.5">
                                <div 
                                  className="bg-gradient-to-r from-teal-500 to-emerald-500 h-1.5 rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${(() => {
                                      const steps = session.audit.filter(a => a.cmd).length;
                                      const maxSteps = activeView === "foh" ? 4 : 3;
                                      return Math.min((steps / maxSteps) * 100, 100);
                                    })()}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Session Controls */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="px-6 py-4 border-b border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-teal-300">Session Controls</h2>
                  <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded-full">
                    {selectedRole.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                {selectedSession && (
                  <p className="text-sm text-zinc-400">
                    Table {selectedSession.table} - {selectedSession.state.replace(/_/g, ' ')}
                  </p>
                )}
              </div>
              <div className="p-6">
                {!selectedSession ? (
                  <div className="text-center py-8 text-zinc-500">
                    <p>Select a session to control</p>
                    <div className="mt-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                      <div className="text-teal-300 font-medium mb-2">💡 Tip:</div>
                      <p className="text-sm text-zinc-400">
                        Click on any session in the queue to see available actions and workflow controls.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Session Info */}
                    <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                      <h3 className="font-medium text-white mb-2">Session Details</h3>
                      <div className="space-y-1 text-sm text-zinc-400">
                        <div>ID: {selectedSession.id}</div>
                        <div>Table: {selectedSession.table}</div>
                        <div>State: {selectedSession.state}</div>
                        <div>Items: {selectedSession.items.length}</div>
                        {selectedSession.timers.heatUpStart && (
                          <div>Heat Start: {new Date(selectedSession.timers.heatUpStart).toLocaleTimeString()}</div>
                        )}
                        {selectedSession.timers.deliveredAt && (
                          <div>Delivered: {new Date(selectedSession.timers.deliveredAt).toLocaleTimeString()}</div>
                        )}
                      </div>
                    </div>

                    {/* Available Commands */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-white text-sm">Available Actions:</h4>
                      {getAvailableCommands(selectedSession).map((command) => (
                        <button
                          key={command}
                          onClick={() => executeCommand(selectedSession, command)}
                          className="w-full bg-teal-500 text-zinc-950 px-4 py-2 rounded-lg hover:bg-teal-400 transition-colors font-medium"
                        >
                          {command.replace(/_/g, ' ')}
                        </button>
                      ))}
                      {getAvailableCommands(selectedSession).length === 0 && (
                        <p className="text-zinc-500 text-sm text-center py-2">
                          No actions available for this state
                        </p>
                      )}
                    </div>

                    {/* Role Permissions Display */}
                    <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <h4 className="font-medium text-purple-300 text-sm mb-2">👤 Role Permissions:</h4>
                      <div className="text-xs text-purple-200">
                        <div className="mb-2">
                          <span className="font-medium">Current Role:</span> {selectedRole.replace('-', ' ').toUpperCase()}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {(() => {
                            const rolePermissions: Record<string, string[]> = {
                              'staff': ['DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE', 'CLOSE_SESSION'],
                              'owner': ['DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE', 'CLOSE_SESSION', 'CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'REMAKE', 'STAFF_HOLD', 'MOVE_TABLE', 'ADD_COAL_SWAP', 'REFUND_REQUEST'],
                              'manager': ['DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE', 'CLOSE_SESSION', 'CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'REMAKE', 'STAFF_HOLD', 'MOVE_TABLE', 'ADD_COAL_SWAP', 'REFUND_REQUEST'],
                              'hookah-prep': ['CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'REMAKE', 'STAFF_HOLD'],
                              'bar-tender': ['DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE', 'CLOSE_SESSION', 'ADD_COAL_SWAP']
                            };
                            const permissions = rolePermissions[selectedRole] || [];
                            return permissions.map(perm => (
                              <span key={perm} className="bg-purple-500/20 text-purple-200 px-2 py-1 rounded text-xs">
                                {perm.replace(/_/g, ' ')}
                              </span>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Workflow Guidance */}
                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <h4 className="font-medium text-blue-300 text-sm mb-2">🔄 Workflow Guidance:</h4>
                      <div className="text-xs text-blue-200">
                        {activeView === "foh" ? (
                          <div>
                            <div className="mb-1">FOH Workflow:</div>
                            <div className="space-y-1">
                              <div>READY → DELIVER_NOW → OUT_FOR_DELIVERY</div>
                              <div>OUT → MARK_DELIVERED → DELIVERED</div>
                              <div>DELIVERED → START_ACTIVE → ACTIVE</div>
                              <div>ACTIVE → CLOSE_SESSION → CLOSED</div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="mb-1">BOH Workflow:</div>
                            <div className="space-y-1">
                              <div>PAID → CLAIM_PREP → PREP_IN_PROGRESS</div>
                              <div>PREP → HEAT_UP → HEAT_UP</div>
                              <div>HEAT → READY_FOR_DELIVERY → READY</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Data Flow Tracking - Steps 3 & 4 */}
                    {currentStep >= 3 && selectedSession && (
                      <div className="p-4 bg-teal-500/10 rounded-lg border border-teal-500/20">
                        <h4 className="font-medium text-teal-300 text-sm mb-2">📊 Operational Data Flow:</h4>
                        <div className="text-xs text-teal-200 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="font-medium">Customer ID:</span>
                              <div className="text-white">{selectedSession.meta.customerId || 'Unknown'}</div>
                            </div>
                            <div>
                              <span className="font-medium">Table Position:</span>
                              <div className="text-white">{selectedSession.table}</div>
                            </div>
                          </div>
                          
                          <div>
                            <span className="font-medium">Bar Grid Layout:</span>
                            <div className="text-white">
                              {(() => {
                                const pos = getBarGridPosition(selectedSession.table);
                                return `Row ${pos.row}, Col ${pos.col} (${pos.zone})`;
                              })()}
                            </div>
                          </div>
                          
                          <div>
                            <span className="font-medium">Session Duration:</span>
                            <div className="text-white">
                              {selectedSession.audit.length > 0 ? 
                                `${Math.round((Date.now() - selectedSession.audit[0].ts) / 60000)} minutes` : 
                                'New session'
                              }
                            </div>
                          </div>
                          
                          <div>
                            <span className="font-medium">Estimated Completion:</span>
                            <div className="text-white">
                              {getEstimatedCompletion(selectedSession.state)} minutes
                            </div>
                          </div>
                          
                          <div>
                            <span className="font-medium">Workflow Steps:</span>
                            <div className="text-white">
                              {selectedSession.audit
                                .filter(a => a.cmd)
                                .map(a => a.cmd)
                                .join(' → ') || 'No steps yet'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Journey Progress Indicator */}
                    {currentStep >= 3 && (
                      <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <h4 className="font-medium text-purple-300 text-sm mb-2">🎯 Journey Progress:</h4>
                        <div className="text-xs text-purple-200">
                          <div className="mb-2">
                            <span className="font-medium">Current Step:</span> {currentStep}/4
                          </div>
                          <div className="w-full bg-zinc-800 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(currentStep / 4) * 100}%` }}
                            ></div>
                          </div>
                          <div className="mt-2 text-center text-xs">
                            {currentStep === 3 ? 'Executing workflow...' : 
                             currentStep === 4 ? 'Managing lifecycle...' : 
                             'Journey complete!'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Role-Based Session Generation Info */}
        <div className="mt-6 bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-teal-300 mb-4">Role-Based Session Generation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-2">Current Role: {selectedRole.replace('-', ' ').toUpperCase()}</h4>
              <div className="space-y-2 text-sm text-zinc-400">
                <div className="flex justify-between">
                  <span>Session Generation Limit:</span>
                  <span className="text-white font-medium">
                    {(() => {
                      const roleLimits: Record<string, number> = {
                        'staff': 3,
                        'owner': 10,
                        'manager': 8,
                        'hookah-prep': 5,
                        'bar-tender': 5
                      };
                      return roleLimits[selectedRole] || 5;
                    })()} sessions
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Can Generate Floor Sessions:</span>
                  <span className={`font-medium ${['staff', 'owner', 'manager', 'bar-tender'].includes(selectedRole) ? 'text-emerald-400' : 'text-red-400'}`}>
                    {['staff', 'owner', 'manager', 'bar-tender'].includes(selectedRole) ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Can Generate Demo Sessions:</span>
                  <span className={`font-medium ${['owner', 'manager', 'hookah-prep'].includes(selectedRole) ? 'text-emerald-400' : 'text-red-400'}`}>
                    {['owner', 'manager', 'hookah-prep'].includes(selectedRole) ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">AI Insights Integration</h4>
              <p className="text-sm text-zinc-400 mb-3">
                This dashboard demonstrates AI-powered session lifecycle management with role-based access control.
              </p>
              <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-3">
                <div className="text-teal-300 font-medium text-sm mb-1">🤖 AI Agent Status:</div>
                <div className="text-xs text-teal-200">
                  Core system is ready for session data generation. We have the ability to generate data so lets give them something to experience here.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-teal-300 mb-4">Dashboard Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-2">Front of House (FOH)</h4>
              <p className="text-sm text-zinc-400">
                Manages customer delivery, table management, and active sessions. 
                Handles sessions from "Ready for Delivery" through "Active" to "Close Pending".
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Back of House (BOH)</h4>
              <p className="text-sm text-zinc-400">
                Manages hookah preparation, heating, and prep queue. 
                Handles sessions from "Paid Confirmed" through "Prep in Progress" to "Ready for Delivery".
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FireSessionDashboard;
