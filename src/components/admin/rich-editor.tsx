"use client";

import { useRef, useState } from "react";
import { EditorContent, Node, mergeAttributes, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Youtube from "@tiptap/extension-youtube";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import { upload } from "@vercel/blob/client";
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Code, Code2, Eraser, Film, Heading, Highlighter,
  ImagePlus, Italic, Link2, List, ListOrdered, Minus, Quote, Redo2, Strikethrough, Table, Underline, Undo2, MonitorPlay as YoutubeIcon,
} from "lucide-react";

/** Video subido (MP4/WebM) incrustado con controles. */
const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes: () => ({ src: { default: null }, width: { default: null } }),
  parseHTML: () => [{ tag: "video" }],
  renderHTML: ({ HTMLAttributes }) => [
    "video",
    mergeAttributes({ controls: "true", playsinline: "true", preload: "metadata", class: "cl-video" }, HTMLAttributes),
  ],
});

const FONTS = [
  ["", "Fuente"],
  ["var(--font-roboto)", "Roboto"],
  ["var(--font-oswald)", "Oswald"],
  ["Georgia, serif", "Georgia"],
  ["'Times New Roman', serif", "Times"],
  ["Arial, sans-serif", "Arial"],
  ["'Courier New', monospace", "Courier"],
  ["'Comic Sans MS', cursive", "Manuscrita"],
];
const SIZES = ["", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "40px", "48px", "64px"];

export async function uploadMedia(file: File, onProgress?: (p: number) => void) {
  const clean = file.name.normalize("NFD").replace(/[^\w.-]+/g, "-").toLowerCase();
  const blob = await upload(`media/${clean}`, file, {
    access: "private",
    handleUploadUrl: "/api/upload",
    multipart: file.size > 8 * 1024 * 1024,
    onUploadProgress: ({ percentage }) => onProgress?.(percentage),
  });
  return `/api/media/${blob.pathname.split("/").map(encodeURIComponent).join("/")}`;
}

