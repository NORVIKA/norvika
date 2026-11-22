"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Etape } from "@/lib/types-contenu";
import { suivreApparitions } from "@/lib/useReveal";
import { useContenuGlobal } from "@/components/site/ContenuGlobal";

/**
 * « Comment ça marche » : le parcours en N étapes, partagé par l'accueil et les
 * pages de service. Styles des points, des libellés et de la pièce : app/globals.css,
 * « Parcours en étapes » (déclarés une seule fois, règle d'agence 5).
 *
 * Refait le 2026-11-22 (passe tablette de Pixel). Quatre défauts de la version précédente :
 *
 * 1. OSCILLATION ENTRE 808 ET 876 PX DE LARGE (iPad Air 820, iPad Pro 11 po 834). Le mode
 *    (vague ou colonne) se décidait sur la largeur du bloc, mais le bloc avait 34 px de marge de
 *    chaque côté en mode vague et aucune en colonne. Entre 760 et 828 px, chaque mode donnait une
 *    largeur qui réclamait l'autre : la section changeait de hauteur de 260 px plusieurs fois par
 *    seconde, ou se figeait dans le mauvais mode selon le moment. Maintenant le bloc a la même
 *    largeur dans les deux modes, et le mode se DÉDUIT de cette largeur au rendu (aucun état
 *    séparé qui pourrait se contredire).
 *
 * 2. LA PIÈCE CACHAIT LE LIBELLÉ DE L'ÉTAPE ACTIVE. Les libellés commençaient à 8 px du centre du
 *    point, alors que la pièce (goutte de 30 px tournée, anneau de 6 px) déborde de 21 à 25 px.
 *    Les dégagements ci-dessous sont mesurés sur la pièce, pas devinés.
 *
 * 3. LES LIBELLÉS TOMBAIENT SUR LA COURBE. Les points étaient posés à 1/4, 1/2 et 3/4 de la
 *    longueur, soit au milieu des montées, là où la courbe passe en diagonale : impossible de poser
 *    un libellé au-dessus ou au-dessous sans qu'elle le traverse. Les points sont maintenant les
 *    sommets et les creux de la vague, un sur deux en haut : la courbe s'éloigne du libellé des
 *    deux côtés. Les segments sont identiques, donc chaque point reste à i/(n-1) de la longueur
 *    (la pièce les rejoint en suivant le tracé, comme avant).
 *
 * 4. ÉTAPES À VENIR ILLISIBLES (1,9:1). Couleurs d'état dans globals.css, contraste mesuré.
 *
 * La vague garde la largeur de la tablette en portrait (règle 6 : optimiser la largeur, pas
 * empiler) : elle tient tant que deux libellés du même côté entrent côte à côte. La colonne
 * verticale ne reste que pour les téléphones.
 *
 * Les points et les libellés sont posés AU RENDU (largeur en %, hauteur en px), donc présents et
 * bien placés dans le HTML livré, avant le JavaScript. Le SVG s'étire à la largeur
 * (preserveAspectRatio "none", trait non déformé) : la courbe passe sur les points même avant la
 * mesure. Seule la pièce attend le JavaScript (elle est décorative).
 */

export type RoadStep = {
  num?: string;
  label: string;
  title: string;
  body: string;
};

/** Les étapes du Studio vers le parcours. Le libellé court reprend le titre s'il est vide. */
export const versRoadSteps = (etapes: Etape[]): RoadStep[] =>
  etapes.map((e) => ({ label: e.libelle || e.titre, title: e.titre, body: e.texte }));

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Largeur d'un libellé sur la vague. */
const LIB_L = 168;
/** Demi-cible du bouton (44 px de côté, règle tactile). */
const DEMI = 22;
// Dégagements mesurés sur la pièce : goutte de 30 px tournée de 45°, anneau blanc de 6 px.
// Vers le haut et les côtés elle déborde de 21 px du centre, sa pointe descend à 25 px.
/** Du centre du point au BAS d'un libellé posé au-dessus. */
const DEG_HAUT = 28;
/** Du centre du point au HAUT d'un libellé posé dessous. */
const DEG_BAS = 30;
/** Colonne : du centre du point au début du libellé. */
const DEG_COTE = 30;
/** Demi-écart vertical entre un sommet et un creux de la vague. */
const AMPLITUDE = 34;
/** Colonne : position du trait, assez loin du bord pour que la pièce ne soit pas rognée. */
const X_COLONNE = 24;

