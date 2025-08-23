// components/ReflexAgentContext.js
import React, { createContext, useContext } from 'react';

const ReflexAgentContext = createContext();

export function ReflexAgentProvider({ children }) {
  const logFlavorChange = (flavor) => {
    console.log(`[ReflexAgent] Flavor changed: ${flavor}`);
    // Optional: send to backend or Reflex Log
  };

  const logSessionNote = (note) => {
    console.log(`[ReflexAgent] Note added: ${note}`);
    // Optional: memory pulse or whisper trigger
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
