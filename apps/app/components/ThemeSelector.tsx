import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTheme, ThemeName } from '@/contexts/ThemeContext';

interface ThemeSelectorProps {
  className?: string;
}

export default function ThemeSelector({ className = '' }: ThemeSelectorProps) {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  const themeColors: Record<ThemeName, string> = {
    midnight: 'bg-black',
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500'
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <span className={`text-sm text-${currentTheme.colors.textSecondary} font-medium`}>
        Lounge Theme:
      </span>
      
      <div className="flex items-center space-x-2">
        {availableThemes.map((theme, index) => (
          <motion.button
            key={theme.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setTheme(theme.name)}
            className={`
              relative w-8 h-8 rounded-full ${themeColors[theme.name]} 
              border-2 transition-all duration-200 hover:scale-110
              ${currentTheme.name === theme.name 
                ? `border-white shadow-lg ring-2 ring-${theme.colors.primary}-400` 
                : `border-${currentTheme.colors.border} hover:border-white`
              }
            `}
            title={theme.displayName}
          >
            {currentTheme.name === theme.name && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
