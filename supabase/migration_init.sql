-- ============================================================
-- NORVIKA — Migration initiale
-- Projet Supabase : uddxvrogkknypneghkkw
-- ============================================================

-- ─── 1. Tables ───────────────────────────────────────────────

-- Contenus éditables (textes des pages)
CREATE TABLE IF NOT EXISTS public.site_content (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text UNIQUE NOT NULL,
  value       text NOT NULL DEFAULT '',
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Couleurs du site
CREATE TABLE IF NOT EXISTS public.site_colors (
  id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key   text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT ''
);

-- Infos générales (nom, email, téléphone, liens)
CREATE TABLE IF NOT EXISTS public.site_info (
  id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key   text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT ''
);

-- Messages du formulaire de contact
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL DEFAULT '',
  email      text NOT NULL DEFAULT '',
  phone      text NOT NULL DEFAULT '',
  message    text NOT NULL DEFAULT '',
  read       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Leads soumis via /bienvenue
CREATE TABLE IF NOT EXISTS public.client_leads (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prenom     text NOT NULL DEFAULT '',
  courriel   text NOT NULL DEFAULT '',
  telephone  text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── 2. RLS — Row Level Security ─────────────────────────────

ALTER TABLE public.site_content    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_colors     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_info       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_leads    ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "public_read_content"  ON public.site_content    FOR SELECT USING (true);
CREATE POLICY "public_read_colors"   ON public.site_colors     FOR SELECT USING (true);
CREATE POLICY "public_read_info"     ON public.site_info       FOR SELECT USING (true);

-- Écriture admin uniquement (authenticated)
CREATE POLICY "admin_all_content"    ON public.site_content    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_colors"     ON public.site_colors     FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_info"       ON public.site_info       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_messages"   ON public.contact_messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_leads"      ON public.client_leads    FOR ALL USING (auth.role() = 'authenticated');

-- Insertion publique pour les formulaires
CREATE POLICY "public_insert_messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_leads"    ON public.client_leads     FOR INSERT WITH CHECK (true);

-- ─── 3. Seed — Contenus par défaut ───────────────────────────

INSERT INTO public.site_content (key, value) VALUES
  ('hero_titre',              'Votre business vaut mieux que sa présence en ligne.'),
  ('hero_sous_titre',         'On trouve ce qui vous freine, de votre site à vos tâches répétitives, puis on le règle avec vous.'),
  ('hero_cta',                'JE VEUX RÉUSSIR'),
  ('pilliers_titre',          'Trois points de friction, trois solutions.'),
  ('pilliers_sous_titre',     'On commence par le vrai problème, pas par une liste de services.'),
  ('pillier_1_label',         'Votre site'),
  ('pillier_1_desc',          'Pas de site, ou un site qui fait vieux. On vous monte une présence claire, à la hauteur de votre travail.'),
  ('pillier_2_label',         'Votre temps'),
  ('pillier_2_desc',          'Vous répétez les mêmes tâches à la main. On automatise ce qui peut l''être.'),
  ('pillier_3_label',         'Votre image'),
  ('pillier_3_desc',          'Vos photos et vidéos ne rendent pas justice à ce que vous faites. On capte ce qui vous représente.'),
  ('about_titre',             'Le vrai problème est rarement celui qu''on pense.'),
  ('about_texte',             'On prend le temps de regarder ce qui vous freine pour vrai, puis on le règle avec vous, jamais à votre place. Pas une présence en ligne de plus à cocher sur une liste, une qui travaille vraiment pour vous.'),
  ('cta_principal_titre',     'On regarde votre cas, gratuitement.'),
  ('cta_principal_sous_titre','30 minutes pour comprendre ce qui vous freine et vous dire, concrètement, ce qu''on ferait. Sans engagement.'),
  ('sites_hero_titre',        'Un site qui travaille pour votre commerce.'),
  ('sites_hero_sous_titre',   'Création ou refonte, on s''occupe de tout. Un site clair, rapide, fait pour vous amener des clients. Payé une fois, aucuns frais mensuels.'),
  ('sites_comment_titre',     'Vous voyez votre site avant de décider quoi que ce soit.'),
  ('sites_realisation_titre', 'Des vrais sites, pour des vrais commerces d''ici.'),
  ('sites_offre_titre',       'Tout ce qu''il faut, rien de superflu.'),
  ('sites_offre_prix',        '500$'),
  ('sites_cta_titre',         'Voyez votre site, puis décidez.'),
  ('sites_cta_sous_titre',    '30 minutes pour comprendre votre commerce. On vous montre ce qu''on ferait, sans engagement.'),
  ('auto_hero_titre',         'Arrêtez de courir après votre propre business.'),
  ('auto_hero_sous_titre',    'Ce qui se répète vous gruge en silence. On le règle, pour que votre business arrête de mener vos journées.'),
  ('auto_pattern_titre',      'Vous le sentez sans toujours le voir.'),
  ('auto_pattern_texte',      'Une partie de votre travail revient sans arrêt, les mêmes gestes, chaque semaine, sans que vous y pensiez. Pris un par un, ça a l''air de rien. Mis bout à bout, ça vous vole vos soirées et votre tête. On regarde ce qui tourne en boucle chez vous, précisément, puis on l''enlève.'),
  ('auto_comment_titre',      'On regarde votre cas, pas un cas type.'),
  ('auto_reassurance_titre',  'Vous gardez la main, on enlève juste le poids.'),
  ('auto_reassurance_texte',  'On ne touche pas à ce qui fait votre valeur, votre contact, votre jugement, votre métier. On enlève ce qui se répète, pour que vous reveniez à ce que vous faites de mieux.'),
  ('auto_cta_titre',          'Reprenez le dessus.'),
  ('auto_cta_sous_titre',     '30 minutes pour repérer ce qui vous gruge en silence et ce qu''on pourrait régler. Sans engagement.'),
  ('photo_hero_titre',        'Une image à la hauteur de ce que vous bâtissez.'),
  ('photo_hero_sous_titre',   'Photo et vidéo qui montrent votre commerce sous son vrai jour, pour votre site, vos réseaux et vos campagnes.'),
  ('photo_ref_titre',         'Quelques entreprises avec qui nous avons collaboré.'),
  ('photo_usages_titre',      'Du contenu qui sert, pas juste qui décore.'),
  ('photo_cta_titre',         'Montrez ce que vous faites de mieux.'),
  ('photo_cta_sous_titre',    '30 minutes pour parler de vos besoins en photo et vidéo. Sans engagement.')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_colors (key, value, label) VALUES
  ('primary',    '#1b2a47', 'Couleur principale'),
  ('brand',      '#3557d4', 'Couleur accent'),
  ('background', '#ffffff', 'Fond'),
  ('foreground', '#1b2333', 'Texte'),
  ('cream',      '#f4f7fc', 'Fond secondaire'),
  ('accent',     '#e8effe', 'Accent doux')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_info (key, value) VALUES
  ('nom',           'Norvika'),
  ('email',         'info@norvika.ca'),
  ('telephone',     '438 522 4275'),
  ('lien_rdv',      'https://calendar.app.google/W5SS5UmnJCTLXhw8A'),
  ('lien_portfolio','https://norvika.myportfolio.com/'),
  ('description',   'Présence numérique pour les entreprises et les travailleurs autonomes.')
ON CONFLICT (key) DO NOTHING;
