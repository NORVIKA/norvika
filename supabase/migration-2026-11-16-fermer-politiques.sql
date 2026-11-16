-- norvika.ca : fermer les politiques « authenticated » et d'insertion publique (bloc F, 2026-11-16)
--
-- POURQUOI
-- Sentinel (audit du 2026-11-16) : les inscriptions Supabase du projet uddxvrogkknypneghkkw sont
-- ouvertes (courriel, Google, GitHub ; vérifié par /auth/v1/settings). migration_init.sql a créé des
-- politiques « FOR ALL USING (auth.role() = 'authenticated') » sur contact_messages et client_leads.
-- Donc toute personne qui se crée un compte pouvait lire, modifier et effacer les messages de contact
-- et les prospects. Les politiques « public_insert_* » (WITH CHECK true) laissaient aussi écrire avec
-- la clé anon publique, sans Turnstile ni limite de débit.
--
-- POURQUOI C'EST SANS RISQUE POUR LE SITE ET LE CRM
-- - /api/contact et /api/lead écrivent avec la clé service_role, qui contourne la RLS.
-- - Le CRM (app.norvika.ca) ne lit jamais ces tables, et lit les siennes en service_role.
-- - Seul effet : les listes de norvika.ca/admin (messages, prospects) deviennent vides. Les messages
--   de contact arrivent toujours par courriel. L'admin du site est à retirer (constat 3 de Sentinel).
-- La RLS reste ACTIVÉE, sans politique : seule la service_role passe (patron du CRM, § 5.4).
-- Réversible : les CREATE POLICY d'origine sont dans migration_init.sql.
--
-- COMMENT LE PASSER : éditeur SQL du projet, en DEUX fois.
-- https://supabase.com/dashboard/project/uddxvrogkknypneghkkw/sql/new


-- ===== PARTIE 1 : lecture seule. Coller, Run, garder le résultat (preuve de l'état d'avant). =====

select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('contact_messages','client_leads','form_rate_limit','site_content','site_info','site_colors')
order by tablename, policyname;


-- ===== PARTIE 2 : le correctif. Coller, Run. Le résultat attendu est une liste VIDE. =====

drop policy if exists "admin_all_messages"     on public.contact_messages;
drop policy if exists "public_insert_messages" on public.contact_messages;
drop policy if exists "admin_all_leads"        on public.client_leads;
drop policy if exists "public_insert_leads"    on public.client_leads;
drop policy if exists "admin_all_content"      on public.site_content;
drop policy if exists "public_read_content"    on public.site_content;
drop policy if exists "admin_all_colors"       on public.site_colors;
drop policy if exists "public_read_colors"     on public.site_colors;
drop policy if exists "admin_all_info"         on public.site_info;
drop policy if exists "public_read_info"       on public.site_info;

alter table public.contact_messages enable row level security;
alter table public.client_leads     enable row level security;
alter table public.site_content     enable row level security;
alter table public.site_colors      enable row level security;
alter table public.site_info        enable row level security;

select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('contact_messages','client_leads','site_content','site_info','site_colors')
order by tablename, policyname;
