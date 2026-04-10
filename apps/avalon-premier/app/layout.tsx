import { brandCssVariables } from '@avalon/branding';
import { getSiteBrandConfig } from '@avalon/config';
import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
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

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata: Metadata = rootMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = getSiteBrandConfig(SITE);
  return (
    <html lang="es" className={`${dmSans.variable} ${cormorant.variable}`}>
      <body style={brandCssVariables(SITE)}>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <MobileNav peerHref={brand.urls.peerSite} peerCta={brand.urls.peerCta} />
      </body>
    </html>
  );
}
