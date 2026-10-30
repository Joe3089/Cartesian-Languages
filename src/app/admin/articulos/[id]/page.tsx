import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, ExternalLink } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { articlePath } from "@/lib/posts";
import { readOne } from "@/lib/store";
import { sections } from "@/lib/site";
import { RichEditor } from "@/components/admin/rich-editor";
import { MediaField } from "@/components/admin/media-field";
import { saveArticle } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Editor de artículos", robots: { index: false } };

const input = "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-ink outline-none focus:border-brand";
const LABELS = sections.flatMap((s) => [s.label, ...s.children]);

export default async function ArticleEditorPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  if (!(await isAdmin())) redirect("/admin");
  const { id } = await params;
  const { ok } = await searchParams;
  const article = id === "nuevo" ? null : await readOne("articles", id);
  if (id !== "nuevo" && !article) redirect("/admin?tab=articulos");

  const custom = article?.labels.filter((l) => !LABELS.includes(l)) ?? [];
  const localDate = (iso?: string) => (iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

  return (
    <section className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/admin?tab=articulos" className="flex items-center gap-1 text-sm hover:text-brand"><ArrowLeft className="h-4 w-4" /> Volver a artículos</Link>
        {article?.status === "published" && (
          <Link href={`/${articlePath(article)}`} target="_blank" className="flex items-center gap-1 text-sm text-brand hover:underline">Ver publicado <ExternalLink className="h-4 w-4" /></Link>
        )}
      </div>
      <h1 className="mt-4 text-4xl">{article ? "Editar artículo" : "Nuevo artículo"}</h1>
      {ok && <p className="mt-4 flex items-center gap-2 rounded-xl bg-brand/10 px-4 py-3 text-sm text-brand-dark"><CheckCircle2 className="h-4 w-4" /> Guardado. Los cambios ya están en la web.</p>}

      <form action={saveArticle} className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <input type="hidden" name="id" value={article?.id ?? ""} />
        <div className="min-w-0 space-y-5">
          <input name="title" required defaultValue={article?.title} placeholder="Título del artículo" className="w-full border-b-2 border-surface bg-transparent pb-3 font-display text-4xl text-ink outline-none placeholder:text-soft focus:border-brand" />
          <RichEditor name="html" initialHtml={article?.html ?? ""} />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <div className="space-y-4 rounded-2xl bg-surface p-5">
            <p className="font-display uppercase tracking-wider text-ink">Publicación</p>
            <select name="status" defaultValue={article?.status ?? "published"} className={input}>
              <option value="published">Publicado (visible en la web)</option>
              <option value="draft">Borrador (solo en el panel)</option>
            </select>
            <label className="block space-y-1.5">
              <span className="text-xs">Fecha de publicación</span>
              <input type="datetime-local" name="publishedAt" defaultValue={localDate(article?.publishedAt)} className={input} />
            </label>
            {!article && (
              <label className="block space-y-1.5">
                <span className="text-xs">Enlace personalizado (opcional)</span>
                <input name="slug" placeholder="se genera a partir del título" className={input} />
              </label>
            )}
            <button className="w-full rounded-full bg-brand py-3 font-display uppercase tracking-wider text-white shadow-lg shadow-brand/30 hover:bg-brand-dark">
              {article ? "Guardar cambios" : "Publicar"}
            </button>
          </div>

          <div className="space-y-3 rounded-2xl bg-surface p-5">
            <p className="font-display uppercase tracking-wider text-ink">Imagen de portada</p>
            <MediaField name="cover" defaultValue={article?.cover} />
            <p className="text-xs text-muted">Si la dejas vacía se usa la primera imagen del artículo.</p>
          </div>

          <div className="space-y-3 rounded-2xl bg-surface p-5">
            <p className="font-display uppercase tracking-wider text-ink">Resumen</p>
            <textarea name="excerpt" rows={3} defaultValue={article?.excerpt} placeholder="Texto breve para las tarjetas (opcional)" className={input} />
          </div>

          <div className="space-y-3 rounded-2xl bg-surface p-5">
            <p className="font-display uppercase tracking-wider text-ink">Secciones</p>
            {sections.map((s) => (
              <div key={s.title} className="space-y-1">
                {[s.label, ...s.children].map((l, i) => (
                  <label key={l} className={`flex items-center gap-2 text-sm ${i ? "pl-5" : "font-medium text-ink"}`}>
                    <input type="checkbox" name="labels" value={l} defaultChecked={article?.labels.includes(l)} className="accent-brand" />
                    {l.replace(" (Columna Investigativa)", "")}
                  </label>
                ))}
              </div>
            ))}
            <input name="extraLabels" defaultValue={custom.join(", ")} placeholder="Otras etiquetas, separadas por comas" className={input} />
          </div>
        </aside>
      </form>
    </section>
  );
}
