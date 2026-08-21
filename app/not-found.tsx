import Link from "next/link";
import { SiteShell } from "@/components/site/SiteShell";

export default function NotFound() {
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
          Erreur 404
        </p>
        <h1
          style={{
            margin: "18px 0 0",
            fontSize: "clamp(28px,3.4vw,42px)",
            lineHeight: 1.1,
          }}
        >
          Cette page n&apos;existe pas.
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
          Elle a peut-être été déplacée ou renommée. Reprenez à l&apos;accueil,
          ou regardez ce qu&apos;on fait pour d&apos;autres entreprises d&apos;ici.
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
            Retour à l&apos;accueil
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
            Voir nos réalisations
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
