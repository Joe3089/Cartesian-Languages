import "server-only";
import { getPosts, summarize, toText, type Post } from "./blogger";
import { readAll, type Article } from "./store";
import { site } from "./site";

export const articlePath = (a: Pick<Article, "publishedAt" | "slug">) => {
  const d = new Date(a.publishedAt);
  return `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${a.slug}`;
};

function toPost(a: Article): Post {
  const text = toText(a.html);
  return {
    id: `local-${a.id}`,
    title: a.title,
    path: articlePath(a),
    published: a.publishedAt,
    updated: a.updatedAt,
    labels: a.labels,
    image: a.cover || a.html.match(/<img[^>]+src="([^"]+)"/i)?.[1] || null,
    excerpt: a.excerpt || (text.length > 220 ? text.slice(0, 220).replace(/\s\S*$/, "") + "…" : text),
    html: a.html,
    readingTime: Math.max(1, Math.round(text.split(" ").length / 220)),
    author: site.shortName,
  };
}

/** Entradas de Blogger + artículos publicados desde el panel, de más reciente a más antiguo. */
export async function getAllPosts(): Promise<Post[]> {
  const [blogger, articles] = await Promise.all([getPosts(), readAll("articles").catch(() => [])]);
  const local = articles.filter((a) => a.status === "published").map(toPost);
  return [...local, ...blogger].sort((a, b) => b.published.localeCompare(a.published));
}

export async function getSummaries() {
  return (await getAllPosts()).map(summarize);
}

export async function getPost(path: string) {
  const posts = await getAllPosts();
  const i = posts.findIndex((p) => p.path === path);
  if (i === -1) return null;
  const post = posts[i];
  const related = posts
    .filter((p) => p.id !== post.id)
    .map((p) => ({ p, score: p.labels.filter((l) => post.labels.includes(l)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => summarize(x.p));
  return {
    post,
    newer: i > 0 ? summarize(posts[i - 1]) : null,
    older: i < posts.length - 1 ? summarize(posts[i + 1]) : null,
    related,
  };
}
