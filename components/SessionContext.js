'use client';
import React, { createContext, useContext, useState } from 'react';

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [session, setSession] = useState({
    flavor: 'Mint',
    isActive: true,
    seconds: 0,
    notes: '',
  });

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
