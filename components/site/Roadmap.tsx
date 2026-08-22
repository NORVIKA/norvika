"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * « Comment ça marche » : le parcours en N étapes, partagé par l'accueil et les
 * pages de service.
 *
 * Deux problemes de la premiere version, corriges ici :
 *
 * 1. MOBILE. Le trace etait une courbe large de 1176 px forcee a min-width:1120,
 *    donc sur un telephone il fallait FAIRE DEFILER horizontalement pour voir les
 *    cinq etapes. Ici, sous 760 px, on bascule sur une colonne verticale : rien a
 *    faire defiler, les libelles ont de la place, les cibles tactiles font 44 px.
 *
 * 2. LA PIECE SUIVAIT UNE LIGNE DROITE. Elle passait d'un point a l'autre en
 *    animant `left` et `top` separement, ce qui coupe a travers la courbe. Ici,
 *    elle avance LE LONG du trace : a chaque image, on lit un point sur le chemin
 *    (getPointAtLength) entre la fraction de depart et celle d'arrivee. Elle suit
 *    donc reellement les courbes.
 *
 * Le SVG utilise un viewBox egal a sa taille en pixels (pas de preserveAspect
 * "none" qui deformait tout) : une unite SVG = un pixel, donc les pastilles et la
 * piece se posent exactement sur le trace.
 */

