import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { obtenirContenu } from "@/lib/contenu";
import { imagePartage, partage } from "@/lib/meta";

// Texte légal, laissé dans le code (exception de la phase 4). Son propre aperçu de partage : sans
// lui, la page héritait du titre et de la description de l'accueil (openGraph du layout).
const TITRE = "Politique de confidentialité";
// ⚠️ À METTRE AU JOUR LE JOUR DE LA MISE EN LIGNE du vérificateur Loi 25 (préparé le 2026-11-18,
// textes de Martin, contenu/verificateur-loi25-textes.md sections 4 et 5) : les ajouts sur l'outil
// seraient faux tant qu'il n'est pas en ligne.
// Date de la version EN LIGNE aujourd'hui. Elle se fixe le jour de la mise en ligne (Pixel,
// 2026-11-19), pas avant : c'est cette ligne qui change à ce moment-là.
const MISE_A_JOUR = "14 novembre 2026";
// Jamais « conforme à la Loi 25 » : c'est l'auto-attestation que le vérificateur Loi 25 refuse de
// faire, sur le site qui l'offre (Martin, 2026-11-18, point B).
const DESCRIPTION = "Politique de confidentialité de Norvika : renseignements recueillis, utilisation, fournisseurs, conservation et vos droits.";

export async function generateMetadata(): Promise<Metadata> {
  const { parametres } = await obtenirContenu();
  return {
    title: TITRE,
    description: DESCRIPTION,
    robots: { index: false, follow: false },
    ...partage(parametres, {
      titre: `${TITRE} | ${parametres.nom}`,
      description: DESCRIPTION,
      chemin: "/politique-de-confidentialite",
      image: imagePartage(parametres.imagePartage),
    }),
  };
}

