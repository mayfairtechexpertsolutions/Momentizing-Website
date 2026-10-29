import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito } from "next/font/google";
import { SiteChrome } from "@/components/marketing/SiteChrome";
import { FieldErrorOverlay } from "@/components/FieldErrorOverlay";
import { JsonLd } from "@/components/marketing/JsonLd";
import { siteGraph } from "@/lib/structured-data";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-url";
import { LocaleBoundary } from "@/i18n/LocaleBoundary";
import "./globals.css";

// Marketing pair: Fraunces is a soft, warm serif close to the rounded bold headlines on the brand's Instagram
// slides; Nunito matches the friendly rounded labels there ("Counseling", "Our service") and stays legible small.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Trailing slash so relative paths resolve under a deploy prefix (GitHub Pages project sites).
  metadataBase: new URL(`${SITE_URL}/`),
  title: { default: "Momentizing — Online Counseling & Coaching for Expats and the Diaspora", template: "%s | Momentizing" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: "Momentizing — Healing Without Borders",
    description: SITE_DESCRIPTION,
    images: [{ url: "website/heart-psychology.png", width: 780, height: 541, alt: "A heart held in caring hands" }],
  },
  twitter: { card: "summary_large_image", title: "Momentizing — Healing Without Borders", description: SITE_DESCRIPTION },
  icons: { icon: "icon-192.png", apple: "icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#3B6B58", // matches --momentizing-teal
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="marketing-root min-h-full flex flex-col bg-momentizing-cream text-momentizing-slate">
        <JsonLd data={siteGraph} />
        <FieldErrorOverlay />
        <LocaleBoundary>
          <SiteChrome>{children}</SiteChrome>
        </LocaleBoundary>
      </body>
    </html>
  );
}
