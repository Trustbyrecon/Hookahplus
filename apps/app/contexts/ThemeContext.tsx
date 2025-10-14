import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export type ThemeName = 'midnight' | 'orange' | 'blue' | 'green';

export interface Theme {
  name: ThemeName;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    background: string;
  };
}

export const THEMES: Record<ThemeName, Theme> = {
  midnight: {
    name: 'midnight',
    displayName: 'Midnight',
    colors: {
      primary: 'teal',
      secondary: 'cyan',
      accent: 'purple',
      background: 'zinc-950',
      surface: 'zinc-900',
      text: 'white',
      textSecondary: 'zinc-400',
      border: 'zinc-800',
      success: 'green',
      warning: 'amber',
      error: 'red'
    },
    gradients: {
      primary: 'from-teal-500 to-cyan-500',
      secondary: 'from-purple-500 to-pink-500',
      background: 'from-zinc-950 via-zinc-900 to-black'
    }
  },
  orange: {
    name: 'orange',
    displayName: 'Sunset',
    colors: {
      primary: 'orange',
      secondary: 'amber',
      accent: 'red',
      background: 'orange-950',
      surface: 'orange-900',
      text: 'white',
      textSecondary: 'orange-300',
      border: 'orange-800',
      success: 'green',
      warning: 'yellow',
      error: 'red'
    },
    gradients: {
      primary: 'from-orange-500 to-red-500',
      secondary: 'from-amber-500 to-orange-500',
      background: 'from-orange-950 via-orange-900 to-red-950'
    }
  },
  blue: {
    name: 'blue',
    displayName: 'Ocean',
    colors: {
      primary: 'blue',
      secondary: 'cyan',
      accent: 'indigo',
      background: 'blue-950',
      surface: 'blue-900',
      text: 'white',
      textSecondary: 'blue-300',
      border: 'blue-800',
      success: 'green',
      warning: 'yellow',
      error: 'red'
    },
    gradients: {
      primary: 'from-blue-500 to-cyan-500',
      secondary: 'from-indigo-500 to-purple-500',
      background: 'from-blue-950 via-blue-900 to-indigo-950'
    }
  },
  green: {
    name: 'green',
    displayName: 'Forest',
    colors: {
      primary: 'green',
      secondary: 'emerald',
      accent: 'teal',
      background: 'green-950',
      surface: 'green-900',
      text: 'white',
      textSecondary: 'green-300',
      border: 'green-800',
      success: 'green',
      warning: 'yellow',
      error: 'red'
    },
    gradients: {
      primary: 'from-green-500 to-emerald-500',
      secondary: 'from-teal-500 to-green-500',
      background: 'from-green-950 via-green-900 to-emerald-950'
    }
  }
};

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (theme: ThemeName) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentThemeName, setCurrentThemeName] = useState<ThemeName>('midnight');

  const setTheme = (themeName: ThemeName) => {
    setCurrentThemeName(themeName);
    localStorage.setItem('hookahplus-theme', themeName);
    
    // Apply theme to document root for CSS variables
    const theme = THEMES[themeName];
    const root = document.documentElement;
    
    // Set CSS custom properties
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--color-border', theme.colors.border);
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('hookahplus-theme') as ThemeName;
    if (savedTheme && THEMES[savedTheme]) {
      setCurrentThemeName(savedTheme);
      setTheme(savedTheme);
    } else {
      setTheme('midnight');
    }
  }, []);

  const value: ThemeContextType = {
    currentTheme: THEMES[currentThemeName],
    setTheme,
    availableThemes: Object.values(THEMES)
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme-aware CSS class generator
export function getThemeClasses(theme: Theme, component: 'background' | 'surface' | 'text' | 'border' | 'button' | 'card'): string {
  const baseClasses = {
    background: `bg-${theme.colors.background}`,
    surface: `bg-${theme.colors.surface}`,
    text: `text-${theme.colors.text}`,
    border: `border-${theme.colors.border}`,
    button: `bg-${theme.colors.primary}-600 hover:bg-${theme.colors.primary}-700 text-white`,
    card: `bg-${theme.colors.surface}/50 border border-${theme.colors.border} backdrop-blur-sm`
  };

  return baseClasses[component];
}

// Dynamic gradient generator
export function getThemeGradient(theme: Theme, type: 'primary' | 'secondary' | 'background'): string {
  return `bg-gradient-to-br ${theme.gradients[type]}`;
}
