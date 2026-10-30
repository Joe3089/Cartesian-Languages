"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUsername, endSession, isAdmin, startSession, updateCredentials, verify } from "@/lib/auth";
import { readAll, remove, slugify, upsert, type Article, type Case, type Course } from "@/lib/store";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const newId = (title: string) => `${slugify(title)}-${Date.now().toString(36).slice(-4)}`;

async function guard() {
  if (!(await isAdmin())) redirect("/admin");
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function login(_: string | null, form: FormData) {
  if (!(await verify(str(form, "username"), String(form.get("password") ?? "")))) {
    await new Promise((r) => setTimeout(r, 800));
    return "Usuario o contraseña incorrectos.";
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin");
}

export async function updateAccount(_: string | null, form: FormData) {
  await guard();
  const current = String(form.get("current") ?? "");
  const currentUser = await currentUsername();
  const username = str(form, "username");
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");

  if (!(await verify(currentUser, current))) return "La contraseña actual no es correcta.";
  if (username.length < 3) return "El usuario debe tener al menos 3 caracteres.";
  const next = password || current;
  if (password && password.length < 8) return "La nueva contraseña debe tener al menos 8 caracteres.";
  if (password !== confirm) return "La confirmación de la contraseña no coincide.";

  await updateCredentials(username, next);
  await startSession();
  return "ok";
}

export async function saveArticle(form: FormData) {
  await guard();
  const title = str(form, "title");
  const id = str(form, "id");
  const existing = id ? (await readAll("articles")).find((a) => a.id === id) : undefined;
  const now = new Date().toISOString();
  const date = str(form, "publishedAt");
  const extra = str(form, "extraLabels").split(",").map((l) => l.trim()).filter(Boolean);

  const article: Article = {
    id: id || newId(title),
    title,
    // El enlace se mantiene estable una vez creado
    slug: existing?.slug ?? (str(form, "slug") ? slugify(str(form, "slug")) : slugify(title)),
    excerpt: str(form, "excerpt"),
    cover: str(form, "cover"),
    labels: [...new Set([...form.getAll("labels").map(String), ...extra])],
    html: String(form.get("html") ?? ""),
    status: str(form, "status") === "draft" ? "draft" : "published",
    publishedAt: date ? new Date(date).toISOString() : (existing?.publishedAt ?? now),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await upsert("articles", article);
  refresh();
  redirect(`/admin/articulos/${article.id}?ok=1`);
}

export async function saveCourse(form: FormData) {
  await guard();
  const title = str(form, "title");
  const course: Course = {
    id: str(form, "id") || newId(title),
    title,
    language: str(form, "language"),
    level: str(form, "level"),
    description: str(form, "description"),
    image: str(form, "image"),
    classroomUrl: str(form, "classroomUrl"),
    createdAt: str(form, "createdAt") || new Date().toISOString(),
  };
  await upsert("courses", course);
  refresh();
  redirect("/admin?tab=cursos&ok=1");
}

export async function saveCase(form: FormData) {
  await guard();
  const title = str(form, "title");
  const item: Case = {
    id: str(form, "id") || newId(title),
    title,
    summary: str(form, "summary"),
    content: String(form.get("content") ?? ""),
    image: str(form, "image"),
    videoUrl: str(form, "videoUrl"),
    createdAt: str(form, "createdAt") || new Date().toISOString(),
  };
  await upsert("cases", item);
  refresh();
  redirect("/admin?tab=casos&ok=1");
}

const TABS = { courses: "cursos", cases: "casos", articles: "articulos" } as const;

export async function deleteItem(form: FormData) {
  await guard();
  const kind = str(form, "kind") as keyof typeof TABS;
  if (!(kind in TABS)) return;
  await remove(kind, str(form, "id"));
  refresh();
  redirect(`/admin?tab=${TABS[kind]}`);
}