/**
 * La vague tient tant que deux libellés du même côté (un point sur deux) entrent côte à côte
 * avec 40 px d'air. 5 étapes : 584 px de bloc ; 4 étapes : 480 px.
 */
const largeurMinVague = (n: number) => LIB_L + ((n - 1) * (LIB_L + 40)) / 2;

type Point = { x: number; y: number; dessus: boolean };

function geometrie(vague: boolean, w: number, labH: number, n: number) {
  if (!vague) {
    const h = Math.max(300, n * 96);
    const points: Point[] = Array.from({ length: n }, (_, i) => ({
      x: X_COLONNE,
      y: n === 1 ? h / 2 : 22 + ((h - 44) * i) / (n - 1),
      dessus: false,
    }));
    return { h, points, d: `M ${X_COLONNE} 22 L ${X_COLONNE} ${h - 22}` };
  }
  const haut = DEG_HAUT + labH;
  const bas = DEG_BAS + labH;
  const h = haut + 2 * AMPLITUDE + bas;
  const m = LIB_L / 2;
  const dx = n === 1 ? 0 : (w - 2 * m) / (n - 1);
  // Un point sur deux en haut, en commençant par un creux (comme la vague d'origine).
  const points: Point[] = Array.from({ length: n }, (_, i) => {
    const dessus = i % 2 === 1;
    return { x: m + dx * i, y: dessus ? haut : haut + 2 * AMPLITUDE, dessus };
  });
  // Segments en S, tangente horizontale à chaque point : chaque point est un sommet ou un creux.
  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 1; i < n; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const cx = (a.x + b.x) / 2;
    d += ` C ${cx} ${a.y}, ${cx} ${b.y}, ${b.x} ${b.y}`;
  }
  if (n === 1) d += " h 0.01";
  return { h, points, d };
}