export type RoadStep = {
  num?: string;
  label: string;
  title: string;
  body: string;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function Roadmap({ steps }: { steps: RoadStep[] }) {
  const n = steps.length;
  const fracs = useMemo(
    () => steps.map((_, i) => (n === 1 ? 0 : i / (n - 1))),
    [n],
  );

  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"h" | "v">("h");
  const [box, setBox] = useState({ w: 1100, h: 220 });

  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const doneRef = useRef<SVGPathElement>(null);
  const pawnRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const userTouched = useRef(false);
  const fromFrac = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Largeur mesuree -> orientation + hauteur de la zone.
  // Un ResizeObserver plutot que l'evenement `resize` : il capte aussi le
  // moment ou le conteneur se stabilise (polices, mise en page), ce qui evite
  // une largeur figee a une valeur transitoire.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const w = wrap.clientWidth;
      if (!w) return;
      const vertical = w < 760;
      setMode((m) => (vertical ? "v" : "h") === m ? m : vertical ? "v" : "h");
      setBox((b) => {
        const h = vertical ? Math.max(300, n * 96) : 220;
        return b.w === w && b.h === h ? b : { w, h };
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [n]);

  // Le trace, calcule pour la taille reelle.
  const d = useMemo(() => {
    const { w, h } = box;
    if (mode === "v") {
      // Ligne verticale droite calee a gauche : les pastilles s'alignent
      // parfaitement et les libelles se lisent a droite, sans defilement.
      const x = Math.min(46, w * 0.14);
      return `M ${x} 22 L ${x} ${h - 22}`;
    }
    // Vague horizontale sur toute la largeur.
    const m = 34;
    const span = w - m * 2;
    const mid = h / 2;
    const amp = Math.min(56, h * 0.32);
    const px = (f: number) => m + span * f;
    return (
      `M ${px(0)} ${mid + amp} ` +
      `C ${px(0.13)} ${mid - amp}, ${px(0.17)} ${mid - amp}, ${px(0.28)} ${mid} ` +
      `C ${px(0.38)} ${mid + amp}, ${px(0.42)} ${mid + amp}, ${px(0.5)} ${mid} ` +
      `C ${px(0.58)} ${mid - amp}, ${px(0.63)} ${mid - amp}, ${px(0.72)} ${mid} ` +
      `C ${px(0.83)} ${mid + amp}, ${px(0.88)} ${mid + amp}, ${px(1)} ${mid - amp * 0.65}`
    );
  }, [box, mode]);

  // Pose les pastilles et les libelles sur le trace.
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const L = path.getTotalLength();
    fracs.forEach((f, i) => {
      const pt = path.getPointAtLength(L * f);
      const el = dotRefs.current[i];
      if (!el) return;
      el.style.left = `${pt.x}px`;
      el.style.top = `${pt.y}px`;
      const lab = el.querySelector("span[data-label]") as HTMLElement | null;
      if (!lab) return;
      if (mode === "v") {
        lab.style.left = "30px";
        lab.style.top = "50%";
        lab.style.transform = "translateY(-50%)";
        lab.style.textAlign = "left";
        lab.style.width = `${Math.min(220, box.w - pt.x - 44)}px`;
      } else {
        const ahead = path.getPointAtLength(Math.min(L, L * f + 22));
        const below = ahead.y >= pt.y;
        lab.style.left = "50%";
        lab.style.top = below ? "-44px" : "30px";
        lab.style.transform = "translateX(-50%)";
        lab.style.textAlign = "center";
        lab.style.width = "150px";
      }
    });
    if (doneRef.current) {
      doneRef.current.style.strokeDasharray = String(L);
      doneRef.current.style.strokeDashoffset = String(L * (1 - fracs[step]!));
    }
  }, [d, mode, fracs, box.w]);

  // La piece avance LE LONG du trace, image par image (elle suit la courbe).
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const L = path.getTotalLength();
    const to = fracs[step]!;
    const from = fromFrac.current;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const dur = reduce ? 0 : 720;
    const t0 = performance.now();

    const frame = (now: number) => {
      const k = dur === 0 ? 1 : Math.min(1, (now - t0) / dur);
      const f = from + (to - from) * easeOutCubic(k);
      const pt = path.getPointAtLength(L * f);
      if (pawnRef.current) {
        pawnRef.current.style.left = `${pt.x}px`;
        pawnRef.current.style.top = `${pt.y}px`;
      }
      if (doneRef.current) {
        doneRef.current.style.strokeDashoffset = String(L * (1 - f));
      }
      if (k < 1) rafRef.current = requestAnimationFrame(frame);
      else fromFrac.current = to;
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [step, d, mode, fracs]);

  // Avance automatique, en pause des que le visiteur choisit une etape.
  useEffect(() => {
    const id = setInterval(() => {
      if (userTouched.current) return;
      setStep((s) => (s + 1) % n);
    }, 3800);
    return () => clearInterval(id);
  }, [n]);

  const current = steps[step]!;
  const isV = mode === "v";

  return (
    <>
      <div
        data-reveal
        ref={wrapRef}
        style={{
          position: "relative",
          margin: isV ? "36px 0 0" : "78px 34px 0",
          height: box.h,
        }}
      >
        <svg
          viewBox={`0 0 ${box.w} ${box.h}`}
          width="100%"
          height={box.h}
          preserveAspectRatio="xMidYMid meet"
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
          aria-hidden="true"
        >
          <path d={d} fill="none" stroke="rgba(12,25,47,.16)" strokeWidth={2} strokeLinecap="round" />
          <path ref={pathRef} d={d} fill="none" stroke="transparent" strokeWidth={2} />
          <path
            ref={doneRef}
            d={d}
            fill="none"
            stroke="#0C192F"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </svg>

        <div
          ref={pawnRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            zIndex: 3,
            width: 30,
            height: 30,
            margin: "-15px 0 0 -15px",
            borderRadius: "50% 50% 50% 6px",
            transform: "rotate(-45deg)",
            background: "#0C192F",
            boxShadow:
              "0 10px 22px -8px rgba(12,25,47,.9), 0 0 0 6px rgba(255,255,255,.6)",
          }}
        />

        {steps.map((e, i) => {
          const color =
            step === i ? "#0C192F" : i < step ? "#33496C" : "rgba(12,25,47,.28)";
          return (
            <button
              key={i}
              type="button"
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              onClick={() => {
                userTouched.current = true;
                setStep(i);
              }}
              aria-label={`Étape ${e.num ?? String(i + 1).padStart(2, "0")} : ${e.label}`}
              aria-current={step === i ? "step" : undefined}
              style={{
                position: "absolute",
                width: 44,
                height: 44,
                margin: "-22px 0 0 -22px",
                padding: 0,
                border: 0,
                background: "transparent",
                cursor: "pointer",
                zIndex: 2,
                display: "grid",
                placeItems: "center",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: "block",
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: color,
                  boxShadow:
                    "0 0 0 6px rgba(255,255,255,.85), 0 6px 16px -8px rgba(12,25,47,.9)",
                  transition: "background .3s cubic-bezier(.2,0,0,1)",
                }}
              />
              <span
                data-label
                style={{
                  position: "absolute",
                  margin: 0,
                  padding: "5px 8px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,.72)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  fontFamily: "var(--font-display)",
                  fontSize: 13.5,
                  lineHeight: 1.25,
                  letterSpacing: "-.01em",
                  color,
                  transition: "color .3s cubic-bezier(.2,0,0,1)",
                  pointerEvents: "none",
                }}
              >
                {e.label}
              </span>
            </button>
          );
        })}
      </div>

      <div
        data-reveal
        style={{
          marginTop: isV ? 20 : 28,
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
        <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 13,
              color: "rgba(12,25,47,.35)",
            }}
          >
            {current.num ?? String(step + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 style={{ margin: 0, fontSize: 21, letterSpacing: "-.02em" }}>
              {current.title}
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
              {current.body}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
