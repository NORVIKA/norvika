"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";

import { AntiRobot, lireJetonAntiRobot, reinitialiserAntiRobot } from "@/components/site/AntiRobot";
import { MentionVerificateur } from "@/components/verificateur/MentionVerificateur";
import { CHAMP_JETON } from "@/lib/anti-robot-commun";
import { apostrophes } from "@/lib/typographie";
import type { PageVerificateur, TextesVerification } from "@/lib/types-contenu";
import {
  CHAMP_ADRESSE,
  LONGUEUR_MAX_ADRESSE,
  VERIFICATIONS,
  type Etat,
  type IdVerification,
  type Preuve,
  type Rapport,
  type ReponseVerificateur,
  type ResultatVerification,
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
 */

type Phase = { nom: "repos" } | { nom: "analyse" } | { nom: "resultat"; rapport: Rapport; saisie: string };

/** Délai côté navigateur : au-delà, la route a de toute façon abandonné (30 s plus ses marges). */
const DELAI_NAVIGATEUR_MS = 45_000;

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

/** Remplace les {variables} connues, puis nettoie les espaces laissés par une variable vide. */
function remplir(gabarit: string, variables: Record<string, string>): string {
  const texte = gabarit
    .replace(/\{(\w+)\}/g, (tout, cle: string) => (cle in variables ? variables[cle] : tout))
    // Une variable vide ne laisse ni parenthèses vides (« dépose _ga () dès »), ni espaces doubles.
    .replace(/\s*\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,])/g, "$1")
    .trim();
  return apostrophes(texte);
}

