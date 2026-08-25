/**
 * Trois sites clients, dans le creneau de la future video.
 *
 * POURQUOI CEUX-LA, ET POURQUOI TROIS.
 * Le hero promet : « chaque entreprise est differente, la votre aussi, pis on
 * batit une offre qui vous ressemble ». Cette phrase ne se demontre pas avec
 * une photo. Elle se demontre en mettant cote a cote un casse-croute, un
 * garage et un verger : trois commerces d'ici qui n'ont RIEN en commun, et
 * trois sites qui ne se ressemblent pas non plus. Le visuel dit exactement ce
 * que le titre dit. C'est ca, la preuve.
 *
 * Trois, pas cinq : plus larges, donc les titres restent lisibles et
 * l'ensemble reste calme.
 *
 * Pas d'etiquettes sous les captures. Le contenu des images dit deja
 * « vrais commerces locaux » ; nommer chacun ferait basculer le bloc du cote
 * « grille de portfolio », et la video qui viendra n'aura pas d'etiquettes non
 * plus.
 *
 * QUAND LA VIDEO ARRIVERA : remplacer le contenu de ce fichier, rien d'autre a
 * toucher dans app/Content.tsx.
 *
 * ⚠️ Ce sont des captures FIGEES (aout 2026), pas un service de capture en
 * direct. Un service tiers dans le hero, c'est une dependance de plus qui peut
 * ralentir ou tomber. A refaire si un de ces sites change de visage.
 */

const SITES = [
  {
    src: "/assets/site-pataphil.webp",
    alt: "Site de Pataphil, casse-croûte de Saint-Hyacinthe, réalisé par Norvika",
  },
  {
    src: "/assets/site-garage.webp",
    alt: "Site du Garage La Touche Finale, mécanique générale, réalisé par Norvika",
  },
  {
    // Masque sur telephone : deux captures suffisent a montrer l'ecart de
    // style, et trois empilees pousseraient tout le reste trop bas.
    src: "/assets/site-verger.webp",
    alt: "Site du Verger François Legault, autocueillette, réalisé par Norvika",
    cacheSurTelephone: true,
  },
];

export function VitrineSites() {
  return (
    <div data-reveal="hero" className="nv-vitrine">
      {SITES.map((s) => (
        <img
          key={s.src}
          src={s.src}
          width={710}
          height={444}
          alt={s.alt}
          loading="lazy"
          decoding="async"
          className={s.cacheSurTelephone ? "nv-vitrine-cachee-mobile" : undefined}
        />
      ))}
    </div>
  );
}
