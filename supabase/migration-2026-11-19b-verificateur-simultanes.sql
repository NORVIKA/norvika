-- norvika.ca : vérificateur Loi 25, plafond de 5 analyses EN MÊME TEMPS (2026-11-19, deuxième fichier)
--
-- POURQUOI (Sentinel, passe 2, constat N3)
-- Le plafond de 5 navigateurs simultanés était vérifié dans le code (lecture de limits() chez
-- Browser Run, puis lancement) : pas atomique (des requêtes simultanées voyaient toutes « moins de
-- 5 ») et ouvert si limits() tombait. 200 analyses tirées d'un coup pouvaient monter vers 90
-- navigateurs, et Browser Run facture chaque navigateur simultané au-delà de 10 (moyenne des pointes).
-- Ici : dans verifier_debit_verificateur, SOUS LE MÊME VERROU GLOBAL, refus ('simultanes') si 5
-- analyses ou plus ont été comptées dans les 35 dernières secondes (une visite dure 30 s au plus).
--
-- Le reste de la fonction ne change pas : même signature (les droits restent), mêmes plafonds
-- (3 par IP ou /64 par heure, 200 par jour, 1 500 par mois). Le code traite 'simultanes' comme
-- « limite atteinte » et toute valeur inconnue comme une panne (refus).
--
-- PRÉALABLE : migration-2026-11-19-verificateur-plafonds.sql déjà passé (c'est le cas).
-- COMMENT LE PASSER : éditeur SQL du projet, UNE seule partie. Coller, Run.
-- https://supabase.com/dashboard/project/uddxvrogkknypneghkkw/sql/new
-- Retour arrière : repasser la partie 2.3 de migration-2026-11-19-verificateur-plafonds.sql.

begin;

create or replace function public.verifier_debit_verificateur(
  p_ip_hash  text,
  p_max_ip   integer  default 3,
  p_fenetre  interval default interval '1 hour',
  p_max_jour integer  default 200,
  p_max_mois integer  default 1500
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  aujourd_hui date := (now() at time zone 'America/Toronto')::date;
  n_ip     integer;
  n_jour   integer;
  n_mois   integer;
  n_actifs integer;
begin
  perform pg_advisory_xact_lock(hashtext('verificateur:global'));

  -- N3 : au plus 5 analyses en cours. Une visite dure 30 s au plus, d'où la fenêtre de 35 s.
  select count(*) into n_actifs
    from public.form_rate_limit
   where formulaire = 'verificateur'
     and created_at > now() - interval '35 seconds';
  if n_actifs >= 5 then
    return 'simultanes';
  end if;

  select count(*) into n_ip
    from public.form_rate_limit
   where ip_hash = p_ip_hash
     and formulaire = 'verificateur'
     and created_at > now() - p_fenetre;
  if n_ip >= p_max_ip then
    return 'ip';
  end if;

  select coalesce(sum(analyses) filter (where jour = aujourd_hui), 0),
         coalesce(sum(analyses), 0)
    into n_jour, n_mois
    from public.verificateur_compteur
   where jour >= date_trunc('month', aujourd_hui)::date;
  if n_jour >= p_max_jour then
    return 'jour';
  end if;
  if n_mois >= p_max_mois then
    return 'mois';
  end if;

  insert into public.form_rate_limit (ip_hash, formulaire)
  values (p_ip_hash, 'verificateur');

  insert into public.verificateur_compteur (jour, analyses)
  values (aujourd_hui, 1)
  on conflict (jour) do update set analyses = public.verificateur_compteur.analyses + 1;

  return 'ok';
end;
$$;

revoke all on function public.verifier_debit_verificateur(text, integer, interval, integer, integer)
  from public, anon, authenticated;
grant execute on function public.verifier_debit_verificateur(text, integer, interval, integer, integer)
  to service_role;

commit;

-- Vérification (lecture seule). Attendu : une ligne, verrouillee = true, simultanes = true.
select p.proname,
       position('pg_advisory_xact_lock' in pg_get_functiondef(p.oid)) > 0 as verrouillee,
       position('simultanes'            in pg_get_functiondef(p.oid)) > 0 as simultanes
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'verifier_debit_verificateur';
