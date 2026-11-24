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
    // Une variable vide ne laisse ni guillemets vides (« Le lien « » mène »), ni parenthèses vides
    // (« dépose _ga () dès »), ni espaces doubles. \s couvre les espaces insécables du Studio.
    .replace(/«\s*»/g, "")
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
  // Remplacement par une fonction : « $& » ou « $' » dans une adresse resteraient sinon des motifs.
  return remplir(gabarit, { [cle]: repere }).replace(repere, () => adresse);
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

/**
 * Le texte d'une vérification selon son état, avec ses variables remplies par les preuves.
 * `pourCourriel` : le courriel part de norvika.ca vers une adresse que l'auteur de l'analyse choisit.
 * Il ne recopie donc AUCUN texte libre du site analysé : le texte du lien de politique et celui du
 * bouton de refus restent vides (la page, elle, les montre à la personne qui a lancé l'analyse).
 */
export function texteResultat(r: ResultatVerification, textes: TextesVerification, t: PageVerificateur, pourCourriel = false): string {
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
    libelle_refus: pourCourriel ? "" : (valeurs(r.preuves, "extrait")[0] ?? ""),
    libelle_lien: pourCourriel ? "" : (valeurs(r.preuves, "lien")[0] ?? ""),
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

/**
 * « Ce que ça peut coûter », pour la page et le courriel (déclaré une fois). `null` s'il est éteint
 * au Studio, s'il manque son titre ou ses montants, ou si aucun point n'est à corriger : un site
 * sans point à corriger ne reçoit pas de montants d'amende.
 * ⛔ La vérification 4 (responsable) ne compte PAS (Martin, 2026-11-24) : la CAI écrit elle-même que
 * ce manquement ne peut pas mener à une sanction administrative (rapport quinquennal 2026, 4.3.3.2),
 * et ce n'est pas une infraction de l'art. 91. Afficher des montants à ce site-là serait faux.
 */
export function blocSanctions(
  rapport: Rapport,
  t: PageVerificateur,
): { titre: string; montants: string[]; notes: string[]; source: string; resume: string; repliLibelle: string } | null {
  const s = t.sanctions;
  const sanctionnable = rapport.resultats.some((r) => r.etat === "a-corriger" && r.id !== "responsable");
  if (!s?.afficher || !sanctionnable) return null;
  const garder = (liste: string[] | null | undefined) => (liste ?? []).map((x) => x.trim()).filter(Boolean);
  const titre = s.titre?.trim() ?? "";
  const montants = garder(s.montants);
  if (!titre || montants.length === 0) return null;
  const resume = s.resume?.trim() ?? "";
  const repliLibelle = s.repliLibelle?.trim() ?? "";
  // Les deux, ou aucun : un repli sans phrase visible cacherait la mise en garde.
  const couches = Boolean(resume && repliLibelle);
  return { titre, montants, notes: garder(s.notes), source: s.source?.trim() ?? "", resume: couches ? resume : "", repliLibelle: couches ? repliLibelle : "" };
}

/** Un montant écrit à la québécoise : 15 000$, 10 000 000$, 2% (espaces ordinaires ou insécables). */
const MONTANT = /\d{1,3}(?:[   ]\d{3})*(?:,\d+)?(?:\$|%)/g;

/**
 * Le texte en morceaux, les montants à part, pour qu'ils ne se coupent jamais en fin de ligne (page et
 * courriel). Jamais en gras ni en rouge (Martin) : un ton d'information, pas d'alarme.
 */
export function morceauxMontants(texte: string): { texte: string; montant: boolean }[] {
  const morceaux: { texte: string; montant: boolean }[] = [];
  let fin = 0;
  for (const m of texte.matchAll(MONTANT)) {
    const debut = m.index ?? 0;
    if (debut > fin) morceaux.push({ texte: texte.slice(fin, debut), montant: false });
    morceaux.push({ texte: m[0], montant: true });
    fin = debut + m[0].length;
  }
  if (fin < texte.length) morceaux.push({ texte: texte.slice(fin), montant: false });
  return morceaux;
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
