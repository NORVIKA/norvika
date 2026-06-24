import type { Metadata } from "next";
import Image from "next/image";
import { getSiteData } from "@/lib/get-site-data";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FinalCTA } from "@/components/ui/FinalCTA";

export const metadata: Metadata = {
  title: "Photo et vidéo pour entreprises du Québec",
  description:
    "Une image à la hauteur de votre commerce. Photo et vidéo pour votre site, vos réseaux et vos campagnes.",
  openGraph: {
    title: "Photo et vidéo pour entreprises du Québec | Norvika",
    description:
      "Une image à la hauteur de votre commerce. Photo et vidéo pour votre site, vos réseaux et vos campagnes.",
    url: "/photo-video",
  },
  alternates: { canonical: "https://norvika.ca/photo-video" },
};

export const dynamic = "force-dynamic";

const CLIENTS = [
  { label: "Desjardins", src: "/images/realisation-desjardins.jpg" },
  { label: "LOUD Conférences de feu", src: "/images/realisation-loud.jpg" },
  { label: "Anytime Fitness", src: "/images/realisation-anytime.jpg" },
];

const USAGES = [
  "Contenu pour vos réseaux sociaux",
  "Photos de votre lieu, vos produits, votre équipe",
  "Vidéo d'événement et de marque",
  "Visuels pour votre site et vos publicités",
];

export default async function PhotoVideoPage() {
  const { content, siteInfo } = await getSiteData();
  const rdvLink = siteInfo.lien_rdv || "https://calendar.app.google/W5SS5UmnJCTLXhw8A";
  const portfolioLink = siteInfo.lien_portfolio || "https://norvika.myportfolio.com/";

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-[40rem] w-[40rem] rounded-full" style={{ background: "radial-gradient(circle, rgba(53,87,212,0.10) 0%, transparent 70%)" }} />
        <div aria-hidden className="pointer-events-none absolute -left-40 top-40 h-[32rem] w-[32rem] rounded-full" style={{ background: "radial-gradient(circle, rgba(53,87,212,0.08) 0%, transparent 70%)" }} />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 md:pb-32 md:pt-32">
          <Reveal>
            <Eyebrow>Photo et vidéo</Eyebrow>
            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl lg:text-7xl">
              {content.photo_hero_titre}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)] md:text-xl">
              {content.photo_hero_sous_titre}
            </p>
            <div className="mt-10">
              <a
                href={portfolioLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-7 py-4 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                VOIR NOTRE PORTFOLIO
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* RÉFÉRENCES */}
      <section className="border-t border-[var(--hairline)] bg-[var(--cream)]">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="max-w-3xl">
            <Eyebrow>Références</Eyebrow>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-5xl">
              {content.photo_ref_titre}
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CLIENTS.map((c, i) => (
              <Reveal key={c.label} delay={i * 100}>
                <div className="group relative aspect-[16/9] overflow-hidden rounded-xl border border-[var(--hairline)] bg-[var(--cream)]">
                  <Image
                    src={c.src}
                    alt={c.label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <a
              href={portfolioLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-[var(--primary)] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              Voir notre portfolio
            </a>
          </div>
        </div>
      </section>

      {/* USAGES */}
      <section className="border-t border-[var(--hairline)]">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
            <Reveal>
              <Eyebrow>Pour quoi faire</Eyebrow>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-5xl">
                {content.photo_usages_titre}
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <ul className="grid gap-px overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-2">
                {USAGES.map((u) => (
                  <li key={u} className="flex items-start gap-3 bg-[var(--background)] p-6">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" aria-hidden>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span className="text-sm leading-relaxed text-[var(--foreground)]">{u}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <FinalCTA
        title={content.photo_cta_titre}
        subtitle={content.photo_cta_sous_titre}
        rdvLink={rdvLink}
      />
    </>
  );
}
