import { createHash } from "node:crypto";
import { site } from "./site";

export const keywords = [
  "Cartesian Languages",
  "Centro de Formación Académica Cartesian Languages",
  "traducción académica",
  "traducción profesional",
  "redacción académica",
  "redacción profesional",
  "Lenguajes Especializados de Regulación",
  "LER",
  "método cartesiano",
  "lingüística cartesiana",
  "pensamiento cartesiano",
  "René Descartes",
  "gramática",
  "semántica",
  "sintaxis",
  "fonética",
  "fonología",
  "ortología",
  "interpretación",
  "oratoria",
  "cursos de inglés",
  "clases de idiomas",
  "comunicación asertiva",
  "Venezuela",
];

const sameAs = site.social.filter((s) => !s.href.includes("wa.me") && !s.href.endsWith("/home")).map((s) => s.href.split("?")[0]);

/** Organización educativa + sitio web: ayuda a Google a mostrar el panel de marca. */
export const organizationLd = () => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      alternateName: site.shortName,
      url: site.url,
      logo: { "@type": "ImageObject", url: `${site.url}/brand/escudo-1024.png`, width: 1024, height: 1024 },
      image: `${site.url}/brand/og.jpg`,
      description: site.description,
      foundingDate: "2023",
      knowsLanguage: ["es", "en"],
      sameAs,
      contactPoint: { "@type": "ContactPoint", contactType: "customer service", telephone: "+351935639418", availableLanguage: ["Spanish", "English"] },
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      description: site.description,
      inLanguage: "es",
      publisher: { "@id": `${site.url}/#organization` },
    },
  ],
});

/* IndexNow: aviso inmediato a Bing, Yandex, Seznam, Naver… de páginas nuevas o cambiadas. */
export const indexNowKey = createHash("sha256").update(`indexnow:${site.url}`).digest("hex").slice(0, 32);

export async function notifySearchEngines(paths: string[]) {
  if (process.env.NODE_ENV !== "production" || !paths.length) return { ok: false, status: 0 };
  const host = new URL(site.url).host;
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: indexNowKey,
        keyLocation: `${site.url}/indexnow-key.txt`,
        urlList: paths.map((p) => (p.startsWith("http") ? p : `${site.url}${p}`)),
      }),
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}
