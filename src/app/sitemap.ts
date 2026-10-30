import type { MetadataRoute } from "next";
import { getPosts, labelHref, postHref } from "@/lib/blogger";
import { getAllPosts } from "@/lib/posts";
import { readAll } from "@/lib/store";
import { site } from "@/lib/site";

export const revalidate = 1800;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, blogCases, cases] = await Promise.all([
    getAllPosts(),
    getPosts(site.blogs.casos).catch(() => []),
    readAll("cases").catch(() => []),
  ]);
  const labels = [...new Set(posts.flatMap((p) => p.labels))];
  const latest = posts[0]?.updated ?? new Date().toISOString();
  return [
    { url: site.url, lastModified: latest, changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/cursos`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/casos`, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((p) => ({
      url: `${site.url}${postHref(p)}`,
      lastModified: p.updated,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: p.image ? [p.image.startsWith("/") ? `${site.url}${p.image}` : p.image] : undefined,
    })),
    ...blogCases.map((p) => ({ url: `${site.url}/casos/${p.path}`, lastModified: p.updated, priority: 0.6 })),
    ...cases.map((c) => ({ url: `${site.url}/casos/c/${c.id}`, lastModified: c.createdAt, priority: 0.6 })),
    ...labels.map((l) => ({ url: `${site.url}${labelHref(l)}`, changeFrequency: "weekly" as const, priority: 0.5 })),
  ];
}
