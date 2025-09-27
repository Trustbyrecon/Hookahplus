export type SessionStatus = 
  | 'NEW'
  | 'PREP_IN_PROGRESS'
  | 'READY_FOR_DELIVERY'
  | 'OUT_FOR_DELIVERY'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED';

export type SessionTeam = 'BOH' | 'FOH' | 'MANAGER' | 'ADMIN';

export type EdgeCase = 
  | 'EQUIPMENT_ISSUE'
  | 'CUSTOMER_NOT_FOUND'
  | 'PAYMENT_FAILED'
  | 'HEALTH_SAFETY'
  | 'OTHER';

export type SessionType = 'walk-in' | 'reservation' | 'vip';

export interface Session {
  id: string;
  tableId: string;
  customerRef?: string;
  flavor?: string;
  priceCents: number;
  state: SessionStatus;
  edgeCase?: EdgeCase;
  edgeNote?: string;
  assignedBOHId?: string;
  assignedFOHId?: string;
  startedAt?: Date;
  endedAt?: Date;
  durationSecs?: number;
  paymentIntent?: string;
  paymentStatus?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // UI-specific fields (computed)
  statusColor?: string;
  statusIcon?: string;
  assignedBOH?: string;
  assignedFOH?: string;
  notes?: string;
  created?: string;
  team?: SessionTeam;
}

export interface SessionAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverColor: string;
  enabled: boolean;
  team: SessionTeam[];
  status: SessionStatus[];
  description: string;
  action: () => void;
}

export interface SessionNotes {
  id: string;
  sessionId: string;
  note: string;
  author: string;
  timestamp: Date;
  type: 'general' | 'issue' | 'resolution' | 'customer_request';
}
