"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { PostSummary } from "@/lib/blogger";
import { sections } from "@/lib/site";
import { PostCard } from "./post-card";

const PAGE = 9;

/** Rejilla filtrable por sección con carga incremental. */
export function PostGrid({ posts }: { posts: PostSummary[] }) {
  const [filter, setFilter] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE);

  const filtered = useMemo(() => (filter ? posts.filter((p) => p.labels.includes(filter)) : posts), [filter, posts]);
  const chips = [{ title: "Todos", label: null as string | null }, ...sections.map((s) => ({ title: s.title, label: s.label as string | null }))];

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-2">
        {chips.map((c) => {
          const active = filter === c.label;
          return (
            <button
              key={c.title}
              onClick={() => { setFilter(c.label); setLimit(PAGE); }}
              className={`relative rounded-full px-5 py-2 text-sm font-medium transition-colors ${active ? "text-white" : "bg-surface text-ink hover:text-brand"}`}
            >
              {active && <motion.span layoutId="chip" className="absolute inset-0 rounded-full bg-brand" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />}
              <span className="relative">{c.title}</span>
            </button>
          );
        })}
      </div>

      <motion.div layout className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.slice(0, limit).map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: (i % PAGE) * 0.04 }}
            >
              <PostCard post={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && <p className="py-16 text-center">Aún no hay artículos en esta sección.</p>}

      {limit < filtered.length && (
        <div className="mt-12 text-center">
          <button onClick={() => setLimit((l) => l + PAGE)} className="rounded-full border-2 border-brand px-8 py-3 font-display uppercase tracking-wider text-brand transition hover:bg-brand hover:text-white">
            Cargar más artículos
          </button>
        </div>
      )}
    </div>
  );
}
