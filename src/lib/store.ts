import "server-only";
import { get, put } from "@vercel/blob";

export type Course = {
  id: string;
  title: string;
  language: string;
  level: string;
  description: string;
  image: string;
  classroomUrl: string;
  createdAt: string;
};

export type Case = {
  id: string;
  title: string;
  summary: string;
  content: string; // HTML del editor (o texto plano en casos antiguos)
  image: string;
  videoUrl: string;
  createdAt: string;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover: string;
  labels: string[];
  html: string;
  status: "draft" | "published";
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

type Collections = { courses: Course; cases: Case; articles: Article };
type Name = keyof Collections;

/** Curso inicial: siempre presente hasta que el administrador lo modifique. */
const seed: { [K in Name]: Collections[K][] } = {
  courses: [
    {
      id: "ingles-cartesiano",
      title: "Cartesian English Languages Course",
      language: "Inglés",
      level: "Todos los niveles",
      description:
        "Aprende inglés con el método lógico-deductivo Cartesiano: gramática razonada, pronunciación consciente y comunicación asertiva para la vida académica y profesional. Las clases, materiales y tareas se gestionan en Google Classroom.",
      image: "",
      classroomUrl: "https://classroom.google.com/u/2/h/tv",
      createdAt: "2026-05-12T00:00:00.000Z",
    },
  ],
  cases: [],
  articles: [],
};

const file = (name: Name) => `data/${name}.json`;

export async function readAll<K extends Name>(name: K): Promise<Collections[K][]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return seed[name];
  const res = await get(file(name), { access: "private", useCache: false }).catch(() => null);
  if (!res || res.statusCode !== 200) return seed[name];
  const items = (await new Response(res.stream).json()) as Collections[K][];
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function readOne<K extends Name>(name: K, id: string) {
  return (await readAll(name)).find((i) => i.id === id) ?? null;
}

async function writeAll<K extends Name>(name: K, items: Collections[K][]) {
  await put(file(name), JSON.stringify(items, null, 2), {
    access: "private",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json",
  });
}

export async function upsert<K extends Name>(name: K, item: Collections[K]) {
  const items = await readAll(name);
  const i = items.findIndex((x) => x.id === item.id);
  if (i === -1) items.unshift(item);
  else items[i] = item;
  await writeAll(name, items);
}

export async function remove(name: Name, id: string) {
  const items = await readAll(name);
  await writeAll(name, items.filter((x) => x.id !== id) as Collections[typeof name][]);
}

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || `item-${Date.now()}`;

/** Convierte una URL de YouTube en URL de inserción. */
export function youtubeEmbed(url: string) {
  const id = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)?.[1];
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
