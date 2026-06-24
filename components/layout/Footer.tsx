import Link from "next/link";
import Image from "next/image";

interface FooterProps {
  email: string;
  logoSrc: string;
  description: string;
}

export function Footer({ email, logoSrc, description }: FooterProps) {
  return (
    <footer className="border-t border-[var(--hairline)] bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Link href="/">
              <Image
                src={logoSrc}
                alt="Norvika"
                width={120}
                height={36}
                className="h-9 w-auto brightness-0"
                unoptimized
              />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[var(--muted-foreground)]">
              {description}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              Services
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <li><Link href="/sites-web" className="text-[var(--foreground)] hover:underline">Sites web</Link></li>
              <li><Link href="/automatisation" className="text-[var(--foreground)] hover:underline">Automatisation</Link></li>
              <li><Link href="/photo-video" className="text-[var(--foreground)] hover:underline">Photo et vidéo</Link></li>
              <li><Link href="/contact" className="text-[var(--foreground)] hover:underline">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              Contact
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <li>
                <a href={`mailto:${email}`} className="text-[var(--foreground)] hover:underline">
                  {email}
                </a>
              </li>
              <li>
                <Link href="/bienvenue" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:underline">
                  Espace client
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-[var(--hairline)] pt-6 text-xs text-[var(--muted-foreground)] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Norvika</span>
          <div className="flex gap-4">
            <Link href="/politique-de-confidentialite" className="hover:text-[var(--foreground)] hover:underline">
              Politique de confidentialité
            </Link>
            <span className="opacity-40">·</span>
            <span>Site créé par Studio W</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
