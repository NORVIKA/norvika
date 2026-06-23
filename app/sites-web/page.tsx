import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteData } from "@/lib/get-site-data";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StepBadge } from "@/components/ui/StepBadge";
import { FinalCTA } from "@/components/ui/FinalCTA";

export const metadata: Metadata = {
  title: "Création et refonte de sites web",
  description:
    "Un site professionnel qui travaille pour votre commerce. Création ou refonte, payé une fois, aucuns frais mensuels.",
  openGraph: {
    title: "Création et refonte de sites web | Norvika",
    description:
      "Un site professionnel qui travaille pour votre commerce. Création ou refonte, payé une fois, aucuns frais mensuels.",
    url: "/sites-web",
  },
  alternates: { canonical: "https://norvika.ca/sites-web" },
};

export const dynamic = "force-dynamic";

const STEPS = [
  { n: "01", title: "Un court appel.", body: "On comprend votre commerce et ce que vous voulez." },
  { n: "02", title: "On monte votre site.", body: "On s'occupe de tout, vous n'avez rien à gérer." },
  { n: "03", title: "Vous le voyez en vrai.", body: "Vous décidez après, jamais avant." },
];

const WORKS = [
  {
    name: "Le Piment Szechuan",
    type: "Restaurant, McMasterville",
    url: "https://lepimentszechuan.com",
    review: "Very nice and clean page design, we love it!",
  },
  {
    name: "Verger François Legault",
    type: "Verger, Mont-Saint-Hilaire",
    url: "https://www.vergerfrancoislegault.ca",
    review: "Merci pour tout !",
  },
];

const OFFER_ITEMS = [
  "Design personnalisé, pas un template",
  "Optimisé pour le mobile",
  "Vous le voyez avant de payer",
  "Mise en ligne, on s'occupe de tout",
  "Formation pour gérer votre contenu",
  "Du soutien après le lancement",
];

export default async function SitesWebPage() {
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
            <Eyebrow>Sites web</Eyebrow>
            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl lg:text-7xl">
              {content.sites_hero_titre}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)] md:text-xl">
              {content.sites_hero_sous_titre}
            </p>
            <div className="mt-10">
              <a
                href={rdvLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-7 py-4 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                VOIR MON SITE
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="border-t border-[var(--hairline)] bg-[var(--cream)]">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="max-w-3xl">
            <Eyebrow>Comment ça marche</Eyebrow>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-5xl">
              {content.sites_comment_titre}
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

      {/* RÉALISATIONS */}
      <section className="border-t border-[var(--hairline)]">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="max-w-3xl">
            <Eyebrow>Réalisations</Eyebrow>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-5xl">
              {content.sites_realisation_titre}
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-12 md:grid-cols-2">
            {WORKS.map((w) => {
              const host = w.url.replace(/^https?:\/\//, "");
              const shot = `https://image.thum.io/get/width/1200/crop/900/noanimate/${w.url}`;
              return (
                <Reveal key={w.name}>
                  <a
                    href={w.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block overflow-hidden rounded-xl border border-[var(--hairline)] bg-[var(--cream)] transition-shadow hover:shadow-[0_20px_60px_-30px_rgba(27,42,71,0.35)]"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-[var(--muted)]">
                      <Image
                        src={shot}
                        alt={`Aperçu du site ${w.name}`}
                        width={600}
                        height={450}
                        loading="lazy"
                        className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                  </a>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-[var(--foreground)]">{w.name}</h3>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{w.type}</p>
                    </div>
                    <a href={w.url} target="_blank" rel="noopener noreferrer" className="shrink-0 pt-0.5 text-sm font-medium text-[var(--primary)] hover:underline">
                      VOIR LE SITE
                    </a>
                  </div>
                  <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">{host}</p>
                  <blockquote className="mt-5 border-l-2 border-[var(--brand)] pl-4 text-sm leading-relaxed text-[var(--foreground)]">
                    « {w.review} »
                  </blockquote>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* L'OFFRE */}
      <section className="border-t border-[var(--hairline)] bg-[var(--cream)]">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
            <Reveal>
              <Eyebrow>L&apos;offre</Eyebrow>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-5xl">
                {content.sites_offre_titre}
              </h2>
              <p className="mt-8 max-w-md text-base leading-relaxed text-[var(--muted-foreground)]">
                Site professionnel à partir de{" "}
                <span className="font-medium text-[var(--foreground)]">{content.sites_offre_prix}</span>
                , payé une fois, aucuns frais mensuels.
              </p>
              <div className="mt-8">
                <a
                  href={rdvLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-7 py-4 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  VOIR MON SITE
                </a>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <ul className="grid gap-px overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-2">
                {OFFER_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-3 bg-[var(--background)] p-6">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" aria-hidden>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span className="text-sm leading-relaxed text-[var(--foreground)]">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <FinalCTA
        title={content.sites_cta_titre}
        subtitle={content.sites_cta_sous_titre}
        ctaLabel="VOIR MON SITE"
        rdvLink={rdvLink}
      />
    </>
  );
}
