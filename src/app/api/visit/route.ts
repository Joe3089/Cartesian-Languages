import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { recordVisit } from "@/lib/stats";

const BOTS = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|preview|headless|lighthouse|vercel|curl|wget|python|node-fetch/i;

/** Registra una página vista. No cuenta robots ni al administrador; el visitante se guarda como huella anónima diaria. */
export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOTS.test(ua)) return new Response(null, { status: 204 });
  if ((await cookies()).get("cl_role")?.value === "admin") return new Response(null, { status: 204 });

  let path = "/";
  try {
    path = String((JSON.parse(await request.text()) as { path?: string }).path ?? "/");
  } catch {}
  if (!path.startsWith("/") || path.length > 300 || /^\/(admin|api)(\/|$)/.test(path)) return new Response(null, { status: 204 });

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const day = new Date().toISOString().slice(0, 10);
  const visitor = createHash("sha256").update(`${ip}|${ua}|${day}`).digest("hex").slice(0, 24);

  await recordVisit(path.split("?")[0], visitor).catch(() => {});
  return new Response(null, { status: 204 });
}
