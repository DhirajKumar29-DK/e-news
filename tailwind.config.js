/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        jagran: {
          red: '#DC2626',      // The Daily Jagran Crimson Red
          dark: '#111827',     // Slate Charcoal Footer & Header Dark
          bg: '#F8FAFC',       // Soft off-white paper canvas
          card: '#FFFFFF',     // Clean white card
          border: '#E2E8F0',   // Subtle divider
          subtext: '#4B5563'   // Muted slate text
        },
        brand: {
          navy: '#0F172A',
          red: '#DC2626',
          gold: '#D97706',
          paper: '#F8FAFC',
          card: '#FFFFFF',
          dark: {
            bg: '#0B0F17',
            card: '#161F2E',
            border: '#2A364F'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Noto Serif Devanagari', 'Merriweather', 'Georgia', 'serif'],
        'hindi-sans': ['Mukta', 'Noto Sans Devanagari', 'sans-serif'],
        'hindi-serif': ['Noto Serif Devanagari', 'serif'],
      },
      lineHeight: {
        'hindi-relaxed': '1.75',
        'hindi-normal': '1.6',
      }
    },
  },
  plugins: [],
}
