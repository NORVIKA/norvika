"use client";

import { useEffect, useRef } from "react";

/**
 * Le courant : le fond vivant du hero.
 *
 * POURQUOI CE N'EST PAS UN BLOC SOUS LES BOUTONS.
 * Deux tentatives ont ete refusees, et les deux avaient la meme forme : un
 * rectangle d'images pose sous les boutons. Un hero centre ne veut rien de
 * large en dessous, ca a toujours l'air colle la. Alors le mouvement passe
 * DERRIERE le texte : c'est le premier ecran au complet qui devient vivant,
 * sans rien ajouter a la colonne.
 *
 * LA FORME VIENT DU LOGO, PAS D'UNE BANQUE D'EFFETS.
 * La marque Norvika est un N fait de deux lames identiques : un demi-cercle,
 * un bord droit, une pointe a 45 degres. C'est cette lame-la qui derive dans
 * le fond, jamais un rond ni une etoile. Et toutes les lames restent proches
 * de la meme diagonale que le logo : le champ se lit comme un tissage oriente,
 * pas comme des confettis.
 *
 * CE QUI EMPECHE QUE CA DEVIENNE UN ECRAN DE VEILLE :
 * - peu de lames (une douzaine), TRES grandes, tres lentes ;
 * - deux encres seulement : creme pour les pleins, turquoise pour les
 *   traits, toutes deux sous 36 % d'opacite ;
 * - un melange de lames pleines et de lames au trait, qui donne du dessin ;
 * - la taille commande la vitesse (les grosses sont « proches » et vont plus
 *   vite), ce qui cree une profondeur au lieu d'un grouillement uniforme ;
 * - un fondu sur les bords, pour que rien ne coupe net.
 *
 * L'ARRIVEE : au chargement, les lames entrent en cascade le long de la
 * diagonale et se posent en une seconde. C'est le « wow » demande : un geste
 * orchestre au moment ou la page apparait, pas un decor qui gigote en boucle.
 *
 * LE GESTE : la souris ecarte le courant. Les lames s'ecartent du curseur avec
 * de l'inertie, puis reviennent. Sur telephone il n'y a pas de curseur, mais le
 * courant coule tout seul : le mouvement ne depend pas du pointeur.
 *
 * CE QUE CA NE CASSE PAS :
 * - Aucun fichier telecharge. Tout est dessine, donc zero octet de plus.
 * - Le canevas se peint APRES le titre, qui reste l'element mesure par le LCP.
 * - `prefers-reduced-motion` : une seule image fixe, aucune boucle.
 * - La boucle s'arrete quand le hero sort de l'ecran ou que l'onglet passe en
 *   arriere-plan. Un site qui anime dans le vide vide la batterie pour rien.
 *
 * QUAND LA VIDEO ARRIVERA : elle se pose PAR-DESSUS ce fond, dans le bloc de
 * texte. Le courant reste, il ne se retire pas.
 */

// Le hero est sombre : les lames sont donc CLAIRES. Sur navy, une lame creme
// se lit comme de la lumiere ; la meme lame en navy serait invisible.
const CREME = "245, 243, 238";
// Le turquoise des aurores, repris au trait : c'est ce qui relie le dessin a
// la couleur du fond au lieu de le poser par-dessus.
const TURQUOISE = "45, 212, 191";

type Lame = {
  x: number;
  y: number;
  r: number;
  /** Profondeur 0 (loin, petite et pale) a 1 (proche, grande et vive). */
  p: number;
  angle: number;
  /** Vitesse de rotation, tres faible : la lame tourne, elle ne tournoie pas. */
  vAngle: number;
  /** Ecart courant du au curseur, ramene vers 0 a chaque image. */
  dx: number;
  dy: number;
  /** Distance parcourue a l'arrivee, propre a chaque lame. */
  entree: number;
  /** Dessinee au trait plutot que pleine. */
  trait: boolean;
};

/** Diagonale du logo : le courant et les lames suivent cette direction. */
const DIAGONALE = -Math.PI / 4;

