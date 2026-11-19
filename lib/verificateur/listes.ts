/**
 * Vérificateur Loi 25 : les listes de signatures (témoins, domaines de suivi, outils de
 * consentement, services tiers). SERVEUR SEULEMENT.
 *
 * Point de départ : _admin/check-loi25.sh (préfixes `TRACEURS` et domaines `DOMAINES`), élargi
 * aux outils nommés dans le cahier des charges (Hotjar, Clarity, TikTok, LinkedIn, Pinterest).
 *
 * ⚠️ VOLONTAIREMENT RESTREINT, comme dans check-loi25.sh : un témoin de session, de panier ou de
 * langue est ESSENTIEL et n'a pas besoin de consentement. Élargir à l'aveugle produirait des faux
 * « à corriger », et un outil qui crie au loup finit ignoré. Une signature s'ajoute ici quand on
 * l'a vue sur un vrai site, avec son nom.
 */

/** Préfixes de témoins de mesure ou de publicité (non essentiels). Comparés au début du nom. */
export const PREFIXES_TEMOINS_SUIVI = [
  "_ga", // Google Analytics (_ga, _ga_XXXX)
  "_gid", // Google Analytics
  "_gat", // Google Analytics (limitation)
  "_gcl", // Google Ads (_gcl_au, _gcl_aw)
  "_fbp", // Meta (Facebook) pixel
  "_fbc", // Meta (Facebook) clic publicitaire
  "__kla", // Klaviyo
  "_hj", // Hotjar
  "_clck", // Microsoft Clarity
  "_clsk", // Microsoft Clarity
  "_uet", // Microsoft Ads
  "_pin", // Pinterest
  "_ttp", // TikTok
  "_tt_", // TikTok
  "ttcsid", // TikTok
  "li_fat_id", // LinkedIn
  "ajs_", // Segment
  "amplitude", // Amplitude
  "mp_", // Mixpanel
  "_scid", // Snapchat
  "_rdt_", // Reddit
  "__hstc", // HubSpot
  "hubspotutk", // HubSpot
  "_hp2_", // Heap
];

/** Témoins de suivi déposés par le domaine de l'outil lui-même (témoins tiers), par nom exact. */
export const TEMOINS_SUIVI_EXACTS = [
  "IDE", // Google DoubleClick (doubleclick.net)
  "test_cookie", // Google DoubleClick
  "NID", // Google, publicité
  "fr", // Meta (facebook.com)
  "MUID", // Microsoft (bing.com, clarity.ms)
  "CLID", // Microsoft Clarity
  "bcookie", // LinkedIn
  "lidc", // LinkedIn
  "UserMatchHistory", // LinkedIn
  "bscookie", // LinkedIn
  "personalization_id", // X (Twitter)
  "guest_id", // X (Twitter)
  "_ttp", // TikTok
];

/** Domaines d'outils de mesure ou de publicité, avec le nom à afficher. Comparés au domaine et à ses sous-domaines. */
export const DOMAINES_SUIVI: [string, string][] = [
  ["google-analytics.com", "Google Analytics"],
  ["analytics.google.com", "Google Analytics"],
  ["googletagmanager.com", "Google Tag Manager"],
  ["doubleclick.net", "Google Ads (DoubleClick)"],
  ["googleadservices.com", "Google Ads"],
  ["googlesyndication.com", "Google AdSense"],
  ["connect.facebook.net", "Meta (Facebook) pixel"],
  ["facebook.com/tr", "Meta (Facebook) pixel"],
  ["static.klaviyo.com", "Klaviyo"],
  ["klaviyo.com", "Klaviyo"],
  ["hotjar.com", "Hotjar"],
  ["hotjar.io", "Hotjar"],
  ["clarity.ms", "Microsoft Clarity"],
  ["bat.bing.com", "Microsoft Ads"],
  ["analytics.tiktok.com", "TikTok pixel"],
  ["snap.licdn.com", "LinkedIn Insight"],
  ["px.ads.linkedin.com", "LinkedIn Insight"],
  ["ct.pinterest.com", "Pinterest"],
  ["s.pinimg.com", "Pinterest"],
  ["sc-static.net", "Snapchat pixel"],
  ["redditstatic.com", "Reddit pixel"],
  ["js.hs-scripts.com", "HubSpot"],
  ["js.hs-analytics.net", "HubSpot"],
  ["track.hubspot.com", "HubSpot"],
  ["cdn.segment.com", "Segment"],
  ["api.amplitude.com", "Amplitude"],
  ["cdn.mxpnl.com", "Mixpanel"],
  ["heapanalytics.com", "Heap"],
  ["stats.wp.com", "Jetpack Stats (WordPress)"],
];

/**
 * Services externes qui reçoivent l'adresse IP du visiteur dès le chargement, sans être des outils
 * de suivi (vérification 7). Liste V1 de Martin (contenu/verificateur-loi25-textes.md), et rien de
 * plus : le texte « en place » nomme ces familles (polices Google, YouTube, Vimeo, Google Maps,
 * réseaux sociaux). PAS de CDN généraux (Cloudflare, Sanity, jsDelivr) : trop de bruit, et le lieu
 * de traitement n'est pas connu d'avance.
 * `politique` : comment la politique du site nomme ce service (sinon, « à corriger »).
 */
