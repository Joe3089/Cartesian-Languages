import type { MetadataRoute } from "next";
import { indexable } from "@/lib/seo";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Copia sin indexar: se permite el rastreo para que los buscadores lean el "noindex" y la retiren
  if (!indexable) return { rules: { userAgent: "*", allow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/acceso"] },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
