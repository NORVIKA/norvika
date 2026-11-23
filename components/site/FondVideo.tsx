"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { CHEMIN_AFFICHE, srcSetAffiche, variantesAffiche } from "@/lib/fond-video";
import { positionFocale, type FondVideo as Donnees, type Image } from "@/lib/types-contenu";

/**
 * Vidéo de fond du haut de l'accueil (« Vidéo de fond du haut de page » dans le Studio).
 *
 * Trois couches, de bas en haut : l'image d'attente, la vidéo, le voile bleu nuit (globals.css,
 * « Fond vidéo »). Le texte du haut de page passe par `children` et se pose au-dessus ; le bouton
 * pause vient APRÈS lui dans le HTML, sinon le bloc de texte, qui couvre le bas de la section sur
 * téléphone, recevrait ses clics.
 *
 * ⚠️ CE QUI PROTÈGE LA VITESSE (accueil mobile à 98 avant la vidéo) :
 *  - le HTML livré ne contient QUE l'image d'attente, recadrée et réduite par le CDN de Sanity
 *    puis copiée au build sur le domaine du site (lib/fond-video.ts). Sur ordinateur, nette, elle
 *    est l'élément LCP. Sur téléphone, c'est une image floue de 350 octets que Chrome refuse comme
 *    élément LCP (faible entropie) : le paragraphe le reste, comme avant la vidéo ;
 *  - ORDINATEUR : la balise <video> n'est créée qu'après le chargement de la page, quand le
 *    navigateur est libre. Elle fait 1 px de moins que l'affiche nette (globals.css) : un candidat
 *    LCP plus petit ne remplace pas le précédent, donc la vidéo ne repousse pas le LCP. À boîte
 *    égale, Chrome la comptait plus grande de 360 px² (arrondis) et elle prenait la place ;
 *  - TÉLÉPHONE : la vidéo attend en plus le PREMIER GESTE (toucher, défilement, clavier) et que le
 *    haut de page soit à l'écran. Mesuré le 2026-11-18 : lancée au chargement, sa première image
 *    devenait l'élément LCP (l'image floue ne compte pas, donc rien ne la précède de même taille) :
 *    Lighthouse mobile local à 81, LCP 5 s. Chrome cesse de mesurer le LCP au premier geste : la
 *    vidéo qui arrive après ne compte plus, et un visiteur qui repart sans toucher à rien ne
 *    télécharge pas 1,6 Mo. PageSpeed en ligne avec l'affiche nette comme élément LCP : 86.
 *
 * ⚠️ MOUVEMENT (WCAG 2.2.2 et 2.3.3) :
 *  - « moins d'animations » demandé à l'appareil, ou mode « économie de données » : l'image seule,
 *    la vidéo n'est même pas demandée au serveur ;
 *  - la boucle dure plus de 5 secondes : bouton pause, visible dès que la vidéo bouge ;
 *  - hors de l'écran, la vidéo s'arrête (batterie, données) et repart au retour, sauf si la
 *    personne l'a mise en pause elle-même.
 * Sans JavaScript : l'image et le voile, rien ne bouge.
 */

type Etat = "attente" | "lecture" | "pause";
type Lecteur = { source: string; etat: Etat; pret: boolean };

const LARGE = "(min-width: 768px)";
const MOINS_DE_MOUVEMENT = "(prefers-reduced-motion: reduce)";

export function FondVideo({ donnees, children }: { donnees?: Donnees | null; children: ReactNode }) {
  const affiche = donnees?.affiche?.url ? donnees.affiche : null;
  const ordinateur = donnees?.ordinateur || null;
  const mobile = donnees?.mobile || null;
  const pause = donnees?.boutonPause?.trim() || null;
  const lecture = donnees?.boutonLecture?.trim() || null;

  // Champs vides ou section décochée : le haut de page d'avant, sur son fond uni.
  if (!donnees || donnees.afficher === false || !(affiche || ordinateur || mobile)) return <>{children}</>;

  // Sans le texte du bouton pause, pas de vidéo : une boucle qu'on ne peut pas arrêter enfreint WCAG 2.2.2.
  const videos = pause && lecture && (ordinateur || mobile) ? { ordinateur, mobile, pause, lecture } : null;
  return (
    <Fond affiche={affiche} videos={videos}>
      {children}
    </Fond>
  );
}

