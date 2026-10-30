import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/blogger";
import { readOne, youtubeEmbed } from "@/lib/store";
import { Reveal } from "@/components/reveal";

export const revalidate = 1800;

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const item = await readOne("cases", (await params).id);
  return item ? { title: item.title, description: item.summary, openGraph: item.image ? { images: [item.image] } : undefined } : {};
}

export default async function CasePage({ params }: Params) {
  const item = await readOne("cases", (await params).id);
  if (!item) notFound();
  const video = item.videoUrl ? youtubeEmbed(item.videoUrl) : null;

  return (
    <article>
      <header className="relative overflow-hidden bg-surface">
        <div className="cartesian-grid absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-5 py-14 text-center md:py-20">
          <Reveal>
            <Link href="/casos" className="inline-flex items-center gap-1 bg-brand px-3 py-1 font-display text-xs uppercase tracking-wider text-white hover:bg-nav">
              <ArrowLeft className="h-3.5 w-3.5" /> Casos Empíricos Cartesianos
            </Link>
            <h1 className="mt-6 text-4xl leading-tight md:text-6xl">{item.title}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg">{item.summary}</p>
            <time className="mt-4 block text-sm text-muted">{formatDate(item.createdAt)}</time>
          </Reveal>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-14">
        {video ? (
          <iframe src={video} title={item.title} className="mb-10 aspect-video w-full rounded-2xl shadow-2xl" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowFullScreen />
        ) : item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt={item.title} className="mb-10 w-full rounded-2xl shadow-2xl" />
        ) : null}
        {item.content.trim().startsWith("<") ? (
          <div className="post-body" dangerouslySetInnerHTML={{ __html: item.content }} />
        ) : (
          <div className="post-body">
            {item.content.split(/\n\s*\n/).map((block, i) =>
              block.startsWith("#") ? <h2 key={i}>{block.replace(/^#+\s*/, "")}</h2> : <p key={i} className="whitespace-pre-line">{block}</p>,
            )}
          </div>
        )}
      </div>
    </article>
  );
}
