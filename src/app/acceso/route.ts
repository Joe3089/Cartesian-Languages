import { NextResponse } from "next/server";
import { DEVICE_COOKIE } from "@/lib/auth";

/** Marca este navegador como del administrador y vuelve a la portada mostrando «Iniciar sesión». */
export function GET(request: Request) {
  const res = NextResponse.redirect(new URL("/", request.url));
  res.cookies.set(DEVICE_COOKIE, "1", {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
