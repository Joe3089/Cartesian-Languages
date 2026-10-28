import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { formatDate, getPost, getPosts, labelHref, postHref } from "@/lib/blogger";
import { site } from "@/lib/site";
import { PostCard } from "@/components/post-card";
import { ReadingProgress, ShareButtons } from "@/components/post-extras";
import { Reveal } from "@/components/reveal";

export const revalidate = 1800;

type Params = { params: Promise<{ year: string; month: string; slug: string }> };

const toPath = ({ year, month, slug }: Awaited<Params["params"]>) => `${year}/${month}/${decodeURIComponent(slug).replace(/\.html$/, "")}`;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => {
    const [year, month, slug] = p.path.split("/");
    return { year, month, slug };
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const data = await getPost(toPath(await params));
  if (!data) return {};
  const { post } = data;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: postHref(post) },
    openGraph: { type: "article", title: post.title, description: post.excerpt, publishedTime: post.published, images: post.image ? [post.image] : [site.logo] },
  };
}

export default async function PostPage({ params }: Params) {
  const p = await params;
  // Enlaces antiguos de Blogger terminados en .html
  if (decodeURIComponent(p.slug).endsWith(".html")) permanentRedirect(`/${toPath(p)}`);

  const data = await getPost(toPath(p));
  if (!data) notFound();
  const { post, newer, older, related } = data;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.published,
    dateModified: post.updated,
    image: post.image ?? site.logo,
    author: { "@type": "Organization", name: site.name },
    publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: site.logo } },
  };

  return (
    <article>
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="relative overflow-hidden bg-surface">
        <div className="cartesian-grid absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-5 py-14 text-center md:py-20">
          <Reveal>
            <nav className="mb-6 flex flex-wrap justify-center gap-2">
              {post.labels.map((l) => (
                <Link key={l} href={labelHref(l)} className="bg-brand px-3 py-1 font-display text-xs uppercase tracking-wider text-white transition hover:bg-nav">
                  {l.replace(" (Columna Investigativa)", "")}
                </Link>
              ))}
            </nav>
            <h1 className="text-4xl leading-tight md:text-6xl">{post.title}</h1>
            <p className="mt-6 flex items-center justify-center gap-3 text-sm text-muted">
              <time dateTime={post.published}>{formatDate(post.published)}</time>
              <span className="h-1 w-1 rounded-full bg-soft" />
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {post.readingTime} min de lectura</span>
            </p>
          </Reveal>
        </div>
      </header>

      {post.image && (
        <Reveal className="mx-auto -mt-2 max-w-5xl px-5 pt-10">
          <div className="relative overflow-hidden rounded-3xl bg-surface shadow-2xl">
            <Image src={post.image} alt={post.title} width={1600} height={1000} priority sizes="(min-width:1024px) 1024px, 100vw" className="mx-auto max-h-[70vh] w-auto object-contain" />
          </div>
        </Reveal>
      )}

      <div className="mx-auto max-w-3xl px-5 py-14">
        <div className="post-body" dangerouslySetInnerHTML={{ __html: post.html }} />

        <div className="mt-14 border-y border-black/5 py-6">
          <ShareButtons title={post.title} url={`${site.url}${postHref(post)}`} />
        </div>

        <nav className="mt-10 grid gap-4 sm:grid-cols-2">
          {older ? (
            <Link href={postHref(older)} className="group rounded-2xl bg-surface p-5 transition hover:bg-nav">
              <span className="flex items-center gap-1 text-xs uppercase tracking-wider text-brand"><ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Anterior</span>
              <span className="mt-2 block font-display text-lg leading-snug text-ink group-hover:text-white">{older.title}</span>
            </Link>
          ) : <span />}
          {newer && (
            <Link href={postHref(newer)} className="group rounded-2xl bg-surface p-5 text-right transition hover:bg-nav">
              <span className="flex items-center justify-end gap-1 text-xs uppercase tracking-wider text-brand">Siguiente <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              <span className="mt-2 block font-display text-lg leading-snug text-ink group-hover:text-white">{newer.title}</span>
            </Link>
          )}
        </nav>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-5">
          <h2 className="mb-8 border-l-4 border-brand pl-4 text-3xl">También te puede interesar</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => <PostCard key={r.id} post={r} />)}
          </div>
        </section>
      )}
    </article>
  );
}
