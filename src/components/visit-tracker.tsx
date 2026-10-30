"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Envía una página vista al contador (no cuenta al administrador ni el panel). */
export function VisitTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin") || /(?:^|; )cl_role=admin/.test(document.cookie)) return;
    const body = JSON.stringify({ path: pathname });
    if (!navigator.sendBeacon?.("/api/visit", body)) {
      fetch("/api/visit", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  }, [pathname]);
  return null;
}
