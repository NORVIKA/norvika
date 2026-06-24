"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/sites-web", label: "Sites web" },
  { href: "/automatisation", label: "Automatisation" },
  { href: "/photo-video", label: "Photo et vidéo" },
  { href: "/contact", label: "Contact" },
] as const;

const NAVY = "#19243a";

interface HeaderProps {
  rdvLink: string;
  logoSrc: string;
}

export function Header({ rdvLink, logoSrc }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) { setScrolled(true); return; }
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 pt-4 pb-2 md:pt-6">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div
          className="relative flex items-center justify-between gap-2 rounded-full border border-white/10 px-2 py-2 shadow-[0_10px_40px_rgb(12,25,47,0.25)] backdrop-blur-md"
          style={{ backgroundColor: `${NAVY}f2` }}
        >
          {/* Logo */}
          <Link
            href="/"
            aria-label="Norvika, accueil"
            onClick={() => setOpen(false)}
            className="flex cursor-pointer items-center gap-2 pl-3 pr-2"
          >
            <Image
              src={logoSrc}
              alt="Norvika"
              width={120}
              height={40}
              className="h-8 w-auto md:h-10 brightness-0 invert"
              priority
              unoptimized
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-white/10 font-medium text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-2">
            <a
              href={rdvLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden rounded-full bg-white px-5 py-2.5 text-sm font-bold transition-all duration-300 hover:bg-white/90 sm:inline-flex ${
                scrolled ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
              }`}
              style={{ color: NAVY }}
            >
              JE VEUX RÉUSSIR
            </a>

            <button
              type="button"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition-colors duration-300 hover:bg-white/10 active:scale-90 md:hidden"
            >
              <span className="relative block h-[14px] w-[18px]">
                {/* Ligne haut → branche du X */}
                <span
                  className="absolute left-0 top-0 block h-[2px] w-[18px] rounded-full bg-white"
                  style={{
                    transition: "transform 0.4s cubic-bezier(0.68,-0.55,0.265,1.55), top 0.3s ease",
                    top: open ? "6px" : "0px",
                    transform: open ? "rotate(45deg)" : "rotate(0)",
                  }}
                />
                {/* Ligne milieu → glisse et disparaît */}
                <span
                  className="absolute left-0 top-[6px] block h-[2px] w-[18px] rounded-full bg-white"
                  style={{
                    transition: "transform 0.3s ease, opacity 0.2s ease",
                    transform: open ? "translateX(-20px)" : "translateX(0)",
                    opacity: open ? 0 : 1,
                  }}
                />
                {/* Ligne bas → branche du X */}
                <span
                  className="absolute left-0 bottom-0 block h-[2px] w-[18px] rounded-full bg-white"
                  style={{
                    transition: "transform 0.4s cubic-bezier(0.68,-0.55,0.265,1.55), bottom 0.3s ease",
                    bottom: open ? "6px" : "0px",
                    transform: open ? "rotate(-45deg)" : "rotate(0)",
                  }}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div
            className="mt-2 rounded-3xl border border-white/10 p-3 shadow-[0_12px_40px_rgb(12,25,47,0.3)] backdrop-blur-md md:hidden"
            style={{ backgroundColor: `${NAVY}f7` }}
          >
            <nav className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-base transition-colors ${
                    pathname === item.href
                      ? "bg-white/10 font-medium text-white"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={rdvLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold"
                style={{ color: NAVY }}
                onClick={() => setOpen(false)}
              >
                JE VEUX RÉUSSIR
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
