import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { get, put } from "@vercel/blob";

const COOKIE = "cl_admin";
const FILE = "data/admin.json";

/** Único usuario administrador. Si aún no se ha personalizado: usuario "admin" + ADMIN_PASSWORD. */
type Credentials = { username: string; salt: string; hash: string };

const hashPassword = (password: string, salt: string) => scryptSync(password, salt, 64).toString("hex");

async function getCredentials(): Promise<Credentials | null> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const res = await get(FILE, { access: "private", useCache: false }).catch(() => null);
    if (res?.statusCode === 200) return (await new Response(res.stream).json()) as Credentials;
  }
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  const salt = "env";
  return { username: "admin", salt, hash: hashPassword(pw, salt) };
}

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/** La firma depende de las credenciales: al cambiarlas se cierran las demás sesiones. */
const sign = (c: Credentials) => createHmac("sha256", c.hash).update(`admin:${c.username}`).digest("hex");

export async function verify(username: string, password: string) {
  const c = await getCredentials();
  if (!c) return false;
  return safeEqual(username.toLowerCase(), c.username.toLowerCase()) && safeEqual(hashPassword(password, c.salt), c.hash);
}

/**
 * Marcas visibles para el navegador (sin datos sensibles; la seguridad real es la cookie firmada):
 * - ROLE_COOKIE: hay una sesión de administrador activa.
 * - DEVICE_COOKIE: este navegador pertenece al administrador (persiste al cerrar sesión),
 *   para mostrarle el botón "Iniciar sesión" que los visitantes no ven.
 */
export const ROLE_COOKIE = "cl_role";
export const DEVICE_COOKIE = "cl_device";

export async function startSession() {
  const c = await getCredentials();
  if (!c) return;
  const jar = await cookies();
  const base = { secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
  jar.set(COOKIE, sign(c), { ...base, httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
  jar.set(ROLE_COOKIE, "admin", { ...base, maxAge: 60 * 60 * 24 * 7 });
  jar.set(DEVICE_COOKIE, "1", { ...base, maxAge: 60 * 60 * 24 * 365 });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
  jar.delete(ROLE_COOKIE);
}

export async function isAdmin() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const c = await getCredentials();
  return Boolean(c && safeEqual(value, sign(c)));
}

export async function currentUsername() {
  return (await getCredentials())?.username ?? "admin";
}

export async function isConfigured() {
  return Boolean(await getCredentials());
}

export async function updateCredentials(username: string, password: string) {
  const salt = randomBytes(16).toString("hex");
  const c: Credentials = { username, salt, hash: hashPassword(password, salt) };
  await put(FILE, JSON.stringify(c), { access: "private", allowOverwrite: true, addRandomSuffix: false, contentType: "application/json" });
}
