import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { labelHref } from "@/lib/blogger";
import { getAllPosts, getSummaries } from "@/lib/posts";
import { sections } from "@/lib/site";
import { PostCard } from "@/components/post-card";
import { Reveal } from "@/components/reveal";

export const revalidate = 1800;

type Params = { params: Promise<{ label: string }> };

export async function generateStaticParams() {
  const labels = new Set((await getAllPosts()).flatMap((p) => p.labels));
  return [...labels].map((label) => ({ label }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const label = decodeURIComponent((await params).label);
  return { title: label, description: `Artículos de ${label} — Cartesian Languages`, alternates: { canonical: labelHref(label) } };
}

export default async function CategoryPage({ params }: Params) {
  const label = decodeURIComponent((await params).label);
  const posts = (await getSummaries()).filter((p) => p.labels.includes(label));
  if (!posts.length) notFound();

  const section = sections.find((s) => s.label === label || s.children.includes(label));
  const subs = section?.children ?? [];

  return (
    <>
      <header className="relative overflow-hidden bg-nav text-white">
        <div className="cartesian-grid absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 md:py-20">
          <Reveal>
            {section && section.label !== label && (
              <Link href={labelHref(section.label)} className="font-display uppercase tracking-[0.3em] text-brand hover:underline">{section.title}</Link>
            )}
            <h1 className="mt-2 text-5xl text-white md:text-7xl">{label.replace(" (Columna Investigativa)", "")}</h1>
            {label.includes("Columna Investigativa") && <p className="mt-2 text-white/60">Columna Investigativa</p>}
            <p className="mt-4 text-white/60">{posts.length} {posts.length === 1 ? "artículo" : "artículos"}</p>
          </Reveal>
          {subs.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {[section!.label, ...subs].map((s) => (
                <Link key={s} href={labelHref(s)} className={`rounded-full px-4 py-2 text-sm transition ${s === label ? "bg-brand text-white" : "bg-white/10 text-white/80 hover:bg-white/20"}`}>
                  {s === section!.label ? "Todo" : s}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 0.08}>
            <PostCard post={p} priority={i < 3} />
          </Reveal>
        ))}
      </section>
    </>
  );
}
