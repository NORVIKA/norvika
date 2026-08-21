import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

/**
 * Entete + pied de page du site, pour les pages qui ne viennent pas de la
 * maquette (contact, bienvenue, politique, 404). Les pages de la maquette
 * posent elles-memes leur SiteHeader/SiteFooter, comme dans l'export.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: "#fff" }}>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
