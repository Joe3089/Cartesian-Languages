import { site } from "@/lib/site";

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {site.social.map((s) => (
        <li key={s.name}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.name}
            title={s.name}
            className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-md hover:ring-brand"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.icon} alt="" width={22} height={22} loading="lazy" className="h-[22px] w-[22px] object-contain" />
          </a>
        </li>
      ))}
    </ul>
  );
}