/** Le nom d'hôte d'une adresse, ou la saisie telle quelle si elle ne se lit pas. */
function hote(adresse: string): string {
  try {
    return new URL(/^https?:\/\//i.test(adresse) ? adresse : `https://${adresse}`).hostname;
  } catch {
    return adresse.slice(0, 80);
  }
}
const sansWww = (h: string) => h.replace(/^www\./, "");

const valeurs = (preuves: Preuve[], type: Preuve["type"]) => preuves.find((p) => p.type === type)?.valeurs ?? [];

/** Le texte d'une vérification selon son état, avec ses variables remplies par les preuves. */
function texteResultat(r: ResultatVerification, textes: TextesVerification, t: PageVerificateur): string {
  const droits: Record<string, string> = { acces: t.droitAcces, rectification: t.droitRectification, retrait: t.droitRetrait };
  const gabarit = r.cas
    .split("+")
    .map((cas) => (cas === "politiqueIllisible" ? t.politiqueIllisible : (textes[cas] ?? "")))
    .join(" ");
  const notes = valeurs(r.preuves, "note");
  return remplir(gabarit, {
    temoins: valeurs(r.preuves, "temoins").join(", "),
    services: notes.join(", "),
    outil: notes[0] ?? "",
    code: notes[0] ?? "",
    libelle_refus: valeurs(r.preuves, "extrait")[0] ?? "",
    libelle_lien: valeurs(r.preuves, "lien")[0] ?? "",
    droits_manquants: valeurs(r.preuves, "manquants")
      .map((d) => droits[d] ?? d)
      .join(", "),
  });
}

/** « 3 points à corriger, 2 à vérifier, 3 en place », avec les accords du Studio. */
function synthese(rapport: Rapport, t: PageVerificateur): string {
  const n = rapport.synthese;
  const compte = (nombre: number, aucun: string, plusieurs: string, un?: string) =>
    nombre === 0 ? aucun : nombre === 1 && un ? un : plusieurs.replace("{n}", String(nombre));
  return remplir(t.synthese, {
    domaine: hote(rapport.adresseFinale),
    corriger: compte(n["a-corriger"], t.corrigerAucun, t.corrigerPlusieurs, t.corrigerUn),
    verifier: compte(n["a-verifier"], t.verifierAucun, t.verifierPlusieurs),
    enPlace: compte(n["en-place"], t.enPlaceAucun, t.enPlacePlusieurs),
  });
}

function phraseAccompagnement(rapport: Rapport, t: PageVerificateur): string {
  const n = rapport.synthese;
  if (n["a-corriger"] > 0) return t.phraseCorriger;
  if (n["a-verifier"] === VERIFICATIONS.length) return t.phrasePartielle;
  if (n["a-verifier"] > 0) return t.phraseVerifier;
  return t.phraseTout;
}

/** « Analyse de exemple.ca le 18 novembre 2026 à 14 h 05 », à l'heure du Québec (« 9 h 05 », jamais « 09 h 05 »). */
function pied(rapport: Rapport, t: PageVerificateur): string {
  const date = new Date(rapport.date);
  const fuseau = { timeZone: "America/Toronto" } as const;
  return remplir(t.piedResultat, {
    domaine: hote(rapport.adresseFinale),
    date: new Intl.DateTimeFormat("fr-CA", { ...fuseau, day: "numeric", month: "long", year: "numeric" }).format(date),
    heure: new Intl.DateTimeFormat("fr-CA", { ...fuseau, hour: "numeric", minute: "2-digit" }).format(date),
  });
}

export function Verificateur({ t, lienRendezVous }: { t: PageVerificateur; lienRendezVous: string }) {
  const [adresse, setAdresse] = useState("");
  const [phase, setPhase] = useState<Phase>({ nom: "repos" });
  // `n` change à chaque erreur, même identique : le message est recréé (role="alert" le relit) et
  // le focus revient au champ.
  const [erreur, setErreur] = useState<{ texte: string; n: number } | null>(null);
  const [annonce, setAnnonce] = useState("");
  const champ = useRef<HTMLInputElement>(null);
  const titreResultat = useRef<HTMLHeadingElement>(null);

  const ETATS: Record<Etat, string> = { "a-corriger": t.etatACorriger, "a-verifier": t.etatAVerifier, "en-place": t.etatEnPlace };
  const rapport = phase.nom === "resultat" ? phase.rapport : null;

  function montrerErreur(message: string) {
    setErreur((avant) => ({ texte: message, n: (avant?.n ?? 0) + 1 }));
    setAnnonce("");
  }

  // Le message est lié au champ (aria-describedby) et annoncé (role="alert") : le focus y revient,
  // APRÈS le rendu (avant, un requestAnimationFrame passait parfois avant React et ratait le champ).
  useEffect(() => {
    if (erreur) champ.current?.focus();
  }, [erreur]);

  async function lancer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phase.nom === "analyse") return;
    const formulaire = e.currentTarget;
    const saisie = adresse.trim();
    if (!saisie) return montrerErreur(apostrophes(t.erreurVide));
    if (saisie.length > LONGUEUR_MAX_ADRESSE) return montrerErreur(t.erreurAdresse);
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
        body: JSON.stringify({ [CHAMP_ADRESSE]: saisie, [CHAMP_JETON]: jeton }),
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
      setPhase({ nom: "resultat", rapport: donnees.rapport, saisie });
      setAnnonce(`${synthese(donnees.rapport, t)} ${apostrophes(t.avertissementCourt)}`);
      // Le titre du résultat prend le focus (lecteurs d'écran) et remonte en haut de l'écran.
      requestAnimationFrame(() => {
        titreResultat.current?.focus({ preventScroll: true });
        titreResultat.current?.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      });
      return;
    }
    if (donnees && !donnees.ok && donnees.code) code = donnees.code;
    setPhase({ nom: "repos" });
    montrerErreur(remplir(String(t[ERREURS[code] ?? "erreurIndisponible"]), { domaine: hote(saisie) }));
  }

  function recommencer() {
    setPhase({ nom: "repos" });
    setAnnonce("");
    champ.current?.focus();
    champ.current?.select();
  }

  const domaineEntre = phase.nom === "resultat" ? hote(phase.saisie) : "";
  const domaineFinal = rapport ? hote(rapport.adresseFinale) : "";
  const redirige = rapport && sansWww(domaineEntre) !== sansWww(domaineFinal);

  return (
    <>
      <section className="nv-verif-entete">
        <div className="nv-verif-cadre">
          <div>
            <h1>{t.h1}</h1>
            <p className="nv-verif-intro">{t.intro}</p>
            {t.introRisque ? <p className="nv-verif-intro">{t.introRisque}</p> : null}
          </div>

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
                aria-invalid={erreur ? true : undefined}
                aria-describedby={`${erreur ? "verif-erreur " : ""}verif-mention`}
                readOnly={phase.nom === "analyse"}
              />
              <button type="submit" className="nv-verif-bouton nv-btn-primary" aria-disabled={phase.nom === "analyse" || undefined}>
                {phase.nom === "analyse" ? t.analyseTitre : t.bouton}
              </button>
            </div>
            {erreur ? (
              <p key={erreur.n} id="verif-erreur" role="alert" className="nv-verif-erreur">
                {erreur.texte}
              </p>
            ) : null}
            <AntiRobot action="verificateur" />
            <div className="nv-verif-mention">
              <MentionVerificateur id="verif-mention" texte={t.mentionCollecte} lien={t.mentionLien} />
            </div>
          </form>
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
                  <details className="nv-verif-pourquoi">
                    {/* Huit « Pourquoi ça compte » : le nom du point les distingue au lecteur d'écran. */}
                    <summary aria-describedby={`verif-nom-${id}`}>{t.libellePourquoi}</summary>
                    <p>{textes.pourquoi}</p>
                    {r ? <p>{textes.article}</p> : null}
                  </details>
                </li>
              );
            })}
          </ol>
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
