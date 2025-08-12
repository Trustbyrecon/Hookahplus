/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: '#1B1B1E',
        ember: '#D35930',
        mystic: '#8E79B9',
        deepMoss: '#486964',
        goldLumen: '#E8D7B1',
        bg: "var(--bg)",
        panel: "var(--panel)",
        accent: "var(--accent)",
        accent2: "var(--accent-2)",
        muted: "var(--muted)",
        danger: "var(--danger)",
        warning: "var(--warning)",
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      borderRadius: { xl: "var(--radius)", "2xl": "var(--radius)" },
      boxShadow: { soft: "0 8px 24px rgba(0,0,0,.35)" },
    },
  },
  plugins: [],
};
