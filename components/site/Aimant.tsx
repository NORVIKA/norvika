"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * L'aimant : le bouton principal vient un peu vers la souris quand elle
 * s'approche, puis reprend sa place.
 *
 * POURQUOI. Le hero demande un moment de plaisir, pas juste du decor qui bouge
 * tout seul. Ce geste-la se sent : on approche le curseur, le bouton repond.
 * C'est le detail qu'on remarque sans savoir le nommer, et il tombe exactement
 * sur l'element qu'on veut faire cliquer.
 *
 * UN SEUL BOUTON. Le principal, jamais les deux : si tout est aimante, plus
 * rien ne l'est, et le second bouton se mettrait a lutter avec le premier.
 *
 * LES GARDE-FOUS :
 * - Souris fine uniquement. Un doigt ne survole pas ; sur telephone le bouton
 *   ne bouge jamais.
 * - `prefers-reduced-motion` : aucun mouvement.
 * - Deplacement plafonne a 7px. Au-dela, le bouton « fuit » le curseur et
 *   devient plus dur a viser, ce qui est exactement le contraire du but.
 * - `transform` seulement, jamais `top`/`left` : rien ne se recalcule, et la
 *   zone cliquable reste la ou l'oeil la voit.
 */

const RAYON = 120;
const AMPLITUDE = 7;

export function Aimant({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let cx = 0;
    let cy = 0;
    let x = 0;
    let y = 0;
    let raf = 0;

    const suivre = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const ex = e.clientX - (r.left + r.width / 2);
      const ey = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(ex, ey);
      if (d > RAYON) {
        cx = 0;
        cy = 0;
      } else {
        const force = 1 - d / RAYON;
        cx = (ex / RAYON) * AMPLITUDE * force * 2;
        cy = (ey / RAYON) * AMPLITUDE * force * 2;
      }
      if (!raf) raf = requestAnimationFrame(rendre);
    };

    // Approche progressive : le bouton glisse vers sa cible au lieu de sauter.
    const rendre = () => {
      x += (cx - x) * 0.18;
      y += (cy - y) * 0.18;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      if (Math.abs(cx - x) > 0.1 || Math.abs(cy - y) > 0.1) {
        raf = requestAnimationFrame(rendre);
      } else {
        raf = 0;
      }
    };

    window.addEventListener("pointermove", suivre, { passive: true });
    return () => {
      window.removeEventListener("pointermove", suivre);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <span ref={ref} style={{ display: "inline-flex", willChange: "transform" }}>
      {children}
    </span>
  );
}
