"use client";

import { useEffect, useRef } from "react";

export function HeroOrb() {
  const orbRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const animRef = useRef<number | null>(null);
  const pos = useRef({ x: 50, y: 40 });
  const target = useRef({ x: 50, y: 40 });

  useEffect(() => {
    const orb = orbRef.current;
    if (!orb) return;
    const section = orb.closest("section") as HTMLElement;
    sectionRef.current = section;

    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      target.current = {
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      };
    };

    const tick = () => {
      // Smooth lerp
      pos.current.x += (target.current.x - pos.current.x) * 0.08;
      pos.current.y += (target.current.y - pos.current.y) * 0.08;
      if (orb) {
        orb.style.left = `${pos.current.x}%`;
        orb.style.top = `${pos.current.y}%`;
      }
      animRef.current = requestAnimationFrame(tick);
    };

    section.addEventListener("mousemove", onMove, { passive: true });
    animRef.current = requestAnimationFrame(tick);

    return () => {
      section.removeEventListener("mousemove", onMove);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div
      ref={orbRef}
      aria-hidden
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        width: "600px",
        height: "600px",
        borderRadius: "50%",
        background:
          "radial-gradient(circle at center, rgba(53,87,212,0.18) 0%, rgba(53,87,212,0.06) 40%, transparent 70%)",
        filter: "blur(24px)",
        willChange: "left, top",
      }}
    />
  );
}