export const SERVICES_EXTERNES: { motif: string; nom: string; politique: RegExp }[] = [
  { motif: "fonts.googleapis.com", nom: "Google Fonts", politique: /google\s*fonts|polices?\s+(de\s+)?google/i },
  { motif: "fonts.gstatic.com", nom: "Google Fonts", politique: /google\s*fonts|polices?\s+(de\s+)?google/i },
  { motif: "youtube.com", nom: "YouTube", politique: /youtube/i },
  { motif: "youtube-nocookie.com", nom: "YouTube", politique: /youtube/i },
  { motif: "ytimg.com", nom: "YouTube", politique: /youtube/i },
  { motif: "vimeo.com", nom: "Vimeo", politique: /vimeo/i },
  { motif: "vimeocdn.com", nom: "Vimeo", politique: /vimeo/i },
  { motif: "maps.googleapis.com", nom: "Google Maps", politique: /google\s*maps|cartes?\s+google/i },
  { motif: "maps.gstatic.com", nom: "Google Maps", politique: /google\s*maps|cartes?\s+google/i },
  { motif: "google.com/maps", nom: "Google Maps", politique: /google\s*maps|cartes?\s+google/i },
  { motif: "facebook.com/plugins", nom: "Facebook", politique: /facebook|\bmeta\b/i },
  { motif: "fbcdn.net", nom: "Facebook", politique: /facebook|\bmeta\b/i },
  { motif: "instagram.com", nom: "Instagram", politique: /instagram/i },
  { motif: "cdninstagram.com", nom: "Instagram", politique: /instagram/i },
  { motif: "tiktok.com/embed", nom: "TikTok", politique: /tiktok/i },
  { motif: "platform.linkedin.com", nom: "LinkedIn", politique: /linkedin/i },
  { motif: "platform.twitter.com", nom: "X (Twitter)", politique: /twitter|r[ée]seau\s+social\s+x\b/i },
  { motif: "syndication.twitter.com", nom: "X (Twitter)", politique: /twitter|r[ée]seau\s+social\s+x\b/i },
];

/**
 * Outils de consentement connus : domaine du script, ou sélecteur de la bannière dans la page.
 * Un seul signal suffit pour dire « un outil de consentement est installé ».
 */
export const OUTILS_CONSENTEMENT: { nom: string; domaines: string[]; selecteurs: string[] }[] = [
  { nom: "CookieYes", domaines: ["cdn-cookieyes.com"], selecteurs: [".cky-consent-container", "#cookie-law-info-bar"] },
  { nom: "Cookiebot", domaines: ["consent.cookiebot.com", "consentcdn.cookiebot.com"], selecteurs: ["#CybotCookiebotDialog"] },
  { nom: "OneTrust", domaines: ["cdn.cookielaw.org", "optanon.blob.core.windows.net"], selecteurs: ["#onetrust-banner-sdk", "#onetrust-consent-sdk"] },
  { nom: "Complianz", domaines: [], selecteurs: [".cmplz-cookiebanner", "#cmplz-cookiebanner-container"] },
  { nom: "Axeptio", domaines: ["static.axept.io", "client.axept.io"], selecteurs: ["#axeptio_overlay", ".axeptio_widget"] },
  { nom: "Didomi", domaines: ["sdk.privacy-center.org"], selecteurs: ["#didomi-host", "#didomi-notice"] },
  { nom: "Usercentrics", domaines: ["app.usercentrics.eu", "web.cmp.usercentrics.eu"], selecteurs: ["#usercentrics-root", "#usercentrics-cmp-ui"] },
  { nom: "Termly", domaines: ["app.termly.io"], selecteurs: ["#termly-code-snippet-support", "[class*='termly-styles']"] },
  { nom: "iubenda", domaines: ["cdn.iubenda.com", "cs.iubenda.com"], selecteurs: ["#iubenda-cs-banner"] },
  { nom: "CookieScript", domaines: ["cdn.cookie-script.com"], selecteurs: ["#cookiescript_injected"] },
  { nom: "Osano", domaines: ["cmp.osano.com"], selecteurs: [".osano-cm-window"] },
  { nom: "Quantcast Choice", domaines: ["cmp.quantcast.com"], selecteurs: [".qc-cmp2-container"] },
  { nom: "Borlabs Cookie", domaines: [], selecteurs: ["#BorlabsCookieBox"] },
  { nom: "Cookie Notice (WordPress)", domaines: [], selecteurs: ["#cookie-notice"] },
  { nom: "Real Cookie Banner (WordPress)", domaines: [], selecteurs: ["[id^='real-cookie-banner']"] },
  { nom: "GDPR Cookie Compliance (WordPress)", domaines: [], selecteurs: ["#moove_gdpr_cookie_info_bar"] },
  { nom: "tarteaucitron", domaines: [], selecteurs: ["#tarteaucitronRoot"] },
  { nom: "Klaro", domaines: [], selecteurs: [".klaro .cookie-notice", "#klaro"] },
  { nom: "Shopify", domaines: [], selecteurs: ["#shopify-pc__banner", ".shopify-pc__banner__dialog"] },
  { nom: "Wix", domaines: [], selecteurs: ["[data-hook='consent-banner-root']", "#ccsu-banner-text"] },
  { nom: "Squarespace", domaines: [], selecteurs: [".sqs-cookie-banner-v2", "#sqs-cookie-banner"] },
];

