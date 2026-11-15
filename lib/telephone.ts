/**
 * Le lien d'appel d'un numéro tel qu'il s'affiche (« 438 522 4275 »), DÉCLARÉ UNE FOIS : barre du
 * haut, page Contact, page Bienvenue. Format international (+1…), compris par tous les téléphones,
 * y compris hors du Canada et dans les logiciels d'appel des ordinateurs.
 */
export function lienTelephone(numero: string): string {
  const chiffres = numero.replace(/\D/g, "");
  if (chiffres.length === 10) return `tel:+1${chiffres}`;
  if (chiffres.length === 11 && chiffres.startsWith("1")) return `tel:+${chiffres}`;
  return `tel:${numero.trim().startsWith("+") ? "+" : ""}${chiffres}`;
}
