"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { site } from "@/lib/site";

/** Asistente flotante "Cartesian Dkarbeg 5:18" (Hugging Face Space del blog original). */
export function DescartesBot() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const bot = site.chatbot;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{ transformOrigin: "bottom right" }}
            className="flex h-[min(560px,75vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border-2 border-sage bg-white shadow-2xl"
          >
            <div className="flex items-center gap-3 bg-sage px-4 py-3 text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bot.avatar} alt="" className="h-9 w-9 rounded-full bg-white object-cover" />
              <div className="flex-1 leading-tight">
                <p className="font-display text-sm">{bot.title}</p>
                <p className="text-xs text-white/70">{bot.name}</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Cerrar chat"><X className="h-5 w-5" /></button>
            </div>
            <div className="relative flex-1">
              {!loaded && (
                <div className="absolute inset-0 grid place-items-center text-sm text-muted">
                  <span className="animate-pulse">Cogito… cargando</span>
                </div>
              )}
              <iframe
                src={bot.url}
                title={bot.title}
                onLoad={() => setLoaded(true)}
                className="h-full w-full"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="group relative"
        aria-label={open ? "Cerrar asistente" : `Consultar a ${bot.name}`}
      >
        {!open && <span className="absolute inset-0 animate-ping rounded-full bg-brand/40" />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bot.avatar} alt="Descartes" className="relative h-[70px] w-[70px] rounded-full border-[3px] border-sage bg-white object-cover shadow-xl" />
        {!open && (
          <span className="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-nav px-3 py-1.5 text-xs text-white shadow-lg group-hover:block">
            Consulta con {bot.name}
          </span>
        )}
      </motion.button>
    </div>
  );
}
