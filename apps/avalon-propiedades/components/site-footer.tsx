import Image from 'next/image';
import Link from 'next/link';
import { getSiteBrandConfig } from '@avalon/config';
import { getBrandAssetPaths } from '@avalon/branding';
import { SITE } from '@/lib/site';

export function SiteFooter() {
  const brand = getSiteBrandConfig(SITE);
  const assets = getBrandAssetPaths(SITE);

  return (
    <footer className="border-t border-brand-primary/10 bg-brand-surface-alt">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 md:px-6">
        <div>
          <Image
            src={assets.logoFooter}
            alt={brand.name}
            width={280}
            height={120}
            className="h-auto w-full max-w-xs"
          />
          <p className="mt-4 max-w-md text-sm text-brand-muted">{brand.tagline}</p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-semibold text-brand-primary">Contacto</p>
          <p>
            {brand.contact.professionalName}
            <br />
            Mat. {brand.contact.licenseId}
            <br />
            <a className="text-brand-primary-mid underline" href={`tel:${brand.contact.phoneTel}`}>
              Tel. {brand.contact.phoneDisplay}
            </a>
          </p>
          <p>
            <Link href={brand.urls.peerSite} className="font-medium text-brand-primary underline">
              {brand.urls.peerCta}
            </Link>
          </p>
        </div>
      </div>
      <div className="border-t border-brand-primary/10 py-4 text-center text-xs text-brand-muted">
        © {new Date().getFullYear()} {brand.legalName}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
