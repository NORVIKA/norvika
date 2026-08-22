# Modifier norvika.ca

Ce document s'adresse à quelqu'un qui n'a jamais touché au dépôt. Il ne contient
aucun mot de passe ni aucune clé : tous les accès se demandent à William, qui
envoie des invitations nominatives.

## Ce qu'il faut avant de commencer

| Quoi | Comment on l'obtient |
|---|---|
| Un compte GitHub | github.com/signup, puis William vous invite sur le dépôt |
| Un accès Cloudflare | William vous invite sur le compte Norvika |
| Node.js 22 ou plus | nodejs.org, ou `brew install node` |
| Git | déjà installé sur macOS, sinon `xcode-select --install` |

## Installer le projet, une seule fois

```sh
git clone https://github.com/NORVIKA/norvika.git
cd norvika
git checkout next16-migration
npm install
```

⚠️ **`next16-migration` est la branche de production**, pas `main`. `main` est
restée sur une vieille version et ne reflète plus ce qui est en ligne.

## Travailler

```sh
npm run dev
```

Le site tourne sur http://localhost:3000. Tout changement enregistré s'affiche
tout de suite. **Travaillez toujours en local d'abord** : frapper le site en
ligne pendant les essais est ce qui l'a déjà fait tomber en erreur 1102.

### Où se trouve quoi

| Ce que vous voulez changer | Le fichier |
|---|---|
| Le texte d'une page | `app/<nom-de-la-page>/Content.tsx` |
| Le texte de l'accueil | `app/Content.tsx` |
| Les fiches de réalisations | `lib/realisations.ts` |
| Le menu, le pied de page | `components/site/SiteHeader.tsx`, `SiteFooter.tsx` |
| Les couleurs, les polices, les animations | `app/globals.css` |
| Les images | `public/assets/` |
| Le titre et la description Google d'une page | `app/<page>/page.tsx` |

### Deux règles d'écriture, non négociables

1. **Aucun tiret cadratin (—) ni demi-cadratin (–)** dans le texte affiché.
   C'est la signature « écrit par une IA ». Une virgule, un point, deux points,
   des parenthèses, ou deux phrases courtes. Le trait d'union normal reste bon.
2. **Une nouvelle image se redimensionne et se convertit en WebP** avant d'être
   ajoutée. Une photo de téléphone fait 4 Mo et ralentit la page pour tout le
   monde.

## Publier

```sh
git add -A
git commit -m "Ce que j'ai changé, en une phrase"
git push origin next16-migration
```

**C'est tout.** Une action GitHub construit et déploie automatiquement, puis
vérifie que le site répond. Environ deux minutes.

Si quelque chose ne va pas (une faute de frappe qui casse la construction),
l'action échoue et **le site en ligne ne bouge pas**. On corrige, on renvoie.
Le suivi est ici : https://github.com/NORVIKA/norvika/actions

⚠️ **Ne jamais lancer `npx wrangler deploy` à la main.** Cette commande ne
construit rien : elle renvoie en ligne le dossier local tel qu'il est, qui peut
dater d'avant vos changements. Le site se met alors à jour... avec l'ancien
code, sans le moindre message d'erreur. C'est arrivé. L'action existe pour ça.

## Quand on est deux à travailler

Avant de commencer, toujours :

```sh
git pull origin next16-migration
```

Sinon vos deux versions se croisent et git demande de démêler. Si ça arrive et
que ce n'est pas clair, arrêtez-vous et demandez plutôt que de deviner : rien
n'est perdu, un envoi non résolu ne casse rien.
