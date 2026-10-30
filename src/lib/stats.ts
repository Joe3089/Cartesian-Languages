import "server-only";
import { Redis } from "@upstash/redis";

/* Contador de visitas en Redis (Upstash, Marketplace de Vercel). Sin base configurada no registra nada. */
const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
export const statsEnabled = Boolean(url && token);
const redis = statsEnabled ? new Redis({ url: url!, token: token! }) : null;

/** Días contados en hora de Venezuela. */
const TZ = "America/Caracas";
const DAY = 86_400_000;
const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD

export async function recordVisit(path: string, visitor: string) {
  if (!redis) return;
  const day = dayKey(new Date());
  const p = redis.pipeline();
  p.incr("v:total");
  p.incr(`v:d:${day}`);
  p.incr(`v:y:${day.slice(0, 4)}`);
  p.pfadd(`u:d:${day}`, visitor);
  p.pfadd("u:total", visitor);
  p.zincrby("v:pages", 1, path);
  p.setnx("v:since", day);
  await p.exec();
}

export type Point = { label: string; value: number };
export type Report = {
  total: number;
  uniqueTotal: number;
  since: string | null;
  today: number;
  uniqueToday: number;
  week: number;
  month: number;
  year: number;
  daily: Point[];
  weekly: Point[];
  monthly: Point[];
  yearly: Point[];
  pages: { path: string; views: number }[];
};

const fmtDay = (k: string) =>
  new Date(`${k}T12:00:00Z`).toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });
const fmtMonth = (k: string) =>
  new Date(`${k}-15T12:00:00Z`).toLocaleDateString("es-ES", { month: "short", year: "2-digit", timeZone: "UTC" });

export async function getReport(): Promise<Report | null> {
  if (!redis) return null;
  const now = new Date();
  const days = Array.from({ length: 400 }, (_, i) => dayKey(new Date(now.getTime() - i * DAY))); // hoy primero
  const thisYear = Number(days[0].slice(0, 4));

  const p = redis.pipeline();
  p.get<number>("v:total");
  p.pfcount("u:total");
  p.get<string>("v:since");
  p.zrange("v:pages", 0, 9, { rev: true, withScores: true });
  p.pfcount(`u:d:${days[0]}`);
  p.mget<(number | null)[]>(...days.map((d) => `v:d:${d}`));
  const [total, uniqueTotal, since, pagesRaw, uniqueToday, counts] = (await p.exec()) as [
    number | null, number, string | null, (string | number)[], number, (number | null)[],
  ];

  const byDay = new Map(days.map((d, i) => [d, Number(counts[i] ?? 0)]));
  const firstYear = since ? Math.min(Number(since.slice(0, 4)), thisYear) : thisYear;
  const years = Array.from({ length: thisYear - firstYear + 1 }, (_, i) => firstYear + i);
  const yearCounts = years.length ? await redis.mget<(number | null)[]>(...years.map((y) => `v:y:${y}`)) : [];

  // Diario: últimos 30 días
  const daily = days.slice(0, 30).reverse().map((d) => ({ label: fmtDay(d), value: byDay.get(d)! }));

  // Semanal: últimas 12 semanas (lunes a domingo)
  const mondayOf = (k: string) => {
    const d = new Date(`${k}T12:00:00Z`);
    return dayKey(new Date(d.getTime() - ((d.getUTCDay() + 6) % 7) * DAY + 4 * 3_600_000));
  };
  const weeks = new Map<string, number>();
  for (const d of days) {
    const m = mondayOf(d);
    weeks.set(m, (weeks.get(m) ?? 0) + byDay.get(d)!);
  }
  const weekly = [...weeks.entries()].slice(0, 12).reverse().map(([m, v]) => ({ label: `Sem. ${fmtDay(m)}`, value: v }));

  // Mensual: últimos 12 meses
  const months = new Map<string, number>();
  for (const d of days) months.set(d.slice(0, 7), (months.get(d.slice(0, 7)) ?? 0) + byDay.get(d)!);
  const monthly = [...months.entries()].slice(0, 12).reverse().map(([m, v]) => ({ label: fmtMonth(m), value: v }));

  const yearly = years.map((y, i) => ({ label: String(y), value: Number(yearCounts[i] ?? 0) }));

  const pages: Report["pages"] = [];
  for (let i = 0; i < pagesRaw.length; i += 2) pages.push({ path: String(pagesRaw[i]), views: Number(pagesRaw[i + 1]) });

  return {
    total: Number(total ?? 0),
    uniqueTotal,
    since,
    today: byDay.get(days[0])!,
    uniqueToday,
    week: weekly.at(-1)?.value ?? 0,
    month: monthly.at(-1)?.value ?? 0,
    year: yearly.at(-1)?.value ?? 0,
    daily,
    weekly,
    monthly,
    yearly,
    pages,
  };
}
