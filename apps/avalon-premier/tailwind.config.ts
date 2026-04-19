import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './modules/**/*.{js,ts,jsx,tsx,mdx}',
    './providers/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-premier-serif)', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          primary: 'var(--color-brand-primary)',
          'primary-mid': 'var(--color-brand-primary-mid)',
          'primary-light': 'var(--color-brand-primary-light)',
          surface: 'var(--color-brand-surface)',
          'surface-alt': 'var(--color-brand-surface-alt)',
          accent: 'var(--color-brand-accent)',
          'accent-soft': 'var(--color-brand-accent-soft)',
          text: 'var(--color-brand-text)',
          bg: 'var(--color-brand-bg)',
          muted: 'var(--color-brand-muted)',
        },
        premier: {
          ink: 'var(--color-premier-ink)',
          paper: 'var(--color-premier-paper)',
          line: 'var(--color-premier-line)',
          gold: 'var(--color-premier-gold)',
        },
      },
      transitionDuration: {
        '400': '400ms',
      },
      letterSpacing: {
        caps: '0.22em',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.42s ease-out both',
        'fade-in-slow': 'fade-in 0.55s ease-out 0.05s both',
      },
    },
  },
  plugins: [],
} satisfies Config;
