/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/design-system/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // HookahPlus Brand Colors (Moodbook Compliant)
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Main teal
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Teal Colors (Primary Brand)
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf', // Primary brand color
          500: '#14b8a6', // Primary button background
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // Cyan Colors (Secondary Brand)
        cyan: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee', // Secondary brand color
          500: '#06b6d4',
          600: '#0891b2', // Secondary button backgrounds
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        // Purple Colors (Special Actions)
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea', // Special actions (mobile QR generation)
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        zinc: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        // Status Colors
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        'gradient-accent': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        'gradient-teal': 'linear-gradient(to right, #14b8a6, #0d9488)',
        'gradient-teal-blue': 'linear-gradient(to right, #14b8a6, #2563eb)',
        'gradient-teal-cyan': 'linear-gradient(to right, #2dd4bf, #22d3ee)',
      },
      boxShadow: {
        'primary': '0 4px 14px 0 rgba(34, 197, 94, 0.25)',
        'secondary': '0 4px 14px 0 rgba(59, 130, 246, 0.25)',
        'accent': '0 4px 14px 0 rgba(139, 92, 246, 0.25)',
        'glow': '0 0 20px rgba(34, 197, 94, 0.3)',
      },
    },
  },
  plugins: [],
  safelist: [
    'from-teal-500',
    'to-teal-600', 
    'to-blue-600',
    'to-blue-700',
    'hover:from-teal-600',
    'hover:to-blue-700',
    'shadow-teal-500/25',
    'hover:shadow-teal-500/25',
    'bg-gradient-to-br',
    'from-teal-400',
    'to-cyan-400',
    'text-teal-400',
    'text-teal-300',
    'border-teal-500',
    'bg-teal-500/10'
  ],
}
// Moodbook styling applied Fri, Sep 26, 2025  7:03:42 PM
