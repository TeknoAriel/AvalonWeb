import Image from 'next/image';
import Link from 'next/link';
import { getSiteBrandConfig } from '@avalon/config';
import { getBrandAssetPaths } from '@avalon/branding';
import { SITE } from '@/lib/site';

export function SiteFooter() {
  const brand = getSiteBrandConfig(SITE);
  const assets = getBrandAssetPaths(SITE);

  return (
    <footer className="border-t border-brand-accent/15 bg-brand-surface-alt/50">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-2 md:px-6">
        <div className="space-y-6">
          <Image
            src={assets.logoFooter}
            alt={brand.name}
            width={300}
            height={140}
            className="h-auto w-full max-w-sm opacity-95"
          />
          <p className="max-w-sm font-serif text-lg text-brand-text/80">{brand.tagline}</p>
        </div>
        <div className="flex flex-col justify-center space-y-4 text-sm text-brand-text/80">
          <p className="font-medium text-brand-primary">{brand.contact.professionalName}</p>
          <p>Mat. {brand.contact.licenseId}</p>
          <p>
            <a className="border-b border-brand-accent/40 hover:border-brand-accent" href={`tel:${brand.contact.phoneTel}`}>
              {brand.contact.phoneDisplay}
            </a>
          </p>
          <Link href={brand.urls.peerSite} className="text-xs uppercase tracking-caps text-brand-accent">
            {brand.urls.peerCta}
          </Link>
        </div>
      </div>
      <div className="py-6 text-center text-[11px] uppercase tracking-caps text-brand-text/50">
        © {new Date().getFullYear()} {brand.legalName}
      </div>
    </footer>
  );
}
