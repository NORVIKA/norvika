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
 * ⚠️ CE QUI PROTÈGE LA VITESSE (accueil mobile à 98, 2026-11-17) :
 *  - le HTML livré ne contient QUE l'image d'attente, recadrée et réduite par le CDN de Sanity
 *    (portrait sur téléphone) puis copiée au build sur le domaine du site (lib/fond-video.ts).
 *    C'est elle, légère et prioritaire, qui devient l'élément LCP ;
 *  - la balise <video> n'est créée qu'APRÈS le chargement de la page, quand le navigateur est
 *    libre : ses 1,6 à 3,7 Mo ne disputent jamais la bande passante au premier écran ;
 *  - elle a exactement la taille de l'image : un candidat LCP de même taille ne remplace pas le
 *    précédent, donc la vidéo qui arrive plus tard ne repousse pas le LCP.
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
  const pleine = tailles.find((t) => !t.portrait && t.largeur === 1440);
  const repli = pleine ? `${CHEMIN_AFFICHE}/${pleine.fichier}` : affiche?.url;

  // 1. Choisir la vidéo une fois la page chargée et le navigateur libre, ou n'en choisir aucune.
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
    // Safari n'a pas requestIdleCallback : un court délai après le chargement en tient lieu.
    const auRepos = typeof window.requestIdleCallback === "function";
    let attente: number | null = null;
    const planifier = () => {
      attente = auRepos ? window.requestIdleCallback(choisir, { timeout: 2000 }) : window.setTimeout(choisir, 300);
    };
    if (document.readyState === "complete") planifier();
    else window.addEventListener("load", planifier, { once: true });
    mouvement.addEventListener("change", choisir);
    return () => {
      window.removeEventListener("load", planifier);
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
            {tailles.length ? <source media="(max-width: 767px)" srcSet={srcSetAffiche(tailles, true)} sizes="100vw" /> : null}
            <img
              src={repli}
              srcSet={tailles.length ? srcSetAffiche(tailles, false) : undefined}
              sizes="100vw"
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
