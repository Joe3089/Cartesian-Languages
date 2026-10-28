import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, BookOpen, Feather, Languages, Mic, ScrollText } from "lucide-react";
import { formatDate, getSummaries, labelHref, postHref } from "@/lib/blogger";
import { sections, site } from "@/lib/site";
import { PostGrid } from "@/components/post-grid";
import { Podcast } from "@/components/podcast";
import { Reveal } from "@/components/reveal";
import { SocialLinks } from "@/components/social-links";

export const revalidate = 1800;

const icons = [Feather, BookOpen, Languages, Mic, ScrollText];

export default async function Home() {
  const posts = await getSummaries();
  const [featured, ...rest] = posts;
  const secondary = rest.slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="cartesian-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-12 lg:pt-16">
          <Reveal>
            <p className="font-display uppercase tracking-[0.35em] text-brand">Cogito, ergo sum</p>
            <h1 className="mt-3 max-w-4xl text-5xl leading-[1.05] md:text-7xl">
              Transformamos ideas complejas en <span className="relative whitespace-nowrap text-brand">contenido reflexivo<svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none"><path d="M2 9c60-6 180-8 296-3" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg></span> y conciso.
            </h1>
          </Reveal>

          {featured && (
            <div className="mt-12 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <Reveal delay={0.1}>
                <Link href={postHref(featured)} className="group relative block aspect-[16/11] overflow-hidden rounded-3xl bg-nav lg:aspect-auto lg:h-full lg:min-h-[480px]">
                  {featured.image && (
                    <Image src={featured.image} alt={featured.title} fill priority sizes="(min-width:1024px) 60vw, 100vw" className="object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-nav via-nav/50 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                    <span className="bg-brand px-3 py-1 font-display text-xs uppercase tracking-wider text-white">Lo más reciente</span>
                    <h2 className="mt-4 text-2xl leading-tight text-white md:text-4xl">{featured.title}</h2>
                    <p className="mt-3 line-clamp-2 max-w-2xl text-white/70">{featured.excerpt}</p>
                    <p className="mt-4 flex items-center gap-2 text-sm text-white/60">
                      {formatDate(featured.published)} · {featured.readingTime} min de lectura
                      <ArrowUpRight className="h-5 w-5 text-brand transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </p>
                  </div>
                </Link>
              </Reveal>
              <div className="flex flex-col gap-6">
                {secondary.map((p, i) => (
                  <Reveal key={p.id} delay={0.2 + i * 0.1} className="flex-1">
                    <Link href={postHref(p)} className="group flex h-full gap-4 rounded-2xl bg-surface p-4 transition hover:shadow-xl">
                      <div className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-xl bg-nav">
                        {p.image && <Image src={p.image} alt="" fill sizes="112px" className="object-cover transition-transform duration-700 group-hover:scale-110" />}
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-xs font-medium uppercase tracking-wider text-brand">{p.labels[0]?.replace(" (Columna Investigativa)", "") ?? "Artículo"}</span>
                        <h3 className="mt-1 line-clamp-3 text-lg leading-snug transition-colors group-hover:text-brand">{p.title}</h3>
                        <p className="mt-1 text-xs text-muted">{formatDate(p.published)}</p>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CINTA DE SERVICIOS */}
      <div className="overflow-hidden bg-brand py-4 text-white">
        <div className="flex w-max animate-marquee gap-12 font-display text-xl uppercase tracking-widest">
          {[...Array(2)].flatMap((_, k) =>
            [...site.services, "Lenguajes Especializados de Regulación (LER)", "Método lógico-deductivo Cartesiano"].map((s) => (
              <span key={`${k}-${s}`} className="flex items-center gap-12">{s}<span className="text-white/50">✦</span></span>
            )),
          )}
        </div>
      </div>

      {/* SECCIONES */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <Reveal>
          <h2 className="text-4xl md:text-5xl">Explora el saber <span className="text-brand">Cartesiano</span></h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {sections.map((s, i) => {
            const Icon = icons[i];
            const count = posts.filter((p) => p.labels.includes(s.label)).length;
            return (
              <Reveal key={s.title} delay={i * 0.06}>
                <Link href={labelHref(s.label)} className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-surface p-6 transition-colors duration-500 hover:bg-nav">
                  <Icon className="h-9 w-9 text-brand transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
                  <h3 className="mt-6 text-xl leading-tight transition-colors group-hover:text-white">{s.title}</h3>
                  <p className="mt-2 text-sm group-hover:text-white/60">{count} {count === 1 ? "artículo" : "artículos"}</p>
                  <ArrowUpRight className="absolute right-5 top-5 h-5 w-5 text-soft transition group-hover:text-brand" />
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ARTÍCULOS */}
      <section className="mx-auto max-w-7xl px-5 pb-24">
        <Reveal>
          <div className="mb-8 flex items-end justify-between gap-4 border-b-2 border-surface pb-4">
            <h2 className="text-4xl md:text-5xl">Artículos</h2>
            <p className="text-sm text-muted">{posts.length} publicaciones</p>
          </div>
        </Reveal>
        <PostGrid posts={posts} />
      </section>

      <Podcast />

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pt-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-brand p-10 text-white md:p-16">
            <div className="absolute -right-20 -top-20 h-80 w-80 animate-float rounded-full bg-white/10" />
            <div className="absolute -bottom-24 right-40 h-56 w-56 animate-float rounded-full bg-black/10 [animation-delay:2s]" />
            <div className="relative grid items-center gap-10 lg:grid-cols-[1.5fr_1fr]">
              <div>
                <h2 className="text-4xl text-white md:text-5xl">¿Necesitas traducir, redactar o comunicar con precisión?</h2>
                <p className="mt-4 max-w-2xl text-white/85">{site.services.join(" · ")}. Escríbenos y te asesoramos con el método lógico-deductivo Cartesiano.</p>
              </div>
              <div className="flex flex-col items-start gap-6 lg:items-end">
                <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white px-8 py-4 font-display text-lg uppercase tracking-wider text-brand shadow-xl transition hover:-translate-y-1 hover:bg-nav hover:text-white">
                  Contactar por WhatsApp
                </a>
                <SocialLinks />
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
