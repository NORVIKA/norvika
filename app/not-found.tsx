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
        {/* Plus de « Erreur 404 » au-dessus du titre (règle d'agence 1) : « Cette page n'existe
            pas. » le dit déjà, et ce gris à 45 % n'atteignait que 2,9:1 de contraste. */}
        <h1
          style={{
            margin: 0,
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
