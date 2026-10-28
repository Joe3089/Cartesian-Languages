"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Headphones, Play, Radio } from "lucide-react";
import { site } from "@/lib/site";

/** Cartesian Podcast: episodios alojados en archive.org. */
export function Podcast() {
  const { podcast } = site;
  const [current, setCurrent] = useState<(typeof podcast.episodes)[number] | null>(null);

  return (
    <section id="podcast" className="relative overflow-hidden bg-nav py-20 text-white scroll-mt-16">
      <div className="cartesian-grid absolute inset-0 opacity-60" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="flex items-center gap-2 font-display uppercase tracking-[0.3em] text-brand">
            <Radio className="h-5 w-5" /> {podcast.subtitle}
          </p>
          <h2 className="mt-3 text-5xl text-white md:text-6xl">{podcast.title}</h2>
          <p className="mt-5 max-w-md text-white/60">
            Inducciones sonoras sobre lenguaje, lógica y pensamiento. Selecciona un episodio y escúchalo sin salir de la página.
          </p>

          <div className="mt-8 overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/10">
            <div className="flex items-center gap-3 px-5 py-4 font-mono text-sm">
              <span className={`h-2.5 w-2.5 rounded-full ${current ? "animate-pulse bg-brand" : "bg-white/30"}`} />
              <span className={current ? "text-brand" : "text-white/50"}>
                {current ? `[ REPRODUCIENDO: ${current.name.toUpperCase()} ]` : "[ SELECCIONA UNA INDUCCIÓN ]"}
              </span>
            </div>
            <AnimatePresence>
              {current && (
                <motion.div initial={{ height: 0 }} animate={{ height: 140 }} exit={{ height: 0 }}>
                  <iframe
                    key={current.slug}
                    src={`https://archive.org/embed/${current.slug}&playlist=1&autoplay=1&as_object=1`}
                    title={current.name}
                    className="h-[140px] w-full"
                    allow="autoplay"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <ol className="grid gap-2 sm:grid-cols-2">
          {podcast.episodes.map((ep, i) => {
            const active = current?.slug === ep.slug;
            return (
              <motion.li key={ep.slug} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                <button
                  onClick={() => setCurrent(ep)}
                  className={`group flex w-full items-center gap-4 rounded-xl p-4 text-left transition ${active ? "bg-brand" : "bg-white/5 hover:bg-white/10"}`}
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition ${active ? "bg-white text-brand" : "bg-brand/20 text-brand group-hover:bg-brand group-hover:text-white"}`}>
                    {active ? <Headphones className="h-5 w-5" /> : <Play className="h-4 w-4 translate-x-0.5" />}
                  </span>
                  <span>
                    <span className={`block font-mono text-[11px] ${active ? "text-white/80" : "text-white/40"}`}>EP. {String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm leading-snug">{ep.name}</span>
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
