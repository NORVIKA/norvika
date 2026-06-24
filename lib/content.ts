export const defaultContent: Record<string, string> = {
  // Accueil
  hero_titre: "Votre business vaut mieux que sa présence en ligne.",
  hero_sous_titre: "On trouve ce qui vous freine, de votre site à vos tâches répétitives, puis on le règle avec vous.",
  hero_cta: "JE VEUX RÉUSSIR",
  pilliers_titre: "Trois points de friction, trois solutions.",
  pilliers_sous_titre: "On commence par le vrai problème, pas par une liste de services.",
  pillier_1_label: "Votre site",
  pillier_1_desc: "Pas de site, ou un site qui fait vieux. On vous monte une présence claire, à la hauteur de votre travail.",
  pillier_2_label: "Votre temps",
  pillier_2_desc: "Vous répétez les mêmes tâches à la main. On automatise ce qui peut l'être.",
  pillier_3_label: "Votre image",
  pillier_3_desc: "Vos photos et vidéos ne rendent pas justice à ce que vous faites. On capte ce qui vous représente.",
  about_titre: "Le vrai problème est rarement celui qu'on pense.",
  about_texte: "On prend le temps de regarder ce qui vous freine pour vrai, puis on le règle avec vous, jamais à votre place. Pas une présence en ligne de plus à cocher sur une liste, une qui travaille vraiment pour vous.",
  cta_principal_titre: "On regarde votre cas, gratuitement.",
  cta_principal_sous_titre: "30 minutes pour comprendre ce qui vous freine et vous dire, concrètement, ce qu'on ferait. Sans engagement.",

  // Sites web
  sites_hero_titre: "Un site qui travaille pour votre commerce.",
  sites_hero_sous_titre: "Création ou refonte, on s'occupe de tout. Un site clair, rapide, fait pour vous amener des clients. Payé une fois, aucuns frais mensuels.",
  sites_comment_titre: "Vous voyez votre site avant de décider quoi que ce soit.",
  sites_realisation_titre: "Des vrais sites, pour des vrais commerces d'ici.",
  sites_offre_titre: "Tout ce qu'il faut, rien de superflu.",
  sites_offre_prix: "500$",
  sites_cta_titre: "Voyez votre site, puis décidez.",
  sites_cta_sous_titre: "30 minutes pour comprendre votre commerce. On vous montre ce qu'on ferait, sans engagement.",

  // Automatisation
  auto_hero_titre: "Arrêtez de courir après votre propre business.",
  auto_hero_sous_titre: "Ce qui se répète vous gruge en silence. On le règle, pour que votre business arrête de mener vos journées.",
  auto_pattern_titre: "Vous le sentez sans toujours le voir.",
  auto_pattern_texte: "Une partie de votre travail revient sans arrêt, les mêmes gestes, chaque semaine, sans que vous y pensiez. Pris un par un, ça a l'air de rien. Mis bout à bout, ça vous vole vos soirées et votre tête. On regarde ce qui tourne en boucle chez vous, précisément, puis on l'enlève.",
  auto_comment_titre: "On regarde votre cas, pas un cas type.",
  auto_reassurance_titre: "Vous gardez la main, on enlève juste le poids.",
  auto_reassurance_texte: "On ne touche pas à ce qui fait votre valeur, votre contact, votre jugement, votre métier. On enlève ce qui se répète, pour que vous reveniez à ce que vous faites de mieux.",
  auto_cta_titre: "Reprenez le dessus.",
  auto_cta_sous_titre: "30 minutes pour repérer ce qui vous gruge en silence et ce qu'on pourrait régler. Sans engagement.",

  // Photo et vidéo
  photo_hero_titre: "Une image à la hauteur de ce que vous bâtissez.",
  photo_hero_sous_titre: "Photo et vidéo qui montrent votre commerce sous son vrai jour, pour votre site, vos réseaux et vos campagnes.",
  photo_ref_titre: "Quelques entreprises avec qui nous avons collaboré.",
  photo_usages_titre: "Du contenu qui sert, pas juste qui décore.",
  photo_cta_titre: "Montrez ce que vous faites de mieux.",
  photo_cta_sous_titre: "30 minutes pour parler de vos besoins en photo et vidéo. Sans engagement.",
};

export const defaultSiteInfo: Record<string, string> = {
  nom: "Norvika",
  email: "info@norvika.ca",
  telephone: "438 522 4275",
  lien_rdv: "https://calendar.app.google/W5SS5UmnJCTLXhw8A",
  lien_portfolio: "https://norvika.myportfolio.com/",
  description: "Présence numérique pour les entreprises et les travailleurs autonomes.",
};

export const defaultColors: Record<string, string> = {
  primary: "#1b2a47",
  brand: "#3557d4",
  background: "#ffffff",
  foreground: "#1b2333",
  cream: "#f4f7fc",
  accent: "#e8effe",
};

// Images gérables depuis l'admin — fallback sur les fichiers locaux
export const defaultImages: Record<string, string> = {
  logo: "/images/logo.png",
  fondateurs: "/images/fondateurs.png",
  realisation_desjardins: "/images/realisation-desjardins.jpg",
  realisation_loud: "/images/realisation-loud.jpg",
  realisation_anytime: "/images/realisation-anytime.jpg",
};

// Métadonnées d'affichage pour le panneau /admin/images
export const IMAGE_FIELDS: { key: string; label: string; hint: string }[] = [
  { key: "logo", label: "Logo (en-tête et pied de page)", hint: "PNG transparent, format large" },
  { key: "fondateurs", label: "Photo des fondateurs (page Accueil)", hint: "Portrait vertical" },
  { key: "realisation_desjardins", label: "Réalisation 1 — Photo/vidéo", hint: "Format paysage 16:9" },
  { key: "realisation_loud", label: "Réalisation 2 — Photo/vidéo", hint: "Format paysage 16:9" },
  { key: "realisation_anytime", label: "Réalisation 3 — Photo/vidéo", hint: "Format paysage 16:9" },
];
