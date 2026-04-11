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
  /** Avalon Premier — paleta editorial internacional (prompt maestro) */
  premier: {
    ink: '#0A0A0A',
    paper: '#FFFFFF',
    line: '#CFCFCF',
    gold: '#C6A86B',
    goldSoft: 'rgba(198, 168, 107, 0.35)',
    wash: '#F5F5F5',
  },
} as const;

export type BrandPalette = (typeof brandPalettes)[SiteType];

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
    };
  }
  const p = brandPalettes.premier;
  return {
    '--color-brand-primary': p.ink,
    '--color-brand-primary-mid': p.ink,
    '--color-brand-primary-light': '#2C2C2C',
    '--color-brand-surface': p.paper,
    '--color-brand-surface-alt': p.wash,
    '--color-brand-muted': '#8A8A8A',
    '--color-brand-accent': p.gold,
    '--color-brand-accent-soft': p.goldSoft,
    '--color-brand-text': p.ink,
    '--color-brand-bg': p.paper,
    '--color-premier-line': p.line,
    '--color-premier-gold': p.gold,
    '--color-premier-ink': p.ink,
    '--color-premier-paper': p.paper,
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
