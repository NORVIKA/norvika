import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Limitation de debit des formulaires publics : 3 soumissions par IP par
 * heure (regle interne Norvika, CLAUDE.md § Securite).
 *
 * ⚠️ POURQUOI PAS UN COMPTEUR EN MEMOIRE
 * Le site tourne sur un Worker Cloudflare. Chaque requete peut atterrir dans
 * un isolat different, dans un centre de donnees different, et un isolat est
 * detruit sans preavis. Un `Map` en memoire de processus ne compte donc rien
 * du tout : il repart a zero a chaque requete ou presque.
 *
 * ⚠️ POURQUOI PAS LE BINDING RATE LIMITING DE CLOUDFLARE
 * Il ne sait faire que des fenetres de 10 ou 60 secondes. Notre regle est de
 * 3 par HEURE. Il ne peut pas l'exprimer.
 *
 * ⚠️ POURQUOI POSTGRES
 * Le compteur vit dans Supabase, que le site interroge de toute facon a
 * chaque soumission. Une seule transaction, aucune ressource Cloudflare
 * supplementaire a provisionner (ni KV, ni Durable Object, ni D1).
 * Cout : un aller-retour de plus, sur un chemin qui en fait deja plusieurs.
 * ⚠️ COURSE (Sentinel, 2026-11-19, E1) : la fonction d'origine fait SELECT count puis INSERT
 * sans verrou ; 20 requetes simultanees de la meme IP passaient toutes. Le verrou
 * (pg_advisory_xact_lock) est dans supabase/migration-2026-11-19-verificateur-plafonds.sql,
 * a passer par William. D'ici la, l'ecart ne vaut que pour les formulaires (le verificateur,
 * lui, reste FERME tant que sa fonction n'existe pas).
 *
 * ⚠️ AUCUNE IP EN CLAIR N'EST STOCKEE
 * On envoie un condense SHA-256 de (sel + IP). Voir hashIp().
 */

const MAX_PAR_FENETRE = 3;
const FENETRE = "1 hour";

/**
 * Sel de pseudonymisation. Idealement pose en secret du Worker :
 *   printf "%s" "$RATE_LIMIT_SALT" | npx wrangler secret put RATE_LIMIT_SALT
 * Sans secret, le condense reste une pseudonymisation (l'IP n'est pas lisible
 * dans la table) mais devient theoriquement reversible par force brute sur
 * l'espace des IPv4. La ligne ne vit que 24 h.
 */
const SEL_DEFAUT = "norvika-form-rate-limit-v1";

function serviceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error("Configuration Supabase serveur manquante.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * La cle du compteur pour une adresse IP. Une IPv6 est regroupee par /64 (Sentinel, E1) : un
 * serveur loue recoit souvent un /64 entier, soit 2^64 adresses, et compter chaque adresse a part
 * laissait une seule machine passer autant de fois qu'elle voulait. Une IPv4 reste telle quelle.
 */
export function cleIp(ip: string): string {
  if (!ip.includes(":")) return ip;
  const sans = ip.replace(/^\[|\]$/g, "").replace(/%.*$/, "").toLowerCase();
  const [debut, fin = ""] = sans.split("::");
  const a = debut ? debut.split(":") : [];
  const b = sans.includes("::") ? (fin ? fin.split(":") : []) : [];
  const groupes = sans.includes("::") ? [...a, ...Array(Math.max(0, 8 - a.length - b.length)).fill("0"), ...b] : a;
  return `${groupes
    .slice(0, 4)
    .map((g) => g.replace(/^0+(?=.)/, "") || "0")
    .join(":")}::/64`;
}

/** Adresse IP du visiteur telle que vue par Cloudflare. */
export function clientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "inconnue"
  );
}

async function hashIp(ip: string): Promise<string> {
  const sel = process.env.RATE_LIMIT_SALT ?? SEL_DEFAUT;
  const donnees = new TextEncoder().encode(`${sel}:${cleIp(ip)}`);
  const condense = await crypto.subtle.digest("SHA-256", donnees);
  return Array.from(new Uint8Array(condense))
    .map((o) => o.toString(16).padStart(2, "0"))
    .join("");
}

export type ResultatDebit = { permis: boolean; raison?: string; panne?: boolean };

/** Le compteur est en panne : refus (seulement avec `fermeSiPanne`). */
const PANNE: ResultatDebit = {
  permis: false,
  panne: true,
  raison: "Le service est momentanément indisponible. Réessayez dans quelques minutes, ou écrivez-nous à info@norvika.ca.",
};

/**
 * Verifie et enregistre une tentative. `formulaire` separe les compteurs
 * (« contact », « lead » et « diagnostic » ont chacun leur quota ; la colonne
 * `formulaire` de form_rate_limit est un texte libre, sans contrainte).
 *
 * En cas de panne du compteur, on laisse passer (fail-open) : un incident
 * Supabase ne doit pas fermer le formulaire de contact du site. La
 * sauvegarde du message, elle, echouera de toute facon si la base est en
 * panne, donc on ne cree aucun trou reel.
 *
 * `fermeSiPanne` (verificateur Loi 25, 2026-11-18) : l'inverse, une panne REFUSE. Le
 * verificateur n'ecrit rien dans la base (aucune autre etape ne tomberait avec elle) et chaque
 * analyse ouvre un navigateur Browser Run : sans compteur, seul Turnstile le protegerait.
 */
