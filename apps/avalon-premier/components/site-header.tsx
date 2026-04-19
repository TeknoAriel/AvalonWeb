'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getSiteBrandConfig } from '@avalon/config';
import { getBrandAssetPaths } from '@avalon/branding';
import { HeaderCompareLink, HeaderEngagementLinks } from '@avalon/ui';
import { SITE } from '@/lib/site';

/** Misma escala visual en todas las rutas (alineada a lo que antes era solo home). */
const HEADER_LOGO_WIDTH = 660;
const HEADER_LOGO_HEIGHT = 156;

const premierNavPill =
  'rounded-sm border border-premier-line/60 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-primary transition hover:border-brand-accent/50 hover:text-brand-accent';

export function SiteHeader() {
  const brand = getSiteBrandConfig(SITE);
  const assets = getBrandAssetPaths(SITE);

  return (
    <header className="sticky top-0 z-50 border-b border-premier-line/55 bg-[var(--color-site-header-bg)] shadow-[0_1px_3px_rgba(27,33,48,0.06)] backdrop-blur-none">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 md:px-6 md:py-5">
        <Link
          href="/"
          className="flex max-h-[5.5rem] max-w-[min(100%,22rem)] items-center md:max-h-[6.25rem] md:max-w-[min(100%,26rem)]"
        >
          <Image
            src={assets.logoHeader}
            alt={brand.name}
            width={HEADER_LOGO_WIDTH}
            height={HEADER_LOGO_HEIGHT}
            className="h-auto w-full max-w-full object-contain object-left max-h-[5.25rem] md:max-h-[6rem]"
            priority
          />
        </Link>
        <nav className="hidden flex-wrap items-center justify-end gap-x-3 gap-y-2 text-[11px] font-medium uppercase tracking-caps text-brand-text md:flex lg:gap-x-3.5">
          <Link href="/" className={premierNavPill} title="Inicio">
            Inicio
          </Link>
          <Link href="/propiedades" className={premierNavPill}>
            Colección
          </Link>
          <Link href="/institucional" className={premierNavPill}>
            Experiencia
          </Link>
          <Link href="/contacto" className={premierNavPill}>
            Contacto
          </Link>
          <span className="hidden h-4 w-px shrink-0 bg-premier-line/45 lg:block" aria-hidden />
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <HeaderEngagementLinks site={SITE} variant="premier" compact />
            <HeaderCompareLink variant="premier" compact />
          </div>
          <Link href={brand.urls.peerSite} className={premierNavPill} title={brand.urls.peerLabel}>
            {brand.urls.peerCta}
          </Link>
        </nav>
        <Link
          href="/propiedades"
          className="border border-brand-primary/20 px-3 py-2 text-xs font-medium uppercase tracking-caps text-brand-primary md:hidden"
        >
          Colección
        </Link>
      </div>
    </header>
  );
}
