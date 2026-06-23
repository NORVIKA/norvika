import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--brand)]">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-5xl">
        Page introuvable.
      </h1>
      <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--muted-foreground)]">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-7 py-4 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
