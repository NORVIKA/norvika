import type { Metadata } from "next";
import { getSiteData } from "@/lib/get-site-data";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Parlez-nous de votre projet. On vous répond rapidement, par courriel ou par téléphone.",
  openGraph: {
    title: "Contact | Norvika",
    description:
      "Parlez-nous de votre projet. On vous répond rapidement, par courriel ou par téléphone.",
    url: "/contact",
  },
  alternates: { canonical: "https://norvika.ca/contact" },
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const { siteInfo } = await getSiteData();
  const email = siteInfo.email || "info@norvika.ca";
  const telephone = siteInfo.telephone || "438 522 4275";
  const rdvLink = siteInfo.lien_rdv || "https://calendar.app.google/W5SS5UmnJCTLXhw8A";

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[40rem] w-[40rem] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(53,87,212,0.10) 0%, transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 md:pb-32 md:pt-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          {/* Colonne info */}
          <Reveal>
            <Eyebrow>Contact</Eyebrow>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-5xl">
              Parlons de votre projet.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--muted-foreground)] md:text-lg">
              Une question, un projet, ou juste l&apos;envie d&apos;en parler ? Écrivez-nous et on
              vous revient rapidement.
            </p>

            <dl className="mt-10 space-y-6">
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                  Courriel
                </dt>
                <dd className="mt-1">
                  <a href={`mailto:${email}`} className="text-base font-medium text-[var(--foreground)] hover:text-[var(--brand)] hover:underline">
                    {email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                  Téléphone
                </dt>
                <dd className="mt-1">
                  <a href={`tel:${telephone.replace(/\s/g, "")}`} className="text-base font-medium text-[var(--foreground)] hover:text-[var(--brand)] hover:underline">
                    {telephone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                  Prendre rendez-vous
                </dt>
                <dd className="mt-1">
                  <a href={rdvLink} target="_blank" rel="noopener noreferrer" className="text-base font-medium text-[var(--brand)] hover:underline">
                    Réserver un appel de 30 min →
                  </a>
                </dd>
              </div>
            </dl>
          </Reveal>

          {/* Colonne formulaire */}
          <Reveal delay={120}>
            <ContactForm email={email} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
