import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { formatDate, getPosts } from "@/lib/blogger";
import { site } from "@/lib/site";
import { Reveal } from "@/components/reveal";

export const revalidate = 1800;

type Params = { params: Promise<{ year: string; month: string; slug: string }> };

async function find(params: Params["params"]) {
  const { year, month, slug } = await params;
  const path = `${year}/${month}/${decodeURIComponent(slug).replace(/\.html$/, "")}`;
  const posts = await getPosts(site.blogs.casos).catch(() => []);
  return posts.find((p) => p.path === path) ?? null;
}

export async function generateStaticParams() {
  const posts = await getPosts(site.blogs.casos).catch(() => []);
  return posts.map((p) => {
    const [year, month, slug] = p.path.split("/");
    return { year, month, slug };
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await find(params);
  return post ? { title: post.title, description: post.excerpt, alternates: { canonical: `/casos/${post.path}` }, openGraph: { type: "article", title: post.title, description: post.excerpt, images: [post.image ?? "/brand/og-1200x630.jpg"] } } : {};
}

export default async function BlogCasePage({ params }: Params) {
  const post = await find(params);
  if (!post) notFound();

  return (
    <article>
      <header className="relative overflow-hidden bg-surface">
        <div className="cartesian-grid absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-5 py-14 text-center md:py-20">
          <Reveal>
            <Link href="/casos" className="inline-flex items-center gap-1 bg-brand px-3 py-1 font-display text-xs uppercase tracking-wider text-white hover:bg-nav">
              <ArrowLeft className="h-3.5 w-3.5" /> Casos Empíricos Cartesianos
            </Link>
            <h1 className="mt-6 text-4xl leading-tight md:text-5xl">{post.title}</h1>
            <p className="mt-6 flex items-center justify-center gap-3 text-sm text-muted">
              <time dateTime={post.published}>{formatDate(post.published)}</time>
              <span className="h-1 w-1 rounded-full bg-soft" />
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {post.readingTime} min</span>
            </p>
          </Reveal>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-5 py-14">
        <div className="post-body" dangerouslySetInnerHTML={{ __html: post.html }} />
      </div>
    </article>
  );
}
