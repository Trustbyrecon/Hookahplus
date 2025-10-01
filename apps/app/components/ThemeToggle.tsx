'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Settings } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [isPrettyTheme, setIsPrettyTheme] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for pretty theme setting on client side only
    const savedTheme = localStorage.getItem('hookahplus-pretty-theme');
    const envTheme = process.env.NEXT_PUBLIC_PRETTY_THEME === '1';
    const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
    
    // Use saved preference, then environment, then Vercel detection
    const shouldUsePrettyTheme = savedTheme !== null 
      ? savedTheme === 'true' 
      : envTheme || isVercel;
    
    setIsPrettyTheme(shouldUsePrettyTheme);
    setIsLoading(false);
    
    // Apply theme to document
    if (shouldUsePrettyTheme) {
      document.documentElement.classList.add('pretty-theme');
    } else {
      document.documentElement.classList.remove('pretty-theme');
    }
  }, []);

  const handleToggle = () => {
    const newTheme = !isPrettyTheme;
    setIsPrettyTheme(newTheme);
    localStorage.setItem('hookahplus-pretty-theme', newTheme.toString());
    
    // Apply theme to document
    if (newTheme) {
      document.documentElement.classList.add('pretty-theme');
    } else {
      document.documentElement.classList.remove('pretty-theme');
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Settings className="w-4 h-4 text-zinc-400 animate-spin" />
        <span className="text-sm text-zinc-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={handleToggle}
        className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors ${
          isPrettyTheme 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
        }`}
        title={isPrettyTheme ? 'Disable Pretty Theme' : 'Enable Pretty Theme'}
      >
        {isPrettyTheme ? (
          <>
            <Sun className="w-4 h-4" />
            <span>Pretty</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4" />
            <span>Classic</span>
          </>
        )}
      </button>
    </div>
  );
}