export async function verifierDebit(
  req: Request,
  formulaire: "contact" | "lead" | "diagnostic",
  options: { fermeSiPanne?: boolean } = {}
): Promise<ResultatDebit> {
  const siPanne: ResultatDebit = options.fermeSiPanne ? PANNE : { permis: true };
  try {
    const ipHash = await hashIp(clientIp(req));
    const { data, error } = await serviceClient().rpc("verifier_debit_formulaire", {
      p_ip_hash: ipHash,
      p_formulaire: formulaire,
      p_max: MAX_PAR_FENETRE,
      p_fenetre: FENETRE,
    });

    if (error) {
      console.error("Limitation de debit indisponible:", error.message);
      return siPanne;
    }

    if (data === false) {
      return {
        permis: false,
        raison:
          "Vous avez envoye trop de messages. Reessayez dans une heure, ou ecrivez-nous a info@norvika.ca.",
      };
    }
    return { permis: true };
  } catch (e) {
    console.error("Limitation de debit indisponible:", e);
    return siPanne;
  }
}

/**
 * Verificateur Loi 25 : 3 analyses par IP par heure ET un plafond GLOBAL (Sentinel, E1, 2026-11-19)
 * de 200 analyses par jour et 1 500 par mois, environ les 10 h de navigateur incluses au forfait
 * Workers Paid. Le tout dans UNE fonction Postgres, sous verrou : aucune course.
 *   - « ok » : l'analyse est comptee et permise ;
 *   - « ip » : trop d'analyses depuis cette adresse (ou ce /64) dans l'heure ;
 *   - « quota » : le plafond du jour ou du mois est atteint, ou 5 analyses sont deja en cours
 *     (verrou global, donc atomique : N3 de Sentinel), pour tout le monde ;
 *   - « panne » : compteur injoignable, OU fonction pas encore creee (SQL a passer par William,
 *     supabase/migration-2026-11-19-verificateur-plafonds.sql). FERME dans les deux cas : sans
 *     plafond, chaque analyse ouvre un navigateur Browser Run facture a notre compte, celui qui
 *     sert aussi app.norvika.ca et mon-espace.norvika.ca.
 */
export const PLAFONDS_VERIFICATEUR = { parIp: 3, fenetre: "1 hour", parJour: 200, parMois: 1500 } as const;

export type DebitVerificateur = "ok" | "ip" | "quota" | "panne";

export async function verifierDebitVerificateur(req: Request): Promise<DebitVerificateur> {
  try {
    const { data, error } = await serviceClient().rpc("verifier_debit_verificateur", {
      p_ip_hash: await hashIp(clientIp(req)),
      p_max_ip: PLAFONDS_VERIFICATEUR.parIp,
      p_fenetre: PLAFONDS_VERIFICATEUR.fenetre,
      p_max_jour: PLAFONDS_VERIFICATEUR.parJour,
      p_max_mois: PLAFONDS_VERIFICATEUR.parMois,
    });
    if (error) {
      console.error("[verificateur] compteur indisponible :", error.code ?? "", error.message.slice(0, 120));
      return "panne";
    }
    if (data === "ok") return "ok";
    if (data === "ip") return "ip";
    // « simultanes » : 5 analyses en cours ou plus (N3 de Sentinel, fichier SQL du 2026-11-19 b).
    if (data === "jour" || data === "mois" || data === "simultanes") return "quota";
    // Toute autre valeur : refus (fermé en cas de doute).
    return "panne";
  } catch (e) {
    console.error("[verificateur] compteur indisponible :", e instanceof Error ? e.message.slice(0, 120) : "erreur");
    return "panne";
  }
}

/**
 * Verificateur Loi 25, rapport par courriel (2026-11-23) : un plafond PROPRE aux courriels, plus bas
 * que celui des analyses. La cle Resend et le domaine d'envoi sont ceux des formulaires de contact :
 * sans ce plafond, le verificateur seul pourrait epuiser le quota d'envoi du jour, et William ne
 * serait plus averti des nouveaux messages. 50 courriels par jour (heure du Quebec) au total, rapport
 * ET copie interne comptes ; la reserve est prise AVANT l'appel a Resend.
 *   - « ok » : la reserve est faite ;  « plafond » : le plafond du jour serait depasse ;
 *   - « panne » : compteur injoignable, OU fonction pas encore creee (SQL a passer par William,
 *     supabase/migration-2026-11-23-verificateur-courriels.sql). FERME : l'analyse s'affiche quand
 *     meme, seul le courriel ne part pas.
 * Aucune donnee personnelle : un nombre par jour, rien d'autre.
 */
export const PLAFOND_COURRIELS_VERIFICATEUR = { parJour: 50 } as const;

export type ReserveCourriels = "ok" | "plafond" | "panne";

export async function reserverCourrielsVerificateur(nombre: 1 | 2): Promise<ReserveCourriels> {
  try {
    // 3 s au plus : la personne attend sa réponse (délai de la page, constat F5).
    const { data, error } = await serviceClient()
      .rpc("reserver_courriels_verificateur", { p_nombre: nombre, p_max_jour: PLAFOND_COURRIELS_VERIFICATEUR.parJour })
      .abortSignal(AbortSignal.timeout(3000));
    if (error) {
      console.error("[verificateur] compteur de courriels indisponible :", error.code ?? "");
      return "panne";
    }
    if (data === "ok") return "ok";
    if (data === "jour") return "plafond";
    // Toute autre valeur : refus (fermé en cas de doute).
    return "panne";
  } catch (e) {
    console.error("[verificateur] compteur de courriels indisponible :", e instanceof Error ? e.name : "erreur");
    return "panne";
  }
}

/** Client Supabase a privileges serveur, pour les insertions de formulaires. */
export function supabaseService(): SupabaseClient {
  return serviceClient();
}
