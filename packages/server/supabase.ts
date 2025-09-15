import { createClient } from '@supabase/supabase-js';

export const supaAdmin = createClient(
  process.env.SUPABASE_URL!, 
  process.env.SUPABASE_ANON_KEY!, 
  {
    auth: { persistSession: false }
  }
);

export interface Session {
  id: string;
  venue_id: string;
  table_id: string;
  tier: string;
  flavors: string[];
  status: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETE' | 'STAFF_HOLD' | 'STOCK_BLOCKED';
  started_at?: string;
  ends_at?: string;
  price_lookup_key?: string;
  payment_intent_id?: string;
  checkout_session_id?: string;
  created_by?: string;
  created_at: string;
}

export interface Refill {
  id: string;
  session_id: string;
  venue_id: string;
  requested_at: string;
  completed_at?: string;
}

export interface Reservation {
  id: string;
  venue_id: string;
  table_id: string;
  status: 'HOLD' | 'ARRIVED' | 'NO_SHOW' | 'CANCELLED';
  payment_intent_id?: string;
  hold_amount_cents: number;
  window_minutes: number;
  created_at: string;
}

export interface GhostLog {
  id: number;
  venue_id?: string;
  session_id?: string;
  actor: string;
  event: string;
  meta: Record<string, any>;
  created_at: string;
}
