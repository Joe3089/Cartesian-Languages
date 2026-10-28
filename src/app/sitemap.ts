import type { MetadataRoute } from "next";
import { getPosts, labelHref, postHref } from "@/lib/blogger";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  const labels = [...new Set(posts.flatMap((p) => p.labels))];
  return [
    { url: site.url, changeFrequency: "daily", priority: 1 },
    ...posts.map((p) => ({ url: `${site.url}${postHref(p)}`, lastModified: p.updated, priority: 0.8 })),
    ...labels.map((l) => ({ url: `${site.url}${labelHref(l)}`, priority: 0.5 })),
  ];
}
