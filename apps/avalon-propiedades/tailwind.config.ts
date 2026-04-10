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
      },
      colors: {
        brand: {
          primary: 'var(--color-brand-primary)',
          'primary-dark': 'var(--color-brand-primary-dark)',
          'primary-mid': 'var(--color-brand-primary-mid)',
          surface: 'var(--color-brand-surface)',
          'surface-alt': 'var(--color-brand-surface-alt)',
          muted: 'var(--color-brand-muted)',
          accent: 'var(--color-brand-accent)',
          text: 'var(--color-brand-text)',
          bg: 'var(--color-brand-bg)',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
