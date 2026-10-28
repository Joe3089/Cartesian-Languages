import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { labelHref } from "@/lib/blogger";
import { sections, site } from "@/lib/site";
import { SocialLinks } from "./social-links";

export function Footer() {
  return (
    <footer className="mt-24">
      <div className="border-t-4 border-brand bg-surface">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={site.logo} alt="" className="h-14 w-14 rounded-full" />
              <p className="font-display text-xl text-logo">{site.name}</p>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-relaxed">{site.description}</p>
            <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-medium text-white shadow-lg shadow-brand/30 transition hover:-translate-y-0.5 hover:bg-brand-dark">
              <MessageCircle className="h-5 w-5" /> Solicitar información
            </a>
          </div>
          <div>
            <h3 className="mb-4 text-lg uppercase tracking-wider">Secciones</h3>
            <ul className="space-y-2 text-sm">
              {sections.map((s) => (
                <li key={s.title}><Link href={labelHref(s.label)} className="hover:text-brand">{s.title}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg uppercase tracking-wider">Cartesian Languages</h3>
            <ul className="space-y-2 text-sm">
              {site.links.map((l) => (
                <li key={l.href}><a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-brand">{l.label}</a></li>
              ))}
            </ul>
            <SocialLinks className="mt-6" />
          </div>
        </div>
      </div>
      <div className="bg-footer">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-5 text-sm text-soft sm:flex-row">
          <p>© {new Date().getFullYear()} {site.name}</p>
          <p className="text-body">Desde 2023 · Método lógico-deductivo Cartesiano</p>
        </div>
      </div>
    </footer>
  );
}
