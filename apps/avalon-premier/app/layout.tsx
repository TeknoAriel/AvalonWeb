import { brandCssVariables } from '@avalon/branding';
import { getSiteBrandConfig } from '@avalon/config';
import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import { CompareDock } from '@avalon/ui';
import { MobileNav } from '@/components/mobile-nav';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { rootMetadata } from '@/lib/metadata';
import { SITE } from '@/lib/site';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-premier-serif',
  display: 'swap',
});

export const metadata: Metadata = rootMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = getSiteBrandConfig(SITE);
  return (
    <html lang="es" className={`${dmSans.variable} ${playfair.variable}`}>
      <body style={brandCssVariables(SITE)}>
        <SiteHeader />
        <main className="pb-20">{children}</main>
        <SiteFooter />
        <CompareDock site={SITE} variant="premier" compareHref="/propiedades/comparar" />
        <MobileNav peerHref={brand.urls.peerSite} peerCta={brand.urls.peerCta} />
      </body>
    </html>
  );
}