export function Roadmap({ steps }: { steps: RoadStep[] }) {
  // « Étape », lu avant le numéro de chaque point : « Menu et pied de page » du Studio.
  const { navigation } = useContenuGlobal();
  const n = steps.length;
  const fracs = useMemo(
    () => Array.from({ length: n }, (_, i) => (n === 1 ? 0 : i / (n - 1))),
    [n],
  );

  const [step, setStep] = useState(0);
  const idCarte = useId();
  // Largeur mesurée du bloc et hauteur du plus haut libellé (1 ou 2 lignes selon le Studio).
  // Valeurs par défaut : celles d'un ordinateur, pour le HTML livré.
  const [mesure, setMesure] = useState({ w: 1100, labH: 44 });
  const vague = mesure.w >= largeurMinVague(n);
  const { h, points, d } = useMemo(
    () => geometrie(vague, mesure.w, mesure.labH, n),
    [vague, mesure.w, mesure.labH, n],
  );

  const wrapRef = useRef<HTMLDivElement>(null);
  const carteRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const doneRef = useRef<SVGPathElement>(null);
  const pawnRef = useRef<HTMLDivElement>(null);
  const userTouched = useRef(false);
  // Fraction REELLEMENT affichee a cet instant. Mise a jour a chaque image de
  // l'animation, et non seulement a la fin : c'est ce qui empeche la piece et la
  // ligne de progression de se desynchroniser si la mise en page change en plein
  // mouvement (polices qui arrivent, redimensionnement).
  const curFrac = useRef(0);
  const rafRef = useRef<number | null>(null);

  // ⚠️ LE COMPOSANT REVELE SES PROPRES ELEMENTS.
  // Il ne peut pas dependre de la page hote : chaque page avait son propre
  // observateur, et celui de /sites-web ne surveillait que `[data-check]`, pas
  // `[data-reveal]`. Resultat, en y posant cette roadmap, tout le bloc restait
  // a opacity 0 : courbe, pastilles et carte invisibles, pas seulement la piece.
  // Un composant qui se cache doit savoir se montrer tout seul.
  useEffect(
    () =>
      suivreApparitions(
        [wrapRef.current, carteRef.current].filter((el): el is HTMLDivElement => el !== null),
      ),
    [],
  );

  // Mesure de la largeur du bloc et de la hauteur des libellés.
  // ResizeObserver sur le bloc ET sur chaque libellé : il capte aussi l'arrivée des polices,
  // qui change la hauteur d'un libellé sans changer la largeur du bloc.
  // La hauteur ne compte qu'en vague : en colonne, les libellés n'ont pas la même largeur.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const w = wrap.clientWidth;
      if (!w) return;
      let labH = 0;
      if (w >= largeurMinVague(n)) {
        wrap.querySelectorAll<HTMLElement>(".nv-etape-libelle").forEach((l) => {
          labH = Math.max(labH, l.offsetHeight);
        });
      }
      setMesure((m) => {
        const nh = labH && Math.abs(labH - m.labH) > 1 ? labH : m.labH;
        return m.w === w && nh === m.labH ? m : { w, labH: nh };
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    wrap.querySelectorAll(".nv-etape-libelle").forEach((l) => ro.observe(l));
    return () => ro.disconnect();
  }, [n]);

  // Place la piece et la ligne de progression a une fraction du trace. Un seul endroit qui
  // ecrit dans le DOM : les deux ne peuvent donc pas se desynchroniser.
  // La piece bouge par `transform` (calcul sur la carte graphique), jamais par left/top.
  const poserA = useCallback((f: number) => {
    const path = pathRef.current;
    if (!path) return;
    const L = path.getTotalLength();
    curFrac.current = f;
    const pt = path.getPointAtLength(L * f);
    const pawn = pawnRef.current;
    if (pawn) {
      pawn.style.transform = `translate(${pt.x - 15}px, ${pt.y - 15}px) rotate(-45deg)`;
      pawn.dataset.pret = "";
    }
    if (doneRef.current) {
      doneRef.current.style.strokeDasharray = String(L);
      doneRef.current.style.strokeDashoffset = String(L * (1 - f));
    }
  }, []);

  // ⚠️ Poser la piece et la progression TOUT DE SUITE quand le trace change, sans attendre
  // l'animation (qui ne tourne pas dans un onglet en arriere-plan). On part de `curFrac`, la
  // position REELLE de la piece, et non de l'etape visee : sinon elle sauterait a l'arrivee
  // avant que l'animation ne la fasse repartir du depart.
  useEffect(() => {
    poserA(curFrac.current);
  }, [d, poserA]);

  // La piece avance LE LONG du trace, image par image (elle suit la courbe).
  useEffect(() => {
    const to = fracs[step]!;
    const from = curFrac.current;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // requestAnimationFrame NE TOURNE PAS quand la page est en arriere-plan. Meme raccourci si
    // l'appareil demande moins d'animation : on place, on n'anime pas.
    const sansAnimation =
      reduce || (typeof document !== "undefined" && document.visibilityState === "hidden");
    if (sansAnimation) {
      poserA(to);
      return;
    }

    const dur = 720;
    const t0 = performance.now();
    let aDessine = false;

    // ⚠️ FILET DE SECURITE. requestAnimationFrame ne produit pas toujours d'image (economie
    // d'energie, navigateur pilote par un outil de test). Si aucune image n'est venue en
    // 150 ms, on place sans animer : la carte et la piece parlent toujours de la meme etape.
    const filet = window.setTimeout(() => {
      if (!aDessine) poserA(to);
    }, 150);

    const frame = (now: number) => {
      // ⚠️ BORNER AUX DEUX BOUTS : `now` peut etre INFERIEUR a `t0` (horloge ajustee, onglet
      // reveille). easeOutCubic d'un nombre negatif renvoie un nombre enorme.
      aDessine = true;
      const k = Math.min(1, Math.max(0, (now - t0) / dur));
      poserA(Math.min(1, Math.max(0, from + (to - from) * easeOutCubic(k))));
      if (k < 1) rafRef.current = requestAnimationFrame(frame);
      else poserA(to);
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => {
      window.clearTimeout(filet);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // `d` : si le trace change en plein mouvement, l'animation repart de la position reelle.
  }, [step, d, fracs, poserA]);

  // Avance automatique, en pause des que le visiteur choisit une etape.
  // Jamais avec « réduire les animations » (constat 15 de Pixel) : un contenu qui change tout seul
  // toutes les 3,8 s, sans bouton pause, est exactement ce que ce réglage demande d'éviter.
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (userTouched.current) return;
      setStep((s) => (s + 1) % n);
    }, 3800);
    return () => clearInterval(id);
  }, [n]);

  const w = mesure.w;

  return (
    <>
      <div
        data-reveal
        ref={wrapRef}
        className="nv-parcours"
        data-mode={vague ? "vague" : "colonne"}
        style={{ height: h }}
      >
        <svg
          viewBox={`0 0 ${w} ${h}`}
          width="100%"
          height={h}
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
          aria-hidden="true"
        >
          <path
            d={d}
            fill="none"
            stroke="rgba(12,25,47,.16)"
            strokeWidth={2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path ref={pathRef} d={d} fill="none" stroke="transparent" strokeWidth={2} />
          <path
            ref={doneRef}
            d={d}
            fill="none"
            stroke="#0C192F"
            strokeWidth={2.5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div ref={pawnRef} aria-hidden="true" className="nv-etape-piece" />

        {steps.map((e, i) => {
          const p = points[i]!;
          const etat = step === i ? "actuel" : i < step ? "passe" : "avenir";
          const libelle: CSSProperties = !vague
            ? {
                left: DEMI + DEG_COTE,
                top: "50%",
                transform: "translateY(-50%)",
                textAlign: "left",
                // La pastille épouse le texte, jusqu'à la largeur disponible.
                width: "max-content",
                maxWidth: Math.max(120, Math.min(260, w - p.x - DEMI - DEG_COTE - 4)),
              }
            : p.dessus
              ? { left: "50%", bottom: DEMI + DEG_HAUT, transform: "translateX(-50%)", textAlign: "center", width: LIB_L }
              : { left: "50%", top: DEMI + DEG_BAS, transform: "translateX(-50%)", textAlign: "center", width: LIB_L };
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                userTouched.current = true;
                setStep(i);
              }}
              aria-label={`${navigation.etapeLibelle} ${e.num ?? String(i + 1).padStart(2, "0")} : ${e.label}`}
              className="nv-etape-point"
              data-etat={etat}
              aria-current={step === i ? "step" : undefined}
              aria-controls={`${idCarte}-${i}`}
              style={{ left: `${(p.x / w) * 100}%`, top: p.y }}
            >
              <span aria-hidden="true" className="nv-etape-pastille" />
              {/* Le libellé fait partie du bouton : toucher le texte choisit l'étape (avant, il
                  était `pointer-events: none` et seul le point de 44 px réagissait). */}
              <span className="nv-etape-libelle" style={libelle}>
                {e.label}
              </span>
            </button>
          );
        })}
      </div>

      <div
        data-reveal
        ref={carteRef}
        style={{
          marginTop: vague ? 24 : 20,
          padding: "28px 30px",
          borderRadius: 22,
          border: "1px solid rgba(255,255,255,.85)",
          background:
            "linear-gradient(150deg, rgba(255,255,255,.78), rgba(255,255,255,.44))",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,.95) inset, 0 30px 70px -44px rgba(12,25,47,.8)",
        }}
      >
        {/* Toutes les étapes sont dans le HTML livré (lisibles sans JavaScript et par Google) ;
            seule l'étape choisie est montrée. Avant, les étapes 02 et suivantes n'existaient
            qu'après un clic ou l'avance automatique (constat 6 de Pixel). */}
        {steps.map((e, i) => (
          <div
            key={i}
            id={`${idCarte}-${i}`}
            hidden={i !== step}
            style={{ display: i === step ? "flex" : undefined, alignItems: "baseline", gap: 18 }}
          >
            {/* Numéro de l'étape : même gris lisible que les étapes à venir (avant : 2,4:1). */}
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 13,
                color: "var(--parcours-avenir-texte)",
              }}
            >
              {e.num ?? String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: 21, letterSpacing: "-.02em" }}>
                {e.title}
              </h3>
              <p
                style={{
                  margin: "10px 0 0",
                  maxWidth: "62ch",
                  fontSize: 16,
                  lineHeight: 1.62,
                  color: "rgba(12,25,47,.66)",
                }}
              >
                {e.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
