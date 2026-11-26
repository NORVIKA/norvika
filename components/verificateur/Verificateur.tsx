"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";

import { AntiRobot, lireJetonAntiRobot, reinitialiserAntiRobot } from "@/components/site/AntiRobot";
import { MentionVerificateur } from "@/components/verificateur/MentionVerificateur";
import { CHAMP_JETON } from "@/lib/anti-robot-commun";
import { formeCourrielValide, ligneSimpleValide } from "@/lib/garde-formulaire";
import { apostrophes } from "@/lib/typographie";
import type { PageVerificateur } from "@/lib/types-contenu";
import {
  blocSanctions,
  hote,
  morceauxMontants,
  phraseAccompagnement,
  pied,
  remplir,
  remplirAvecAdresse,
  sansWww,
  synthese,
  texteResultat,
} from "@/lib/verificateur/textes";
import {
  CHAMP_ADRESSE,
  CHAMP_JETON_RAPPORT,
  CHAMP_COURRIEL,
  CHAMP_SUIVI,
  LONGUEUR_MAX_ADRESSE,
  LONGUEUR_MAX_COURRIEL,
  VERIFICATIONS,
  type Etat,
  type EtatEnvoi,
  type IdVerification,
  type Rapport,
  type ReponseRapport,
  type ReponseVerificateur,
} from "@/lib/verificateur/types";

/**
 * Le vérificateur Loi 25, côté navigateur : le formulaire, l'attente (10 à 20 s), le résultat.
 * TOUT le texte vient du Studio (document « Vérificateur Loi 25 », textes de Martin) : ce fichier
 * ne contient que la mécanique (variables à remplir, accords, choix du texte selon l'état).
 *
 * ⛔ Jamais « conforme » : trois états seulement, et la synthèse « X points à corriger, Y à
 * vérifier, Z en place », toujours suivie de « Test automatique, pas un avis juridique ».
 *
 * Accessibilité : une seule annonce au début (« Analyse en cours... »), une à la fin (la phrase de
 * synthèse) dans une zone aria-live ; le focus passe au titre du résultat, ou revient au champ
 * quand une erreur s'affiche (message lié au champ par aria-describedby).
 * Pendant l'analyse, le champ passe en lecture seule et le bouton en aria-disabled, JAMAIS en
 * `disabled` : un élément désactivé perd le focus, qui tombait sur <body> pendant 10 s, et le
 * champ désactivé refusait ensuite le focus de l'erreur (QA Pixel, 2026-11-19).
 *
 * Rapport par courriel (2026-11-23, textes de Martin), seulement si le Studio l'active
 * (rapportCourriel.afficher) : un champ de courriel FACULTATIF sous l'adresse, avec son aide. Le
 * bouton passe alors sous les champs, dans l'ordre de lecture et de tabulation. Fermé, le formulaire
 * est exactement celui de la V1.
 * La case de consentement a son propre interrupteur (afficherCase) et ne paraît JAMAIS sans
 * l'adresse postale de « Infos de l'entreprise » (DORS/2012-36, art. 4 d). Jamais cochée d'avance,
 * séparée du champ par un trait, elle n'apparaît qu'une fois une adresse courriel inscrite :
 * « cochée sans courriel » ne peut donc pas arriver (et le serveur l'ignorerait, fait C5).
 *
 * Mention par couches (2026-11-23, demande de William, avis de Martin dans
 * contenu/verificateur-courriel-textes.md) : sous le bouton, une phrase toujours visible (premier
 * niveau, art. 8), puis les deux mentions complètes, inchangées, dans un <details> fermé. La case et
 * son texte d'identification restent au-dessus du bouton, jamais repliés (DORS/2012-36, art. 4 d).
 */

type Phase =
  | { nom: "repos" }
  | { nom: "analyse" }
  | { nom: "resultat"; rapport: Rapport; saisie: string; envoi: EtatEnvoi; courriel: string; caseCochee: boolean; jeton: string };

/** Le champ qui porte une erreur : son message s'affiche sous lui, et le focus y revient. */
type Champ = "adresse" | "courriel";

/**
 * Délai côté navigateur : au-delà, la route a de toute façon abandonné. Pire cas du serveur, environ
 * 52 s (détail à DELAI_ENVOI_MS, lib/courriel.ts) : la page attend 55 s pour ne jamais afficher une
 * erreur alors que le rapport est parti.
 */
