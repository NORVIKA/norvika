/**
 * Bande de photos du hero, en attendant la video showreel.
 *
 * POURQUOI ELLE EXISTE : le hero etait du texte seul (titre, sous-titre, deux
 * boutons) et la page n'offrait AUCUNE preuve avant la bande de logos, tres
 * bas. Un visiteur qui lit « vos courtiers des outils numeriques » n'a rien vu
 * de concret. Ces cinq photos sont du vrai travail livre : un plat, un enfant,
 * un espresso, une scene, une table. Elles occupent exactement le creneau que
 * la video prendra.
 *
 * QUAND LA VIDEO ARRIVERA : remplacer le contenu de ce fichier par le lecteur,
 * rien d'autre a toucher dans app/Content.tsx. Garder les memes proportions
 * (bande large, hauteur ~190px sur ordinateur) pour eviter un saut de mise en
 * page.
 *
 * TROIS CONTRAINTES RESPECTEES, et elles ne sont pas negociables :
 * 1. LCP. Le hero est note 94-99 sur telephone. Les cinq images pesent 67 Ko
 *    en tout : redimensionnees a 380px de haut, pas les originales de 1800px.
 *    Elles sont en chargement DIFFERE, ce qui les met en priorite basse sans
 *    les retarder (le navigateur charge tout de suite ce qui est a moins de
 *    ~1250px de l'ecran). Sur ordinateur elles sont dans le premier ecran,
 *    mais le bloc de titre reste plus grand qu'elles : c'est lui qui demeure
 *    l'element mesure par le LCP. Sur telephone, elles sont loin dessous.
 * 2. CLS. Chaque image porte ses dimensions reelles en attribut. Le navigateur
 *    reserve la place avant meme d'avoir le fichier, donc rien ne saute.
 * 3. Motion. UNE seule animation d'entree, sur le conteneur, pas cinq. Le
 *    reglage `data-reveal="hero"` rend l'element opaque des la premiere image
 *    et n'anime que le deplacement : aucune attente du JavaScript.
 *    Aucune animation en boucle : une bande qui defile a l'infini distrait et
 *    n'apporte rien ici.
 */

const PHOTOS = [
  {
    src: "/assets/hero-supergolf.webp",
    largeur: 570,
    hauteur: 380,
    alt: "Burgers et frites du menu Super Golf",
  },
  {
    src: "/assets/hero-lylou.webp",
    largeur: 380,
    hauteur: 380,
    alt: "Enfant avec un popsicle chez Lylou desserts glacés",
  },
  {
    src: "/assets/hero-qg.webp",
    largeur: 254,
    hauteur: 380,
    alt: "Extraction d'espresso au QG du Vieux Beloeil",
  },
  {
    src: "/assets/hero-loud.webp",
    largeur: 506,
    hauteur: 380,
    alt: "Conférencier sur scène lors d'un événement LOUD",
  },
  {
    // Masquee sur telephone : la mosaique y tient sur deux colonnes, donc
    // quatre photos. Masquee par CSS plutot que retiree du HTML, pour que le
    // texte alternatif reste identique partout.
    src: "/assets/hero-cracheur.webp",
    largeur: 380,
    hauteur: 380,
    alt: "Verre de vin et plats au Cracheur de feu",
    cacheeSurTelephone: true,
  },
];

export function BandeTravail() {
  return (
    <div data-reveal="hero" className="nv-bande-travail">
      {PHOTOS.map((p) => (
        <img
          key={p.src}
          src={p.src}
          width={p.largeur}
          height={p.hauteur}
          alt={p.alt}
          loading="lazy"
          decoding="async"
          className={p.cacheeSurTelephone ? "nv-bande-cachee-mobile" : undefined}
        />
      ))}
    </div>
  );
}
