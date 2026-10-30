import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Artículos largos diseñados en el editor visual
    serverActions: { bodySizeLimit: "4mb" },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "blogger.googleusercontent.com" },
      { protocol: "https", hostname: "*.bp.blogspot.com" },
      // Portadas pegadas por URL desde el panel
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    // Imágenes de marca accesibles para los generadores de vistas previas (WhatsApp, redes sociales)
    const brand = { source: "/brand/:file*", headers: [{ key: "Access-Control-Allow-Origin", value: "*" }, { key: "Cache-Control", value: "public, max-age=86400" }] };
    // Refuerzo del noindex para la copia de portafolio (solo páginas: las imágenes de vista previa deben seguir accesibles)
    const noindex = { source: "/((?!brand/|_next/).*)", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] };
    return process.env.SEO_NOINDEX === "1" ? [brand, noindex] : [brand];
  },
  async redirects() {
    return [
      // Enlaces antiguos de Blogger
      { source: "/search/label/:label", destination: "/categoria/:label", permanent: true },
      { source: "/p/:page.html", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
