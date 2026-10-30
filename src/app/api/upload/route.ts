import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAdmin } from "@/lib/auth";

/** Emite tokens de subida directa a Blob (imágenes y videos) solo para el administrador. */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await isAdmin())) throw new Error("No autorizado");
        if (!pathname.startsWith("media/")) throw new Error("Ruta no permitida");
        return {
          allowedContentTypes: ["image/*", "video/*"],
          maximumSizeInBytes: 200 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
