"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, LayoutDashboard, LogIn, Menu, Search, X } from "lucide-react";
import { labelHref, postHref, type PostSummary } from "@/lib/blogger";
import { sections, site } from "@/lib/site";
import { SearchDialog } from "./search-dialog";

type Role = "visitor" | "device" | "admin";

/** Rol según las marcas que deja el inicio de sesión (solo afecta a lo que se muestra). */
function readRole(): Role {
  const c = document.cookie;
  if (/(?:^|; )cl_role=admin/.test(c)) return "admin";
  if (/(?:^|; )cl_device=1/.test(c)) return "device";
  return "visitor";
}

function sectionTree(posts: PostSummary[]) {
  return sections.map((s) => ({
    ...s,
    groups: (s.children.length ? s.children : [s.label]).map((label) => ({
      label,
      posts: posts.filter((p) => p.labels.includes(label)).slice(0, 5),
    })),
  }));
}

export function Header({ posts }: { posts: PostSummary[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<Role>("visitor");
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const tree = sectionTree(posts);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    const onKey = (e: KeyboardEvent) => {
      // Acceso discreto al panel desde cualquier equipo: Ctrl + Alt + A
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        router.push("/admin");
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [router]);

  useEffect(() => {
    setOpen(null);
    setMobile(false);
    setRole(readRole());
  }, [pathname]);

  return (
    <>
      {/* Cabecera con logo (#f2f2f2) */}
      <div className="bg-surface">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-5 py-6 lg:py-8">
          <Link href="/" className="group flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.logo} alt={site.shortName} className="h-16 w-16 rounded-full object-cover shadow-md ring-2 ring-white transition-transform duration-500 group-hover:rotate-6 lg:h-20 lg:w-20" />
            <div>
              <p className="font-display text-2xl leading-tight text-logo sm:text-3xl lg:text-[34px]">{site.name}</p>
              <p className="mt-1 hidden max-w-3xl text-sm text-tagline md:line-clamp-2">{site.description}</p>
            </div>
          </Link>
          <AdminButton role={role} className="ml-auto hidden shrink-0 sm:flex" />
        </div>
      </div>

      {/* Barra de navegación (#232323) */}
      <header
        className={`sticky top-0 z-40 transition-shadow ${scrolled ? "bg-nav/95 shadow-xl backdrop-blur" : "bg-nav"}`}
        onMouseLeave={() => setOpen(null)}
      >
        <nav className="mx-auto flex max-w-[1400px] items-center px-2 lg:px-5">
          <button className="p-4 text-white xl:hidden" onClick={() => setMobile(true)} aria-label="Abrir menú">
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" aria-label="Inicio" className="group relative mr-2 block h-14 w-14 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.logo}
              alt={site.shortName}
              className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-full shadow-lg ring-2 ring-white/80 transition-all duration-500 group-hover:rotate-6 group-hover:scale-105 ${scrolled ? "h-12 w-12" : "h-16 w-16"}`}
            />
          </Link>

          <ul className="hidden flex-1 xl:flex">
            <li>
              <NavLink href="/" active={pathname === "/"}>Tòisich</NavLink>
            </li>
            {tree.map((s) => (
              <li key={s.title} onMouseEnter={() => setOpen(s.title)}>
                <button
                  onClick={() => setOpen(open === s.title ? null : s.title)}
                  className={`flex items-center gap-1 whitespace-nowrap px-2.5 py-4 2xl:px-3.5 font-display text-sm uppercase tracking-wide text-white transition-colors hover:bg-brand ${open === s.title ? "bg-brand" : ""}`}
                  aria-expanded={open === s.title}
                >
                  {s.title}
                  <ChevronDown className={`h-4 w-4 transition-transform ${open === s.title ? "rotate-180" : ""}`} />
                </button>
              </li>
            ))}
            <li>
              <NavLink href="/#podcast" active={false}>Podcast</NavLink>
            </li>
            <li>
              <NavLink href="/casos" active={pathname.startsWith("/casos")}>Casos</NavLink>
            </li>
            <li>
              <NavLink href="/cursos" active={pathname.startsWith("/cursos")}>Cursos</NavLink>
            </li>
          </ul>

          <button
            onClick={() => setSearch(true)}
            className="ml-auto flex items-center gap-2 rounded-full px-4 py-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
            <kbd className="hidden rounded border border-white/20 px-1.5 text-[11px] xl:inline">Ctrl K</kbd>
          </button>
        </nav>

        {/* Mega menú */}
        <AnimatePresence>
          {open && (
            <motion.div
              key={open}
              initial={{ opacity: 0, rotateX: -15, y: -8 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              style={{ transformOrigin: "top" }}
              className="absolute inset-x-0 top-full hidden border-t-2 border-brand bg-white shadow-2xl xl:block"
            >
              {tree
                .filter((s) => s.title === open)
                .map((s) => (
                  <div key={s.title} className="mx-auto grid max-w-7xl gap-8 px-5 py-8" style={{ gridTemplateColumns: `repeat(${Math.max(s.groups.length, 2)}, minmax(0,1fr))` }}>
                    {s.groups.map((g) => (
                      <div key={g.label}>
                        <Link href={labelHref(g.label)} className="mb-3 inline-block bg-brand px-3 py-1 font-display text-sm uppercase tracking-wider text-white hover:bg-brand-dark">
                          {g.label.replace(" (Columna Investigativa)", "")}
                        </Link>
                        <ul className="space-y-2">
                          {g.posts.map((p) => (
                            <li key={p.id}>
                              <Link href={postHref(p)} className="group flex items-start gap-2 text-sm text-ink transition-colors hover:text-brand">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand transition-transform group-hover:scale-150" />
                                {p.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <Link href={labelHref(s.label)} className="self-end justify-self-start text-sm font-medium text-brand hover:underline">
                      Ver todo en {s.title} →
                    </Link>
                  </div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Menú móvil */}
      <AnimatePresence>
        {mobile && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobile(false)} />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-y-auto bg-nav text-white"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
            >
              <div className="flex items-center justify-between border-b border-white/10 p-4">
                <span className="font-display text-xl">Menú</span>
                <button onClick={() => setMobile(false)} aria-label="Cerrar menú"><X /></button>
              </div>
              {role !== "visitor" && <AdminButton role={role} className="m-4 flex justify-center" />}
              <Link href="/" className="block px-5 py-3 font-display uppercase hover:bg-brand">Tòisich</Link>
              {tree.map((s) => (
                <details key={s.title} className="group border-t border-white/5">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 font-display uppercase hover:bg-brand">
                    {s.title}
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="bg-black/30 pb-2">
                    {s.groups.map((g) => (
                      <div key={g.label} className="px-5 pt-3">
                        <Link href={labelHref(g.label)} className="text-xs font-bold uppercase tracking-wider text-brand">{g.label.replace(" (Columna Investigativa)", "")}</Link>
                        {g.posts.map((p) => (
                          <Link key={p.id} href={postHref(p)} className="block py-1.5 pl-3 text-sm text-white/80 hover:text-white">{p.title}</Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </details>
              ))}
              {[["/#podcast","Podcast"],["/casos","Casos Empíricos"],["/cursos","Cursos"]].map(([href,label])=>(
                <Link key={href} href={href} className="block border-t border-white/5 px-5 py-3 font-display uppercase hover:bg-brand">{label}</Link>
              ))}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SearchDialog open={search} onClose={() => setSearch(false)} posts={posts} />
    </>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`block whitespace-nowrap px-2.5 py-4 2xl:px-3.5 font-display text-sm uppercase tracking-wide text-white transition-colors hover:bg-brand ${active ? "bg-brand" : ""}`}>
      {children}
    </Link>
  );
}

function AdminButton({ role, className = "" }: { role: Role; className?: string }) {
  if (role === "visitor") return null;
  const admin = role === "admin";
  return (
    <Link
      href="/admin"
      className={`items-center gap-2 rounded-full px-5 py-2.5 font-display text-sm uppercase tracking-wider shadow-md transition hover:-translate-y-0.5 ${admin ? "bg-brand text-white shadow-brand/30 hover:bg-brand-dark" : "border-2 border-brand bg-white text-brand hover:bg-brand hover:text-white"} ${className}`}
    >
      {admin ? <LayoutDashboard className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
      {admin ? "Panel de administración" : "Iniciar sesión"}
    </Link>
  );
}
