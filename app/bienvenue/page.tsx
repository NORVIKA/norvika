import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { LeadForm } from "./LeadForm";

export const metadata: Metadata = {
  title: "Bienvenue — Espace client Norvika",
  description:
    "Guide d'accueil pour les nouveaux clients de sites web Norvika. Étapes simples, expliquées sans jargon.",
  robots: { index: false, follow: false },
};

const OUTILS = [
  {
    nom: "GoDaddy",
    texte: "C'est l'adresse de votre site, ce que les gens tapent pour vous trouver, par exemple votrecommerce.com. Comme l'adresse civique de votre commerce.",
  },
  {
    nom: "GitHub",
    texte: "C'est l'endroit sécurisé où le code de votre site est gardé, avec tout son historique. Comme un coffre-fort qui contient les plans de votre site.",
  },
  {
    nom: "Supabase",
    texte: "C'est la mémoire de votre site, ce qui garde les informations comme les réservations, les formulaires et les contenus.",
  },
  {
    nom: "Vercel",
    texte: "C'est ce qui garde votre site en ligne en tout temps et le fait charger vite. Comme le terrain qui accueille votre site et le garde allumé.",
  },
];

const ETAPES = [
  { titre: "Vos coordonnées", texte: "Vous remplissez le formulaire ci-dessus." },
  { titre: "On crée vos comptes ensemble", texte: "On configure GoDaddy, GitHub, Supabase et Vercel avec vous." },
  { titre: "Le dépôt pour lancer", texte: "Un dépôt de 25 % confirme le projet et on se met au travail. On vous envoie les détails par courriel." },
  { titre: "On monte votre site", texte: "On s'occupe de tout, vous n'avez rien à gérer." },
  { titre: "Vous le voyez et vous approuvez", texte: "On ajuste jusqu'à ce que vous soyez satisfait." },
  { titre: "Le solde et la mise en ligne", texte: "Vous réglez le reste (75 %), puis votre site devient public à votre adresse." },
];

export default function BienvenuePage() {
  return (
    <>
      {/* INTRO */}
      <section className="border-b border-[var(--hairline)] bg-[var(--background)]">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
          <Eyebrow>Espace client</Eyebrow>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-6xl">
            Bienvenue. Voici comment on va s&apos;y prendre.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
            On s&apos;occupe de presque tout. Ce guide vous explique chaque étape en mots simples,
            pour que vous sachiez ce qui s&apos;en vient, sans stress. Vous n&apos;avez pas besoin
            d&apos;être à l&apos;aise avec la technologie, c&apos;est notre travail.
          </p>
        </div>
      </section>

      {/* FORMULAIRE */}
      <section className="border-b border-[var(--hairline)] bg-[var(--cream)]">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-24">
          <Eyebrow>Étape 1</Eyebrow>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-4xl">
            Pour commencer, laissez-nous vos coordonnées.
          </h2>
          <div className="mt-10">
            <LeadForm />
          </div>
        </div>
      </section>

      {/* OUTILS */}
      <section className="border-b border-[var(--hairline)] bg-[var(--background)]">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
          <Eyebrow>Les outils</Eyebrow>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-4xl">
            Les outils qu&apos;on va utiliser, expliqués simplement.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted-foreground)]">
            Pendant le projet, vous allez voir passer quelques noms. Pas de panique. Voici ce que
            chacun fait, et on crée tous ces comptes avec vous, étape par étape. Vous ne serez jamais
            laissé tout seul devant un écran.
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
              Ces comptes sont à vous. Votre site, votre domaine et vos données vous appartiennent.
              Vous n&apos;êtes jamais pris en otage, et vous pouvez partir avec si un jour vous le
              souhaitez.
            </p>
          </div>
        </div>
      </section>

      {/* ÉTAPES */}
      <section className="border-b border-[var(--hairline)] bg-[var(--cream)]">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
          <Eyebrow>Les prochaines étapes</Eyebrow>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-4xl">
            Ce qui s&apos;en vient, étape par étape.
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

      {/* PAIEMENT */}
      <section className="border-b border-[var(--hairline)] bg-[var(--background)]">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-24">
          <Eyebrow>Le paiement</Eyebrow>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-4xl">
            Le paiement, simple et sans surprise.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted-foreground)]">
            Vous payez en deux fois. Un dépôt de 25 % au début pour lancer le projet, puis le solde
            de 75 % à la fin, une fois que votre site vous plaît et avant la mise en ligne. On vous
            envoie tous les détails et le moyen de paiement par courriel, à chaque étape. Rien de
            compliqué, rien à faire sur cette page.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section className="bg-[var(--primary)] text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-24">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            Une question ? On est là.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80">
            Écrivez-nous ou appelez-nous n&apos;importe quand, on vous accompagne du début à la fin.
          </p>
          <ul className="mt-8 space-y-2 text-base">
            <li>
              Courriel :{" "}
              <a href="mailto:info@norvika.ca" className="underline underline-offset-4">
                info@norvika.ca
              </a>
            </li>
            <li>
              Téléphone :{" "}
              <a href="tel:+14385224275" className="underline underline-offset-4">
                438 522 4275
              </a>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
