import Image from 'next/image';
import Link from 'next/link';
import { getSiteBrandConfig } from '@avalon/config';
import { getBrandAssetPaths } from '@avalon/branding';
import { SITE } from '@/lib/site';

export function SiteHeader() {
  const brand = getSiteBrandConfig(SITE);
  const assets = getBrandAssetPaths(SITE);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-primary/10 bg-brand-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={assets.logoHeader}
            alt={brand.name}
            width={200}
            height={48}
            className="h-10 w-auto md:h-11"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-brand-primary md:flex">
          <Link href="/propiedades" className="hover:text-brand-primary-mid">
            Propiedades
          </Link>
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
