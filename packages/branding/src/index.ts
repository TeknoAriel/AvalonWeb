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
  premier: {
    primary: '#0A2342',
    primaryMid: '#103B73',
    primaryLight: '#1B4E8C',
    gold: '#C7A15A',
    goldSoft: '#E6D5AF',
    ivory: '#FAF7F2',
    sand: '#F1ECE3',
    charcoal: '#222833',
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
    '--color-brand-primary': p.primary,
    '--color-brand-primary-mid': p.primaryMid,
    '--color-brand-primary-light': p.primaryLight,
    '--color-brand-surface': p.ivory,
    '--color-brand-surface-alt': p.sand,
    '--color-brand-accent': p.gold,
    '--color-brand-accent-soft': p.goldSoft,
    '--color-brand-text': p.charcoal,
    '--color-brand-bg': p.ivory,
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
