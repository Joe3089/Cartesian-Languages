"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, CornerDownLeft } from "lucide-react";
import { formatDate, hiRes, postHref, type PostSummary } from "@/lib/blogger";

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function SearchDialog({ open, onClose, posts }: { open: boolean; onClose: () => void; posts: PostSummary[] }) {
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setTimeout(() => input.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return posts.slice(0, 6);
    return posts.filter((p) => {
      const hay = norm(`${p.title} ${p.labels.join(" ")} ${p.excerpt}`);
      return terms.every((t) => hay.includes(t));
    });
  }, [q, posts]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-label="Buscar artículos"
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            initial={{ scale: 0.95, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b-2 border-brand px-5">
              <Search className="h-5 w-5 text-brand" />
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar artículos, temas, categorías…"
                className="w-full bg-transparent py-5 text-lg text-ink outline-none placeholder:text-soft"
              />
              <kbd className="rounded border px-1.5 text-xs text-muted">Esc</kbd>
            </div>
            <ul className="max-h-[55vh] overflow-y-auto p-2">
              {results.length === 0 && <li className="p-8 text-center text-muted">Sin resultados para “{q}”.</li>}
              {results.map((p) => (
                <li key={p.id}>
                  <Link href={postHref(p)} onClick={onClose} className="group flex items-center gap-4 rounded-xl p-3 hover:bg-surface">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={hiRes(p.image, 200)} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="h-14 w-14 shrink-0 rounded-lg bg-brand/20" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-ink group-hover:text-brand">{p.title}</p>
                      <p className="truncate text-xs text-muted">{p.labels[0] ?? "Artículo"} · {formatDate(p.published)}</p>
                    </div>
                    <CornerDownLeft className="h-4 w-4 text-soft opacity-0 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
