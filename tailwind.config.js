/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-outfit)', 'sans-serif'],
      },
      colors: {
        dark: {
          bg: '#070A13',
          card: 'rgba(15, 23, 42, 0.65)',
          border: 'rgba(255, 255, 255, 0.08)',
          accent: '#38BDF8',
          muted: '#94A3B8'
        },
        brand: {
          primary: '#0284C7',   // Sky blue
          secondary: '#6366F1', // Indigo
          accent: '#10B981',    // Emerald
        },
        aqi: {
          good: '#059669',       // Green
          satisfactory: '#10B981', // Emerald
          moderate: '#D97706',   // Amber
          poor: '#EA580C',       // Orange
          verypoor: '#DC2626',   // Red
          severe: '#7F1D1D'      // Dark Red
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        glow: '0 0 15px rgba(56, 189, 248, 0.25)',
      }
    },
  },
  plugins: [],
}
