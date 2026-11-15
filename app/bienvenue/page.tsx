import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/ui/Reveal";
import { obtenirContenu } from "@/lib/contenu";
import { visible } from "@/lib/types-contenu";
import { LeadForm } from "./LeadForm";

// Page cachée de Google (lien envoyé aux nouveaux clients). Ses textes : page « Bienvenue » du
// Studio ; le courriel et le téléphone : « Infos de l'entreprise ».
export async function generateMetadata(): Promise<Metadata> {
  const { bienvenue } = await obtenirContenu();
  return {
    title: { absolute: bienvenue.seoTitre },
    description: bienvenue.seoDescription,
    robots: { index: false, follow: false },
  };
}

export default async function BienvenuePage() {
  const { bienvenue: t, parametres } = await obtenirContenu();
  const OUTILS = t.outils.liste.map((o) => ({ nom: o.titre, texte: o.texte }));
  const ETAPES = t.etapes.liste;
  return (
    <SiteShell>
      <>
        {/* INTRO */}
        <section className="border-b border-[var(--hairline)] bg-[var(--background)]">
          <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-6xl">
              {t.h1}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
              {t.intro}
            </p>
          </div>
        </section>

        {/* FORMULAIRE */}
        <section className="border-b border-[var(--hairline)] bg-[var(--cream)]">
          <div className="mx-auto max-w-4xl px-6 py-20 md:py-24">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-4xl">
              {t.formTitre}
            </h2>
            <div className="mt-10">
              <LeadForm t={t} />
            </div>
          </div>
        </section>

        {/* OUTILS */}
        {visible(t.outils) ? (
        <section className="border-b border-[var(--hairline)] bg-[var(--background)]">
          <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-4xl">
              {t.outils.titre}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted-foreground)]">
              {t.outils.texte}
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {OUTILS.map((o, i) => (
                <Reveal key={o.nom} delay={i * 80}>
                  <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--background)] p-8">
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">{o.nom}</h3>
                    <p className="mt-3 text-base leading-relaxed text-[var(--muted-foreground)]">{o.texte}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="mt-8 rounded-2xl border border-[var(--hairline)] bg-[var(--cream)] p-6 md:p-8">
              <p className="text-base leading-relaxed text-[var(--foreground)]">
                {t.outils.propriete}
              </p>
            </div>
          </div>
        </section>
        ) : null}

        {/* ÉTAPES */}
        {visible(t.etapes) ? (
        <section className="border-b border-[var(--hairline)] bg-[var(--cream)]">
          <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-4xl">
              {t.etapes.titre}
            </h2>
            <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--hairline)] md:grid-cols-2">
              {ETAPES.map((e, i) => (
                <li key={e.titre} className="bg-[var(--background)] p-8 md:p-10">
                  <span className="text-sm font-medium text-[var(--muted-foreground)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-[var(--foreground)]">{e.titre}</h3>
                  <p className="mt-3 text-base leading-relaxed text-[var(--muted-foreground)]">{e.texte}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        ) : null}

        {/* PAIEMENT */}
        {visible(t.paiement) ? (
        <section className="border-b border-[var(--hairline)] bg-[var(--background)]">
          <div className="mx-auto max-w-4xl px-6 py-20 md:py-24">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-4xl">
              {t.paiement.titre}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted-foreground)]">
              {t.paiement.texte}
            </p>
          </div>
        </section>
        ) : null}

        {/* CONTACT */}
        {visible(t.contact) ? (
        <section className="bg-[var(--primary)] text-white">
          <div className="mx-auto max-w-4xl px-6 py-20 md:py-24">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              {t.contact.titre}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80">
              {t.contact.texte}
            </p>
            <ul className="mt-8 space-y-2 text-base">
              <li>
                {t.contact.libelleCourriel}{" "}
                <a href={`mailto:${parametres.courriel}`} className="underline underline-offset-4">
                  {parametres.courriel}
                </a>
              </li>
              <li>
                {t.contact.libelleTelephone}{" "}
                <a href={`tel:+1${parametres.telephone.replace(/\D/g, "")}`} className="underline underline-offset-4">
                  {parametres.telephone}
                </a>
              </li>
            </ul>
          </div>
        </section>
        ) : null}
      </>
    </SiteShell>
  );
}
