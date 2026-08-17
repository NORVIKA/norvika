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
      <p className="mt-4 text-sm text-[var(--muted-foreground)]">Dernière mise à jour : 15 août 2026</p>

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
          Ce site n&apos;utilise aucun cookie de mesure d&apos;audience, aucun outil d&apos;analytique
          et aucun traceur publicitaire. Rien n&apos;est déposé sur votre appareil à des fins de
          suivi, et c&apos;est pourquoi aucune bannière de consentement ne vous est présentée. Si un
          outil de mesure était ajouté un jour, cette page serait mise à jour et votre consentement
          serait demandé avant tout dépôt.
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

        <h2 className="mt-8 text-xl font-semibold">
          7. Responsable de la protection des renseignements personnels
        </h2>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Conformément à l&apos;article 3.1 de la Loi 25, la personne responsable de la protection
          des renseignements personnels chez Groupe Norvika S.E.N.C. est :
        </p>
        <ul className="mt-3 list-disc pl-5 text-[var(--muted-foreground)]">
          <li>
            <strong className="text-[var(--foreground)]">William Simard</strong>, associé
          </li>
          <li>
            Courriel :{" "}
            <a href="mailto:info@norvika.ca" className="underline">
              info@norvika.ca
            </a>
          </li>
        </ul>
        <p className="mt-3 text-[var(--muted-foreground)]">
          C&apos;est à cette personne que vous adressez toute demande d&apos;accès, de correction ou
          de retrait, ainsi que toute plainte concernant le traitement de vos renseignements.
        </p>

        <h2 className="mt-8 text-xl font-semibold">
          8. Hébergement et communication hors du Québec
        </h2>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Conformément à l&apos;article 17 de la Loi 25, nous vous informons que vos renseignements
          sont hébergés et traités par des fournisseurs situés à l&apos;extérieur du Québec,
          principalement aux États-Unis :
        </p>
        <ul className="mt-3 list-disc pl-5 text-[var(--muted-foreground)]">
          <li>
            <strong className="text-[var(--foreground)]">Supabase</strong> : conservation des
            messages envoyés par les formulaires du site
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Resend</strong> : acheminement des
            courriels de notification qui nous préviennent de votre message
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Cloudflare</strong> : hébergement et
            diffusion du site
          </li>
        </ul>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Avant de recourir à ces fournisseurs, nous avons évalué que les renseignements en cause
          bénéficient d&apos;une protection adéquate, compte tenu de leur nature (coordonnées
          d&apos;affaires), de la finalité limitée de leur utilisation et des mesures de sécurité
          contractuelles et techniques mises en place. Nous ne transmettons aucun renseignement
          sensible à ces fournisseurs.
        </p>

        <h2 className="mt-8 text-xl font-semibold">9. Sécurité</h2>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Vos données sont stockées de manière sécurisée via Supabase et protégées par des mesures
          de sécurité conformes aux standards de l&apos;industrie (chiffrement, authentification, contrôle
          d&apos;accès).
        </p>

        <h2 className="mt-8 text-xl font-semibold">10. Contact</h2>
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
