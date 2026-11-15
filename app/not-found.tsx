import Link from "next/link";
import { SiteShell } from "@/components/site/SiteShell";
import { obtenirContenu } from "@/lib/contenu";

// Textes : « Page introuvable » du Studio.
export default async function NotFound() {
  const { page404: t } = await obtenirContenu();
  return (
    <SiteShell>
      <div
        className="nv-shell"
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "120px 32px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 11.5,
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "rgba(12,25,47,.45)",
          }}
        >
          {t.surtitre}
        </p>
        <h1
          style={{
            margin: "18px 0 0",
            fontSize: "clamp(28px,3.4vw,42px)",
            lineHeight: 1.1,
          }}
        >
          {t.titre}
        </h1>
        <p
          style={{
            margin: "20px auto 0",
            maxWidth: "48ch",
            fontSize: 16.5,
            lineHeight: 1.7,
            color: "rgba(12,25,47,.6)",
          }}
        >
          {t.texte}
        </p>
        <div
          style={{
            marginTop: 32,
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            className="nv-btn-primary"
            style={{ padding: "15px 26px", borderRadius: 10, fontWeight: 600 }}
          >
            {t.boutonAccueil}
          </Link>
          <Link
            href="/realisations"
            className="nv-cta-outline"
            style={{
              padding: "15px 26px",
              borderRadius: 10,
              fontWeight: 600,
              border: "1px solid rgba(12,25,47,.14)",
            }}
          >
            {t.boutonRealisations}
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
