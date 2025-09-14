// hookahplus-v2-/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create client if environment variables are provided
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types
export interface SessionRecord {
  id: string;
  table_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  flavors: string[];
  total_amount: number;
  session_state: string;
  created_at: string;
  updated_at: string;
  metadata: any;
  source: 'preorder' | 'mobile_qr' | 'staff' | 'admin';
  assigned_staff?: string;
  session_start_time?: string;
  session_timer?: number;
  boh_state?: string;
  special_instructions?: string;
  estimated_prep_time?: number;
}

export interface TableRecord {
  id: string;
  table_number: string;
  table_type: string;
  table_location: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  current_session_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loyalty_points: number;
  total_sessions: number;
  no_show_count: number;
  blacklisted: boolean;
  created_at: string;
  updated_at: string;
}

// Session management functions
export class SupabaseSessionManager {
  // Create a new session
  static async createSession(sessionData: {
    tableId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    flavors: string[];
    totalAmount: number;
    source: 'preorder' | 'mobile_qr' | 'staff' | 'admin';
    metadata?: any;
    specialInstructions?: string;
    estimatedPrepTime?: number;
  }): Promise<{ success: boolean; session?: SessionRecord; error?: string }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Supabase not configured' };
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert([{
          id: `session_${sessionData.tableId}_${Date.now()}`,
          table_id: sessionData.tableId,
          customer_name: sessionData.customerName,
          customer_phone: sessionData.customerPhone,
          customer_email: sessionData.customerEmail,
          flavors: sessionData.flavors,
          total_amount: sessionData.totalAmount,
          session_state: 'READY',
          source: sessionData.source,
          metadata: sessionData.metadata || {},
          special_instructions: sessionData.specialInstructions,
          estimated_prep_time: sessionData.estimatedPrepTime
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, session: data };
    } catch (error: any) {
      console.error('Session creation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update session state
  static async updateSessionState(
    sessionId: string, 
    updates: Partial<SessionRecord>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Supabase error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Session update error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get session by ID
  static async getSession(sessionId: string): Promise<{ success: boolean; session?: SessionRecord; error?: string }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Supabase not configured' };
      }

      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, session: data };
    } catch (error: any) {
      console.error('Session fetch error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all active sessions
  static async getActiveSessions(): Promise<{ success: boolean; sessions?: SessionRecord[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .in('session_state', ['READY', 'OUT', 'DELIVERED', 'ACTIVE'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, sessions: data || [] };
    } catch (error: any) {
      console.error('Sessions fetch error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get sessions by table
  static async getSessionsByTable(tableId: string): Promise<{ success: boolean; sessions?: SessionRecord[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('table_id', tableId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, sessions: data || [] };
    } catch (error: any) {
      console.error('Sessions fetch error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get table information
  static async getTable(tableId: string): Promise<{ success: boolean; table?: TableRecord; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('id', tableId)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, table: data };
    } catch (error: any) {
      console.error('Table fetch error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update table status
  static async updateTableStatus(
    tableId: string, 
    status: TableRecord['status'],
    currentSessionId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('tables')
        .update({
          status,
          current_session_id: currentSessionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', tableId);

      if (error) {
        console.error('Supabase error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Table update error:', error);
      return { success: false, error: error.message };
    }
  }

  // Create or update customer
  static async upsertCustomer(customerData: {
    name: string;
    phone: string;
    email?: string;
  }): Promise<{ success: boolean; customer?: CustomerRecord; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .upsert([{
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email,
          updated_at: new Date().toISOString()
        }], {
          onConflict: 'phone'
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, customer: data };
    } catch (error: any) {
      console.error('Customer upsert error:', error);
      return { success: false, error: error.message };
    }
  }

  // Real-time subscription for sessions
  static subscribeToSessions(callback: (session: SessionRecord) => void) {
    return supabase
      .channel('sessions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sessions' },
        (payload) => {
          if (payload.new) {
            callback(payload.new as SessionRecord);
          }
        }
      )
      .subscribe();
  }

  // Real-time subscription for tables
  static subscribeToTables(callback: (table: TableRecord) => void) {
    return supabase
      .channel('tables')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tables' },
        (payload) => {
          if (payload.new) {
            callback(payload.new as TableRecord);
          }
        }
      )
      .subscribe();
  }
}

// Initialize default tables if they don't exist
export async function initializeTables() {
  const defaultTables = [
    { id: 'T-001', table_number: 'T-001', table_type: 'VIP', table_location: 'Window Side', capacity: 4 },
    { id: 'T-002', table_number: 'T-002', table_type: 'Standard', table_location: 'Center', capacity: 2 },
    { id: 'T-003', table_number: 'T-003', table_type: 'Standard', table_location: 'Corner', capacity: 2 },
    { id: 'T-004', table_number: 'T-004', table_type: 'Premium', table_location: 'Patio', capacity: 6 },
    { id: 'T-005', table_number: 'T-005', table_type: 'Standard', table_location: 'Bar Side', capacity: 2 }
  ];

  try {
    for (const table of defaultTables) {
      const { error } = await supabase
        .from('tables')
        .upsert([{
          ...table,
          status: 'available',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }], {
          onConflict: 'id'
        });

      if (error) {
        console.error('Table initialization error:', error);
      }
    }
    console.log('✅ Tables initialized successfully');
  } catch (error) {
    console.error('Table initialization failed:', error);
  }
}
