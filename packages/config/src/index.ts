import type { SiteBrandConfig, SiteType } from '@avalon/types';

export { isFeatureEnabled, type AvalonFeatureId } from './features';

function env(name: string, fallback = ''): string {
  if (typeof process !== 'undefined' && process.env[name]) {
    return process.env[name] as string;
  }
  return fallback;
}

const defaultAvalonUrl = 'http://localhost:3000';
const defaultPremierUrl = 'http://localhost:3001';

export function getSiteBrandConfig(site: SiteType): SiteBrandConfig {
  const isAvalon = site === 'avalon';

  const avalonBase = env('NEXT_PUBLIC_AVALON_URL', defaultAvalonUrl);
  const premierBase = env('NEXT_PUBLIC_PREMIER_URL', defaultPremierUrl);

  const base = isAvalon ? env('NEXT_PUBLIC_SITE_URL', avalonBase) : env('NEXT_PUBLIC_SITE_URL', premierBase);
  const peerSite = isAvalon ? premierBase : avalonBase;

  return {
    site,
    name: isAvalon ? 'Avalon Propiedades' : 'Avalon Premier',
    legalName: isAvalon ? 'Avalon Propiedades' : 'Avalon Premier',
    tagline: isAvalon
      ? 'Inmobiliaria moderna, clara y confiable en Rosario y región.'
      : 'Selección exclusiva de propiedades premium.',
    description: isAvalon
      ? 'Propiedades en venta y alquiler. Asesoramiento profesional y respaldo comercial.'
      : 'Curaduría inmobiliaria de alto estándar. Consultas reservadas y atención diferencial.',
    contact: {
      professionalName: 'Ariel Carnevali',
      licenseId: '0413',
      phoneDisplay: '+54 341 681-1434',
      phoneTel: '+543416811434',
      whatsapp: env('NEXT_PUBLIC_WHATSAPP', '543416811434'),
    },
    urls: {
      base,
      peerSite: env('NEXT_PUBLIC_PEER_SITE_URL', peerSite),
      peerLabel: isAvalon ? 'Avalon Premier' : 'Avalon Propiedades',
      peerCta: isAvalon ? 'Ver Avalon Premier' : 'Explorar Avalon Propiedades',
    },
    ogImage: isAvalon ? '/og-avalon.png' : '/og-premier.png',
  };
}