export function RichEditor({ name, initialHtml = "", placeholder = "Escribe aquí tu publicación…" }: { name: string; initialHtml?: string; placeholder?: string }) {
  const [html, setHtml] = useState(initialHtml);
  const [source, setSource] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: true } }),
      Image.configure({ resize: { enabled: true, alwaysPreserveAspectRatio: true, minWidth: 80, minHeight: 40 } }),
      TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
      TextStyleKit,
      Highlight.configure({ multicolor: true }),
      Youtube.configure({ nocookie: true, width: 840, height: 472 }),
      TableKit.configure({ table: { resizable: true } }),
      Placeholder.configure({ placeholder }),
      Video,
    ],
    content: initialHtml,
    editorProps: { attributes: { class: "post-body min-h-[420px] px-6 py-5 outline-none" } },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  async function onFile(file: File | undefined, kind: "image" | "video") {
    if (!file || !editor) return;
    try {
      setProgress(0);
      const src = await uploadMedia(file, setProgress);
      if (kind === "image") editor.chain().focus().setImage({ src, alt: file.name }).run();
      else editor.chain().focus().insertContent({ type: "video", attrs: { src } }).run();
    } catch (e) {
      alert(`No se pudo subir el archivo: ${(e as Error).message}`);
    } finally {
      setProgress(null);
    }
  }

  function toggleSource() {
    if (source && editor) editor.commands.setContent(html, { emitUpdate: false });
    setSource(!source);
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white">
      <input type="hidden" name={name} value={html} />
      <input ref={imageInput} type="file" accept="image/*" hidden onChange={(e) => { onFile(e.target.files?.[0], "image"); e.target.value = ""; }} />
      <input ref={videoInput} type="file" accept="video/*" hidden onChange={(e) => { onFile(e.target.files?.[0], "video"); e.target.value = ""; }} />

      <div className="sticky top-14 z-10 flex flex-wrap items-center gap-0.5 rounded-t-2xl border-b border-black/10 bg-surface p-2">
        {editor && !source && <Toolbar editor={editor} onImage={() => imageInput.current?.click()} onVideo={() => videoInput.current?.click()} />}
        <button type="button" onClick={toggleSource} className={`ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${source ? "bg-brand text-white" : "bg-white text-ink hover:text-brand"}`}>
          <Code2 className="h-4 w-4" /> {source ? "Volver al editor visual" : "HTML"}
        </button>
      </div>

      {progress !== null && (
        <div className="flex items-center gap-3 bg-brand/10 px-4 py-2 text-xs text-brand-dark">
          Subiendo archivo… {Math.round(progress)}%
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white"><div className="h-full bg-brand transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      {source ? (
        <div>
          <p className="bg-surface px-4 py-2 text-xs">
            Modo HTML libre: puedes pegar o escribir cualquier diseño (bloques, estilos, iframes…). Si guardas en este modo se publica tal cual.
          </p>
          <textarea value={html} onChange={(e) => setHtml(e.target.value)} spellCheck={false} className="min-h-[480px] w-full rounded-b-2xl bg-nav p-5 font-mono text-sm text-green-300 outline-none" />
        </div>
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}

function Toolbar({ editor, onImage, onVideo }: { editor: Editor; onImage: () => void; onVideo: () => void }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"), italic: e.isActive("italic"), underline: e.isActive("underline"), strike: e.isActive("strike"),
      code: e.isActive("code"), bullet: e.isActive("bulletList"), ordered: e.isActive("orderedList"), quote: e.isActive("blockquote"),
      link: e.isActive("link"), table: e.isActive("table"),
      align: (["left", "center", "right", "justify"] as const).find((a) => e.isActive({ textAlign: a })) ?? "left",
      level: ([1, 2, 3, 4] as const).find((l) => e.isActive("heading", { level: l })) ?? 0,
      font: (e.getAttributes("textStyle").fontFamily as string) ?? "",
      size: (e.getAttributes("textStyle").fontSize as string) ?? "",
      color: (e.getAttributes("textStyle").color as string) ?? "#262626",
    }),
  });
  const c = () => editor.chain().focus();
  const sel = "h-8 rounded-lg border border-black/10 bg-white px-2 text-xs text-ink outline-none";

  return (
    <>
      <Btn title="Deshacer" onClick={() => c().undo().run()}><Undo2 /></Btn>
      <Btn title="Rehacer" onClick={() => c().redo().run()}><Redo2 /></Btn>
      <Sep />
      <label className="flex items-center gap-1" title="Tipo de bloque">
        <Heading className="h-4 w-4 text-muted" />
        <select className={sel} value={s.level} onChange={(e) => { const l = Number(e.target.value) as 0 | 1 | 2 | 3 | 4; if (l) c().toggleHeading({ level: l }).run(); else c().setParagraph().run(); }}>
          <option value={0}>Párrafo</option>
          <option value={1}>Título 1</option>
          <option value={2}>Título 2</option>
          <option value={3}>Título 3</option>
          <option value={4}>Título 4</option>
        </select>
      </label>
      <select className={sel} title="Fuente" value={s.font} onChange={(e) => (e.target.value ? c().setFontFamily(e.target.value).run() : c().unsetFontFamily().run())}>
        {FONTS.map(([v, l]) => <option key={l} value={v}>{l}</option>)}
      </select>
      <select className={sel} title="Tamaño" value={s.size} onChange={(e) => (e.target.value ? c().setFontSize(e.target.value).run() : c().unsetFontSize().run())}>
        {SIZES.map((v) => <option key={v} value={v}>{v || "Tamaño"}</option>)}
      </select>
      <Sep />
      <Btn title="Negrita" active={s.bold} onClick={() => c().toggleBold().run()}><Bold /></Btn>
      <Btn title="Cursiva" active={s.italic} onClick={() => c().toggleItalic().run()}><Italic /></Btn>
      <Btn title="Subrayado" active={s.underline} onClick={() => c().toggleUnderline().run()}><Underline /></Btn>
      <Btn title="Tachado" active={s.strike} onClick={() => c().toggleStrike().run()}><Strikethrough /></Btn>
      <Btn title="Código" active={s.code} onClick={() => c().toggleCode().run()}><Code /></Btn>
      <label title="Color del texto" className="relative grid h-8 w-8 cursor-pointer place-items-center rounded-lg hover:bg-white">
        <span className="font-display text-sm font-bold" style={{ color: s.color }}>A</span>
        <span className="absolute bottom-1 h-1 w-4 rounded" style={{ background: s.color }} />
        <input type="color" className="absolute inset-0 cursor-pointer opacity-0" value={s.color.startsWith("#") ? s.color : "#262626"} onChange={(e) => c().setColor(e.target.value).run()} />
      </label>
      <label title="Resaltar" className="relative grid h-8 w-8 cursor-pointer place-items-center rounded-lg hover:bg-white">
        <Highlighter className="h-4 w-4" />
        <input type="color" defaultValue="#fff59d" className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => c().setHighlight({ color: e.target.value }).run()} />
      </label>
      <Btn title="Quitar formato" onClick={() => c().unsetAllMarks().clearNodes().run()}><Eraser /></Btn>
      <Sep />
      <Btn title="Alinear a la izquierda" active={s.align === "left"} onClick={() => c().setTextAlign("left").run()}><AlignLeft /></Btn>
      <Btn title="Centrar" active={s.align === "center"} onClick={() => c().setTextAlign("center").run()}><AlignCenter /></Btn>
      <Btn title="Alinear a la derecha" active={s.align === "right"} onClick={() => c().setTextAlign("right").run()}><AlignRight /></Btn>
      <Btn title="Justificar" active={s.align === "justify"} onClick={() => c().setTextAlign("justify").run()}><AlignJustify /></Btn>
      <Sep />
      <Btn title="Lista" active={s.bullet} onClick={() => c().toggleBulletList().run()}><List /></Btn>
      <Btn title="Lista numerada" active={s.ordered} onClick={() => c().toggleOrderedList().run()}><ListOrdered /></Btn>
      <Btn title="Cita" active={s.quote} onClick={() => c().toggleBlockquote().run()}><Quote /></Btn>
      <Btn title="Separador" onClick={() => c().setHorizontalRule().run()}><Minus /></Btn>
      <Btn
        title="Enlace"
        active={s.link}
        onClick={() => {
          const prev = editor.getAttributes("link").href as string | undefined;
          const url = prompt("Dirección del enlace (vacío para quitarlo):", prev ?? "https://");
          if (url === null) return;
          if (!url) c().unsetLink().run();
          else c().extendMarkRange("link").setLink({ href: url, target: url.startsWith("/") ? null : "_blank" }).run();
        }}
      >
        <Link2 />
      </Btn>
      <Sep />
      <Btn title="Subir imagen" onClick={onImage}><ImagePlus /></Btn>
      <Btn
        title="Imagen desde URL"
        onClick={() => {
          const src = prompt("URL de la imagen:");
          if (src) c().setImage({ src }).run();
        }}
      >
        <span className="text-[10px] font-bold">URL</span>
      </Btn>
      <Btn title="Subir video corto (MP4, WebM)" onClick={onVideo}><Film /></Btn>
      <Btn
        title="Video de YouTube"
        onClick={() => {
          const src = prompt("Enlace del video de YouTube:");
          if (src) c().setYoutubeVideo({ src }).run();
        }}
      >
        <YoutubeIcon />
      </Btn>
      <Btn title="Insertar tabla" onClick={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table /></Btn>
      {s.table && (
        <span className="flex items-center gap-1 rounded-lg bg-white px-1 text-[11px]">
          <button type="button" className="px-1.5 py-1 hover:text-brand" onClick={() => c().addRowAfter().run()}>+ fila</button>
          <button type="button" className="px-1.5 py-1 hover:text-brand" onClick={() => c().addColumnAfter().run()}>+ col</button>
          <button type="button" className="px-1.5 py-1 hover:text-red-600" onClick={() => c().deleteRow().run()}>− fila</button>
          <button type="button" className="px-1.5 py-1 hover:text-red-600" onClick={() => c().deleteColumn().run()}>− col</button>
          <button type="button" className="px-1.5 py-1 hover:text-red-600" onClick={() => c().deleteTable().run()}>borrar</button>
        </span>
      )}
    </>
  );
}

function Btn({ title, active, onClick, children }: { title: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`grid h-8 min-w-8 place-items-center rounded-lg px-1.5 transition [&_svg]:h-4 [&_svg]:w-4 ${active ? "bg-brand text-white" : "text-ink hover:bg-white hover:text-brand"}`}
    >
      {children}
    </button>
  );
}

const Sep = () => <span className="mx-1 h-6 w-px bg-black/10" />;
