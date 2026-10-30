"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, isAdmin, startSession } from "@/lib/auth";
import { remove, slugify, upsert, type Case, type Course } from "@/lib/store";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

async function guard() {
  if (!(await isAdmin())) redirect("/admin");
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function login(_: string | null, form: FormData) {
  if (!checkPassword(str(form, "password"))) return "Contraseña incorrecta.";
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin");
}

export async function saveCourse(form: FormData) {
  await guard();
  const title = str(form, "title");
  const course: Course = {
    id: str(form, "id") || `${slugify(title)}-${Date.now().toString(36).slice(-4)}`,
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
    id: str(form, "id") || `${slugify(title)}-${Date.now().toString(36).slice(-4)}`,
    title,
    summary: str(form, "summary"),
    content: str(form, "content"),
    image: str(form, "image"),
    videoUrl: str(form, "videoUrl"),
    createdAt: str(form, "createdAt") || new Date().toISOString(),
  };
  await upsert("cases", item);
  refresh();
  redirect("/admin?tab=casos&ok=1");
}

export async function deleteItem(form: FormData) {
  await guard();
  const kind = str(form, "kind") === "cases" ? "cases" : "courses";
  await remove(kind, str(form, "id"));
  refresh();
  redirect(`/admin?tab=${kind === "cases" ? "casos" : "cursos"}`);
}
