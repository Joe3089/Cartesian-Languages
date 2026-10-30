import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "cl_admin";

const sign = (value: string) =>
  createHmac("sha256", process.env.ADMIN_PASSWORD ?? "").update(value).digest("hex");

export function checkPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(sign(password));
  const b = Buffer.from(sign(expected));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function startSession() {
  (await cookies()).set(COOKIE, sign("admin"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  if (!process.env.ADMIN_PASSWORD) return false;
  return (await cookies()).get(COOKIE)?.value === sign("admin");
}
