// Mock Session Store for Development
// This provides a temporary session storage system until database is fully configured

import { Session, SessionStatus } from '../types/session';

// In-memory session store
let mockSessions: Session[] = [
  {
    id: 'session_T-007_1758552685415',
    tableId: 'T-007',
    customerRef: '15551234556',
    flavor: 'Watermelon + Mint',
    priceCents: 3500,
    state: 'PREP_IN_PROGRESS',
    assignedBOHId: 'boh-1',
    assignedFOHId: 'foh-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    // UI computed fields
    statusColor: 'bg-green-500',
    statusIcon: '🔄',
    assignedBOH: 'Mike Rodriguez',
    assignedFOH: 'John Smith',
    notes: 'Source: WALK IN, External Ref: T-007',
    created: '1:39:07 PM',
    team: 'BOH'
  },
  {
    id: 'session_T-008_1758552685416',
    tableId: 'T-008',
    customerRef: '15551234557',
    flavor: 'Blue Mist',
    priceCents: 3000,
    state: 'READY_FOR_DELIVERY',
    assignedBOHId: 'boh-1',
    assignedFOHId: 'foh-2',
    createdAt: new Date(),
    updatedAt: new Date(),
    // UI computed fields
    statusColor: 'bg-blue-500',
    statusIcon: '✅',
    assignedBOH: 'Mike Rodriguez',
    assignedFOH: 'Emily Davis',
    notes: 'Source: RESERVE, External Ref: T-008',
    created: '1:34:07 PM',
    team: 'BOH'
  },
  {
    id: 'session_T-011_1758552685417',
    tableId: 'T-011',
    customerRef: '15551234560',
    flavor: 'Custom Mix',
    priceCents: 4500,
    state: 'ACTIVE',
    edgeCase: 'EQUIPMENT_ISSUE',
    edgeNote: 'Equipment malfunction - hookah base cracked',
    assignedBOHId: 'boh-2',
    assignedFOHId: 'foh-3',
    startedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    createdAt: new Date(),
    updatedAt: new Date(),
    // UI computed fields
    statusColor: 'bg-orange-500',
    statusIcon: '⚠️',
    assignedBOH: 'Sarah Chen',
    assignedFOH: 'David Wilson',
    notes: 'Source: WALK IN, External Ref: T-011. Edge Case: Equipment malfunction - hookah base cracked',
    created: '1:19:07 PM',
    team: 'FOH'
  }
];

// Mock Session Store API
export class MockSessionStore {
  static getSessions(): Session[] {
    return [...mockSessions];
  }

  static getSession(id: string): Session | null {
    return mockSessions.find(s => s.id === id) || null;
  }

  static createSession(sessionData: Partial<Session>): Session {
    const newSession: Session = {
      id: `session_${sessionData.tableId}_${Date.now()}`,
      tableId: sessionData.tableId || 'T-000',
      customerRef: sessionData.customerRef,
      flavor: sessionData.flavor,
      priceCents: sessionData.priceCents || 0,
      state: 'NEW',
      assignedBOHId: sessionData.assignedBOHId,
      assignedFOHId: sessionData.assignedFOHId,
      createdAt: new Date(),
      updatedAt: new Date(),
      // UI computed fields
      statusColor: 'bg-blue-500',
      statusIcon: '🆕',
      assignedBOH: sessionData.assignedBOH,
      assignedFOH: sessionData.assignedFOH,
      notes: sessionData.notes,
      created: new Date().toLocaleTimeString(),
      team: 'BOH'
    };
    
    mockSessions.unshift(newSession);
    return newSession;
  }

  static updateSession(id: string, updates: Partial<Session>): Session | null {
    const sessionIndex = mockSessions.findIndex(s => s.id === id);
    if (sessionIndex === -1) return null;

    const updatedSession = {
      ...mockSessions[sessionIndex],
      ...updates,
      updatedAt: new Date()
    };

    // Update computed fields based on state
    updatedSession.statusColor = this.getStatusColor(updatedSession.state);
    updatedSession.statusIcon = this.getStatusIcon(updatedSession.state);
    updatedSession.team = this.getTeam(updatedSession.state);

    mockSessions[sessionIndex] = updatedSession;
    return updatedSession;
  }

