/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        slate: {
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
          950: '#020617',
        },
        blue: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
          950: '#051e3e',
        },
        accent: {
          orange: '#f97316',
          pink: '#ec4899',
          red: '#ef4444',
          green: '#10b981',
          purple: '#a855f7',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-sm': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 20px 50px -12px rgba(0, 0, 0, 0.15)',
        'xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out',
        'fade-in-up': 'fade-in-up 0.8s ease-out',
        'fade-in-down': 'fade-in-down 0.8s ease-out',
        'slide-in-left': 'slide-in-left 0.6s ease-out',
        'slide-in-right': 'slide-in-right 0.6s ease-out',
        'scale-in': 'scale-in 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float-slow 4s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'typewriter-loop': 'typewriter-loop 5s steps(5) infinite, blink 1s steps(1) infinite',
        'typewriter-loop-delayed': 'typewriter-loop 7s steps(14) infinite, blink 1s steps(1) infinite',
        'typewriter-loop-delayed-2': 'typewriter-loop 6s steps(6) infinite, blink 1s steps(1) infinite',
        'blink': 'blink 1s steps(1) infinite',
        // Staggered entrance animations (0.6s duration)
        'reveal-1': 'reveal-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards', 
        'reveal-2': 'reveal-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards', // 0.1s delay
        'reveal-3': 'reveal-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards', // 0.2s delay
        'fade-subtext': 'fade-slide-right 1s ease-out 0.8s forwards',

        // The infinite loop (runs forever)
        'shimmer-infinite': 'shimmer 5s linear infinite',
        // Animation for "H.O.T" (5 chars)
        // Types for 0.6s, then hides the border cursor immediately so the next line can start
        'type-line-1': 'typing 0.6s steps(5, end) forwards, shut-caret 0s step-end 0.6s forwards',

        // Animation for "Transforming." (13 chars)
        // Types for 1.2s, then hides cursor
        'type-line-2': 'typing 1.2s steps(13, end) forwards, shut-caret 0s step-end 1.2s forwards',

        // Animation for "Lives." (6 chars)
        // Types for 0.6s, then keeps blinking forever
        'type-line-3': 'typing 0.6s steps(6, end) forwards, blink-caret 1s step-end infinite',  
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float-slow': {
          '0%, 100%': { 
            transform: 'translateY(0) scale(1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          },
          '50%': { 
            transform: 'translateY(-15px) scale(1.02)',
            boxShadow: '0 35px 60px -15px rgba(0, 0, 0, 0.4)'
          },
        },
        // 1. The Entrance: Slides text up from hidden position
          'reveal-up': {
            '0%': { transform: 'translateY(100%)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          
          // 2. The Continuous Loop: Moves a gradient background across the text
          'shimmer': {
            'from': { backgroundPosition: '200% 0' },
            'to': { backgroundPosition: '-200% 0' }
          },
          'fade-slide-right': {
            '0%': { opacity: '0', transform: 'translateX(-10px)' },
            '100%': { opacity: '1', transform: 'translateX(0)' },
          },
        'typing': {
              '0%': { width: '0' },
              '100%': { width: '100%' },
            },
            // 2. The Cursor Blink (standard fade)
            'blink-caret': {
              '0%, 100%': { borderColor: 'transparent' },
              '50%': { borderColor: 'currentColor' },
            },
            // 3. Cursor cleanup (removes the border color after typing is done)
            'shut-caret': {
              '0%, 100%': { borderColor: 'transparent' },
            },
        'typewriter-loop': {
          '0%': {
            width: '0',
          },
          '40%': {
            width: '100%',
          },
          '80%': {
            width: '100%',
          },
          '85%': {
            width: '0',
          },
          '100%': {
            width: '0',
          },
        },
        'blink': {
          '0%, 100%': {
            borderColor: 'transparent',
          },
          '50%': {
            borderColor: 'currentColor',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}