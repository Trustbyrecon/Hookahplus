'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useGuestSessionData } from '../hooks/useGuestSessionData';
import { FireSession } from '../../app/types/enhancedSession';

interface GuestSessionContextType {
  sessions: FireSession[];
  activeSession: FireSession | null;
  loading: boolean;
  error: string | null;
  refreshSessions: () => Promise<void>;
  tableId: string | null;
  customerPhone: string | null;
  setTableId: (id: string | null) => void;
  setCustomerPhone: (phone: string | null) => void;
}

const GuestSessionContext = createContext<GuestSessionContextType | undefined>(undefined);

export function GuestSessionProvider({ children }: { children: ReactNode }) {
  const [tableId, setTableId] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);

  // Load customer phone from localStorage on mount
  useEffect(() => {
    const storedPhone = localStorage.getItem('hookahplus_customer_phone');
    if (storedPhone) {
      setCustomerPhone(storedPhone);
    }
  }, []);

  const { sessions, activeSession, loading, error, refreshSessions } = useGuestSessionData({
    tableId: tableId || undefined,
    customerPhone: customerPhone || undefined,
  });

  const value: GuestSessionContextType = {
    sessions,
    activeSession,
    loading,
    error,
    refreshSessions,
    tableId,
    customerPhone,
    setTableId,
    setCustomerPhone,
  };

  return (
    <GuestSessionContext.Provider value={value}>
      {children}
    </GuestSessionContext.Provider>
  );
}

export function useGuestSessionContext(): GuestSessionContextType {
  const context = useContext(GuestSessionContext);
  if (context === undefined) {
    throw new Error('useGuestSessionContext must be used within a GuestSessionProvider');
  }
  return context;
}

