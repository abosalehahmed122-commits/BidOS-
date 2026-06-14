import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep navy / charcoal base — فاخرة داكنة
        navy: {
          950: '#060d1a',
          900: '#0a1730',
          800: '#0b1f3a',
          700: '#13294f',
          600: '#1c3a6b',
        },
        // Emerald accent — أخضر زمردي
        emerald: {
          400: '#22c08a',
          500: '#0f8a5f',
          600: '#0b6e4c',
        },
        // Gold accent — ذهبي
        gold: {
          300: '#e6cd7a',
          400: '#d4af37',
          500: '#c9a227',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -12px rgba(212, 175, 55, 0.35)',
        card: '0 8px 30px -12px rgba(0, 0, 0, 0.6)',
      },
      backgroundImage: {
        'hero-radial':
          'radial-gradient(1200px 600px at 80% -10%, rgba(15,138,95,0.18), transparent), radial-gradient(900px 500px at 10% 10%, rgba(212,175,55,0.12), transparent)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
