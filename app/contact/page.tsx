import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { obtenirContenu } from "@/lib/contenu";
import { metaPage } from "@/lib/meta";
import { lienTelephone } from "@/lib/telephone";
import { ContactForm } from "./ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const { contact, parametres } = await obtenirContenu();
  return metaPage(contact, "/contact", parametres);
}

// Meme raison que dans app/layout.tsx : la revalidation ne pouvait rien
// ecrire, elle ne servait qu'a marquer la page perimee pour toujours.
export const dynamic = "force-static";

export default async function ContactPage() {
  // Coordonnées : « Infos de l'entreprise ». Textes : page « Contact » du Studio.
  const { parametres, contact: t } = await obtenirContenu();
  const email = parametres.courriel;
  const telephone = parametres.telephone;
  const rdvLink = parametres.lienRendezVous;

  return (
    <SiteShell>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[40rem] w-[40rem] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(53,87,212,0.10) 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 md:pb-32 md:pt-28">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
            {/* Colonne info */}
            <div>
              <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-5xl">
                {t.h1}
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--muted-foreground)] md:text-lg">
                {t.intro}
              </p>

              <dl className="mt-10 space-y-6">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                    {t.libelleCourriel}
                  </dt>
                  <dd className="mt-1">
                    <a href={`mailto:${email}`} className="text-base font-medium text-[var(--foreground)] hover:text-[var(--brand)] hover:underline">
                      {email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                    {t.libelleTelephone}
                  </dt>
                  <dd className="mt-1">
                    <a href={lienTelephone(telephone)} className="text-base font-medium text-[var(--foreground)] hover:text-[var(--brand)] hover:underline">
                      {telephone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                    {t.libelleRendezVous}
                  </dt>
                  <dd className="mt-1">
                    <a href={rdvLink} target="_blank" rel="noopener noreferrer" className="text-base font-medium text-[var(--brand)] hover:underline">
                      {t.lienRendezVous}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Colonne formulaire */}
            <div>
              <ContactForm email={email} t={t} />
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
