/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kasu: {
          dark: {
            950: '#080c14', // Ultra Dark Obsidian Canvas
            900: '#0d131f', // Deep Midnight Card Base
            850: '#111827', // Card Background
            800: '#1e293b', // Elevated Surface
            750: '#27354a', // Border / Divider Dark
            700: '#334155', // Muted Element
          },
          red: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c',
            800: '#990000', // KASU Official Deep Red
            900: '#7f1d1d',
            950: '#450a0a',
          },
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#006633', // KASU Official Forest Green
            900: '#14532d',
            950: '#052e16',
          },
          smoke: '#f5f5f7', // KASU Official Whitesmoke
          milk: '#fffdf7',  // KASU Official Milk
          cream: '#fef8ee', // Warm Cream Ivory
        },
        university: {
          primary: '#990000',   // KASU Red
          secondary: '#006633', // KASU Green
          whitesmoke: '#f5f5f7',
          milk: '#fffdf7',
          accent: '#b91c1c',
          dark: '#080c14',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-short': 'bounce 1s ease-in-out 2',
        'laser': 'scanLaser 2.2s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}
