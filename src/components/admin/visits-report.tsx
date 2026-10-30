"use client";

import { useState } from "react";
import type { Point, Report } from "@/lib/stats";

const PERIODS = [
  { id: "daily", label: "Diario", hint: "últimos 30 días" },
  { id: "weekly", label: "Semanal", hint: "últimas 12 semanas" },
  { id: "monthly", label: "Mensual", hint: "últimos 12 meses" },
  { id: "yearly", label: "Anual", hint: "por año" },
] as const;

const n = (v: number) => v.toLocaleString("es-ES");

export function VisitsReport({ report }: { report: Report }) {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["id"]>("daily");
  const current = PERIODS.find((p) => p.id === period)!;
  const data = report[period];

  const tiles = [
    { label: "Hoy", value: report.today, sub: `${n(report.uniqueToday)} visitantes únicos` },
    { label: "Esta semana", value: report.week },
    { label: "Este mes", value: report.month },
    { label: "Este año", value: report.year },
    { label: "Total", value: report.total, sub: `${n(report.uniqueTotal)} visitantes únicos`, strong: true },
  ];

  return (
    <div className="space-y-8">
      {/* Renglón estadístico */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className={`rounded-2xl p-5 ${t.strong ? "bg-nav text-white" : "bg-surface"}`}>
            <p className={`text-xs font-medium uppercase tracking-wider ${t.strong ? "text-white/60" : "text-muted"}`}>{t.label}</p>
            <p className={`mt-1 font-display text-4xl tabular-nums ${t.strong ? "text-white" : "text-ink"}`}>{n(t.value)}</p>
            <p className={`mt-1 text-xs ${t.strong ? "text-white/60" : "text-muted"}`}>{t.sub ?? "páginas vistas"}</p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-black/5 p-5 md:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl">Visitas · {current.label.toLowerCase()}</h2>
            <p className="text-sm text-muted">Páginas vistas, {current.hint}</p>
          </div>
          <div role="tablist" className="flex rounded-full bg-surface p-1">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={period === p.id}
                onClick={() => setPeriod(p.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${period === p.id ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <BarChart data={data} />
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-brand-dark hover:underline">Ver como tabla</summary>
          <div className="mt-3 max-h-72 overflow-auto rounded-xl border border-black/5">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-surface text-xs uppercase tracking-wider text-muted">
                <tr><th className="px-4 py-2">Periodo</th><th className="px-4 py-2 text-right">Visitas</th></tr>
              </thead>
              <tbody>
                {[...data].reverse().map((d) => (
                  <tr key={d.label} className="border-t border-black/5">
                    <td className="px-4 py-2 text-ink">{d.label}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-ink">{n(d.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <section className="rounded-3xl border border-black/5 p-5 md:p-7">
        <h2 className="text-2xl">Páginas más visitadas</h2>
        {report.pages.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Aún no hay visitas registradas.</p>
        ) : (
          <ol className="mt-4 space-y-2">
            {report.pages.map((p) => {
              const max = report.pages[0].views || 1;
              return (
                <li key={p.path} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 text-sm">
                  <a href={p.path} target="_blank" className="truncate text-ink hover:text-brand">{p.path === "/" ? "Portada" : decodeURIComponent(p.path)}</a>
                  <span className="tabular-nums text-ink">{n(p.views)}</span>
                  <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-surface">
                    <span className="block h-full rounded-full bg-brand-dark" style={{ width: `${(p.views / max) * 100}%` }} />
                  </span>
                </li>
              );
            })}
          </ol>
        )}
        {report.since && <p className="mt-4 text-xs text-muted">Contando desde el {new Date(`${report.since}T12:00:00Z`).toLocaleDateString("es-ES", { dateStyle: "long", timeZone: "UTC" })}. No se cuentan tus propias visitas ni las de buscadores y robots.</p>}
      </section>
    </div>
  );
}

function BarChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const nice = niceMax(max);
  const peak = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);
  const every = Math.ceil(data.length / 8);

  return (
    <div className="mt-6">
      <div className="relative h-64">
        {/* Rejilla discreta */}
        {[1, 0.5, 0].map((f) => (
          <div key={f} className="absolute inset-x-0 flex items-center gap-2" style={{ bottom: `${f * 100}%` }}>
            <span className="w-10 -translate-y-1/2 text-right text-[11px] tabular-nums text-muted">{n(Math.round(nice * f))}</span>
            <span className={`h-px flex-1 ${f === 0 ? "bg-black/20" : "bg-black/5"}`} />
          </div>
        ))}
        <div className="absolute inset-y-0 left-12 right-0 flex items-end gap-[2px]" onMouseLeave={() => setHover(null)}>
          {data.map((d, i) => (
            <div key={d.label} className="relative flex h-full flex-1 items-end" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0} aria-label={`${d.label}: ${n(d.value)} visitas`}>
              <div
                className={`w-full rounded-t-[4px] transition-colors ${hover === i ? "bg-nav" : "bg-brand-dark"}`}
                style={{ height: `${(d.value / nice) * 100}%`, minHeight: d.value ? 2 : 0 }}
              />
              {i === peak && d.value > 0 && hover === null && (
                <span className="absolute left-1/2 -translate-x-1/2 text-xs font-medium tabular-nums text-ink" style={{ bottom: `calc(${(d.value / nice) * 100}% + 4px)` }}>{n(d.value)}</span>
              )}
              {hover === i && (
                <div className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-nav px-3 py-2 text-xs text-white shadow-lg" style={{ bottom: `calc(${(d.value / nice) * 100}% + 8px)` }}>
                  <p className="text-white/70">{d.label}</p>
                  <p className="font-display text-base tabular-nums">{n(d.value)} visitas</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="ml-12 mt-2 flex gap-[2px]">
        {data.map((d, i) => (
          <span key={d.label} className="flex-1 truncate text-center text-[10px] text-muted">{i % every === 0 || i === data.length - 1 ? d.label : ""}</span>
        ))}
      </div>
    </div>
  );
}

function niceMax(v: number) {
  const p = 10 ** Math.floor(Math.log10(v));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((m) => m >= v) ?? v;
}
