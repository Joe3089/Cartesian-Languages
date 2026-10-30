import { get } from "@vercel/blob";

/** Sirve imágenes y videos del almacén privado (con soporte de Range para los videos). */
export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const pathname = (await params).path.map(decodeURIComponent).join("/");
  if (!pathname.startsWith("media/")) return new Response("Not found", { status: 404 });

  const range = request.headers.get("range");
  const res = await get(pathname, { access: "private", headers: range ? { range } : undefined }).catch(() => null);
  if (!res || res.statusCode !== 200) return new Response("Not found", { status: 404 });

  const headers = new Headers({
    "content-type": res.blob.contentType,
    "accept-ranges": "bytes",
    // El nombre lleva sufijo aleatorio: el archivo nunca cambia
    "cache-control": "public, max-age=31536000, immutable",
  });
  for (const h of ["content-length", "content-range", "etag", "last-modified"]) {
    const v = res.headers.get(h);
    if (v) headers.set(h, v);
  }
  return new Response(res.stream, { status: headers.has("content-range") ? 206 : 200, headers });
}
