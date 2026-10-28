"use client";

import { useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { Check, Link2 } from "lucide-react";

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-[55] h-1 origin-left bg-brand" />;
}

export function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const targets = [
    { name: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "X", href: `https://x.com/intent/post?text=${t}&url=${u}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
  ];
  const btn = "rounded-full border border-black/10 px-4 py-2 text-sm transition hover:border-brand hover:bg-brand hover:text-white";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-2 font-display uppercase tracking-wider text-ink">Compartir</span>
      {targets.map((s) => (
        <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className={btn}>{s.name}</a>
      ))}
      <button
        className={`${btn} flex items-center gap-1.5`}
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {copied ? "¡Copiado!" : "Copiar enlace"}
      </button>
    </div>
  );
}