function Fond({
  affiche,
  videos,
  children,
}: {
  affiche: Image | null;
  videos: { ordinateur: string | null; mobile: string | null; pause: string; lecture: string } | null;
  children: ReactNode;
}) {
  const cadre = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const pauseVolontaire = useRef(false);
  const [lecteur, setLecteur] = useState<Lecteur | null>(null);

  const ordinateur = videos?.ordinateur ?? null;
  const mobile = videos?.mobile ?? null;
  const source = lecteur?.source ?? null;

  // L'image d'attente, servie par le site (lib/fond-video.ts). Une adresse hors du projet Sanity,
  // improbable, garde son adresse d'origine.
  const tailles = variantesAffiche(affiche);
  const pleine = tailles.find((t) => t.role === "paysage" && t.largeur === 1440);
  const repli = pleine ? `${CHEMIN_AFFICHE}/${pleine.fichier}` : affiche?.url;

  // 1. Choisir la vidéo, ou n'en choisir aucune. Trois conditions : la page est chargée (et le
  //    navigateur libre), le haut de page est à l'écran, et sur téléphone, la personne a fait un
  //    premier geste (voir l'en-tête : sinon la vidéo devient l'élément LCP).
  useEffect(() => {
    if (!ordinateur && !mobile) return;
    const mouvement = window.matchMedia(MOINS_DE_MOUVEMENT);
    const choisir = () => {
      const economie = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
      if (mouvement.matches || economie) {
        setLecteur(null);
        return;
      }
      const large = window.matchMedia(LARGE).matches;
      const choix = large ? (ordinateur ?? mobile) : (mobile ?? ordinateur);
      setLecteur((l) => (l?.source === choix || !choix ? l : { source: choix, etat: "attente", pret: false }));
    };

    let charge = false;
    let geste = window.matchMedia(LARGE).matches;
    let aLEcran = true;
    // Safari n'a pas requestIdleCallback : un court délai en tient lieu. Le délai sert aussi au
    // téléphone : le geste est enregistré par Chrome avant que la vidéo ne soit demandée.
    const auRepos = typeof window.requestIdleCallback === "function";
    let attente: number | null = null;
    const essayer = () => {
      if (!charge || !geste || !aLEcran || attente !== null) return;
      attente = auRepos ? window.requestIdleCallback(choisir, { timeout: 2000 }) : window.setTimeout(choisir, 300);
    };

    const GESTES = ["pointerdown", "keydown", "wheel", "touchmove"] as const;
    const surGeste = () => {
      geste = true;
      GESTES.forEach((g) => window.removeEventListener(g, surGeste));
      essayer();
    };
    if (!geste) GESTES.forEach((g) => window.addEventListener(g, surGeste, { passive: true }));

    const c = cadre.current;
    const io =
      c && "IntersectionObserver" in window
        ? new IntersectionObserver(([e]) => {
            if (!e) return;
            aLEcran = e.isIntersecting;
            essayer();
          })
        : null;
    if (c) io?.observe(c);

    const surChargement = () => {
      charge = true;
      essayer();
    };
    if (document.readyState === "complete") surChargement();
    else window.addEventListener("load", surChargement, { once: true });
    mouvement.addEventListener("change", choisir);
    return () => {
      window.removeEventListener("load", surChargement);
      GESTES.forEach((g) => window.removeEventListener(g, surGeste));
      io?.disconnect();
      mouvement.removeEventListener("change", choisir);
      if (attente !== null) {
        if (auRepos) window.cancelIdleCallback(attente);
        else window.clearTimeout(attente);
      }
    };
  }, [ordinateur, mobile]);

  // 2. Lancer la lecture. Refusée (mode économie d'énergie d'un iPhone, par exemple) : l'image
  //    reste, et le bouton propose « Lecture ».
  useEffect(() => {
    const v = ref.current;
    if (!v || !source) return;
    v.muted = true;
    v.play().catch(() => setLecteur((l) => (l && l.etat === "attente" ? { ...l, etat: "pause" } : l)));
  }, [source]);

  // 3. Hors de l'écran : pause. De retour : lecture, sauf pause demandée par la personne.
  useEffect(() => {
    const v = ref.current;
    const c = cadre.current;
    if (!v || !c || !source || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e) return;
      if (!e.isIntersecting) {
        if (!v.paused) v.pause();
      } else if (v.paused && !pauseVolontaire.current) {
        v.play().catch(() => {});
      }
    });
    io.observe(c);
    return () => io.disconnect();
  }, [source]);

  const basculer = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      pauseVolontaire.current = false;
      v.play().catch(() => {});
    } else {
      pauseVolontaire.current = true;
      v.pause();
    }
  };

  return (
    <>
      <div ref={cadre} className="nv-fond-video" aria-hidden="true">
        {affiche ? (
          <picture>
            {/* Téléphone : l'image floue de 350 octets, que Chrome n'accepte pas comme élément LCP
                (lib/fond-video.ts) ; l'affiche nette seulement si l'appareil demande moins d'animations,
                puisque la vidéo ne viendra jamais. Le premier <source> qui correspond gagne. */}
            {tailles.length ? (
              <>
                <source media="(max-width: 767px) and (prefers-reduced-motion: no-preference)" srcSet={srcSetAffiche(tailles, "flou")} sizes="100vw" />
                <source media="(max-width: 767px)" srcSet={srcSetAffiche(tailles, "portrait")} sizes="100vw" />
              </>
            ) : null}
            {/* `sizes` : la largeur AFFICHÉE de l'affiche, pas celle de l'écran. Plein écran depuis le
                2026-11-23, elle couvre toute la hauteur : sur un écran moins allongé qu'elle (16:10,
                4:3), elle déborde sur les côtés et s'affiche plus large que 100vw (1600 px à 1440 x 900).
                Avec « 100vw », le navigateur prenait la version de 1440 px, agrandie ; Chrome compte une
                image agrandie pour moins que sa surface, et la vidéo (1920 px, jamais agrandie) devenait
                l'élément LCP : Lighthouse ordinateur, LCP de 0,69 s à 1,0 s, et en ligne, l'heure de la
                première image d'une vidéo de 3,6 Mo. Mesuré le 2026-11-23. */}
            <img
              src={repli}
              srcSet={tailles.length ? srcSetAffiche(tailles, "paysage") : undefined}
              sizes={`(min-aspect-ratio: ${affiche.largeur ?? 1920}/${affiche.hauteur ?? 1080}) 100vw, ${Math.ceil(((affiche.largeur ?? 1920) / (affiche.hauteur ?? 1080)) * 100)}vh`}
              alt=""
              width={affiche.largeur ?? 1920}
              height={affiche.hauteur ?? 1080}
              fetchPriority="high"
              style={{ objectPosition: positionFocale(affiche, "50% 50%") }}
            />
          </picture>
        ) : null}
        {lecteur ? (
          <video
            ref={ref}
            src={lecteur.source}
            data-pret={lecteur.pret ? "" : undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            onPlaying={() => setLecteur((l) => l && { ...l, etat: "lecture", pret: true })}
            onPause={() => setLecteur((l) => l && { ...l, etat: "pause" })}
            onError={() => setLecteur(null)}
          />
        ) : null}
      </div>
      {children}
      {videos && lecteur && lecteur.etat !== "attente" ? (
        <button type="button" className="nv-fond-video-bouton nv-cream-hover" data-etat={lecteur.etat} onClick={basculer}>
          <span className="nv-fond-video-signe" aria-hidden="true" />
          {/* Sur téléphone, le texte est caché à l'œil (globals.css) mais reste le nom du bouton. */}
          <span className="nv-fond-video-libelle">{lecteur.etat === "lecture" ? videos.pause : videos.lecture}</span>
        </button>
      ) : null}
    </>
  );
}
