#!/usr/bin/env node
/**
 * Garde-fou de contenu, lancé sur le SITE RENDU (Worker local, préversion, production).
 * Modèle : crossfit-sainte-foy/scripts/verifier-contenu.mjs (lui-même tiré de la boulangerie).
 *
 *   node scripts/verifier-contenu.mjs [url-de-base]        (défaut : http://127.0.0.1:8792)
 *
 * Les pages viennent du sitemap.xml (toutes, sans liste à tenir), plus les pages cachées de
 * Google (/bienvenue, /politique-de-confidentialite) et la page introuvable.
 * Ce qu'il refuse, dans le texte AFFICHÉ de chaque page (balises, scripts et styles retirés) :
 *   1. un tiret cadratin ou demi-cadratin (la signature « IA ») ;
 *   2. le mot banni par la règle d'agence du 2026-09-08 ;
 *   3. toute flèche (règle 9) ;
 *   4. une apostrophe droite (') : le site rend les apostrophes typographiques (lib/typographie.ts),
 *      une apostrophe droite trahit un texte qui passe à côté ;
 *   5. autre chose qu'exactement un <h1>, et une image sans attribut alt.
 * Le site de Norvika ne porte pas la signature « Conception par Norvika » (exception de CLAUDE.md) :
 * elle n'est pas vérifiée ici. Les longueurs de titre et de description relèvent de la phase 5.
 * Une seule passe, requêtes espacées (règle 1102).
 */
const base = (process.argv.slice(2).find((a) => /^https?:\/\//.test(a)) ?? 'http://127.0.0.1:8792').replace(/\/$/, '')
const attendre = (ms) => new Promise((r) => setTimeout(r, ms))

const decoder = (t) =>
  t
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')

const sitemap = await (await fetch(`${base}/sitemap.xml`)).text()
const routes = [...new Set([...sitemap.matchAll(/<loc>https?:\/\/[^/<]+(\/[^<]*)?<\/loc>/g)].map((m) => m[1] ?? '/'))]
if (routes.length < 5 || !routes.includes('/')) {
  console.error(`⛔ sitemap.xml ne liste que ${routes.length} adresse(s)${routes.includes('/') ? '' : ', sans l’accueil'} : sitemap cassé.`)
  process.exit(1)
}
routes.push('/bienvenue', '/politique-de-confidentialite', '/page-introuvable-verification')

let echecs = 0
const probleme = (route, message) => {
  echecs += 1
  console.error(`  ✗ ${route} : ${message}`)
}
const FLECHES = /[←↑→↓↖↗↘↙⇐⇒⇠⇢➔➜➝➞➟➠⟵⟶⟹]/
const extrait = (texte, motif) => texte.match(new RegExp(`.{0,35}(?:${motif.source}).{0,35}`, motif.flags.replace('g', '')))?.[0]?.trim()

for (const route of routes) {
  const avant = echecs
  await attendre(250)
  const introuvable = route === '/page-introuvable-verification'
  const reponse = await fetch(`${base}${route}`, { redirect: 'manual' })
  if (reponse.status !== (introuvable ? 404 : 200)) {
    probleme(route, `HTTP ${reponse.status}`)
    continue
  }
  const html = await reponse.text()
  const corps = html.slice(Math.max(0, html.indexOf('<body')))
  const visible = corps.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<template[\s\S]*?<\/template>/g, '')
  const texte = decoder(visible.replace(/<[^>]+>/g, ' ')).replace(/[  ]/g, ' ').replace(/\s+/g, ' ')

  if (/[—–]/.test(texte)) probleme(route, `tiret cadratin ou demi-cadratin : « ${extrait(texte, /[—–]/)} »`)
  if (/\bunivers\b/i.test(texte)) probleme(route, 'mot banni par la règle d’agence du 2026-09-08')
  if (FLECHES.test(texte)) probleme(route, `flèche : « ${extrait(texte, FLECHES)} »`)
  const droites = texte.match(/'/g)?.length ?? 0
  if (droites) probleme(route, `${droites} apostrophe(s) droite(s), dont « ${extrait(texte, /'/)} »`)

  const h1 = (html.match(/<h1[\s>]/g) ?? []).length
  if (h1 !== 1) probleme(route, `${h1} balise(s) h1 (il en faut exactement une)`)
  const sansAlt = (visible.match(/<img (?![^>]*\balt=)[^>]*>/g) ?? []).length
  if (sansAlt) probleme(route, `${sansAlt} image(s) sans attribut alt`)
  if (echecs === avant) console.log(`  ✓ ${route}`)
}

console.log(`\n${routes.length} pages vérifiées.`)
if (echecs) {
  console.error(`⛔ ${echecs} problème(s).`)
  process.exit(1)
}
console.log('Aucun problème.')
