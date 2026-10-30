import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ExternalLink, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { readAll, type Case, type Course } from "@/lib/store";
import { deleteItem, logout, saveCase, saveCourse } from "./actions";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Administración", robots: { index: false } };

type Search = Promise<{ tab?: string; edit?: string; ok?: string }>;

const input = "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-ink outline-none focus:border-brand";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Search }) {
  if (!(await isAdmin())) {
    return (
      <section className="cartesian-grid min-h-[70vh] px-5 py-16">
        <LoginForm configured={Boolean(process.env.ADMIN_PASSWORD)} />
      </section>
    );
  }

  const { tab = "cursos", edit, ok } = await searchParams;
  const isCases = tab === "casos";
  const [courses, cases] = await Promise.all([readAll("courses"), readAll("cases")]);
  const items: (Course | Case)[] = isCases ? cases : courses;
  const editing = items.find((i) => i.id === edit);
  const c = editing as Course | undefined;
  const k = editing as Case | undefined;

  return (
    <section className="mx-auto max-w-7xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl">Panel de administración</h1>
        <form action={logout}>
          <button className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm hover:border-brand hover:text-brand"><LogOut className="h-4 w-4" /> Salir</button>
        </form>
      </div>

      <nav className="mt-8 flex gap-2 border-b-2 border-surface">
        {[["cursos", `Cursos (${courses.length})`], ["casos", `Casos prácticos (${cases.length})`]].map(([t, label]) => (
          <Link key={t} href={`/admin?tab=${t}`} className={`-mb-0.5 border-b-2 px-5 py-3 font-display uppercase tracking-wider ${tab === t ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"}`}>
            {label}
          </Link>
        ))}
      </nav>

      {ok && (
        <p className="mt-6 flex items-center gap-2 rounded-xl bg-brand/10 px-4 py-3 text-sm text-brand-dark"><CheckCircle2 className="h-4 w-4" /> Guardado y publicado en la web.</p>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        {/* Listado */}
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
              <form action={deleteItem}>
                <input type="hidden" name="kind" value={isCases ? "cases" : "courses"} />
                <input type="hidden" name="id" value={i.id} />
                <button title="Eliminar" className="p-2 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </form>
            </div>
          ))}
        </div>

        {/* Formulario */}
        <form key={`${tab}-${edit ?? "new"}`} action={isCases ? saveCase : saveCourse} className="space-y-5 rounded-3xl bg-surface p-6 md:p-8">
          <h2 className="text-2xl">{editing ? "Editar" : "Crear"} {isCases ? "caso práctico" : "curso"}</h2>
          <input type="hidden" name="id" value={editing?.id ?? ""} />
          <input type="hidden" name="createdAt" value={editing?.createdAt ?? ""} />
          <Field label="Título"><input name="title" required defaultValue={editing?.title} className={input} /></Field>

          {isCases ? (
            <>
              <Field label="Resumen"><textarea name="summary" rows={2} required defaultValue={k?.summary} className={input} /></Field>
              <Field label="Contenido" hint="Separa los párrafos con una línea en blanco. Las líneas que empiecen con # se muestran como subtítulos.">
                <textarea name="content" rows={12} defaultValue={k?.content} className={input} />
              </Field>
              <Field label="Video de YouTube (opcional)"><input name="videoUrl" type="url" defaultValue={k?.videoUrl} placeholder="https://www.youtube.com/watch?v=…" className={input} /></Field>
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

          <Field label="Imagen (URL, opcional)" hint="Puedes copiar la dirección de una imagen subida a Blogger, Drive público, etc.">
            <input name="image" type="url" defaultValue={editing?.image} className={input} />
          </Field>

          <div className="flex gap-3">
            <button className="rounded-full bg-brand px-8 py-3 font-display uppercase tracking-wider text-white hover:bg-brand-dark">{editing ? "Guardar cambios" : "Publicar"}</button>
            {editing && <Link href={`/admin?tab=${tab}`} className="rounded-full px-6 py-3 text-sm hover:text-brand">Cancelar</Link>}
          </div>
        </form>
      </div>
    </section>
  );
}
