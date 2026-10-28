import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "blogger.googleusercontent.com" },
      { protocol: "https", hostname: "*.bp.blogspot.com" },
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
