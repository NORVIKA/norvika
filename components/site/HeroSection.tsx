"use client";

import { useRef } from "react";
import { Reveal } from "@/components/ui/Reveal";

interface HeroSectionProps {
  titre: string;
  sousTitre: string;
  cta: string;
  rdvLink: string;
}

export function HeroSection({ titre, sousTitre, cta, rdvLink }: HeroSectionProps) {
  const haloRef = useRef<HTMLDivElement | null>(null);

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = haloRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--hx", `${x}%`);
    el.style.setProperty("--hy", `${y}%`);
  };

  return (
    <section
      onMouseMove={handleMove}
      className="relative overflow-hidden border-b border-[var(--hairline)] bg-[var(--background)]"
    >
      {/* Halo en 4 couches — suit la souris */}
      <div
        ref={haloRef}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={
          {
            "--hx": "50%",
            "--hy": "50%",
          } as React.CSSProperties
        }
      >
        {/* Couche 1 — lueur atmosphérique large et douce */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: "var(--hx)",
            top: "var(--hy)",
            width: "min(220vw, 2200px)",
            height: "min(220vw, 2200px)",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.08) 32%, rgba(59,130,246,0) 55%)",
            filter: "blur(50px)",
            transition: "left 400ms ease-out, top 400ms ease-out",
          }}
        />
        {/* Couche 2 — arc lumineux (le bord du cercle brillant) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: "var(--hx)",
            top: "var(--hy)",
            width: "min(180vw, 1800px)",
            height: "min(180vw, 1800px)",
            background:
              "radial-gradient(circle at 50% 50%, rgba(59,130,246,0) 64%, rgba(96,165,250,0.55) 70%, rgba(59,130,246,0.32) 73%, rgba(59,130,246,0) 78%)",
            filter: "blur(6px)",
            transition: "left 500ms ease-out, top 500ms ease-out",
          }}
        />
        {/* Couche 3 — teinture intérieure très subtile */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50"
          style={{
            left: "var(--hx)",
            top: "var(--hy)",
            width: "min(180vw, 1800px)",
            height: "min(180vw, 1800px)",
            background:
              "radial-gradient(circle at 50% 45%, rgba(219,234,254,0.55) 0%, rgba(219,234,254,0.18) 40%, rgba(255,255,255,0) 65%)",
            transition: "left 600ms ease-out, top 600ms ease-out",
          }}
        />
        {/* Couche 4 — poussière de particules le long du bord */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 18% 30%, rgba(59,130,246,0.6), transparent 50%), radial-gradient(1px 1px at 82% 24%, rgba(96,165,250,0.55), transparent 50%), radial-gradient(1px 1px at 32% 12%, rgba(59,130,246,0.45), transparent 50%), radial-gradient(1px 1px at 68% 18%, rgba(96,165,250,0.5), transparent 50%), radial-gradient(1px 1px at 50% 8%, rgba(59,130,246,0.4), transparent 50%), radial-gradient(1px 1px at 14% 78%, rgba(59,130,246,0.4), transparent 50%), radial-gradient(1px 1px at 86% 82%, rgba(96,165,250,0.45), transparent 50%)",
          }}
        />
      </div>

      {/* Contenu */}
      <div className="relative mx-auto max-w-5xl px-6 pb-32 pt-24 text-center md:pb-44 md:pt-32">
        <Reveal
          as="h1"
          className="mx-auto max-w-[18ch] text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.025em] text-[var(--foreground)] sm:text-6xl md:text-7xl lg:text-[5.5rem]"
        >
          {titre.includes("vaut mieux") ? (
            <>
              Votre business{" "}
              <span className="font-normal italic text-[var(--brand)]">vaut mieux</span>{" "}
              que sa présence en ligne.
            </>
          ) : (
            titre
          )}
        </Reveal>

        <Reveal
          as="p"
          delay={120}
          className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-[var(--muted-foreground)] md:text-lg"
        >
          {sousTitre}
        </Reveal>

        <Reveal
          delay={240}
          className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8"
        >
          <a
            href={rdvLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-10 py-5 text-base font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          >
            {cta}
          </a>
          <a
            href="#services"
            className="text-sm font-medium text-[var(--muted-foreground)] underline-offset-4 hover:text-[var(--foreground)] hover:underline"
          >
            Voir les services
          </a>
        </Reveal>
      </div>
    </section>
  );
}
