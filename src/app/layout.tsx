import type { Metadata, Viewport } from "next";
import { Oswald, Roboto } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DescartesBot } from "@/components/descartes-bot";
import { VisitTracker } from "@/components/visit-tracker";
import { getSummaries } from "@/lib/posts";
import { site } from "@/lib/site";
import { indexable, keywords, organizationLd } from "@/lib/seo";
import "./globals.css";

const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald", display: "swap" });
const roboto = Roboto({ subsets: ["latin"], weight: ["300", "400", "500", "700"], variable: "--font-roboto", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.shortName}` },
  description: site.description,
  applicationName: site.shortName,
  keywords,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: "education",
  robots: indexable
    ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }
    : { index: false, follow: false, googleBot: { index: false, follow: false } },
  // Códigos de Google Search Console y Bing Webmaster Tools (variables de entorno en Vercel)
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
  openGraph: { title: site.name, description: site.description, url: "/", siteName: site.name, locale: "es_ES", type: "website", images: [
      // Imagen JPEG estándar (no progresiva): WhatsApp no procesa bien las progresivas
      { url: "/brand/og-1200x630.jpg", type: "image/jpeg", width: 1200, height: 630, alt: site.name },
      { url: "/brand/og-600.jpg", type: "image/jpeg", width: 600, height: 600, alt: site.name },
    ],
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.description, images: ["/brand/og-1200x630.jpg"] },
};

export const viewport: Viewport = { themeColor: "#232323" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const posts = await getSummaries();
  return (
    <html lang="es" className={`${oswald.variable} ${roboto.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd()) }} />
        <Header posts={posts} />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        <DescartesBot />
        <VisitTracker />
      </body>
    </html>
  );
}
