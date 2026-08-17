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
 * chaque soumission. Comptage strictement coherent, une seule transaction,
 * aucune course entre deux requetes simultanees, aucune ressource
 * Cloudflare supplementaire a provisionner (ni KV, ni Durable Object, ni D1).
 * Cout : un aller-retour de plus, sur un chemin qui en fait deja plusieurs.
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
  const donnees = new TextEncoder().encode(`${sel}:${ip}`);
  const condense = await crypto.subtle.digest("SHA-256", donnees);
  return Array.from(new Uint8Array(condense))
    .map((o) => o.toString(16).padStart(2, "0"))
    .join("");
}

export type ResultatDebit = { permis: boolean; raison?: string };

/**
 * Verifie et enregistre une tentative. `formulaire` separe les compteurs
 * (« contact » et « lead » ont chacun leur quota).
 *
 * En cas de panne du compteur, on laisse passer (fail-open) : un incident
 * Supabase ne doit pas fermer le formulaire de contact du site. La
 * sauvegarde du message, elle, echouera de toute facon si la base est en
 * panne, donc on ne cree aucun trou reel.
 */
export async function verifierDebit(
  req: Request,
  formulaire: "contact" | "lead"
): Promise<ResultatDebit> {
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
      return { permis: true };
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
    return { permis: true };
  }
}

/** Client Supabase a privileges serveur, pour les insertions de formulaires. */
export function supabaseService(): SupabaseClient {
  return serviceClient();
}
