/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // NAGAR-X Design Tokens
        primary: {
          DEFAULT: '#F97316',
          dark: '#EA6800',
          light: '#FB923C',
        },
        surface: {
          DEFAULT: '#0F172A',
          card: '#1E293B',
          elevated: '#263548',
          border: '#334155',
        },
        status: {
          critical: '#EF4444',
          high: '#F97316',
          medium: '#F59E0B',
          low: '#22C55E',
          info: '#3B82F6',
        },
        sla: {
          green: '#22C55E',
          yellow: '#F59E0B',
          red: '#EF4444',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
