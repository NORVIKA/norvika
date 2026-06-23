interface FinalCTAProps {
  title: string;
  subtitle: string;
  ctaLabel?: string;
  rdvLink: string;
}

export function FinalCTA({ title, subtitle, ctaLabel = "JE VEUX RÉUSSIR", rdvLink }: FinalCTAProps) {
  return (
    <section className="bg-[var(--primary)] text-white">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
        <span aria-hidden className="mx-auto mb-8 block h-px w-12 bg-[var(--brand)]" />
        <h2 className="mx-auto max-w-3xl text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          {title}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
          {subtitle}
        </p>
        <div className="mt-10 flex flex-col items-center gap-3">
          <a
            href={rdvLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-[var(--cream)] px-10 py-5 text-base font-bold text-[var(--primary)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg active:translate-y-0"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
