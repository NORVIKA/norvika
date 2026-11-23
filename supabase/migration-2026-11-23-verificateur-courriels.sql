-- norvika.ca : vérificateur Loi 25, plafond PROPRE aux courriels du rapport (2026-11-23)
--
-- POURQUOI
-- Le rapport par courriel du vérificateur part avec la même clé Resend et le même domaine que les
-- avis des formulaires de contact (/api/contact, /api/lead). Le plafond des analyses (200 par jour)
-- ne suffit pas : chaque analyse peut envoyer deux courriels (le rapport, et la copie interne si la
-- case est cochée). Sans plafond à part, le vérificateur seul pourrait épuiser le quota d'envoi du
-- jour, et William ne serait plus averti des nouveaux messages de contact.
-- Plafond posé ici : 50 courriels par jour (heure du Québec), rapport ET copie interne comptés. La
-- valeur vient du code (lib/rate-limit.ts, PLAFOND_COURRIELS_VERIFICATEUR) : la changer là.
--
-- CE QUE ÇA CRÉE
-- - Table verificateur_courriels : UNE ligne par jour, un nombre de courriels. Aucune donnée
--   personnelle (ni adresse courriel, ni IP, ni site analysé). RLS activée sans politique : seule la
--   service_role y touche, par la fonction ci-dessous.
-- - Fonction reserver_courriels_verificateur(p_nombre, p_max_jour) : réserve 1 ou 2 courriels en une
--   transaction, sous verrou (aucune course). Rend 'ok' (réservé), 'jour' (plafond du jour atteint),
--   'refus' (nombre ou plafond invalide).
--
-- TANT QUE CE FICHIER N'EST PAS PASSÉ : l'analyse fonctionne normalement, mais AUCUN courriel du
-- rapport ne part (le code reçoit « fonction introuvable », affiche le résultat à l'écran et le
-- message « le courriel n'a pas pu partir »). Les formulaires de contact ne sont pas touchés.
-- Sans risque pour le site et le CRM : rien n'est supprimé, aucune table existante n'est modifiée.
-- Retour arrière :
--   DROP FUNCTION public.reserver_courriels_verificateur(integer, integer);
--   DROP TABLE public.verificateur_courriels;
--
-- COMMENT LE PASSER : éditeur SQL du projet, en DEUX fois.
-- https://supabase.com/dashboard/project/uddxvrogkknypneghkkw/sql/new


-- ===== PARTIE 1 : lecture seule. Coller, Run, garder le résultat (preuve de l'état d'avant). =====
-- Attendu : aucune ligne pour la fonction, et table_courriels vide (null).

select p.proname, pg_get_function_identity_arguments(p.oid) as arguments
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'reserver_courriels_verificateur';

select to_regclass('public.verificateur_courriels') as table_courriels;


-- ===== PARTIE 2 : la création. Coller, Run. =====
-- Attendu à la fin : la fonction existe (verrouillee = true) et la table aussi.

begin;

create table if not exists public.verificateur_courriels (
  jour   date    primary key,
  envois integer not null default 0 check (envois >= 0)
);

alter table public.verificateur_courriels enable row level security;
-- La RLS bloque déjà ces rôles par l'API ; le retrait des droits en plus (défense en profondeur).
revoke all on table public.verificateur_courriels from anon, authenticated;

comment on table public.verificateur_courriels is
  'Vérificateur Loi 25 (norvika.ca) : nombre de courriels du rapport envoyés par jour (heure du Québec), pour le plafond. Aucune donnée personnelle.';

create or replace function public.reserver_courriels_verificateur(
  p_nombre   integer default 1,
  p_max_jour integer default 50
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  aujourd_hui date := (now() at time zone 'America/Toronto')::date;
  n integer;
begin
  -- Le rapport seul (1), ou le rapport et la copie interne (2) : rien d'autre. Un plafond nul ou
  -- négatif est refusé aussi : avec null, la comparaison plus bas vaudrait null et le plafond sauterait.
  if p_nombre is null or p_nombre < 1 or p_nombre > 2 or p_max_jour is null or p_max_jour < 0 then
    return 'refus';
  end if;

  -- Une réserve à la fois : deux envois simultanés ne peuvent pas passer le plafond ensemble.
  perform pg_advisory_xact_lock(hashtext('verificateur:courriels'));

  select envois into n
    from public.verificateur_courriels
   where jour = aujourd_hui;
  if coalesce(n, 0) + p_nombre > p_max_jour then
    return 'jour';
  end if;

  insert into public.verificateur_courriels (jour, envois)
  values (aujourd_hui, p_nombre)
  on conflict (jour) do update set envois = public.verificateur_courriels.envois + p_nombre;

  return 'ok';
end;
$$;

revoke all on function public.reserver_courriels_verificateur(integer, integer)
  from public, anon, authenticated;
grant execute on function public.reserver_courriels_verificateur(integer, integer)
  to service_role;

comment on function public.reserver_courriels_verificateur(integer, integer) is
  'Vérificateur Loi 25 : réserve 1 ou 2 courriels du rapport, 50 par jour au total. Appelée côté serveur uniquement (service_role).';

commit;

-- Vérification (lecture seule) : la fonction verrouillée, et la table.
select p.proname,
       position('pg_advisory_xact_lock' in pg_get_functiondef(p.oid)) > 0 as verrouillee
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'reserver_courriels_verificateur';

select to_regclass('public.verificateur_courriels') as table_courriels;
