import { revalidateTag } from "next/cache";

/** Refresca al instante el contenido tras publicar en Blogger: GET /api/revalidate?secret=... */
export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidateTag("posts", "max");
  return Response.json({ ok: true, revalidated: "posts" });
}
