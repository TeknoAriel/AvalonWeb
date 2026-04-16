'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSiteBrandConfig } from '@avalon/config';
import { getBrandAssetPaths } from '@avalon/branding';
import { cn } from '@avalon/utils';
import { HeaderEngagementLinks } from '@avalon/ui';
import { SITE } from '@/lib/site';

export function SiteHeader() {
  const brand = getSiteBrandConfig(SITE);
  const assets = getBrandAssetPaths(SITE);
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header className="sticky top-0 z-40 border-b border-brand-accent/10 bg-brand-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src={assets.logoHeader}
            alt={brand.name}
            width={isHome ? 330 : 220}
            height={isHome ? 78 : 52}
            className={cn(
              'w-auto transition-[height] duration-200',
              isHome ? 'h-[4.125rem] md:h-[4.5rem]' : 'h-11 md:h-12'
            )}
            priority
          />
        </Link>
        <nav className="hidden items-center gap-10 text-xs font-medium uppercase tracking-caps text-brand-text md:flex">
          <HeaderEngagementLinks site={SITE} variant="premier" />
          <Link href="/propiedades" className="hover:text-brand-accent">
            Colección
          </Link>
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
