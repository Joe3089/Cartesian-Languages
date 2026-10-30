import type { Metadata, Viewport } from "next";
import { Oswald, Roboto } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DescartesBot } from "@/components/descartes-bot";
import { getSummaries } from "@/lib/posts";
import { site } from "@/lib/site";
import "./globals.css";

const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald", display: "swap" });
const roboto = Roboto({ subsets: ["latin"], weight: ["300", "400", "500", "700"], variable: "--font-roboto", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.shortName}` },
  description: site.description,
  openGraph: { siteName: site.name, locale: "es_ES", type: "website", images: ["/brand/escudo-1024.png"] },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#232323" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const posts = await getSummaries();
  return (
    <html lang="es" className={`${oswald.variable} ${roboto.variable}`}>
      <body>
        <Header posts={posts} />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        <DescartesBot />
      </body>
    </html>
  );
}
