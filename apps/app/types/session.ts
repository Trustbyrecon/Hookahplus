export type SessionStatus = 
  | 'CREATED'
  | 'PREP_IN_PROGRESS'
  | 'HEAT_UP'
  | 'READY_FOR_DELIVERY'
  | 'FOH_DELIVERED'
  | 'SESSION_ACTIVE'
  | 'REQUEST_REFILL'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'STAFF_HOLD'
  | 'EQUIPMENT_ISSUE'
  | 'CUSTOMER_ISSUE';

export type SessionTeam = 'BOH' | 'FOH' | 'EDGE' | 'MANAGEMENT';

export type SessionType = 'walk-in' | 'reservation' | 'vip';

export interface Session {
  id: string;
  tableId: string;
  customerName: string;
  customerPhone: string;
  sessionType: SessionType;
  flavor: string;
  amount: number;
  status: SessionStatus;
  statusColor: string;
  statusIcon: string;
  assignedBOH: string;
  assignedFOH: string;
  notes: string;
  created: string;
  team: SessionTeam;
  createdAt: Date;
  updatedAt: Date;
  // Session lifecycle timestamps
  prepStartedAt?: Date;
  heatUpStartedAt?: Date;
  readyForDeliveryAt?: Date;
  deliveredAt?: Date;
  sessionStartedAt?: Date;
  completedAt?: Date;
  // Session duration tracking
  prepDuration?: number; // minutes
  heatUpDuration?: number; // minutes
  deliveryDuration?: number; // minutes
  sessionDuration?: number; // minutes
  totalDuration?: number; // minutes
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
