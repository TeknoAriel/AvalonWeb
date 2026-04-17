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
        <nav className="hidden flex-wrap items-center justify-end gap-x-5 gap-y-2 text-[11px] font-medium uppercase tracking-caps text-brand-text md:flex">
          <Link
            href="/"
            className="rounded-sm border border-premier-line/60 px-2 py-1.5 text-[10px] font-semibold tracking-wide text-brand-primary hover:border-brand-accent/50 hover:text-brand-accent"
            title="Inicio"
          >
            Inicio
          </Link>
          <Link href="/propiedades" className="hover:text-brand-accent">
            Colección
          </Link>
          <HeaderEngagementLinks site={SITE} variant="premier" />
          <HeaderCompareLink variant="premier" />
          <Link href="/institucional" className="hover:text-brand-accent">
            Experiencia
          </Link>
          <Link href="/contacto" className="hover:text-brand-accent">
            Contacto
          </Link>
          <Link
            href={brand.urls.peerSite}
            className="border-b border-brand-accent/40 pb-0.5 hover:border-brand-accent"
          >
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
