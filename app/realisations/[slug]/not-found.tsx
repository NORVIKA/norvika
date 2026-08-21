"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function NotFound() {
  return (
    <div style={{ background: "#fff" }}>
      <SiteHeader />
      <div
        className="nv-shell"
        style={{ maxWidth: 720, margin: "0 auto", padding: "110px 32px", textAlign: "center" }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "clamp(28px,3.4vw,42px)",
            letterSpacing: "-.03em",
          }}
        >
          Cette réalisation n'existe pas.
        </h1>
        <div style={{ marginTop: 26 }}>
          <Link
            href="/realisations"
            className="nv-btn-primary"
            style={{ display: "inline-block", padding: "14px 22px", borderRadius: 10, fontWeight: 600 }}
          >
            Retour aux réalisations
          </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
