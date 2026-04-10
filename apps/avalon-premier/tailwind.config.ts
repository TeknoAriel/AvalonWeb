import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
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
        },
      },
      letterSpacing: {
        caps: '0.22em',
      },
    },
  },
  plugins: [],
} satisfies Config;
