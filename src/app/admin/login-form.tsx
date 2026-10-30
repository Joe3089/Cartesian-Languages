"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { login } from "./actions";

export function LoginForm({ configured }: { configured: boolean }) {
  const [error, action, pending] = useActionState(login, null);
  const input = "w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-brand";
  return (
    <form action={action} className="mx-auto mt-10 max-w-sm space-y-4 rounded-3xl bg-surface p-8 shadow-xl">
      <Lock className="mx-auto h-10 w-10 text-brand" />
      <h1 className="text-center text-2xl">Panel de administración</h1>
      {!configured && (
        <p className="rounded-xl bg-white p-3 text-sm">
          Falta configurar la variable <code>ADMIN_PASSWORD</code> en Vercel.
        </p>
      )}
      <input name="username" required autoComplete="username" placeholder="Usuario" className={input} />
      <input name="password" type="password" required autoComplete="current-password" placeholder="Contraseña" className={input} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={pending} className="w-full rounded-full bg-brand py-3 font-display uppercase tracking-wider text-white hover:bg-brand-dark disabled:opacity-60">
        {pending ? "Verificando…" : "Entrar"}
      </button>
    </form>
  );
}
