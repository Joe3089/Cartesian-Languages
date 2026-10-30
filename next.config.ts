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
  async redirects() {
    return [
      // Enlaces antiguos de Blogger
      { source: "/search/label/:label", destination: "/categoria/:label", permanent: true },
      { source: "/p/:page.html", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
