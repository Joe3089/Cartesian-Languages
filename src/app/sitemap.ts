import type { MetadataRoute } from "next";
import { labelHref, postHref } from "@/lib/blogger";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const labels = [...new Set(posts.flatMap((p) => p.labels))];
  return [
    { url: site.url, changeFrequency: "daily", priority: 1 },
    ...posts.map((p) => ({ url: `${site.url}${postHref(p)}`, lastModified: p.updated, priority: 0.8 })),
    ...labels.map((l) => ({ url: `${site.url}${labelHref(l)}`, priority: 0.5 })),
  ];
}
