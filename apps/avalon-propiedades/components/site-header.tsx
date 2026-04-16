'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSiteBrandConfig } from '@avalon/config';
import { getBrandAssetPaths } from '@avalon/branding';
import { cn } from '@avalon/utils';
import { HeaderCompareLink, HeaderEngagementLinks } from '@avalon/ui';
import { SITE } from '@/lib/site';

export function SiteHeader() {
  const brand = getSiteBrandConfig(SITE);
  const assets = getBrandAssetPaths(SITE);
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header className="sticky top-0 z-40 border-b border-brand-primary/10 bg-brand-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={assets.logoHeader}
            alt={brand.name}
            width={isHome ? 450 : 300}
            height={isHome ? 108 : 72}
            className={cn(
              'w-auto transition-[height] duration-200',
              isHome ? 'h-[5.625rem] md:h-[6.1875rem]' : 'h-[3.75rem] md:h-[4.125rem]'
            )}
            priority
          />
        </Link>
        <nav className="hidden flex-wrap items-center justify-end gap-x-6 gap-y-2 text-sm font-medium text-brand-primary md:flex">
          <Link href="/" className="hover:text-brand-primary-mid">
            Inicio
          </Link>
          <Link href="/propiedades" className="hover:text-brand-primary-mid">
            Propiedades
          </Link>
          <HeaderEngagementLinks site={SITE} variant="avalon" />
          <HeaderCompareLink variant="avalon" />
          <Link href="/institucional" className="hover:text-brand-primary-mid">
            Nosotros
          </Link>
          <Link href="/contacto" className="hover:text-brand-primary-mid">
            Contacto
          </Link>
          <Link
            href={brand.urls.peerSite}
            className="rounded-full border border-brand-accent/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-primary hover:bg-brand-surface-alt"
          >
            {brand.urls.peerCta}
          </Link>
        </nav>
        <Link
          href="/propiedades"
          className="rounded-md bg-brand-primary px-3 py-2 text-sm font-semibold text-white md:hidden"
        >
          Buscar
        </Link>
      </div>
    </header>
  );
}