export default async function PolitiquePage() {
  // Le nom légal vient de « Infos de l'entreprise » (zéro texte en dur) : il a changé le 2026-11-18.
  const { parametres } = await obtenirContenu();
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] md:text-4xl">
          Politique de confidentialité
        </h1>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Dernière mise à jour et entrée en vigueur : {MISE_A_JOUR}
        </p>

        <div className="prose prose-sm mt-10 max-w-none text-[var(--foreground)]">
          <h2 className="mt-8 text-xl font-semibold">1. Qui sommes-nous</h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Norvika est une entreprise québécoise de services numériques. Nous offrons la création de
            sites web, l’automatisation de processus et des services de photo et vidéo pour les
            entreprises et les travailleurs autonomes. Pour nous joindre : info@norvika.ca
          </p>

          <h2 className="mt-8 text-xl font-semibold">2. Données collectées</h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Nous collectons uniquement les données que vous nous fournissez volontairement :
          </p>
          <ul className="mt-3 list-disc pl-5 text-[var(--muted-foreground)]">
            <li>Prénom, courriel et numéro de téléphone (via le formulaire Espace client)</li>
            <li>
              Votre adresse IP, gardée sous une forme brouillée au plus 24 heures, quand vous envoyez un
              formulaire ou lancez le vérificateur Loi 25, pour limiter le nombre d’envois et bloquer les abus
            </li>
            <li>L’adresse d’un site web, quand vous utilisez le vérificateur Loi 25</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold">3. Utilisation des données</h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Vos données personnelles sont utilisées uniquement pour :
          </p>
          <ul className="mt-3 list-disc pl-5 text-[var(--muted-foreground)]">
            <li>Vous recontacter suite à votre demande</li>
            <li>Gérer la relation client dans le cadre d’un projet</li>
          </ul>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Nous ne vendons, ne louons et ne partageons jamais vos données avec des tiers à des fins
            commerciales.
          </p>

          <h2 className="mt-8 text-xl font-semibold">4. Vérificateur Loi 25</h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Notre vérificateur Loi 25 (norvika.ca/verificateur-loi-25) visite automatiquement le site dont
            vous entrez l’adresse, puis la page de politique de confidentialité vers laquelle ce site
            renvoie, même si elle est hébergée sur un autre domaine. Il relève des signaux visibles de
            l’extérieur. Il ne vous demande pas de courriel. Voici ce qu’il recueille et ce que nous en
            faisons.
          </p>
          <ul className="mt-3 list-disc pl-5 text-[var(--muted-foreground)]">
            <li>
              <strong className="text-[var(--foreground)]">Adresse du site analysé.</strong> Elle sert
              uniquement à faire l’analyse et à afficher le résultat. Elle n’est enregistrée dans aucune de
              nos bases de données. Cloudflare, qui fait l’analyse, garde toutefois la liste des adresses
              visitées (le site analysé et sa page de politique) dans notre tableau de bord, pour une durée
              qu’il ne précise pas. Nous ne nous servons pas de cette liste.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Adresse IP.</strong> Nous la gardons sous une
              forme brouillée (un condensé qui ne permet pas de la relire), au plus 24 heures, pour limiter
              le nombre d’analyses par appareil et bloquer les abus. Elle ne sert à rien d’autre.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Vérification anti-robot.</strong> Comme sur nos
              autres formulaires, Cloudflare Turnstile reçoit des signaux techniques de votre navigateur pour
              distinguer une personne d’un robot.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Où se fait l’analyse.</strong> La visite du site
              analysé est faite par un navigateur automatique de Cloudflare (Browser Run), depuis le réseau
              mondial de Cloudflare, qui peut se trouver à l’extérieur du Québec. Le contenu des pages
              visitées sert seulement à produire le résultat : ni nous ni Cloudflare ne conservons ce
              contenu après l’analyse. Si la politique analysée nomme une personne, ce nom sert seulement à constater
              qu’un responsable est désigné ; il n’est ni affiché ni conservé.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Ce que vaut le résultat.</strong> C’est un test
              automatique, pas un avis juridique.
            </li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold">5. Témoins (cookies) et mesure d’audience</h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Ce site utilise deux catégories de témoins. Les témoins <strong>nécessaires</strong> font
            fonctionner le site et mémorisent votre choix de consentement : ils sont déposés sans votre
            accord, parce que le site ne peut pas fonctionner sans eux. Les témoins de{" "}
            <strong>mesure d’audience</strong> (Google Analytics 4) nous indiquent quelles pages
            sont consultées, afin d’améliorer le site.
          </p>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Aucun témoin de mesure n’est déposé avant que vous l’ayez accepté. Tant que vous
            n’avez pas donné votre accord, Google Analytics est désactivé et ne reçoit rien.
            Refuser est aussi simple qu’accepter : les deux choix sont offerts dès la première
            visite, au même endroit et avec la même facilité.
          </p>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Vous pouvez changer d’idée en tout temps en rouvrant la fenêtre de consentement depuis
            le lien de gestion des témoins affiché sur le site, ou en effaçant les témoins de votre
            navigateur. Nous n’utilisons aucun témoin publicitaire et ne faisons aucun ciblage
            publicitaire.
          </p>
          <p className="mt-3 text-[var(--muted-foreground)]">
            La bannière de consentement est fournie par CookieYes. La mesure d’audience est
            fournie par Google Analytics 4, avec l’anonymisation des adresses IP activée.
          </p>

          <h2 className="mt-8 text-xl font-semibold">6. Conservation des données</h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Vos données sont conservées aussi longtemps que nécessaire pour la gestion de votre projet,
            puis supprimées dans un délai raisonnable.
          </p>

          <h2 className="mt-8 text-xl font-semibold">7. Vos droits (Loi 25 Québec)</h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Conformément à la Loi modernisant des dispositions législatives en matière de protection des
            renseignements personnels (Loi 25), vous avez le droit de :
          </p>
          <ul className="mt-3 list-disc pl-5 text-[var(--muted-foreground)]">
            <li>Accéder à vos renseignements personnels</li>
            <li>Demander la correction de données inexactes</li>
            <li>Demander la suppression de vos données</li>
            <li>Retirer votre consentement à tout moment</li>
            <li>
              Recevoir les renseignements que vous nous avez fournis dans un format numérique structuré et
              couramment utilisé (portabilité)
            </li>
          </ul>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Pour exercer ces droits, contactez-nous à{" "}
            <a href="mailto:info@norvika.ca" className="underline">
              info@norvika.ca
            </a>
            .
          </p>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Nous répondons par écrit à une demande d’accès ou de rectification dans les 30 jours suivant sa
            réception. Si notre réponse ne vous satisfait pas, vous pouvez vous adresser à la Commission
            d’accès à l’information du Québec : www.cai.gouv.qc.ca.
          </p>

          <h2 className="mt-8 text-xl font-semibold">
            8. Responsable de la protection des renseignements personnels
          </h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Conformément à l’article 3.1 de la Loi 25, la personne responsable de la protection
            des renseignements personnels chez {parametres.nomLegal} est :
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
            C’est à cette personne que vous adressez toute demande d’accès, de correction ou
            de retrait, ainsi que toute plainte concernant le traitement de vos renseignements.
          </p>

          <h2 className="mt-8 text-xl font-semibold">
            9. Hébergement et communication hors du Québec
          </h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Conformément à l’article 17 de la Loi 25, nous vous informons que vos renseignements
            sont hébergés et traités par des fournisseurs situés à l’extérieur du Québec,
            principalement aux États-Unis :
          </p>
          <ul className="mt-3 list-disc pl-5 text-[var(--muted-foreground)]">
            <li>
              <strong className="text-[var(--foreground)]">Supabase</strong> : conservation des
              messages envoyés par les formulaires du site, et de l’adresse IP brouillée qui sert à limiter
              le nombre d’envois et d’analyses (24 heures au plus)
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
              <strong className="text-[var(--foreground)]">Cloudflare Browser Run</strong> : visite
              automatique des sites soumis au vérificateur Loi 25. La liste des adresses visitées reste
              affichée dans notre tableau de bord Cloudflare, pour une durée que Cloudflare ne précise pas.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Sanity</strong> : gestion du contenu du site. Les
              images et les vidéos du site sont servies depuis ses serveurs, qui reçoivent l’adresse IP des
              visiteurs.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">YouTube (Google)</strong> : lecture d’une vidéo
              quand vous cliquez dessus (domaine youtube-nocookie.com, sans témoin de suivi avant la lecture).
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Google Workspace</strong> : notre messagerie, qui
              reçoit les courriels de notification de vos messages.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Cloudflare Turnstile</strong> : vérification
              anti-robot des formulaires. Pendant que vous remplissez un formulaire, votre navigateur
              transmet à Cloudflare des signaux techniques (adresse IP, type de navigateur et
              d’appareil, comportement de la page) qui servent uniquement à distinguer une
              personne d’un robot. Turnstile ne dépose aucun témoin publicitaire ni de suivi.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Google (Analytics 4)</strong> : mesure
              d’audience, uniquement si vous l’avez acceptée
            </li>
            <li>
              <strong className="text-[var(--foreground)]">CookieYes</strong> : affichage de la
              bannière de consentement et conservation de votre choix
            </li>
          </ul>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Avant de recourir à ces fournisseurs, nous avons évalué que les renseignements en cause
            bénéficient d’une protection adéquate, compte tenu de leur nature (coordonnées
            d’affaires), de la finalité limitée de leur utilisation et des mesures de sécurité
            contractuelles et techniques mises en place. Nous ne transmettons aucun renseignement
            sensible à ces fournisseurs.
          </p>

          <h2 className="mt-8 text-xl font-semibold">10. Sécurité</h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Vos données sont stockées de manière sécurisée via Supabase et protégées par des mesures
            de sécurité reconnues dans l’industrie (chiffrement, authentification, contrôle
            d’accès).
          </p>

          <h2 className="mt-8 text-xl font-semibold">11. Contact</h2>
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