export function CourantNorvika() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const doux = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let l = 0;
    let h = 0;
    let lames: Lame[] = [];
    let rafId = 0;
    let actif = false;
    let visible = true;
    // Arrivee : calculee a partir de l'HORLOGE, pas accumulee dans la boucle.
    //
    // ⚠️ La version accumulee laissait le hero VIDE partout ou
    // requestAnimationFrame ne tourne pas (onglet en arriere-plan, navigateur
    // pilote, economie d'energie) : l'opacite dependait d'un compteur qui
    // n'avancait jamais. En lisant l'horloge, une seule image peinte a
    // n'importe quel moment montre le champ dans le bon etat.
    const depart = performance.now();
    const arriveeMaintenant = () => {
      if (doux) return 1;
      const e = Math.min(1, Math.max(0, (performance.now() - depart - 120) / 1100));
      return 1 - (1 - e) ** 3;
    };
    const souris = { x: -9999, y: -9999, actif: false };

    /** Le nombre de lames suit la surface, pour garder la meme densite partout. */
    const semer = () => {
      const cible = Math.min(22, Math.max(8, Math.round((l * h) / 78000)));
      lames = Array.from({ length: cible }, (_, i) => {
        // Suite deterministe plutot que Math.random : deux visites donnent le
        // meme champ, et rien ne saute au redimensionnement.
        const a = Math.sin(i * 12.9898) * 43758.5453;
        const b = Math.sin(i * 78.233) * 12345.6789;
        const c = Math.sin(i * 39.425) * 24634.6345;
        const f = (v: number) => v - Math.floor(v);
        const p = f(c);
        return {
          x: f(a) * l,
          y: f(b) * h,
          r: 22 + p * 34,
          p,
          // EXACTEMENT la diagonale du logo, a quelques degres pres. C'est
          // ce quasi-alignement qui fait lire un tissage oriente ; des angles
          // libres donnaient une averse de gouttes, ce qui n'a rien a voir
          // avec la marque.
          angle: DIAGONALE + (f(a * 3) - 0.5) * 0.16,
          vAngle: (f(b * 5) - 0.5) * 0.0004,
          // Une lame sur trois est dessinee au trait plutot que pleine. Ce
          // melange plein/contour est ce qui fait lire un motif de marque
          // assume, au lieu d'une tache floue dans le fond.
          trait: f(a * 11) < 0.62,
          dx: 0,
          dy: 0,
          // D'ou la lame arrive : loin en arriere sur la diagonale, chacune a
          // sa distance, pour que le champ se pose en cascade et non d'un bloc.
          entree: 320 + f(c * 7) * 620,
        };
      });
    };

    const mesurer = () => {
      const r = parent.getBoundingClientRect();
      l = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(l * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = l + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      semer();
    };

    /**
     * La lame de la marque : demi-cercle en bas, bord droit a droite, pointe a
     * 45 degres en haut. Dessinee autour du centre du demi-cercle.
     */
    const tracerLame = (r: number) => {
      ctx.beginPath();
      ctx.moveTo(r, -2 * r);
      ctx.lineTo(r, 0);
      ctx.arc(0, 0, r, 0, Math.PI, false);
      ctx.closePath();
    };

    const peindre = (dt: number) => {
      ctx.clearRect(0, 0, l, h);
      const marge = 60;
      const arrivee = arriveeMaintenant();

      for (const lame of lames) {
        if (!doux) {
          // Le courant : tout derive le long de la diagonale, les grandes
          // lames plus vite que les petites (profondeur).
          const v = (0.05 + lame.p * 0.13) * dt;
          lame.x += Math.cos(DIAGONALE) * v;
          lame.y += Math.sin(DIAGONALE) * v;
          lame.angle += lame.vAngle * dt;

          // Le curseur ecarte le courant, puis les lames reviennent.
          if (souris.actif) {
            const ex = lame.x + lame.dx - souris.x;
            const ey = lame.y + lame.dy - souris.y;
            const d2 = ex * ex + ey * ey;
            const R = 170;
            if (d2 < R * R && d2 > 0.01) {
              const d = Math.sqrt(d2);
              // Poussee douce, forte au centre, nulle au bord du rayon.
              const force = (1 - d / R) ** 2 * 26;
              lame.dx += (ex / d) * force * dt * 0.06;
              lame.dy += (ey / d) * force * dt * 0.06;
            }
          }
          // Rappel elastique vers la position du courant.
          lame.dx *= 0.94;
          lame.dy *= 0.94;

          // Reapparition de l'autre cote, sans saut visible.
          if (lame.x > l + marge) { lame.x = -marge; lame.y = Math.random() * h; }
          if (lame.y < -marge) { lame.y = h + marge; lame.x = Math.random() * l; }
        }

        // L'arrivee tire la lame en arriere sur la diagonale, puis la relache.
        const recul = (1 - arrivee) * lame.entree;
        const x = lame.x + lame.dx - Math.cos(DIAGONALE) * recul;
        const y = lame.y + lame.dy - Math.sin(DIAGONALE) * recul;

        // Fondu sur les bords : rien ne doit couper net contre le blanc.
        const bord = Math.min(
          1,
          Math.min(x, l - x) / 150,
          Math.min(y, h - y) / 150,
        );
        if (bord <= 0) continue;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(lame.angle);
        tracerLame(lame.r);
        if (lame.trait) {
          ctx.lineWidth = 1.6;
          ctx.strokeStyle = `rgba(${TURQUOISE}, ${(0.2 + lame.p * 0.26) * bord * arrivee})`;
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(${CREME}, ${(0.028 + lame.p * 0.042) * bord * arrivee})`;
          ctx.fill();
        }
        ctx.restore();
      }
    };

    let precedent = 0;
    const boucle = (t: number) => {
      // dt normalise a 60 images par seconde : la vitesse ne depend pas de
      // l'ecran (un 120 Hz ne doit pas faire couler le courant deux fois plus
      // vite).
      const dt = precedent ? Math.min(3, (t - precedent) / 16.67) : 1;
      precedent = t;
      peindre(dt);
      rafId = requestAnimationFrame(boucle);
    };

    const demarrer = () => {
      if (actif || doux) return;
      actif = true;
      precedent = 0;
      rafId = requestAnimationFrame(boucle);
    };
    const arreter = () => {
      actif = false;
      cancelAnimationFrame(rafId);
    };

    mesurer();
    peindre(1);
    // Filet : la ou la boucle ne tourne pas, cette image-la montre quand meme
    // le champ pose. Sans elle, le hero resterait blanc.
    const filet = window.setTimeout(() => peindre(1), 1400);

    const ro = new ResizeObserver(() => { mesurer(); peindre(1); });
    ro.observe(parent);

    // Ne pas animer un hero qu'on ne regarde pas.
    //
    // ⚠️ On ne CONSULTE pas `document.hidden` au demarrage, on ecoute seulement
    // ses changements. Le navigateur suspend deja requestAnimationFrame dans un
    // onglet en arriere-plan, donc la verification de depart n'apporte rien et
    // elle ment dans certains contextes (un navigateur pilote se declare cache
    // en permanence). Resultat quand on s'y fiait : la boucle ne partait jamais
    // et le hero restait vide, l'arrivee bloquee a zero.
    const io = new IntersectionObserver(
      ([e]) => { visible = e.isIntersecting; visible ? demarrer() : arreter(); },
      { threshold: 0 },
    );
    io.observe(parent);

    const surVisibilite = () => {
      document.hidden ? arreter() : (visible && demarrer());
    };
    document.addEventListener("visibilitychange", surVisibilite);

    // Le pointeur : uniquement une vraie souris. Un doigt ne « survole » pas,
    // et suivre le toucher ferait sauter le champ a chaque defilement.
    //
    // ⚠️ L'ecoute se fait sur la FENETRE, pas sur le conteneur. Le conteneur est
    // en `pointer-events: none` (sinon il avalerait les clics du hero) et ne
    // recoit donc aucun evenement. Ecouter le bloc de texte ne marcherait pas
    // non plus : le courant s'arreterait de reagir des que la souris passe sur
    // le titre, c'est-a-dire au milieu de l'ecran.
    const finPointeur = window.matchMedia("(pointer: fine)").matches;
    const surSouris = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = parent.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      souris.x = x;
      souris.y = y;
      souris.actif = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
    };
    const sortie = () => { souris.actif = false; };
    if (finPointeur && !doux) {
      window.addEventListener("pointermove", surSouris, { passive: true });
      window.addEventListener("blur", sortie);
    }

    return () => {
      arreter();
      window.clearTimeout(filet);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", surVisibilite);
      window.removeEventListener("pointermove", surSouris);
      window.removeEventListener("blur", sortie);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
