"use client";

import { useActionState } from "react";
import { CheckCircle2, KeyRound } from "lucide-react";
import { updateAccount } from "./actions";

export function AccountForm({ username }: { username: string }) {
  const [result, action, pending] = useActionState(updateAccount, null);
  const input = "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-ink outline-none focus:border-brand";

  return (
    <form action={action} className="max-w-xl space-y-5 rounded-3xl bg-surface p-6 md:p-8">
      <h2 className="flex items-center gap-2 text-2xl"><KeyRound className="h-6 w-6 text-brand" /> Cuenta de administrador</h2>
      <p className="text-sm">Eres el único usuario y tienes todos los permisos. Cambia aquí tu nombre de usuario y/o tu contraseña.</p>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-ink">Nombre de usuario</span>
        <input name="username" required minLength={3} defaultValue={username} autoComplete="username" className={input} />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">Nueva contraseña</span>
          <input name="password" type="password" minLength={8} autoComplete="new-password" placeholder="Déjala vacía para no cambiarla" className={input} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">Repite la nueva contraseña</span>
          <input name="confirm" type="password" autoComplete="new-password" className={input} />
        </label>
      </div>
      <label className="block space-y-1.5 border-t border-black/5 pt-5">
        <span className="text-sm font-medium text-ink">Contraseña actual (obligatoria para guardar)</span>
        <input name="current" type="password" required autoComplete="current-password" className={input} />
      </label>

      {result === "ok" ? (
        <p className="flex items-center gap-2 rounded-xl bg-brand/10 px-4 py-3 text-sm text-brand-dark"><CheckCircle2 className="h-4 w-4" /> Datos de acceso actualizados.</p>
      ) : result ? (
        <p className="text-sm text-red-600">{result}</p>
      ) : null}

      <button disabled={pending} className="rounded-full bg-brand px-8 py-3 font-display uppercase tracking-wider text-white hover:bg-brand-dark disabled:opacity-60">
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