/** Texte d'un bouton ou d'un lien de refus, en français et en anglais. */
export const TEXTE_REFUS =
  /\b(tout\s+refuser|refuser(\s+tout)?|je\s+refuse|tout\s+rejeter|rejeter(\s+tout)?|non\s*,?\s*merci|continuer\s+sans\s+accepter|refuser\s+les\s+t[ée]moins|reject(\s+all)?|decline(\s+all)?|deny(\s+all)?|refuse)\b/i;

/** Texte d'un lien vers la politique de confidentialité. */
export const TEXTE_POLITIQUE =
  /(confidentialit[ée]|vie\s+priv[ée]e|renseignements\s+personnels|protection\s+des\s+(donn[ée]es|renseignements)|privacy|donn[ée]es\s+personnelles)/i;

/** Adresse d'une page de politique, quand le texte du lien ne dit rien (une icône, « Légal »). */
export const ADRESSE_POLITIQUE = /(confidentialite|confidentialit%c3%a9|vie-privee|privacy|politique-de-confidentialite|renseignements-personnels|protection-des-donnees|policies\/privacy-policy)/i;

/** Mots qui disent qu'une boîte flottante parle de témoins (bannière maison, sans outil connu). */
export const TEXTE_BANNIERE = /(t[ée]moins|cookies?|traceurs)/i;

/** Ce qu'on cherche dans la politique (vérifications 4, 5 et 6). */
export const MOTIFS_POLITIQUE = {
  responsable:
    /(responsable\s+de\s+la\s+protection\s+des\s+(renseignements\s+personnels|donn[ée]es)|personne\s+responsable\s+de\s+la\s+protection|d[ée]l[ée]gu[ée]\s+[àa]\s+la\s+protection\s+des\s+donn[ée]es|responsable\s+de\s+la\s+vie\s+priv[ée]e|privacy\s+officer|data\s+protection\s+officer|person\s+in\s+charge\s+of\s+the\s+protection\s+of\s+personal\s+information)/i,
  courriel: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  telephone: /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/,
  /**
   * Vérification 5, règle de Martin : « hors du Québec », « à l'extérieur du Québec », ou un pays
   * nommé comme lieu de traitement (les États-Unis, surtout) = en place.
   */
  horsQuebec:
    /(hors\s+du\s+qu[ée]bec|[àa]\s+l['’]ext[ée]rieur\s+du\s+qu[ée]bec|en\s+dehors\s+du\s+qu[ée]bec|hors\s+qu[ée]bec|ext[ée]rieur\s+du\s+qu[ée]bec|outside\s+(of\s+)?(the\s+province\s+of\s+)?qu[ée]bec|[ée]tats-unis|united\s+states|[ée]-?u\.|union\s+europ[ée]enne|\beurope\b|irlande|ireland|allemagne|germany|pays-bas|netherlands|royaume-uni|united\s+kingdom|[àa]\s+l['’][ée]tranger|autres?\s+pays|other\s+countries|outside\s+canada)/i,
  /** Signal partiel : des fournisseurs ou un hébergement nommés sans lieu, ou « Canada » seul (l'Ontario, c'est hors du Québec). */
  ailleurs:
    /(fournisseurs?|h[ée]bergement|h[ée]berg[ée]e?s?|serveurs?|sous-traitants?|prestataires?\s+de\s+services|infonuagique|service\s+providers?|hosting|\bcanada\b)/i,
  acces: /(droit\s+d['’]acc[èe]s|acc[ée]der\s+[àa]\s+(vos|ces|aux|les)\s+(renseignements|donn[ée]es)|consulter\s+(vos|ces|les)\s+(renseignements|donn[ée]es)|demande\s+d['’]acc[èe]s|right\s+(of|to)\s+access|access\s+(to\s+)?your\s+(personal\s+)?(information|data))/i,
  rectification: /(rectifi|faire\s+corriger|corriger\s+(vos|ces|les)\s+(renseignements|donn[ée]es)|correction|rectify|correct\s+your)/i,
  retrait:
    /(retirer\s+(votre|son|leur)\s+consentement|retrait\s+(de\s+votre|du)\s+consentement|r[ée]voquer\s+(votre\s+)?consentement|withdraw\s+(your\s+)?consent|revoke\s+(your\s+)?consent)/i,
};
