import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité de Norvika, conforme à la Loi 25 du Québec.",
  robots: { index: false, follow: false },
};

export default function PolitiquePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
      <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-4xl">
        Politique de confidentialité
      </h1>
      <p className="mt-4 text-sm text-[var(--muted-foreground)]">Dernière mise à jour : 23 juin 2026</p>

      <div className="prose prose-sm mt-10 max-w-none text-[var(--foreground)]">
        <h2 className="mt-8 text-xl font-semibold">1. Qui sommes-nous</h2>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Norvika est une entreprise québécoise de services numériques. Nous offrons la création de
          sites web, l&apos;automatisation de processus et des services de photo et vidéo pour les
          entreprises et les travailleurs autonomes. Pour nous joindre : info@norvika.ca
        </p>

        <h2 className="mt-8 text-xl font-semibold">2. Données collectées</h2>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Nous collectons uniquement les données que vous nous fournissez volontairement :
        </p>
        <ul className="mt-3 list-disc pl-5 text-[var(--muted-foreground)]">
          <li>Prénom, courriel et numéro de téléphone (via le formulaire Espace client)</li>
          <li>Données de navigation anonymes (via Google Analytics, avec votre consentement)</li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold">3. Utilisation des données</h2>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Vos données personnelles sont utilisées uniquement pour :
        </p>
        <ul className="mt-3 list-disc pl-5 text-[var(--muted-foreground)]">
          <li>Vous recontacter suite à votre demande</li>
          <li>Gérer la relation client dans le cadre d&apos;un projet</li>
        </ul>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Nous ne vendons, ne louons et ne partageons jamais vos données avec des tiers à des fins
          commerciales.
        </p>

        <h2 className="mt-8 text-xl font-semibold">4. Cookies et analytique</h2>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Ce site utilise des cookies pour mesurer l&apos;audience (Google Analytics 4). Ces cookies
          ne sont activés qu&apos;après votre consentement explicite via la bannière de gestion des
          cookies. Vous pouvez refuser ou retirer votre consentement à tout moment.
        </p>

        <h2 className="mt-8 text-xl font-semibold">5. Conservation des données</h2>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Vos données sont conservées aussi longtemps que nécessaire pour la gestion de votre projet,
          puis supprimées dans un délai raisonnable.
        </p>

        <h2 className="mt-8 text-xl font-semibold">6. Vos droits (Loi 25 Québec)</h2>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Conformément à la Loi modernisant des dispositions législatives en matière de protection des
          renseignements personnels (Loi 25), vous avez le droit de :
        </p>
        <ul className="mt-3 list-disc pl-5 text-[var(--muted-foreground)]">
          <li>Accéder à vos renseignements personnels</li>
          <li>Demander la correction de données inexactes</li>
          <li>Demander la suppression de vos données</li>
          <li>Retirer votre consentement à tout moment</li>
        </ul>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Pour exercer ces droits, contactez-nous à{" "}
          <a href="mailto:info@norvika.ca" className="underline">
            info@norvika.ca
          </a>
          .
        </p>

        <h2 className="mt-8 text-xl font-semibold">7. Sécurité</h2>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Vos données sont stockées de manière sécurisée via Supabase et protégées par des mesures
          de sécurité conformes aux standards de l&apos;industrie (chiffrement, authentification, contrôle
          d&apos;accès).
        </p>

        <h2 className="mt-8 text-xl font-semibold">8. Contact</h2>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Pour toute question relative à cette politique :{" "}
          <a href="mailto:info@norvika.ca" className="underline">
            info@norvika.ca
          </a>
        </p>
      </div>
    </div>
  );
}