const DELAI_NAVIGATEUR_MS = 55_000;

/** Code d'erreur de la route → texte du Studio. Un code inconnu donne « indisponible ». */
const ERREURS: Record<string, keyof PageVerificateur> = {
  vide: "erreurVide",
  "trop-longue": "erreurAdresse",
  forme: "erreurAdresse",
  protocole: "erreurAdresse",
  port: "erreurAdresse",
  identifiants: "erreurAdresse",
  ip: "erreurAdresse",
  corps: "erreurAdresse",
  // Le site emploie des moyens que l'outil ne peut pas surveiller : arrêt sans résultat, pas une panne.
  incompatible: "erreurIncompatible",
  // Chrome bloque le site derrière son avertissement « site non sécurisé » : rien à analyser.
  "sans-https": "erreurSansHttps",
  "nom-local": "erreurPrivee",
  privee: "erreurPrivee",
  refusee: "erreurPrivee",
  introuvable: "erreurInjoignable",
  inaccessible: "erreurInjoignable",
  protege: "erreurRefusee",
  delai: "erreurDelai",
  debit: "erreurLimite",
  "anti-robot-400": "erreurAntiRobot",
  "anti-robot-403": "erreurAntiRobot",
};

export function Verificateur({ t, lienRendezVous, adressePostale }: { t: PageVerificateur; lienRendezVous: string; adressePostale: string }) {
  const [adresse, setAdresse] = useState("");
  const [courriel, setCourriel] = useState("");
  const [suivi, setSuivi] = useState(false);
  const [phase, setPhase] = useState<Phase>({ nom: "repos" });
  // `n` change à chaque erreur, même identique : le message est recréé (role="alert" le relit) et
  // le focus revient au champ qui la porte.
  const [erreur, setErreur] = useState<{ texte: string; n: number; champ: Champ } | null>(null);
  const [annonce, setAnnonce] = useState("");
  const champ = useRef<HTMLInputElement>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const champCourriel = useRef<HTMLInputElement>(null);
  const titreResultat = useRef<HTMLHeadingElement>(null);

  const ETATS: Record<Etat, string> = { "a-corriger": t.etatACorriger, "a-verifier": t.etatAVerifier, "en-place": t.etatEnPlace };
  const rapport = phase.nom === "resultat" ? phase.rapport : null;
  // « Ce que ça peut coûter » : allumé au Studio ET un point à corriger qui peut mener à une sanction.
  const sanctions = rapport ? blocSanctions(rapport, t) : null;
  // Fonction fermée, ou textes pas encore semés : le formulaire de la V1, sans champ de courriel.
  const rc = t.rapportCourriel?.afficher ? t.rapportCourriel : null;
  // La case : son interrupteur ET l'adresse postale, qui doit figurer dans la demande elle-même.
  const caseEnLigne = Boolean(rc?.afficherCase && adressePostale.trim());
  // Demande différée (2026-11-26) : le champ de courriel quitte le formulaire et reparaît SOUS le
  // résultat, au moment où la personne a ses signaux devant elle. Quatre visiteurs sur cinq ne
  // lançaient pas l'analyse quand le formulaire montrait deux champs vides, et aucun de ceux qui
  // l'ont lancée n'a laissé son adresse. S'éteint tout seul si l'interrupteur du Studio est à off
  // ou si l'un de ses deux textes manque : on retombe alors exactement sur le formulaire d'avant.
  const apresResultat = Boolean(rc?.apresResultat && rc.apresTitre?.trim() && rc.apresBouton?.trim());
  const enAnalyse = phase.nom === "analyse";
  // Mention par couches (2026-11-23, avis de Martin) : la phrase visible, avec ou sans le courriel,
  // puis les mentions complètes dans un repli fermé. Une phrase ou un libellé absent du Studio :
  // pas de repli, les mentions restent affichées en entier (jamais cachées sans premier niveau).
  // Quand le courriel est demandé après le résultat, le formulaire ne recueille que l'adresse :
  // la phrase visible est alors celle SANS courriel, et celle avec courriel descend dans le bloc.
  const resume = (rc && !apresResultat ? rc.mentionResume : t.mentionResume)?.trim() ?? "";
  const libelleRepli = t.mentionRepliLibelle?.trim() ?? "";
  const repli = Boolean(resume && libelleRepli);
  // Ce que les champs annoncent aux lecteurs d'écran : la phrase visible, pas les 25 lignes repliées.
  const idMention = repli ? "verif-mention-resume" : "verif-mention";
  const idMentionCourriel = apresResultat ? "verif-mention-apres" : repli ? "verif-mention-resume" : "verif-mention-courriel";

  function montrerErreur(message: string, champ: Champ = "adresse") {
    setErreur((avant) => ({ texte: message, n: (avant?.n ?? 0) + 1, champ }));
    setAnnonce("");
  }

  // Le message est lié à son champ (aria-describedby) et annoncé (role="alert") : le focus y revient,
  // APRÈS le rendu (avant, un requestAnimationFrame passait parfois avant React et ratait le champ).
  useEffect(() => {
    if (erreur) (erreur.champ === "courriel" ? champCourriel : champ).current?.focus();
  }, [erreur]);

  /** La phrase sous le résultat : envoyé, simulé (poste local seulement) ou échoué. Rien si aucun envoi. */
  function texteEnvoi(envoi: EtatEnvoi, adresseCourriel: string, caseCochee: boolean): string {
    if (!rc || envoi === "aucun") return "";
    if (envoi === "echec") return remplir(caseCochee ? `${rc.envoiEchec} ${rc.envoiEchecCase}` : rc.envoiEchec, {});
    // « simule » n'existe que sur le poste local (localhost) : ce repère n'est jamais vu en ligne.
    return `${remplirAvecAdresse(rc.envoiReussi, "courriel", adresseCourriel)}${envoi === "simule" ? " (envoi simulé, poste local)" : ""}`;
  }

  async function lancer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phase.nom === "analyse") return;
    const formulaire = e.currentTarget;
    const saisie = adresse.trim();
    if (!saisie) return montrerErreur(apostrophes(t.erreurVide));
    if (saisie.length > LONGUEUR_MAX_ADRESSE) return montrerErreur(t.erreurAdresse);
    // Même contrôle que le serveur, avant de dépenser le jeton anti-robot : la faute se corrige sur place.
    const adresseCourriel = rc ? courriel.trim() : "";
    const caseCochee = caseEnLigne && Boolean(adresseCourriel) && suivi;
    if (adresseCourriel && (adresseCourriel.length > LONGUEUR_MAX_COURRIEL || !ligneSimpleValide(adresseCourriel) || !formeCourrielValide(adresseCourriel))) {
      return montrerErreur(rc!.erreurCourriel, "courriel");
    }
    const jeton = lireJetonAntiRobot(formulaire);
    if (!jeton) return montrerErreur(t.erreurAntiRobot);

    setErreur(null);
    setPhase({ nom: "analyse" });
    setAnnonce(t.analyseAnnonce);

    const controle = new AbortController();
    const minuterie = setTimeout(() => controle.abort(), DELAI_NAVIGATEUR_MS);
    let donnees: ReponseVerificateur | null = null;
    let code = "indisponible";
    try {
      const reponse = await fetch("/api/verificateur-loi-25", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Fermé ou vide : aucun champ de courriel dans la requête (exactement la V1).
        body: JSON.stringify({
          [CHAMP_ADRESSE]: saisie,
          [CHAMP_JETON]: jeton,
          ...(adresseCourriel ? { [CHAMP_COURRIEL]: adresseCourriel, [CHAMP_SUIVI]: caseCochee } : {}),
        }),
        signal: controle.signal,
      });
      donnees = (await reponse.json().catch(() => null)) as ReponseVerificateur | null;
    } catch (erreurReseau) {
      if (erreurReseau instanceof DOMException && erreurReseau.name === "AbortError") code = "delai";
    } finally {
      clearTimeout(minuterie);
      reinitialiserAntiRobot(formulaire);
    }

    if (donnees?.ok) {
      const envoi: EtatEnvoi = adresseCourriel ? (donnees.envoi ?? "aucun") : "aucun";
      setPhase({ nom: "resultat", rapport: donnees.rapport, saisie, envoi, courriel: adresseCourriel, caseCochee, jeton: donnees.jeton ?? "" });
      setAnnonce(`${synthese(donnees.rapport, t)} ${apostrophes(t.avertissementCourt)} ${texteEnvoi(envoi, adresseCourriel, caseCochee)}`.trim());
      // Le titre du résultat prend le focus (lecteurs d'écran) et remonte en haut de l'écran.
      requestAnimationFrame(() => {
        titreResultat.current?.focus({ preventScroll: true });
        titreResultat.current?.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      });
      return;
    }
    if (donnees && !donnees.ok && donnees.code) code = donnees.code;
    setPhase({ nom: "repos" });
    if (code === "courriel" && rc) return montrerErreur(rc.erreurCourriel, "courriel");
    // Un texte absent du Studio (champ ajouté, contenu pas encore semé) ne doit jamais s'afficher « undefined ».
    const gabarit = t[ERREURS[code] ?? "erreurIndisponible"];
    const message = remplir(typeof gabarit === "string" && gabarit ? gabarit : t.erreurIndisponible, { domaine: hote(saisie) });
    // Pas de résultat, donc pas de courriel : la personne qui en avait entré un le sait.
    montrerErreur(adresseCourriel && rc ? `${message} ${remplir(rc.sansResultat, {})}` : message);
  }

  /**
   * Envoi du rapport APRÈS le résultat. Aucune analyse n'est relancée : la page renvoie le rapport
   * signé par le serveur (champ `jeton` de la réponse), et la route le refuse s'il ne revient pas
   * intact. Son propre formulaire, donc son propre widget anti-robot, avec une action à part
   * (« verificateur-rapport ») pour ne pas gonfler le compte des arrivées dans Turnstile.
   */
  async function envoyerApres(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phase.nom !== "resultat" || envoiEnCours || !rc) return;
    const formulaire = e.currentTarget;
    const adresseCourriel = courriel.trim();
    const caseCochee = caseEnLigne && Boolean(adresseCourriel) && suivi;
    if (!adresseCourriel || adresseCourriel.length > LONGUEUR_MAX_COURRIEL || !ligneSimpleValide(adresseCourriel) || !formeCourrielValide(adresseCourriel)) {
      return montrerErreur(rc.erreurCourriel, "courriel");
    }
    const jetonRobot = lireJetonAntiRobot(formulaire);
    if (!jetonRobot) return montrerErreur(t.erreurAntiRobot, "courriel");

    setErreur(null);
    setEnvoiEnCours(true);
    let donnees: ReponseRapport | null = null;
    try {
      const reponse = await fetch("/api/verificateur-loi-25/rapport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [CHAMP_JETON_RAPPORT]: phase.jeton,
          [CHAMP_JETON]: jetonRobot,
          [CHAMP_COURRIEL]: adresseCourriel,
          [CHAMP_SUIVI]: caseCochee,
        }),
      });
      donnees = (await reponse.json().catch(() => null)) as ReponseRapport | null;
    } catch {
      donnees = null;
    } finally {
      setEnvoiEnCours(false);
      reinitialiserAntiRobot(formulaire);
    }

    if (!donnees?.ok) {
      // Un seul message, comme ailleurs : la phrase d'échec d'envoi du Studio.
      return montrerErreur(rc.envoiEchec, "courriel");
    }
    // Le résultat affiché ne change pas ; seule la ligne d'envoi apparaît sous lui.
    setPhase({ ...phase, envoi: donnees.envoi ?? "aucun", courriel: adresseCourriel, caseCochee });
    setAnnonce(texteEnvoi(donnees.envoi ?? "aucun", adresseCourriel, caseCochee));
  }

  function recommencer() {
    setPhase({ nom: "repos" });
    setAnnonce("");
    champ.current?.focus();
    champ.current?.select();
  }

  // Un seul bouton, déclaré une fois : à côté de l'adresse (V1), ou sous les champs quand le
  // courriel est offert (ordre de lecture et de tabulation : adresse, courriel, case, bouton).
  const bouton = (
    <button type="submit" className="nv-verif-bouton nv-btn-primary" aria-disabled={enAnalyse || undefined}>
      {enAnalyse ? t.analyseTitre : t.bouton}
    </button>
  );

  // Les champs du courriel, écrits une fois : dans le formulaire (V2) ou sous le résultat (V3,
  // 2026-11-26). Un seul des deux est rendu à la fois, donc les identifiants restent uniques.
  const champsCourriel = rc ? (
    <>
      <label htmlFor="verif-courriel" className="nv-verif-etiquette">
        {rc.champLibelle}
      </label>
      <input
        ref={champCourriel}
        id="verif-courriel"
        name={CHAMP_COURRIEL}
        className="nv-champ"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        maxLength={LONGUEUR_MAX_COURRIEL}
        placeholder={rc.champExemple}
        value={courriel}
        onChange={(e) => {
          setCourriel(e.target.value);
          // Sans adresse, la case disparaît ET se décoche : un consentement suit une adresse.
          if (!e.target.value.trim()) setSuivi(false);
          // Le champ est facultatif : dès qu'on le corrige (ou le vide), l'erreur n'a plus lieu d'être.
          if (erreur?.champ === "courriel") setErreur(null);
        }}
        aria-invalid={erreur?.champ === "courriel" ? true : undefined}
        aria-describedby={`${erreur?.champ === "courriel" ? "verif-erreur-courriel " : ""}verif-aide-courriel ${idMentionCourriel}`}
        readOnly={enAnalyse}
      />
      <p id="verif-aide-courriel" className="nv-verif-aide">
        {rc.champAide}
      </p>
      {erreur?.champ === "courriel" ? (
        <p key={erreur.n} id="verif-erreur-courriel" role="alert" className="nv-verif-erreur">
          {erreur.texte}
        </p>
      ) : null}
      {caseEnLigne && courriel.trim() ? (
        <div className="nv-verif-consentement">
          <label className="nv-verif-case">
            <input
              type="checkbox"
              name={CHAMP_SUIVI}
              checked={suivi}
              onChange={(e) => {
                if (!enAnalyse) setSuivi(e.target.checked);
              }}
              aria-describedby="verif-case-identification"
              aria-disabled={enAnalyse || undefined}
            />
            <span>{rc.caseTexte}</span>
          </label>
          <p id="verif-case-identification" className="nv-verif-aide">
            {remplir(rc.caseIdentification, { adresse_postale: adressePostale.trim() })}
          </p>
        </div>
      ) : null}
    </>
  ) : null;

  // Les mentions complètes (textes de Martin, mot pour mot) : dans le repli, ou seules sans lui.
  const mentions = (
    <>
      <MentionVerificateur id="verif-mention" texte={t.mentionCollecte} lien={t.mentionLien} />
      {rc ? (
        <div className="nv-verif-mention-suite">
          <MentionVerificateur id="verif-mention-courriel" texte={caseEnLigne ? rc.mention : rc.mentionSansCase} lien={t.mentionLien} />
        </div>
      ) : null}
    </>
  );

  const domaineEntre = phase.nom === "resultat" ? hote(phase.saisie) : "";
  const domaineFinal = rapport ? hote(rapport.adresseFinale) : "";
  const redirige = rapport && sansWww(domaineEntre) !== sansWww(domaineFinal);

  return (
    <>
      <section className="nv-verif-entete">
        <div className="nv-verif-cadre">
          <h1>{t.h1}</h1>

          <form className="nv-verif-formulaire" onSubmit={lancer} noValidate>
            <label htmlFor="verif-adresse" className="nv-verif-etiquette">
              {t.champLibelle}
            </label>
            <div className="nv-verif-rangee">
              <input
                ref={champ}
                id="verif-adresse"
                name={CHAMP_ADRESSE}
                className="nv-champ"
                type="text"
                inputMode="url"
                autoComplete="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                maxLength={LONGUEUR_MAX_ADRESSE}
                placeholder={t.champExemple}
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                aria-invalid={erreur?.champ === "adresse" ? true : undefined}
                aria-describedby={`${erreur?.champ === "adresse" ? "verif-erreur " : ""}${idMention}`}
                readOnly={enAnalyse}
              />
              {rc && !apresResultat ? null : bouton}
            </div>
            {erreur?.champ === "adresse" ? (
              <p key={erreur.n} id="verif-erreur" role="alert" className="nv-verif-erreur">
                {erreur.texte}
              </p>
            ) : null}

            {rc && !apresResultat ? (
              <div className="nv-verif-courriel">
                {champsCourriel}
                {bouton}
              </div>
            ) : null}

            <AntiRobot action="verificateur" />
            <div className="nv-verif-mention">
              {repli ? (
                <>
                  {/* Premier niveau, toujours visible, et le repli IMMÉDIATEMENT dessous (condition de
                      Martin) : son libellé fait le renvoi aux durées et aux droits. <details> natif :
                      le texte est dans le HTML replié, s'ouvre au clavier et sans JavaScript. */}
                  <MentionVerificateur id="verif-mention-resume" texte={resume} lien="" />
                  <details className="nv-repli nv-verif-mention-repli">
                    <summary>{libelleRepli}</summary>
                    {mentions}
                  </details>
                </>
              ) : (
                mentions
              )}
            </div>
          </form>

          {/* L'explication passe SOUS le test (2026-11-26) : les gens qui arrivent de la publicité
              doivent voir le champ et le bouton sans rien lire avant. Les deux paragraphes restent
              sur la page, pour Google et pour qui veut comprendre, mais après le geste. */}
          <div className="nv-verif-explication">
            <p className="nv-verif-intro">{t.intro}</p>
            {t.introRisque ? <p className="nv-verif-intro">{t.introRisque}</p> : null}
          </div>
        </div>
      </section>

      <section className="nv-verif-resultat" aria-busy={phase.nom === "analyse"} aria-labelledby="verif-titre">
        <div className="nv-verif-cadre">
          <div className="nv-verif-synthese">
            <h2 id="verif-titre" ref={titreResultat} tabIndex={-1}>
              {rapport ? synthese(rapport, t) : phase.nom === "analyse" ? t.analyseTitre : t.listeTitre}
            </h2>

            {phase.nom === "analyse" ? (
              <>
                <p className="nv-verif-phrase">{t.analyseTexte}</p>
                {/* Ce que fait l'outil : une description, pas une progression (aucune étape cochée). */}
                <ul className="nv-verif-etapes">
                  {t.analyseEtapes.map((etape) => (
                    <li key={etape}>{etape}</li>
                  ))}
                </ul>
                <div className="nv-verif-barre" aria-hidden="true" />
              </>
            ) : null}

            {rapport ? (
              <>
                <p className="nv-verif-avertissement-court">{t.avertissementCourt}</p>
                <p className="nv-verif-phrase">{apostrophes(phraseAccompagnement(rapport, t))}</p>
                {redirige ? (
                  <p className="nv-verif-phrase">{remplir(t.phraseRedirection, { adresse_entree: domaineEntre, domaine_final: domaineFinal })}</p>
                ) : null}
                <ul className="nv-verif-comptes" aria-hidden="true">
                  {(["a-corriger", "a-verifier", "en-place"] as const).map((etat) => (
                    <li key={etat} className="nv-etat" data-etat={etat}>
                      {rapport.synthese[etat]} {ETATS[etat].toLowerCase()}
                    </li>
                  ))}
                </ul>
                <p className="nv-verif-pied">{pied(rapport, t)}</p>
                {phase.nom === "resultat" && texteEnvoi(phase.envoi, phase.courriel, phase.caseCochee) ? (
                  <p className="nv-verif-envoi" data-envoi={phase.envoi}>
                    {texteEnvoi(phase.envoi, phase.courriel, phase.caseCochee)}
                  </p>
                ) : null}
                {rc && apresResultat && phase.nom === "resultat" && phase.jeton && phase.envoi === "aucun" ? (
                  <form className="nv-verif-apres" onSubmit={envoyerApres} noValidate>
                    <p className="nv-verif-apres-titre">{rc.apresTitre}</p>
                    <div className="nv-verif-courriel">
                      {champsCourriel}
                      <button type="submit" className="nv-verif-bouton nv-btn-primary" aria-disabled={envoiEnCours || undefined}>
                        {rc.apresBouton}
                      </button>
                    </div>
                    <MentionVerificateur
                      id="verif-mention-apres"
                      texte={caseEnLigne ? rc.mention : rc.mentionSansCase}
                      lien={t.mentionLien}
                    />
                    <AntiRobot action="verificateur-rapport" />
                  </form>
                ) : null}
                <button type="button" className="nv-verif-refaire" onClick={recommencer}>
                  {t.boutonRefaire}
                </button>
              </>
            ) : null}
          </div>

          <div>
          <ol className="nv-verif-liste">
            {VERIFICATIONS.map((id: IdVerification, rang) => {
              const textes = t[id];
              const r = rapport?.resultats.find((x) => x.id === id);
              return (
                <li key={id} className="nv-verif-ligne" data-etat={r?.etat} style={{ "--rang": rang } as CSSProperties}>
                  <div className="nv-verif-tete">
                    <h3 id={`verif-nom-${id}`}>{textes.nom}</h3>
                    {r ? (
                      <span className="nv-etat" data-etat={r.etat}>
                        {ETATS[r.etat]}
                      </span>
                    ) : phase.nom === "analyse" ? (
                      <span className="nv-etat-attente" aria-hidden="true" />
                    ) : (
                      <span className="nv-verif-article">{textes.article}</span>
                    )}
                  </div>
                  {r ? (
                    <>
                      <p className="nv-verif-texte">{texteResultat(r, textes, t)}</p>
                      {r.preuves
                        .filter((p) => p.type === "temoins" || p.type === "domaines")
                        .map((p) => (
                          <div key={p.type} className="nv-verif-preuve">
                            <p>{p.type === "temoins" ? t.libelleTemoins : t.libelleDomaines}</p>
                            <ul>
                              {p.valeurs.map((v) => (
                                <li key={v}>{v}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                    </>
                  ) : null}
                  <details className="nv-repli nv-verif-pourquoi">
                    {/* Huit « Pourquoi ça compte » : le nom du point les distingue au lecteur d'écran. */}
                    <summary aria-describedby={`verif-nom-${id}`}>{t.libellePourquoi}</summary>
                    <p>{textes.pourquoi}</p>
                    {r ? <p>{textes.article}</p> : null}
                  </details>
                </li>
              );
            })}
          </ol>
          {/* Ce que ça peut coûter : entre le résultat et l'invitation, seulement s'il y a à corriger. */}
          {sanctions ? (
            <div className="nv-verif-sanctions">
              <h3>{sanctions.titre}</h3>
              <ul>
                {sanctions.montants.map((ligne) => (
                  <li key={ligne}>
                    <Montants texte={ligne} />
                  </li>
                ))}
              </ul>
              {sanctions.resume ? (
                <>
                  <p>
                    <Montants texte={sanctions.resume} />
                  </p>
                  {/* Même repli que « Pourquoi ça compte » : texte dans la page, fermé à l'arrivée. */}
                  <details className="nv-repli nv-verif-sanctions-repli">
                    <summary>{sanctions.repliLibelle}</summary>
                    <DetailsSanctions notes={sanctions.notes} source={sanctions.source} />
                  </details>
                </>
              ) : (
                <DetailsSanctions notes={sanctions.notes} source={sanctions.source} />
              )}
            </div>
          ) : null}
          {/* L'invitation suit les huit lignes : sur téléphone, le résultat passe avant elle. */}
          {rapport ? (
            <div className="nv-verif-appel">
              <h3>{t.appelTitre}</h3>
              <p>{rapport.synthese["a-corriger"] > 0 ? t.appelTexte : t.appelTexteSansCorrection}</p>
              <a href={lienRendezVous} target="_blank" rel="noopener noreferrer" className="nv-btn-cream">
                {t.appelBouton}
              </a>
            </div>
          ) : null}
          </div>
        </div>
      </section>

      <section className="nv-verif-limites" aria-labelledby="verif-limites">
        <div className="nv-verif-cadre">
          <h2 id="verif-limites">{t.invisibleTitre}</h2>
          <div>
            <p className="nv-verif-texte" style={{ marginTop: 0 }}>
              {t.invisibleTexte}
            </p>
            <ul>
              {t.invisibleListe.map((element) => (
                <li key={element}>{element}</li>
              ))}
            </ul>
            <div className="nv-verif-avertissement">
              {t.avertissement.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Une seule annonce au début, une à la fin. */}
      <p className="sr-only" aria-live="polite">
        {annonce}
      </p>
    </>
  );
}

/** Les paragraphes sous la liste et la ligne Sources : dépliés, ou dans le repli. */
function DetailsSanctions({ notes, source }: { notes: string[]; source: string }) {
  return (
    <>
      {notes.map((note) => (
        <p key={note}>
          <Montants texte={note} />
        </p>
      ))}
      {source ? <p className="nv-verif-sanctions-source">{source}</p> : null}
    </>
  );
}

/** Un texte dont les montants (15 000$, 2%) ne se coupent jamais en fin de ligne. */
function Montants({ texte }: { texte: string }) {
  return (
    <>
      {morceauxMontants(texte).map((m, i) =>
        m.montant ? (
          <span key={i} className="nv-montant">
            {m.texte}
          </span>
        ) : (
          m.texte
        ),
      )}
    </>
  );
}
