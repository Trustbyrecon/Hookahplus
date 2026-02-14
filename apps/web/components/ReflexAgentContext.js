'use client';
import React, { createContext, useContext } from 'react';

const ReflexAgentContext = createContext();

export function ReflexAgentProvider({ children }) {
  const logFlavorChange = (flavor) => {
    console.log(`[ReflexAgent] Flavor changed: ${flavor}`);
  };

  const logSessionNote = (note) => {
    console.log(`[ReflexAgent] Note added: ${note}`);
  };

  return (
    <ReflexAgentContext.Provider value={{ logFlavorChange, logSessionNote }}>
      {children}
    </ReflexAgentContext.Provider>
  );
}

export function useReflexAgent() {
  return useContext(ReflexAgentContext);
}