  static deleteSession(id: string): boolean {
    const initialLength = mockSessions.length;
    mockSessions = mockSessions.filter(s => s.id !== id);
    return mockSessions.length < initialLength;
  }

  static transitionSession(id: string, transition: string, extra?: any): Session | null {
    const session = this.getSession(id);
    if (!session) return null;

    const updates: Partial<Session> = {};
    const now = new Date();

    switch (transition) {
      case "START_PREP":
        if (session.state !== "NEW") throw new Error(`Invalid transition: ${session.state} -> START_PREP`);
        updates.state = "PREP_IN_PROGRESS";
        break;

      case "MARK_READY":
        if (session.state !== "PREP_IN_PROGRESS") throw new Error(`Invalid transition: ${session.state} -> MARK_READY`);
        updates.state = "READY_FOR_DELIVERY";
        break;

      case "TAKE_DELIVERY":
        if (session.state !== "READY_FOR_DELIVERY") throw new Error(`Invalid transition: ${session.state} -> TAKE_DELIVERY`);
        updates.state = "OUT_FOR_DELIVERY";
        break;

      case "START_ACTIVE":
        if (session.state !== "OUT_FOR_DELIVERY") throw new Error(`Invalid transition: ${session.state} -> START_ACTIVE`);
        updates.state = "ACTIVE";
        updates.startedAt = now;
        break;

      case "PAUSE":
        if (session.state !== "ACTIVE") throw new Error(`Invalid transition: ${session.state} -> PAUSE`);
        updates.state = "PAUSED";
        break;

      case "RESUME":
        if (session.state !== "PAUSED") throw new Error(`Invalid transition: ${session.state} -> RESUME`);
        updates.state = "ACTIVE";
        break;

      case "COMPLETE":
        if (!["ACTIVE", "PAUSED"].includes(session.state)) throw new Error(`Invalid transition: ${session.state} -> COMPLETE`);
        updates.state = "COMPLETED";
        updates.endedAt = now;
        if (session.startedAt) {
          updates.durationSecs = Math.floor((now.getTime() - session.startedAt.getTime()) / 1000);
        }
        break;

      case "CANCEL":
        updates.state = "CANCELLED";
        updates.endedAt = now;
        break;

      case "SET_EDGE_CASE":
        updates.edgeCase = extra?.edge || "OTHER";
        updates.edgeNote = extra?.note || "";
        break;

      case "RESOLVE_EDGE_CASE":
        updates.edgeCase = undefined;
        updates.edgeNote = undefined;
        break;

      default:
        throw new Error(`Unknown transition: ${transition}`);
    }

    return this.updateSession(id, updates);
  }

  private static getStatusColor(state: SessionStatus): string {
    switch (state) {
      case 'NEW': return 'bg-blue-500';
      case 'PREP_IN_PROGRESS': return 'bg-yellow-500';
      case 'READY_FOR_DELIVERY': return 'bg-green-500';
      case 'OUT_FOR_DELIVERY': return 'bg-purple-500';
      case 'ACTIVE': return 'bg-orange-500';
      case 'PAUSED': return 'bg-gray-500';
      case 'COMPLETED': return 'bg-green-600';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }

  private static getStatusIcon(state: SessionStatus): string {
    switch (state) {
      case 'NEW': return '🆕';
      case 'PREP_IN_PROGRESS': return '🔄';
      case 'READY_FOR_DELIVERY': return '✅';
      case 'OUT_FOR_DELIVERY': return '🚚';
      case 'ACTIVE': return '🔥';
      case 'PAUSED': return '⏸️';
      case 'COMPLETED': return '✅';
      case 'CANCELLED': return '❌';
      default: return '❓';
    }
  }

  private static getTeam(state: SessionStatus): 'BOH' | 'FOH' | 'MANAGER' {
    switch (state) {
      case 'NEW':
      case 'PREP_IN_PROGRESS':
      case 'READY_FOR_DELIVERY':
        return 'BOH';
      case 'OUT_FOR_DELIVERY':
      case 'ACTIVE':
      case 'PAUSED':
        return 'FOH';
      default:
        return 'MANAGER';
    }
  }
}
