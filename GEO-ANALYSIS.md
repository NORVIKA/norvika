# norvika.ca — visibilité dans les réponses des IA (GEO/AEO)

Audit du 2026-08-21, fait sur le domaine en ligne, pas sur le dossier local.
Cadre : le guide d'optimisation IA de Google, qui rappelle que « GEO » et « AEO »
sont des étiquettes neuves posées sur du référencement classique.

## Note globale : 45 / 100

| Critère | Poids | Note | Ce qui la fixe |
|---|---|---|---|
| Accès technique | 20 | **4** | Les robots d'IA sont bloqués. Le reste est excellent. |
| Autorité et signaux de marque | 20 | 8 | Pas de date, pas de signature, schéma minimal |
| Citabilité des passages | 25 | 11 | De la prose de vente, très peu de faits vérifiables |
| Lisibilité structurelle | 20 | 13 | Hiérarchie propre, mais aucun titre en question |
| Contenu multi-format | 15 | 9 | Photos oui, vidéo non, un outil interactif oui |

## 1. Le seul point qui compte vraiment

**Les robots d'IA sont interdits d'entrée.** Le `robots.txt` servi contient un
bloc « Cloudflare Managed content » avec `Disallow: /` pour **GPTBot,
ClaudeBot, Google-Extended, CCBot, meta-externalagent, Applebot-Extended,
Bytespider, Amazonbot** et le robot de rendu de Cloudflare.

Tout le reste de ce rapport est théorique tant que ce point n'est pas tranché :
on peut écrire les meilleurs passages du monde, aucun assistant n'ira les lire.

Le blocage vient du réglage **« robots.txt setting »** du tableau de bord
Cloudflare, pas du dépôt. Il est groupé : on ne peut pas garder la préférence
« pas d'entraînement » sans garder aussi les `Disallow`. C'est pour ça que le
dépôt sert maintenant son propre `robots.txt` avec
`Content-Signal: search=yes, ai-input=yes, ai-train=no, use=reference`, qui dit
exactement « citez-moi, n'entraînez pas ». Il prendra effet dès que le réglage
Cloudflare sera désactivé.

## 2. Ce qui est déjà bon, et qu'on ne touche pas

- **Rendu côté serveur.** Les robots d'IA n'exécutent pas de JavaScript. Ici le
  HTML brut porte déjà tout le texte : 632 mots sur l'accueil, 656 sur l'équipe,
  319 sur une fiche de réalisation. Rien ne dépend de l'hydratation.
- **Hiérarchie des titres propre** sur toutes les pages : un seul H1, des H2 qui
  découpent, des H3 qui détaillent.
- **22 fiches de réalisations** structurées pareil (le besoin, ce qu'on a fait,
  le résultat). C'est exactement la forme qu'un assistant sait extraire.
- **Un outil interactif** (le diagnostic en 7 questions), rare sur un site
  d'agence et bon pour la sélection multi-format.

## 3. Les cinq changements à plus fort effet

| # | Quoi | Effort | Pourquoi |
|---|---|---|---|
| 1 | Rouvrir les robots d'IA dans Cloudflare | 2 min | Débloque tout le reste |
| 2 | Ajouter `aggregateRating` au schéma | 15 min | La page affiche « 5,0 sur 6 avis » sans le déclarer nulle part |
| 3 | Ajouter `sameAs` (LinkedIn, YouTube, fiche Google) | 20 min | C'est ce qui relie l'entité « Norvika » à ses mentions ailleurs |
| 4 | Dater les fiches de réalisations | 1 h | Un contenu de moins de 3 mois est ~3x plus cité |
| 5 | Une section « questions fréquentes » par page de service | 3 h | Les titres en question correspondent aux requêtes réelles |

## 4. Le schéma actuel, et ce qui lui manque

`ProfessionalService` est présent sur toutes les pages, avec le nom, l'URL, le
courriel, le téléphone, la zone servie, les services et les deux fondateurs.
Il lui manque :

- `aggregateRating` — la note Google est affichée à l'écran mais invisible aux machines
- `sameAs` — aucun lien vers LinkedIn, YouTube, la fiche Google
- `address` — pas d'adresse, alors que le positionnement est local (Rive-Sud)
- `Article` ou `CreativeWork` sur les fiches de réalisations, qui héritent du
  schéma générique de l'agence au lieu de décrire le mandat

## 5. Ce qui pèse le plus lourd, et qui n'est pas technique

Les citations par les IA corrèlent **trois fois plus** avec les mentions de
marque qu'avec les liens entrants, et la corrélation la plus forte vient de
YouTube. Norvika tourne déjà de la vidéo pour ses clients. La chaîne YouTube et
les mentions Reddit valent plus, pour la visibilité IA, que n'importe quelle
optimisation de balise sur ce site.

## 6. `llms.txt`

Absent. Google a écrit noir sur blanc que le fichier est **ignoré** par sa
recherche, y compris ses fonctions génératives, et qu'il ne peut ni aider ni
nuire. À poser seulement si on vise des services non-Google, jamais comme
levier de classement.
