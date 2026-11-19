/**
 * Essai SANS réseau de la garde d'adresse du vérificateur Loi 25 (lib/verificateur/adresse.ts).
 * Toute régression de la première barrière anti-SSRF fait sortir ce script en erreur.
 *
 *   npx tsx scripts/verificateur/essai-adresse.ts
 */
import { ipReservee, normaliserAdresse } from "../../lib/verificateur/adresse";

let echecs = 0;
function attendre(nom: string, obtenu: unknown, voulu: unknown) {
  const ok = JSON.stringify(obtenu) === JSON.stringify(voulu);
  if (!ok) echecs++;
  console.log(`${ok ? "ok    " : "ÉCHEC "} ${nom} : ${JSON.stringify(obtenu)}${ok ? "" : ` (attendu ${JSON.stringify(voulu)})`}`);
}
const code = (s: string) => {
  const r = normaliserAdresse(s);
  return r.ok ? `ok:${r.url.href}` : r.code;
};

// Refus exigés par le cahier des charges.
attendre("http://127.0.0.1", code("http://127.0.0.1"), "ip");
attendre("http://169.254.169.254", code("http://169.254.169.254"), "ip");
attendre("http://[::1]", code("http://[::1]"), "ip");
attendre("port 8080", code("http://exemple.ca:8080"), "port");
attendre("file:", code("file:///etc/passwd"), "protocole");
attendre("ftp:", code("ftp://exemple.ca"), "protocole");
attendre("javascript:", code("javascript:alert(1)"), "protocole");
// Formes détournées d'IPv4 (URL les convertit en notation pointée).
attendre("décimal 2130706433", code("http://2130706433"), "ip");
attendre("hexa 0x7f.1", code("http://0x7f.1"), "ip");
attendre("octal 0177.0.0.1", code("http://0177.0.0.1"), "ip");
attendre("IPv6 mappée", code("http://[::ffff:127.0.0.1]"), "ip");
// Noms locaux.
attendre("localhost", code("localhost"), "nom-local");
attendre("x.localhost", code("http://admin.localhost"), "nom-local");
attendre(".local", code("imprimante.local"), "nom-local");
attendre(".internal", code("metadata.google.internal"), "nom-local");
attendre(".lan", code("routeur.lan"), "nom-local");
attendre("home.arpa", code("nas.home.arpa"), "nom-local");
attendre("nom sans point", code("intranet"), "nom-local");
// Identifiants, espaces.
attendre("identifiants", code("https://moi:secret@exemple.ca"), "identifiants");
attendre("espace", code("exemple .ca"), "forme");
attendre("vide", code("   "), "vide");
// Acceptés.
attendre("sans protocole", code("norvika.ca"), "ok:https://norvika.ca/");
attendre("http explicite (origine seulement)", code("http://exemple.ca/page?client=42#ancre"), "ok:http://exemple.ca/");
attendre("port 443 écrit", code("https://exemple.ca:443"), "ok:https://exemple.ca/");
attendre("nom avec port 443 sans protocole", code("exemple.ca:443/a"), "ok:https://exemple.ca/");
attendre("accent (punycode)", code("café-ok.ca"), "ok:https://xn--caf-ok-dva.ca/");

// Plages d'adresses (deuxième barrière, après DNS).
for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "224.0.0.1", "255.255.255.255", "::1", "::", "fe80::1", "fc00::1", "fd12:3456::1", "::ffff:10.0.0.1", "64:ff9b::7f00:1", "2001:db8::1", "2002:7f00:1::", "ff02::1", "pas-une-ip"]) {
  attendre(`réservée ${ip}`, ipReservee(ip), true);
}
for (const ip of ["104.21.3.4", "8.8.8.8", "172.32.0.1", "2606:4700::6810:1", "2a00:1450:4009::200e"]) {
  attendre(`publique ${ip}`, ipReservee(ip), false);
}

console.log(echecs ? `\n${echecs} échec(s).` : "\nTout passe.");
process.exit(echecs ? 1 : 0);
