import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité de Norvika, conforme à la Loi 25 du Québec.",
  robots: { index: false, follow: false },
};

export default function PolitiquePage() {
  return (
    <SiteShell>
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

          <h2 className="mt-8 text-xl font-semibold">4. Témoins (cookies) et mesure d&apos;audience</h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Ce site utilise deux catégories de témoins. Les témoins <strong>nécessaires</strong> font
            fonctionner le site et mémorisent votre choix de consentement : ils sont déposés sans votre
            accord, parce que le site ne peut pas fonctionner sans eux. Les témoins de{" "}
            <strong>mesure d&apos;audience</strong> (Google Analytics 4) nous indiquent quelles pages
            sont consultées, afin d&apos;améliorer le site.
          </p>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Aucun témoin de mesure n&apos;est déposé avant que vous l&apos;ayez accepté. Tant que vous
            n&apos;avez pas donné votre accord, Google Analytics est désactivé et ne reçoit rien.
            Refuser est aussi simple qu&apos;accepter : les deux choix sont offerts dès la première
            visite, au même endroit et avec la même facilité.
          </p>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Vous pouvez changer d&apos;idée en tout temps en rouvrant la fenêtre de consentement depuis
            le lien de gestion des témoins affiché sur le site, ou en effaçant les témoins de votre
            navigateur. Nous n&apos;utilisons aucun témoin publicitaire et ne faisons aucun ciblage
            publicitaire.
          </p>
          <p className="mt-3 text-[var(--muted-foreground)]">
            La bannière de consentement est fournie par CookieYes. La mesure d&apos;audience est
            fournie par Google Analytics 4, avec l&apos;anonymisation des adresses IP activée.
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
            <li>
              <strong className="text-[var(--foreground)]">Google (Analytics 4)</strong> : mesure
              d&apos;audience, uniquement si vous l&apos;avez acceptée
            </li>
            <li>
              <strong className="text-[var(--foreground)]">CookieYes</strong> : affichage de la
              bannière de consentement et conservation de votre choix
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
    </SiteShell>
  );
}
