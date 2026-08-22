/**
 * Liens externes du site, a un seul endroit.
 *
 * ⚠️ Le lien de rendez-vous existe AUSSI dans Supabase (`site_info.lien_rdv`) et
 * la page /contact le lit encore de la. Depuis la refonte, les pages viennent de
 * la maquette et leur contenu vit dans le code : elles utilisent donc la
 * constante ci-dessous. Si le lien change, il faut le changer AUX DEUX endroits,
 * ou trancher lequel des deux fait foi (voir le backlog du tracker).
 */
export const LIEN_RDV = "https://calendar.app.google/W5SS5UmnJCTLXhw8A";
