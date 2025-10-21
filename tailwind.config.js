/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Original CFS colors (kept for backward compatibility)
        cfs: {
          red: '#D81421',
          teal: '#005847',
          white: '#FFFFFF',
        },
        // CFS_Demo design tokens (primary theme)
        brand: {
          DEFAULT: '#0c4a6e',
          accent: '#2d9cdb',
          soft: '#e0f2fe',
          deep: '#082f49',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f5f7fa',
          dark: '#0f172a',
          'card-dark': 'rgba(15, 23, 42, 0.75)',
        },
        ink: {
          DEFAULT: '#0f172a',
          muted: '#475569',
          'muted-dark': '#cbd5f5',
        },
        // Legacy mappings
        primary: '#D81421',
        secondary: '#FFFFFF',
        accent: '#005847',
      },
      fontFamily: {
        sans: ['Source Sans 3', 'Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'JetBrains Mono', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display': '96px',
        'hero': '64px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'elevation-1': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'elevation-2': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'elevation-3': '0 8px 24px rgba(0, 0, 0, 0.10)',
        'soft': '0 18px 40px -24px rgba(15, 23, 42, 0.35)', // CFS_Demo soft shadow
      },
      borderRadius: {
        'xl': '24px', // CFS_Demo large radius
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
}
