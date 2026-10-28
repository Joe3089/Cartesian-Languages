import { site } from "./site";

export type Post = {
  id: string;
  title: string;
  path: string; // "2025/11/la-traduccion-cartesiana"
  published: string;
  updated: string;
  labels: string[];
  image: string | null;
  excerpt: string;
  html: string;
  readingTime: number;
  author: string;
};

export type PostSummary = Omit<Post, "html">;

type Entry = {
  id: { $t: string };
  title: { $t: string };
  published: { $t: string };
  updated: { $t: string };
  content?: { $t: string };
  summary?: { $t: string };
  category?: { term: string }[];
  link: { rel: string; href: string }[];
  author?: { name: { $t: string } }[];
  media$thumbnail?: { url: string };
};

const FEED = `${site.blogger}/feeds/posts/default?alt=json&max-results=500`;

/** Pide la imagen de Blogger en alta resolución. */
export function hiRes(url: string, size = 1600) {
  return url
    .replace(/\/s\d+(-[a-z0-9-]+)?\/(?=[^/]+$)/i, `/s${size}/`)
    .replace(/=s\d+(-[a-z0-9-]+)?$/i, `=s${size}`);
}

const decode = (s: string) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&");

const toText = (html: string) =>
  decode(html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

const BLOG_HOST = /https?:\/\/cfacartesianlanguages\.blogspot\.com/i;

/** Limpia los estilos en línea de Blogger para que manden los estilos del nuevo diseño. */
function cleanHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/?o:p>/gi, "")
    .replace(/\sstyle="([^"]*)"/gi, (_, css: string) => {
      const kept = css
        .split(";")
        .filter((d) => /^\s*(text-align|font-weight|font-style|text-decoration)\s*:/i.test(d))
        .join(";");
      return kept ? ` style="${kept}"` : "";
    })
    .replace(/<img\b([^>]*)>/gi, (_, attrs: string) => {
      const a = attrs.replace(/\s(width|height)="\d+"/gi, "");
      return `<img loading="lazy" decoding="async"${a}>`;
    })
    .replace(/href="([^"]+)"/gi, (m, href: string) =>
      BLOG_HOST.test(href) ? `href="${href.replace(BLOG_HOST, "").replace(/\.html(?=$|[#?])/, "") || "/"}"` : m,
    );
}

function normalize(e: Entry): Post {
  const alt = e.link.find((l) => l.rel === "alternate")?.href ?? "";
  const path = alt.replace(/^https?:\/\/[^/]+\//, "").replace(/\.html$/, "");
  const raw = e.content?.$t ?? e.summary?.$t ?? "";
  const text = toText(raw);
  const firstImg = raw.match(/<img[^>]+src="([^"]+)"/i)?.[1];
  const thumb = e.media$thumbnail?.url ?? firstImg;
  return {
    id: e.id.$t.split("post-").pop()!,
    title: decode(e.title.$t).trim() || "Sin título",
    path,
    published: e.published.$t,
    updated: e.updated.$t,
    labels: (e.category ?? []).map((c) => c.term),
    image: thumb ? hiRes(thumb) : null,
    excerpt: text.length > 220 ? text.slice(0, 220).replace(/\s\S*$/, "") + "…" : text,
    html: cleanHtml(raw),
    readingTime: Math.max(1, Math.round(text.split(" ").length / 220)),
    author: e.author?.[0]?.name.$t ?? site.shortName,
  };
}

/** Lee todas las entradas del feed público de Blogger (ISR: se refresca cada 30 min). */
export async function getPosts(): Promise<Post[]> {
  const res = await fetch(FEED, { next: { revalidate: 1800, tags: ["posts"] } });
  if (!res.ok) throw new Error(`Blogger feed ${res.status}`);
  const data = (await res.json()) as { feed: { entry?: Entry[] } };
  return (data.feed.entry ?? []).map(normalize);
}

export const summarize = ({ html: _html, ...rest }: Post): PostSummary => rest;

export async function getSummaries() {
  return (await getPosts()).map(summarize);
}

export async function getPost(path: string) {
  const posts = await getPosts();
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

export const labelHref = (label: string) => `/categoria/${encodeURIComponent(label)}`;
export const postHref = (p: { path: string }) => `/${p.path}`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
