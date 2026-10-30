import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Eye, FileText, GraduationCap, LogOut, Microscope, Pencil, Plus, Trash2, UserCog } from "lucide-react";
import { currentUsername, isAdmin, isConfigured } from "@/lib/auth";
import { articlePath } from "@/lib/posts";
import { readAll, type Case, type Course } from "@/lib/store";
import { RichEditor } from "@/components/admin/rich-editor";
import { MediaField } from "@/components/admin/media-field";
import { deleteItem, logout, saveCase, saveCourse, viewAsVisitor } from "./actions";
import { AccountForm } from "./account-form";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Administración", robots: { index: false } };

type Search = Promise<{ tab?: string; edit?: string; ok?: string }>;

const input = "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-ink outline-none focus:border-brand";

const TABS = [
  { id: "articulos", label: "Artículos", icon: FileText },
  { id: "cursos", label: "Cursos", icon: GraduationCap },
  { id: "casos", label: "Casos prácticos", icon: Microscope },
  { id: "cuenta", label: "Mi cuenta", icon: UserCog },
];

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function DeleteButton({ kind, id }: { kind: string; id: string }) {
  return (
    <form action={deleteItem}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <button title="Eliminar" className="p-2 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
    </form>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Search }) {
  if (!(await isAdmin())) {
    return (
      <section className="cartesian-grid min-h-[70vh] px-5 py-16">
        <LoginForm configured={await isConfigured()} />
      </section>
    );
  }

  const { tab = "articulos", edit, ok } = await searchParams;
  const [articles, courses, cases, username] = await Promise.all([readAll("articles"), readAll("courses"), readAll("cases"), currentUsername()]);
  const counts: Record<string, number> = { articulos: articles.length, cursos: courses.length, casos: cases.length };

  return (
    <section className="mx-auto max-w-7xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl">Panel de administración</h1>
          <p className="mt-1 text-sm">Sesión iniciada como <strong className="text-ink">{username}</strong> · Administrador</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={viewAsVisitor}>
            <button title="Cierra sesión y oculta el botón de acceso en este navegador" className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm hover:border-brand hover:text-brand"><Eye className="h-4 w-4" /> Ver como visitante</button>
          </form>
          <form action={logout}>
            <button className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm hover:border-brand hover:text-brand"><LogOut className="h-4 w-4" /> Salir</button>
          </form>
        </div>
      </div>

      <nav className="mt-8 flex gap-1 overflow-x-auto border-b-2 border-surface">
        {TABS.map((t) => (
          <Link key={t.id} href={`/admin?tab=${t.id}`} className={`-mb-0.5 flex items-center gap-2 whitespace-nowrap border-b-2 px-5 py-3 font-display uppercase tracking-wider ${tab === t.id ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"}`}>
            <t.icon className="h-4 w-4" /> {t.label}{t.id in counts ? ` (${counts[t.id]})` : ""}
          </Link>
        ))}
      </nav>

      {ok && <p className="mt-6 flex items-center gap-2 rounded-xl bg-brand/10 px-4 py-3 text-sm text-brand-dark"><CheckCircle2 className="h-4 w-4" /> Guardado y publicado en la web.</p>}

      <div className="mt-8">
        {tab === "articulos" && (
          <div className="space-y-3">
            <Link href="/admin/articulos/nuevo" className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand/40 p-5 font-display uppercase tracking-wider text-brand hover:bg-brand/5">
              <Plus className="h-5 w-5" /> Escribir nuevo artículo
            </Link>
            <p className="text-xs text-muted">Los artículos publicados aquí aparecen junto a los de Blogger en la portada, las secciones, el buscador y el menú.</p>
            {articles.length === 0 && <p className="p-6 text-center text-sm">Todavía no has publicado artículos desde el panel.</p>}
            {articles.map((a) => (
              <div key={a.id} className="flex items-center gap-4 rounded-2xl bg-surface p-4">
                {a.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.cover} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="cartesian-grid h-14 w-20 shrink-0 rounded-lg bg-white" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg text-ink">{a.title}</p>
                  <p className="flex items-center gap-2 text-xs text-muted">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${a.status === "published" ? "bg-brand text-white" : "bg-soft/40 text-ink"}`}>{a.status === "published" ? "Publicado" : "Borrador"}</span>
                    {new Date(a.publishedAt).toLocaleDateString("es-ES")} · {a.labels.join(", ") || "Sin sección"}
                  </p>
                </div>
                {a.status === "published" && <Link href={`/${articlePath(a)}`} target="_blank" title="Ver" className="p-2 hover:text-brand"><ExternalLink className="h-4 w-4" /></Link>}
                <Link href={`/admin/articulos/${a.id}`} title="Editar" className="p-2 hover:text-brand"><Pencil className="h-4 w-4" /></Link>
                <DeleteButton kind="articles" id={a.id} />
              </div>
            ))}
          </div>
        )}

        {(tab === "cursos" || tab === "casos") && (
          <CrudTab isCases={tab === "casos"} items={tab === "casos" ? cases : courses} edit={edit} />
        )}

        {tab === "cuenta" && <AccountForm username={username} />}
      </div>
    </section>
  );
}

function CrudTab({ isCases, items, edit }: { isCases: boolean; items: (Course | Case)[]; edit?: string }) {
  const tab = isCases ? "casos" : "cursos";
  const editing = items.find((i) => i.id === edit);
  const c = editing as Course | undefined;
  const k = editing as Case | undefined;
  // Casos antiguos en texto plano: se convierten a párrafos para el editor
  const caseHtml = k?.content && !k.content.trim().startsWith("<") ? k.content.split(/\n\s*\n/).map((p) => `<p>${p}</p>`).join("") : k?.content;

  return (
    <div className={`grid gap-10 ${isCases ? "lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)]" : "lg:grid-cols-[1fr_1.2fr]"}`}>
      <div className="space-y-3">
        <Link href={`/admin?tab=${tab}`} className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand/40 p-4 text-brand hover:bg-brand/5">
          <Plus className="h-5 w-5" /> {isCases ? "Nuevo caso práctico" : "Nuevo curso"}
        </Link>
        {items.length === 0 && <p className="p-6 text-center text-sm">Aún no hay elementos.</p>}
        {items.map((i) => (
          <div key={i.id} className={`flex items-center gap-3 rounded-2xl p-4 ${i.id === edit ? "bg-brand/10 ring-1 ring-brand" : "bg-surface"}`}>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg text-ink">{i.title}</p>
              <p className="truncate text-xs text-muted">{new Date(i.createdAt).toLocaleDateString("es-ES")}</p>
            </div>
            <Link href={isCases ? `/casos/c/${i.id}` : "/cursos"} target="_blank" title="Ver" className="p-2 hover:text-brand"><ExternalLink className="h-4 w-4" /></Link>
            <Link href={`/admin?tab=${tab}&edit=${i.id}`} title="Editar" className="p-2 hover:text-brand"><Pencil className="h-4 w-4" /></Link>
            <DeleteButton kind={isCases ? "cases" : "courses"} id={i.id} />
          </div>
        ))}
      </div>

      <form key={`${tab}-${edit ?? "new"}`} action={isCases ? saveCase : saveCourse} className="min-w-0 space-y-5 rounded-3xl bg-surface p-6 md:p-8">
        <h2 className="text-2xl">{editing ? "Editar" : "Crear"} {isCases ? "caso práctico" : "curso"}</h2>
        <input type="hidden" name="id" value={editing?.id ?? ""} />
        <input type="hidden" name="createdAt" value={editing?.createdAt ?? ""} />
        <Field label="Título"><input name="title" required defaultValue={editing?.title} className={input} /></Field>

        {isCases ? (
          <>
            <Field label="Resumen"><textarea name="summary" rows={2} required defaultValue={k?.summary} className={input} /></Field>
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Contenido</span>
              <RichEditor name="content" initialHtml={caseHtml ?? ""} placeholder="Desarrolla el caso práctico…" />
            </div>
            <Field label="Video de YouTube destacado (opcional)"><input name="videoUrl" type="url" defaultValue={k?.videoUrl} placeholder="https://www.youtube.com/watch?v=…" className={input} /></Field>
          </>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Idioma / área"><input name="language" required defaultValue={c?.language} placeholder="Inglés" className={input} /></Field>
              <Field label="Nivel"><input name="level" defaultValue={c?.level} placeholder="Básico, Intermedio…" className={input} /></Field>
            </div>
            <Field label="Descripción"><textarea name="description" rows={5} required defaultValue={c?.description} className={input} /></Field>
            <Field label="Enlace de Google Classroom"><input name="classroomUrl" type="url" required defaultValue={c?.classroomUrl} placeholder="https://classroom.google.com/…" className={input} /></Field>
          </>
        )}

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-ink">Imagen (opcional)</span>
          <MediaField name="image" defaultValue={editing?.image} />
        </div>

        <div className="flex gap-3">
          <button className="rounded-full bg-brand px-8 py-3 font-display uppercase tracking-wider text-white hover:bg-brand-dark">{editing ? "Guardar cambios" : "Publicar"}</button>
          {editing && <Link href={`/admin?tab=${tab}`} className="rounded-full px-6 py-3 text-sm hover:text-brand">Cancelar</Link>}
        </div>
      </form>
    </div>
  );
}
