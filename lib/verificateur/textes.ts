import { apostrophes } from "@/lib/typographie";
import type { PageVerificateur, TextesVerification } from "@/lib/types-contenu";

import { VERIFICATIONS, type Preuve, type Rapport, type ResultatVerification } from "./types";

/**
 * Les phrases du vérificateur Loi 25, écrites à partir des textes du Studio et du rapport.
 * DÉCLARÉES UNE FOIS (règle d'agence 5) : la page (components/verificateur/Verificateur.tsx) et le
 * courriel du rapport (lib/verificateur/courriel.ts) disent exactement la même chose. Fichier sans
 * dépendance serveur : la page l'importe.
 */

/** Remplace les {variables} connues, puis nettoie les espaces laissés par une variable vide. */
export function remplir(gabarit: string, variables: Record<string, string>): string {
  const texte = gabarit
    .replace(/\{(\w+)\}/g, (tout, cle: string) => (cle in variables ? variables[cle] : tout))
    // Une variable vide ne laisse ni parenthèses vides (« dépose _ga () dès »), ni espaces doubles.
    .replace(/\s*\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,])/g, "$1")
    .trim();
  return apostrophes(texte);
}

/**
 * Comme `remplir`, mais une valeur posée telle quelle, sans apostrophe typographique : une adresse
 * courriel peut contenir une apostrophe (o'neil@exemple.ca), qui ne doit pas devenir ’.
 */
export function remplirAvecAdresse(gabarit: string, cle: string, adresse: string): string {
  const repere = "";
  return remplir(gabarit, { [cle]: repere }).replace(repere, adresse);
}

/** Le nom d'hôte d'une adresse, ou la saisie telle quelle si elle ne se lit pas. */
export function hote(adresse: string): string {
  try {
    return new URL(/^https?:\/\//i.test(adresse) ? adresse : `https://${adresse}`).hostname;
  } catch {
    return adresse.slice(0, 80);
  }
}

export const sansWww = (h: string) => h.replace(/^www\./, "");

export const valeurs = (preuves: Preuve[], type: Preuve["type"]) => preuves.find((p) => p.type === type)?.valeurs ?? [];

/** Le texte d'une vérification selon son état, avec ses variables remplies par les preuves. */
export function texteResultat(r: ResultatVerification, textes: TextesVerification, t: PageVerificateur): string {
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
export function synthese(rapport: Rapport, t: PageVerificateur): string {
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

/** La phrase sous l'avertissement court, selon le résultat. */
export function phraseAccompagnement(rapport: Rapport, t: PageVerificateur): string {
  const n = rapport.synthese;
  if (n["a-corriger"] > 0) return t.phraseCorriger;
  if (n["a-verifier"] === VERIFICATIONS.length) return t.phrasePartielle;
  if (n["a-verifier"] > 0) return t.phraseVerifier;
  return t.phraseTout;
}

const FUSEAU = { timeZone: "America/Toronto" } as const;

/** « 23 novembre 2026 » et « 9 h 05 », à l'heure du Québec (jamais « 09 h 05 »). */
export function dateEtHeure(iso: string): { date: string; heure: string } {
  const date = new Date(iso);
  return {
    date: new Intl.DateTimeFormat("fr-CA", { ...FUSEAU, day: "numeric", month: "long", year: "numeric" }).format(date),
    heure: new Intl.DateTimeFormat("fr-CA", { ...FUSEAU, hour: "numeric", minute: "2-digit" }).format(date),
  };
}

/** « Analyse de exemple.ca le 18 novembre 2026 à 14 h 05 », à l'heure du Québec. */
export function pied(rapport: Rapport, t: PageVerificateur): string {
  return remplir(t.piedResultat, { domaine: hote(rapport.adresseFinale), ...dateEtHeure(rapport.date) });
}
