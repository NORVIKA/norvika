-- norvika.ca : condensés d'IP purgés après 23 heures au lieu de 24 (2026-11-21)
--
-- POURQUOI
-- La purge tourne chaque heure (migration-2026-11-19-purge-horaire.sql) et efface les lignes de
-- form_rate_limit vieilles de plus de 24 heures. Une ligne vit donc jusqu'à 25 heures, alors que la
-- politique de confidentialité, la mention de collecte du vérificateur Loi 25 et son EFVP disent
-- « au plus 24 heures ». Constaté par Mattew le 2026-11-21.
-- Avec un seuil de 23 heures et un passage chaque heure, une ligne vit au plus 24 heures.
-- Sans effet sur les limites : leurs fenêtres sont d'une heure (formulaires et vérificateur), et le
-- compteur quotidien du vérificateur est dans une autre table, qui ne contient aucune IP.
-- Seul changement : '24 hours' devient '23 hours'. Le reste de la fonction est identique à
-- migration_retention_ratelimit.sql.
--
-- COMMENT LE PASSER : éditeur SQL du projet Supabase de norvika.ca, tout coller, Run.
-- https://supabase.com/dashboard/project/_/sql/new
-- Garde-fou : si la fonction en place n'a pas la forme attendue (trois DELETE, seuil de 24 heures),
-- tout s'arrête avec un message et RIEN n'est changé.
-- Retour arrière : repasser la fonction de migration_retention_ratelimit.sql.

begin;

do $garde$
declare
  def text := pg_get_functiondef('public.purge_donnees_expirees()'::regprocedure);
  nb_delete int;
begin
  nb_delete := (length(def) - length(replace(def, 'DELETE FROM', ''))) / length('DELETE FROM');
  if nb_delete <> 3 or position('interval ''24 hours''' in def) = 0 then
    raise exception 'La fonction purge_donnees_expirees en place ne correspond pas au dépôt (% DELETE). Rien n''est changé : envoyer ce message à Jarvis.', nb_delete;
  end if;
end
$garde$;

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

  -- Empreintes de limitation de débit : 23 heures, purge chaque heure, donc au plus 24 heures
  -- (2026-11-21). Le garde-fou évite que la tâche échoue si la table n'existe pas.
  n_debit := 0;
  IF to_regclass('public.form_rate_limit') IS NOT NULL THEN
    DELETE FROM public.form_rate_limit
     WHERE created_at < now() - interval '23 hours';
    GET DIAGNOSTICS n_debit = ROW_COUNT;
  END IF;

  RETURN QUERY
    SELECT 'contact_messages'::text, n_messages
    UNION ALL SELECT 'client_leads'::text, n_leads
    UNION ALL SELECT 'form_rate_limit'::text, n_debit;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_donnees_expirees() FROM PUBLIC, anon, authenticated;

commit;

-- Vérification 1 (attendu : true) : le nouveau seuil est en place.
select position('interval ''23 hours''' in pg_get_functiondef('public.purge_donnees_expirees()'::regprocedure)) > 0
  as seuil_23_heures;

-- Vérification 2, réserve R2 de l'EFVP (attendu : des lignes « succeeded », une par heure) :
-- la tâche planifiée s'exécute vraiment.
select d.status, d.start_time
  from cron.job_run_details d
  join cron.job j using (jobid)
 where j.jobname = 'purge-donnees-expirees'
 order by d.start_time desc
 limit 3;
