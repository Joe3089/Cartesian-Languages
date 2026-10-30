import type { Metadata } from "next";
import { ArrowUpRight, GraduationCap, Languages, Signal } from "lucide-react";
import { getPosts } from "@/lib/blogger";
import { readAll } from "@/lib/store";
import { site } from "@/lib/site";
import { Reveal } from "@/components/reveal";

export const revalidate = 1800;
export const metadata: Metadata = {
  title: "Cursos",
  description: "Cursos de idiomas de Cartesian Languages con el método lógico-deductivo Cartesiano: inglés y más, con clases en Google Classroom.",
  alternates: { canonical: "/cursos" },
};

export default async function CoursesPage() {
  const [courses, blogPosts] = await Promise.all([readAll("courses"), getPosts(site.blogs.cursos).catch(() => [])]);

  // Datos estructurados de cursos (resultados enriquecidos en Google)
  const coursesLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: courses.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Course",
        name: c.title,
        description: c.description,
        inLanguage: "es",
        url: `${site.url}/cursos`,
        provider: { "@type": "EducationalOrganization", name: site.name, sameAs: site.url },
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(coursesLd) }} />
      <header className="relative overflow-hidden bg-nav text-white">
        <div className="cartesian-grid absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 md:py-24">
          <Reveal>
            <p className="font-display uppercase tracking-[0.3em] text-brand">Cartesian Languages</p>
            <h1 className="mt-2 text-5xl text-white md:text-7xl">Courses</h1>
            <p className="mt-4 max-w-2xl text-white/60">
              Formación en idiomas con el método lógico-deductivo Cartesiano. Inscríbete y accede a tus clases, materiales y tareas desde Google Classroom.
            </p>
          </Reveal>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((c, i) => (
          <Reveal key={c.id} delay={(i % 3) * 0.08}>
            <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-surface transition duration-500 hover:-translate-y-1.5 hover:shadow-2xl">
              <div className="relative aspect-[16/9] overflow-hidden bg-nav">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt={c.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="cartesian-grid flex h-full flex-col items-center justify-center gap-2 text-brand">
                    <GraduationCap className="h-16 w-16 transition-transform duration-500 group-hover:-rotate-12" />
                    <span className="font-display text-3xl uppercase tracking-widest">{c.language}</span>
                  </div>
                )}
                <span className="absolute left-4 top-4 bg-brand px-2.5 py-1 font-display text-xs uppercase tracking-wider text-white">{c.language}</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-2xl leading-snug">{c.title}</h2>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1"><Languages className="h-4 w-4" /> {c.language}</span>
                  {c.level && <span className="flex items-center gap-1"><Signal className="h-4 w-4" /> {c.level}</span>}
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed">{c.description}</p>
                <a href={c.classroomUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 font-display uppercase tracking-wider text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark">
                  <GraduationCap className="h-5 w-5" /> Entrar al Classroom
                </a>
              </div>
            </article>
          </Reveal>
        ))}
        {courses.length === 0 && <p className="col-span-full py-10 text-center">Próximamente nuevos cursos.</p>}
      </section>

      {blogPosts.length > 0 && (
        <section className="mx-auto max-w-7xl px-5">
          <h2 className="mb-6 border-l-4 border-brand pl-4 text-3xl">Publicaciones de Cartesian Languages Courses</h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {blogPosts.map((p) => (
              <li key={p.id}>
                <a href={`${site.blogs.cursos}/${p.path}.html`} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-4 rounded-2xl bg-surface p-5 transition hover:bg-nav">
                  <span className="font-display text-lg text-ink group-hover:text-white">{p.title}</span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-brand" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 pt-16 text-center">
        <p>¿Quieres información sobre otro idioma o un curso a medida?</p>
        <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full border-2 border-brand px-8 py-3 font-display uppercase tracking-wider text-brand transition hover:bg-brand hover:text-white">
          Escríbenos por WhatsApp
        </a>
      </section>
    </>
  );
}
