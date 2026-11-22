-- norvika.ca : plafonds du vérificateur Loi 25, et fin de la course du compteur (2026-11-19)
--
-- POURQUOI (Sentinel, revue du vérificateur Loi 25, constat E1, BLOQUANT)
-- 1. Aucun plafond GLOBAL : chaque analyse ouvre un navigateur Browser Run facturé au compte
--    Cloudflare de Norvika, le même qui sert app.norvika.ca, mon-espace.norvika.ca et le site de
--    Marie Lefebvre. Une suspension pour abus les ferait tomber ensemble.
--    Plafond posé ici : 200 analyses par jour, 1 500 par mois (heure du Québec), soit environ les
--    10 h de navigateur incluses au forfait Workers Paid. Les valeurs viennent du code
--    (lib/rate-limit.ts, PLAFONDS_VERIFICATEUR) : les changer là, pas ici.
-- 2. Course : verifier_debit_formulaire fait SELECT count(*) puis INSERT sans verrou. En READ
--    COMMITTED (le défaut de Postgres), 20 requêtes simultanées de la même IP lisaient toutes
--    « moins de 3 » et passaient toutes. Le verrou pg_advisory_xact_lock sérialise les requêtes
--    de la même clé jusqu'à la fin de la transaction.
-- (Le regroupement des IPv6 par /64 est fait dans le code, avant le condensé : rien à faire ici.)
--
-- CE QUE ÇA CRÉE
-- - Table verificateur_compteur : UNE ligne par jour, un nombre d'analyses. Aucune donnée
--   personnelle (ni IP, ni adresse visitée). RLS activée sans politique : seule la service_role.
-- - Fonction verifier_debit_verificateur : vérifie et compte en une transaction, sous verrou.
--   Rend 'ok', 'ip' (3 par IP ou /64 par heure), 'jour' ou 'mois' (plafond global atteint).
-- - verifier_debit_formulaire : même signature et même logique qu'avant, plus le verrou.
--
-- TANT QUE CE FICHIER N'EST PAS PASSÉ : le vérificateur reste FERMÉ (le code reçoit « fonction
-- introuvable » et refuse toute analyse, message « indisponible » au visiteur). Les formulaires de
-- contact fonctionnent comme aujourd'hui.
-- Sans risque pour le site et le CRM : rien n'est supprimé, aucune table existante n'est touchée.
-- Retour arrière : DROP FUNCTION public.verifier_debit_verificateur(text, integer, interval, integer, integer);
-- DROP TABLE public.verificateur_compteur; et repasser la fonction d'origine (migration_retention_ratelimit.sql).
--
-- COMMENT LE PASSER : éditeur SQL du projet, en DEUX fois.
-- https://supabase.com/dashboard/project/uddxvrogkknypneghkkw/sql/new


-- ===== PARTIE 1 : lecture seule. Coller, Run, garder le résultat (preuve de l'état d'avant). =====
-- Attendu : la fonction verifier_debit_formulaire existe (sans « advisory » dans sa définition),
-- verifier_debit_verificateur et verificateur_compteur n'existent pas encore.

select p.proname,
       pg_get_function_identity_arguments(p.oid) as arguments,
       position('pg_advisory_xact_lock' in pg_get_functiondef(p.oid)) > 0 as deja_verrouillee
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('verifier_debit_formulaire', 'verifier_debit_verificateur');

select to_regclass('public.verificateur_compteur') as table_compteur,
       to_regclass('public.form_rate_limit')       as table_debit;


-- ===== PARTIE 2 : le correctif. Coller, Run. =====
-- Attendu à la fin : deux fonctions, toutes deux « verrouillee = true », et la table créée.

begin;

-- 2.1 Le verrou dans la fonction des formulaires (même signature, même résultat qu'avant).
create or replace function public.verifier_debit_formulaire(
  p_ip_hash    text,
  p_formulaire text,
  p_max        integer default 3,
  p_fenetre    interval default interval '1 hour'
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  n integer;
begin
  -- Une seule transaction à la fois pour la même IP et le même formulaire : plus de course.
  perform pg_advisory_xact_lock(hashtext('formulaire:' || p_formulaire || ':' || p_ip_hash));

  select count(*) into n
    from public.form_rate_limit
   where ip_hash = p_ip_hash
     and formulaire = p_formulaire
     and created_at > now() - p_fenetre;

  if n >= p_max then
    return false;
  end if;

  insert into public.form_rate_limit (ip_hash, formulaire)
  values (p_ip_hash, p_formulaire);

  return true;
end;
$$;

revoke all on function public.verifier_debit_formulaire(text, text, integer, interval)
  from public, anon, authenticated;

-- 2.2 Le compteur global du vérificateur : un nombre par jour, rien d'autre.
create table if not exists public.verificateur_compteur (
  jour     date    primary key,
  analyses integer not null default 0 check (analyses >= 0)
);

alter table public.verificateur_compteur enable row level security;

comment on table public.verificateur_compteur is
  'Vérificateur Loi 25 (norvika.ca) : nombre d''analyses par jour (heure du Québec), pour le plafond global. Aucune donnée personnelle.';

-- 2.3 La fonction du vérificateur : par IP (ou /64) ET plafond global, sous UN verrou global.
--     Le volume visé (200 par jour au plus) rend la sérialisation sans effet sur la vitesse.
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
  n_ip   integer;
  n_jour integer;
  n_mois integer;
begin
  perform pg_advisory_xact_lock(hashtext('verificateur:global'));

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

comment on function public.verifier_debit_verificateur(text, integer, interval, integer, integer) is
  'Vérificateur Loi 25 : 3 analyses par IP (ou /64) par heure, 200 par jour et 1 500 par mois au total. Appelée côté serveur uniquement (service_role).';

commit;

-- Vérification (lecture seule) : deux fonctions verrouillées, et la table.
select p.proname,
       position('pg_advisory_xact_lock' in pg_get_functiondef(p.oid)) > 0 as verrouillee
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('verifier_debit_formulaire', 'verifier_debit_verificateur');

select to_regclass('public.verificateur_compteur') as table_compteur;
