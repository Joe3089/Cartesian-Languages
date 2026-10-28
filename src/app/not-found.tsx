import Link from "next/link";

export default function NotFound() {
  return (
    <section className="cartesian-grid grid min-h-[60vh] place-items-center px-5 text-center">
      <div>
        <p className="font-display text-8xl text-brand">404</p>
        <h1 className="mt-4 text-3xl">Dubito: esta página no existe</h1>
        <p className="mt-2">Quizá el artículo cambió de lugar.</p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-brand px-8 py-3 font-display uppercase tracking-wider text-white hover:bg-brand-dark">Volver al inicio</Link>
      </div>
    </section>
  );
}
