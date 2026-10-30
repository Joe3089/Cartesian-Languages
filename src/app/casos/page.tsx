import type { Metadata } from "next";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { formatDate, getPosts } from "@/lib/blogger";
import { readAll } from "@/lib/store";
import { site } from "@/lib/site";
import { Reveal } from "@/components/reveal";

export const revalidate = 1800;
export const metadata: Metadata = {
  title: "Casos Empíricos Cartesianos",
  description: "Casos prácticos del método Cartesiano aplicados a la vida cotidiana, la educación y la comunicación.",
  alternates: { canonical: "/casos" },
};

type Item = { key: string; href: string; title: string; summary: string; image: string | null; date: string; video: boolean };

export default async function CasesPage() {
  const [cases, blogPosts] = await Promise.all([readAll("cases"), getPosts(site.blogs.casos).catch(() => [])]);

  const items: Item[] = [
    ...cases.map((c) => ({ key: c.id, href: `/casos/c/${c.id}`, title: c.title, summary: c.summary, image: c.image || null, date: c.createdAt, video: Boolean(c.videoUrl) })),
    ...blogPosts.map((p) => ({ key: p.id, href: `/casos/${p.path}`, title: p.title, summary: p.excerpt, image: p.image, date: p.published, video: /youtube|youtu\.be/.test(p.html) })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <header className="relative overflow-hidden bg-nav text-white">
        <div className="cartesian-grid absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 md:py-24">
          <Reveal>
            <p className="font-display uppercase tracking-[0.3em] text-brand">Cùisean Deuchainneil Cartesach</p>
            <h1 className="mt-2 text-5xl text-white md:text-7xl">Casos Empíricos Cartesianos</h1>
            <p className="mt-4 max-w-2xl text-white/60">El método Cartesiano llevado a la práctica: análisis, experiencias y casos reales.</p>
            <p className="mt-2 text-white/40">{items.length} casos</p>
          </Reveal>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={it.key} delay={(i % 3) * 0.08}>
            <Link href={it.href} className="group flex h-full flex-col overflow-hidden rounded-2xl bg-surface transition duration-500 hover:-translate-y-1.5 hover:shadow-2xl">
              <div className="relative aspect-[16/10] overflow-hidden bg-nav">
                {it.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="cartesian-grid grid h-full place-items-center font-display text-5xl text-brand">CEC</div>
                )}
                {it.video && <PlayCircle className="absolute right-4 top-4 h-9 w-9 text-white drop-shadow-lg" />}
                <span className="absolute left-4 top-4 bg-brand px-2.5 py-1 font-display text-xs uppercase tracking-wider text-white">Caso práctico</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <time className="text-xs text-muted">{formatDate(it.date)}</time>
                <h2 className="mt-2 text-xl leading-snug transition-colors group-hover:text-brand">{it.title}</h2>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed">{it.summary}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </section>
    </>
  );
}
