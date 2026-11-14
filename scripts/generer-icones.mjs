#!/usr/bin/env node
/**
 * Icônes du site, tirées du symbole Norvika (public/icon.svg, vectoriel) :
 * symbole crème sur un carré navy PLEIN. Avant, le favicon était le symbole crème
 * sur fond TRANSPARENT : invisible dans un onglet clair. Le document de référence
 * exige un logo sur fond plein, visible dans un onglet sombre ET clair.
 *
 * Écrit :
 *   app/favicon.ico      16, 32, 48 (PNG dans un ICO), servi à /favicon.ico
 *   app/icon.png         512, lu par Next comme <link rel="icon">
 *   app/apple-icon.png   180, écran d'accueil du téléphone
 *   public/apple-touch-icon.png  180, l'adresse que iOS demande par défaut
 *
 * À relancer si le symbole change : node scripts/generer-icones.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const racine = path.resolve(import.meta.dirname, "..");
const NAVY = "#0C192F"; // --navy de globals.css
const CREME = "#F5F3EE"; // --cream de globals.css

// Le SVG source est le symbole en encre (#1D1D1B) : on le recolore en crème.
const svg = readFileSync(path.join(racine, "public/icon.svg"), "utf8").replace(/#1D1D1B/gi, CREME);
const symbole = await sharp(Buffer.from(svg), { density: 600 }).trim().png().toBuffer();

async function carre(taille, marge, arrondi) {
  const interieur = Math.round(taille * (1 - marge * 2));
  const dessin = await sharp(symbole)
    .resize(interieur, interieur, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  const r = Math.round(taille * arrondi);
  const fond = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${taille}" height="${taille}"><rect width="${taille}" height="${taille}" rx="${r}" fill="${NAVY}"/></svg>`,
  );
  return sharp(fond).composite([{ input: dessin, gravity: "center" }]).png().toBuffer();
}

writeFileSync(path.join(racine, "app/icon.png"), await carre(512, 0.18, 0.22));
const pomme = await carre(180, 0.16, 0); // iOS arrondit lui-même les coins
writeFileSync(path.join(racine, "app/apple-icon.png"), pomme);
writeFileSync(path.join(racine, "public/apple-touch-icon.png"), pomme);

// ICO : en-tête de 6 octets, une entrée de 16 octets par taille, puis les PNG.
const tailles = [16, 32, 48];
const pngs = await Promise.all(tailles.map((t) => carre(t, 0.12, 0.18)));
const entete = Buffer.alloc(6 + 16 * tailles.length);
entete.writeUInt16LE(0, 0);
entete.writeUInt16LE(1, 2);
entete.writeUInt16LE(tailles.length, 4);
let decalage = entete.length;
tailles.forEach((t, i) => {
  const o = 6 + i * 16;
  entete.writeUInt8(t, o);
  entete.writeUInt8(t, o + 1);
  entete.writeUInt8(0, o + 2);
  entete.writeUInt8(0, o + 3);
  entete.writeUInt16LE(1, o + 4);
  entete.writeUInt16LE(32, o + 6);
  entete.writeUInt32LE(pngs[i].length, o + 8);
  entete.writeUInt32LE(decalage, o + 12);
  decalage += pngs[i].length;
});
writeFileSync(path.join(racine, "app/favicon.ico"), Buffer.concat([entete, ...pngs]));
console.log("app/favicon.ico, app/icon.png, app/apple-icon.png, public/apple-touch-icon.png écrits.");
