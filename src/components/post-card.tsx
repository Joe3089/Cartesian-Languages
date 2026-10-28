import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { formatDate, postHref, type PostSummary } from "@/lib/blogger";

export function PostCard({ post, priority = false }: { post: PostSummary; priority?: boolean }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-surface transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/10">
      <Link href={postHref(post)} className="relative block aspect-[16/10] overflow-hidden bg-nav">
        {post.image ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority={priority}
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="cartesian-grid grid h-full place-items-center font-display text-5xl text-brand">CL</div>
        )}
        {/* Overlay verde al pasar el cursor, como el tema original */}
        <div className="absolute inset-0 bg-brand/0 transition-colors duration-500 group-hover:bg-brand/25" />
        {post.labels[0] && (
          <span className="absolute left-4 top-4 bg-brand px-2.5 py-1 font-display text-xs uppercase tracking-wider text-white">
            {post.labels[0].replace(" (Columna Investigativa)", "")}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-3 text-xs text-muted">
          <time dateTime={post.published}>{formatDate(post.published)}</time>
          <span className="h-1 w-1 rounded-full bg-soft" />
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {post.readingTime} min</span>
        </div>
        <h3 className="text-xl leading-snug">
          <Link href={postHref(post)} className="transition-colors hover:text-brand">{post.title}</Link>
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed">{post.excerpt}</p>
        <Link href={postHref(post)} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand">
          Leer más
          <span className="h-px w-6 bg-brand transition-all duration-300 group-hover:w-12" />
        </Link>
      </div>
    </article>
  );
}
