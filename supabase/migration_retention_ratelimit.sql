-- ============================================================
-- NORVIKA — Migration 002
-- Conservation (X-13 / EFVP R1) + limitation de debit (X-14 / EFVP R2)
-- Projet Supabase : uddxvrogkknypneghkkw
--
-- ⚠️ ADDITIVE. Ne modifie ni ne supprime aucune colonne ni aucune donnee
--    existante. `migration_init.sql` reste tel quel, il est deja applique.
--
-- ⚠️ ORDRE D'EXECUTION
--    Sections 1 a 4 : a executer MAINTENANT, sans risque, avant ou apres le
--                     deploiement du code. Elles n'enlevent aucun acces.
--    Section 5      : a executer SEULEMENT APRES le deploiement du nouveau
--                     code (route serveur /api/lead). Elle retire l'insertion
--                     anonyme dans client_leads : si le code deploye est
--                     encore l'ancien, le formulaire /bienvenue casse.
-- ============================================================


-- ─── 1. Conservation : 24 mois ───────────────────────────────
--
-- Loi 25 : un renseignement personnel ne peut etre conserve au-dela de la
-- finalite pour laquelle il a ete recueilli. Duree retenue : 24 mois apres
-- created_at, pour contact_messages et client_leads.

CREATE OR REPLACE FUNCTION public.purge_donnees_expirees()
RETURNS TABLE (table_purgee text, lignes_supprimees bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  n_messages bigint;
  n_leads    bigint;
  n_debit    bigint;
BEGIN
  DELETE FROM public.contact_messages
   WHERE created_at < now() - interval '24 months';
  GET DIAGNOSTICS n_messages = ROW_COUNT;

  DELETE FROM public.client_leads
   WHERE created_at < now() - interval '24 months';
  GET DIAGNOSTICS n_leads = ROW_COUNT;

  -- Les empreintes de limitation de debit (section 3) sont des donnees
  -- techniques a duree de vie de quelques heures. On les purge ici aussi.
  -- Le garde-fou evite que le job quotidien echoue si seules les sections
  -- 1 et 2 ont ete executees.
  n_debit := 0;
  IF to_regclass('public.form_rate_limit') IS NOT NULL THEN
    DELETE FROM public.form_rate_limit
     WHERE created_at < now() - interval '24 hours';
    GET DIAGNOSTICS n_debit = ROW_COUNT;
  END IF;

  RETURN QUERY
    SELECT 'contact_messages'::text, n_messages
    UNION ALL SELECT 'client_leads'::text, n_leads
    UNION ALL SELECT 'form_rate_limit'::text, n_debit;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_donnees_expirees() FROM PUBLIC, anon, authenticated;

COMMENT ON FUNCTION public.purge_donnees_expirees() IS
  'Loi 25 — supprime les renseignements personnels de plus de 24 mois. Planifiee par pg_cron (job purge-donnees-expirees).';

-- Index de support : sans eux la purge fait un balayage complet.
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON public.contact_messages (created_at);
CREATE INDEX IF NOT EXISTS client_leads_created_at_idx     ON public.client_leads (created_at);


-- ─── 2. Planification de la purge (pg_cron) ──────────────────
--
-- pg_cron est disponible sur tous les projets Supabase, y compris le plan
-- gratuit. Il tourne DANS la base : rien a deployer, rien a authentifier,
-- aucune route publique a proteger. C'est pour ca qu'il est prefere a une
-- route planifiee Cloudflare.

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Idempotent : on retire le job s'il existe deja avant de le recreer.
DO $$
BEGIN
  PERFORM cron.unschedule('purge-donnees-expirees');
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;

-- Tous les jours a 03:30 UTC (23:30 heure de l'Est en hiver).
SELECT cron.schedule(
  'purge-donnees-expirees',
  '30 3 * * *',
  $$SELECT public.purge_donnees_expirees();$$
);


-- ─── 3. Limitation de debit : table d'empreintes ─────────────
--
-- On ne stocke JAMAIS l'adresse IP en clair. Le serveur envoie un condense
-- SHA-256 de (sel + IP). Une IP ne peut pas etre relue depuis la table, et
-- la ligne disparait de toute facon en quelques heures.

CREATE TABLE IF NOT EXISTS public.form_rate_limit (
  id         bigserial PRIMARY KEY,
  ip_hash    text        NOT NULL,
  formulaire text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS form_rate_limit_lookup_idx
  ON public.form_rate_limit (ip_hash, formulaire, created_at DESC);

ALTER TABLE public.form_rate_limit ENABLE ROW LEVEL SECURITY;

-- Aucune politique n'est creee : anon et authenticated n'ont donc AUCUN
-- acces a cette table. Seul le role service_role (qui contourne la RLS),
-- utilise uniquement cote serveur, y touche.

COMMENT ON TABLE public.form_rate_limit IS
  'Empreintes SHA-256 d''IP pour la limitation de debit des formulaires. Aucune IP en clair. Purge a 24 h.';


-- ─── 4. Limitation de debit : fonction de comptage ───────────
--
-- Compte et enregistre en UNE seule aller-retour, dans une seule transaction
-- Postgres : pas de course entre deux requetes simultanees.
-- Retourne true si la soumission est permise.

CREATE OR REPLACE FUNCTION public.verifier_debit_formulaire(
  p_ip_hash    text,
  p_formulaire text,
  p_max        integer DEFAULT 3,
  p_fenetre    interval DEFAULT interval '1 hour'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  n integer;
BEGIN
  SELECT count(*) INTO n
    FROM public.form_rate_limit
   WHERE ip_hash = p_ip_hash
     AND formulaire = p_formulaire
     AND created_at > now() - p_fenetre;

  IF n >= p_max THEN
    RETURN false;
  END IF;

  INSERT INTO public.form_rate_limit (ip_hash, formulaire)
  VALUES (p_ip_hash, p_formulaire);

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.verifier_debit_formulaire(text, text, integer, interval)
  FROM PUBLIC, anon, authenticated;

COMMENT ON FUNCTION public.verifier_debit_formulaire(text, text, integer, interval) IS
  'Limitation de debit des formulaires : 3 soumissions par IP par heure par defaut. Appelee cote serveur uniquement.';


-- ============================================================
-- ─── 5. ⚠️ APRES LE DEPLOIEMENT SEULEMENT ────────────────────
--
-- Le formulaire /bienvenue inserait directement depuis le navigateur avec la
-- cle anonyme. Le nouveau code passe par /api/lead (cote serveur, cle
-- service_role). Une fois ce code EN LIGNE, l'insertion anonyme n'a plus
-- aucune raison d'exister : la retirer ferme la seule surface d'ecriture
-- publique restante sur client_leads.
--
-- Executer ces deux lignes UNIQUEMENT apres `npm run deploy` et apres avoir
-- verifie que /bienvenue fonctionne encore en ligne.
--
-- Retour arriere si besoin :
--   CREATE POLICY "public_insert_leads" ON public.client_leads FOR INSERT WITH CHECK (true);
--   CREATE POLICY "public_insert_messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
-- ============================================================

-- DROP POLICY IF EXISTS "public_insert_leads"    ON public.client_leads;
-- DROP POLICY IF EXISTS "public_insert_messages" ON public.contact_messages;
