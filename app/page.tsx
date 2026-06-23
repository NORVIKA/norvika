import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteData } from "@/lib/get-site-data";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FinalCTA } from "@/components/ui/FinalCTA";

export const metadata: Metadata = {
  title: "Norvika — Présence numérique pour entreprises du Québec",
  description:
    "On trouve ce qui vous freine, de votre site à vos tâches répétitives, puis on le règle avec vous.",
  openGraph: {
    title: "Norvika — Présence numérique pour entreprises du Québec",
    description:
      "On trouve ce qui vous freine, de votre site à vos tâches répétitives, puis on le règle avec vous.",
    url: "/",
  },
  alternates: { canonical: "https://norvika.ca" },
};

export const dynamic = "force-dynamic";

const PILLARS = [
  { n: "01", key: "site", to: "/sites-web", cta: "Sites web" },
  { n: "02", key: "temps", to: "/automatisation", cta: "Automatisation" },
  { n: "03", key: "image", to: "/photo-video", cta: "Photo et vidéo" },
];

export default async function HomePage() {
  const { content, siteInfo } = await getSiteData();
  const rdvLink = siteInfo.lien_rdv || "https://calendar.app.google/W5SS5UmnJCTLXhw8A";

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[var(--hairline)] bg-[var(--background)]">
        {/* Blue halo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(53,87,212,0.12) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-6 pb-32 pt-24 text-center md:pb-44 md:pt-32">
          <Reveal
            as="h1"
            className="mx-auto max-w-[18ch] text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.025em] text-[var(--foreground)] sm:text-6xl md:text-7xl lg:text-[5.5rem]"
          >
            {content.hero_titre}
          </Reveal>
          <Reveal
            as="p"
            delay={120}
            className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-[var(--muted-foreground)] md:text-lg"
          >
            {content.hero_sous_titre}
          </Reveal>
          <Reveal delay={240} className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
            <a
              href={rdvLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-10 py-5 text-base font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
            >
              {content.hero_cta}
            </a>
            <a
              href="#services"
              className="text-sm font-medium text-[var(--muted-foreground)] underline-offset-4 hover:text-[var(--foreground)] hover:underline"
            >
              Voir les services
            </a>
          </Reveal>
        </div>
      </section>

      {/* PILLIERS */}
      <section id="services" className="scroll-mt-24 bg-[var(--cream)]">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="max-w-3xl">
            <Eyebrow>Trois solutions</Eyebrow>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-5xl">
              {content.pilliers_titre}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[var(--muted-foreground)] md:text-lg">
              {content.pilliers_sous_titre}
            </p>
          </Reveal>
          <ul className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--hairline)] md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Reveal
                as="li"
                key={p.key}
                delay={i * 120}
                className="group relative flex flex-col overflow-hidden bg-[var(--background)] p-8 transition-colors duration-300 hover:bg-[var(--brand-soft)] md:p-10"
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[var(--brand)] transition-transform duration-300 group-hover:scale-x-100"
                />
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand)] transition-colors duration-300 group-hover:bg-[var(--brand)] group-hover:text-white">
                    {p.n}
                  </span>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                    {content[`pillier_${i + 1}_label`]}
                  </p>
                </div>
                <p className="mt-6 flex-1 text-base leading-relaxed text-[var(--foreground)]">
                  {content[`pillier_${i + 1}_desc`]}
                </p>
                <Link
                  href={p.to}
                  className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] transition-colors group-hover:text-[var(--brand)]"
                >
                  {p.cta}
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* BRAND MOMENT */}
      <section className="relative overflow-hidden border-t border-[var(--hairline)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-1/2 h-[36rem] w-[36rem] -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(53,87,212,0.10) 0%, rgba(53,87,212,0) 70%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <Reveal className="order-2 md:order-1">
              <div className="relative">
                <div aria-hidden className="absolute -inset-3 -z-10 rounded-3xl bg-[var(--brand)]/10 blur-xl" />
                <div className="overflow-hidden rounded-2xl border border-[var(--brand)]/20 bg-[var(--cream)] shadow-[0_30px_60px_-30px_rgba(53,87,212,0.3)]">
                  <Image
                    src="/images/fondateurs.png"
                    alt="Les fondateurs de Norvika"
                    width={600}
                    height={700}
                    className="w-full h-auto max-h-[600px] object-cover object-top transition-transform duration-700 ease-out hover:scale-[1.03]"
                  />
                </div>
              </div>
            </Reveal>
            <Reveal delay={120} className="order-1 md:order-2">
              <Eyebrow>Pourquoi Norvika</Eyebrow>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-5xl">
                {content.about_titre}
              </h2>
              <p className="mt-8 text-base leading-relaxed text-[var(--muted-foreground)] md:text-lg">
                {content.about_texte}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <FinalCTA
        title={content.cta_principal_titre}
        subtitle={content.cta_principal_sous_titre}
        rdvLink={rdvLink}
      />
    </>
  );
}
