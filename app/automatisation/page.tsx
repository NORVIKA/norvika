import type { Metadata } from "next";
import { getSiteData } from "@/lib/get-site-data";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StepBadge } from "@/components/ui/StepBadge";
import { FinalCTA } from "@/components/ui/FinalCTA";

export const metadata: Metadata = {
  title: "Automatisation pour entreprises et travailleurs autonomes",
  description:
    "Ce qui se répète vous gruge en silence. On le règle sur mesure, pour que votre business arrête de mener vos journées.",
  openGraph: {
    title: "Automatisation pour entreprises et travailleurs autonomes | Norvika",
    description:
      "Ce qui se répète vous gruge en silence. On le règle sur mesure, pour que votre business arrête de mener vos journées.",
    url: "/automatisation",
  },
  alternates: { canonical: "https://norvika.ca/automatisation" },
};

export const dynamic = "force-dynamic";

const STEPS = [
  { n: "01", title: "On regarde votre semaine.", body: "On trouve ce qui se répète chez vous, spécifiquement." },
  { n: "02", title: "On le règle sur mesure.", body: "Vous validez, rien ne bouge sans vous." },
  { n: "03", title: "Vous reprenez vos journées.", body: "On ajuste avec vous au fil du temps." },
];

export default async function AutomatisationPage() {
  const { content, siteInfo } = await getSiteData();
  const rdvLink = siteInfo.lien_rdv || "https://calendar.app.google/W5SS5UmnJCTLXhw8A";

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-[40rem] w-[40rem] rounded-full" style={{ background: "radial-gradient(circle, rgba(53,87,212,0.10) 0%, transparent 70%)" }} />
        <div aria-hidden className="pointer-events-none absolute -left-40 top-40 h-[32rem] w-[32rem] rounded-full" style={{ background: "radial-gradient(circle, rgba(53,87,212,0.08) 0%, transparent 70%)" }} />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 md:pb-32 md:pt-32">
          <Reveal>
            <Eyebrow>Automatisation</Eyebrow>
            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl lg:text-7xl">
              {content.auto_hero_titre}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)] md:text-xl">
              {content.auto_hero_sous_titre}
            </p>
            <div className="mt-10">
              <a
                href={rdvLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-7 py-4 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                J&apos;ARRÊTE DE PERDRE DU TEMPS
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* LE PATTERN */}
      <section className="border-t border-[var(--hairline)] bg-[var(--cream)]">
        <div className="mx-auto max-w-3xl px-6 py-24 md:py-32">
          <Reveal>
            <Eyebrow>Le pattern</Eyebrow>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-5xl">
              {content.auto_pattern_titre}
            </h2>
            <p className="mt-8 text-base leading-relaxed text-[var(--muted-foreground)] md:text-lg">
              {content.auto_pattern_texte}
            </p>
          </Reveal>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="border-t border-[var(--hairline)]">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="max-w-3xl">
            <Eyebrow>Comment ça marche</Eyebrow>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-5xl">
              {content.auto_comment_titre}
            </h2>
          </Reveal>
          <ol className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--hairline)] md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 100} className="group relative flex flex-col overflow-hidden bg-[var(--background)] p-8 transition-colors duration-300 hover:bg-[var(--brand-soft)] md:p-10">
                <span aria-hidden className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[var(--brand)] transition-transform duration-300 group-hover:scale-x-100" />
                <StepBadge n={s.n} />
                <h3 className="mt-6 text-xl font-semibold text-[var(--foreground)]">{s.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-[var(--muted-foreground)]">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* VOUS GARDEZ LA MAIN */}
      <section className="border-t border-[var(--hairline)] bg-[var(--cream)]">
        <div className="mx-auto max-w-3xl px-6 py-24 md:py-32">
          <Reveal>
            <Eyebrow>Vous gardez la main</Eyebrow>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-5xl">
              {content.auto_reassurance_titre}
            </h2>
            <p className="mt-8 text-base leading-relaxed text-[var(--muted-foreground)] md:text-lg">
              {content.auto_reassurance_texte}
            </p>
          </Reveal>
        </div>
      </section>

      <FinalCTA
        title={content.auto_cta_titre}
        subtitle={content.auto_cta_sous_titre}
        ctaLabel="J'ARRÊTE DE PERDRE DU TEMPS"
        rdvLink={rdvLink}
      />
    </>
  );
}
