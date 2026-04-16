import type { SiteType } from '@avalon/types';

/** Tokens de color por marca (hex) */
export const brandPalettes = {
  avalon: {
    primary: '#0B376B',
    primaryDark: '#082A52',
    primaryMid: '#1A4C86',
    white: '#FFFFFF',
    paper: '#F7F5F0',
    mist: '#E9EDF3',
    muted: '#5E6B7A',
    gold: '#C5A46D',
  },
  /** Avalon Premier — lujo sobrio: marfil/piedra, navy petróleo, acentos discretos */
  premier: {
    ink: '#121A2E',
    paper: '#FAFAF8',
    line: '#D8D4CC',
    gold: '#B89A6A',
    goldSoft: 'rgba(184, 154, 106, 0.34)',
    wash: '#EEEBE6',
  },
} as const;

export type BrandPalette = (typeof brandPalettes)[SiteType];

/** Hex #RRGGBB → `rgba(r,g,b,a)` para fondos con opacidad fiable (evita fallos de Tailwind /opacity sobre vars). */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return `rgba(255,255,255,${alpha})`;
  const n = Number.parseInt(h, 16);
  if (!Number.isFinite(n)) return `rgba(255,255,255,${alpha})`;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Genera estilo inline para :root en layout */
export function brandCssVariables(site: SiteType): Record<string, string> {
  if (site === 'avalon') {
    const p = brandPalettes.avalon;
    return {
      '--color-brand-primary': p.primary,
      '--color-brand-primary-dark': p.primaryDark,
      '--color-brand-primary-mid': p.primaryMid,
      '--color-brand-surface': p.paper,
      '--color-brand-surface-alt': p.mist,
      '--color-brand-muted': p.muted,
      '--color-brand-accent': p.gold,
      '--color-brand-text': p.primaryDark,
      '--color-brand-bg': p.white,
      /** Barra superior: marfil (papel) al 95% de opacidad — lectura sobre héroes oscuros */
      '--color-site-header-bg': hexToRgba(p.paper, 0.95),
    };
  }
  const p = brandPalettes.premier;
  return {
    '--color-brand-primary': p.ink,
    '--color-brand-primary-mid': '#1A2438',
    '--color-brand-primary-light': '#2A3448',
    '--color-brand-surface': p.paper,
    '--color-brand-surface-alt': p.wash,
    '--color-brand-muted': '#5E636C',
    '--color-brand-accent': p.gold,
    '--color-brand-accent-soft': p.goldSoft,
    '--color-brand-text': '#1B2130',
    '--color-brand-bg': p.paper,
    '--color-premier-line': p.line,
    '--color-premier-gold': p.gold,
    '--color-premier-ink': p.ink,
    '--color-premier-paper': p.paper,
    '--color-site-header-bg': hexToRgba(p.paper, 0.95),
  };
}

/** Rutas de logos por sitio (ubicar en /public de cada app) */
export const brandAssets = {
  avalon: {
    logoHeader: '/brand/avalon-logo-header.png',
    logoFooter: '/brand/avalon-logo-footer.png',
    favicon: '/favicon.png',
    og: '/og-avalon.png',
  },
  premier: {
    logoHeader: '/brand/premier-logo-header.png',
    logoFooter: '/brand/premier-logo-footer.png',
    favicon: '/favicon.png',
    og: '/og-premier.png',
  },
} as const;

export function getBrandAssetPaths(site: SiteType) {
  return brandAssets[site];
}
