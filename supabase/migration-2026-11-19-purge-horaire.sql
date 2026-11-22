-- norvika.ca : purge des condensés d'IP chaque heure au lieu d'une fois par jour (2026-11-19)
--
-- POURQUOI
-- La tâche pg_cron « purge-donnees-expirees » tournait une fois par jour (30 3 * * *, en UTC) et
-- efface les lignes de form_rate_limit vieilles de plus de 24 heures. Une ligne créée juste après
-- le passage restait donc près de 48 heures. Or la politique de confidentialité, la mention de
-- collecte du vérificateur Loi 25 et son EFVP disent « 24 heures ». Constaté par Jarvis le
-- 2026-11-19 en vérifiant la réserve R2 de l'EFVP.
-- Chaque heure : une ligne vit au plus 25 heures (effacée dans l'heure qui suit ses 24 heures).
-- Coût nul : la fonction ne fait que quelques DELETE sur de petites tables.
--
-- COMMENT LE PASSER : éditeur SQL du projet, coller, Run.
-- https://supabase.com/dashboard/project/uddxvrogkknypneghkkw/sql/new
-- pg_cron 1.4 et plus : cron.schedule avec un nom existant MET À JOUR la tâche (pas de doublon).
-- Retour arrière : la même commande avec '30 3 * * *'.

select cron.schedule(
  'purge-donnees-expirees',
  '30 * * * *',
  $$SELECT public.purge_donnees_expirees();$$
);

-- Vérification (attendu : une seule ligne, schedule = 30 * * * *).
select jobname, schedule, command from cron.job where jobname = 'purge-donnees-expirees';
