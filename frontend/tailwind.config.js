/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shield: {
          bg: '#070a13',
          surface: '#0f172a',
          card: '#131b2e',
          cardHover: '#1c2844',
          border: 'rgba(139, 92, 246, 0.2)',
          borderHover: 'rgba(139, 92, 246, 0.45)',
          purple: '#8b5cf6',
          purpleDark: '#6d28d9',
          purpleLight: '#c4b5fd',
          indigo: '#6366f1',
          crimson: '#ef4444',
          crimsonDark: '#b91c1c',
          amber: '#f59e0b',
          emerald: '#10b981',
          textMuted: '#94a3b8',
          textLight: '#f8fafc',
        }
      },
      boxShadow: {
        'glow-purple': '0 0 25px rgba(139, 92, 246, 0.25)',
        'glow-crimson': '0 0 35px rgba(239, 68, 68, 0.45)',
        'glow-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 15px rgba(124, 58, 237, 0.1)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
