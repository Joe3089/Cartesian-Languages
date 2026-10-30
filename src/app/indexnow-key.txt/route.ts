import { indexNowKey } from "@/lib/seo";

/** Archivo de verificación de IndexNow (la clave es pública por diseño). */
export function GET() {
  return new Response(indexNowKey, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
