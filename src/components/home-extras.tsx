import Link from "next/link";
import { ArrowUpRight, GraduationCap } from "lucide-react";
import { formatDate, getPosts } from "@/lib/blogger";
import { readAll } from "@/lib/store";
import { site } from "@/lib/site";
import { Reveal } from "./reveal";

/** Bloques "Casos Empírico Cartesianos" y "Cartesian Languages · Courses" del blog original. */
export async function HomeExtras() {
  const [cases, blogCases, courses] = await Promise.all([
    readAll("cases"),
    getPosts(site.blogs.casos).catch(() => []),
    readAll("courses"),
  ]);
  const latest = [
    ...cases.map((c) => ({ key: c.id, href: `/casos/c/${c.id}`, title: c.title, date: c.createdAt })),
    ...blogCases.map((p) => ({ key: p.id, href: `/casos/${p.path}`, title: p.title, date: p.published })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-24 lg:grid-cols-2">
      <Reveal>
        <div className="flex h-full flex-col rounded-3xl bg-surface p-8">
          <h2 className="self-start bg-brand px-4 py-2 text-xl uppercase tracking-wider text-white">Casos Empírico Cartesianos</h2>
          <ul className="mt-6 flex-1 divide-y divide-black/5">
            {latest.map((c) => (
              <li key={c.key}>
                <Link href={c.href} className="group flex items-center justify-between gap-4 py-4">
                  <span>
                    <span className="block font-display text-lg leading-snug text-ink transition-colors group-hover:text-brand">{c.title}</span>
                    <span className="text-xs text-muted">{formatDate(c.date)}</span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-soft transition group-hover:text-brand" />
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/casos" className="mt-4 text-sm font-medium text-brand hover:underline">Ver todos los casos prácticos →</Link>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="flex h-full flex-col rounded-3xl bg-nav p-8 text-white">
          <h2 className="self-start bg-brand px-4 py-2 text-xl uppercase tracking-wider text-white">Cartesian Languages</h2>
          <p className="mt-6 font-display text-4xl text-white">Courses</p>
          <ul className="mt-6 flex-1 space-y-3">
            {courses.slice(0, 3).map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white/5 p-4">
                <span>
                  <span className="block font-display text-lg">{c.title}</span>
                  <span className="text-xs text-white/50">{c.language}{c.level ? ` · ${c.level}` : ""}</span>
                </span>
                <a href={c.classroomUrl} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm hover:bg-brand-dark">
                  <GraduationCap className="h-4 w-4" /> Classroom
                </a>
              </li>
            ))}
          </ul>
          <Link href="/cursos" className="mt-4 text-sm font-medium text-brand hover:underline">Ver todos los cursos →</Link>
        </div>
      </Reveal>
    </section>
  );
}
