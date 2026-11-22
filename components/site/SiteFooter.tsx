"use client";

import Link from "next/link";
import { ContactCTA } from "@/components/site/ContactCTA";
import { useContenuGlobal } from "@/components/site/ContenuGlobal";
import { MentionDroits } from "@/components/site/MentionDroits";
import { CHEMIN_VERIFICATEUR } from "@/lib/verificateur/types";

// Tout le texte vient du Studio : « Infos de l'entreprise » (logo, phrase, courriel, nom légal)
// et « Menu et pied de page » (colonnes, liens, ligne du bas). L'annee du © est calculee au build.
export function SiteFooter() {
  const { parametres, navigation, lienVerificateur } = useContenuGlobal();
  const logoStack = parametres.logoPied;
  return (
    <>
      <ContactCTA />

      <footer className="nv-shell" style={{ padding: "72px 32px 44px" }}>
        <div className="nv-shell nv-grid-3"
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr",
            gap: 40,
          }}
        >
          <div>
            <img loading="lazy" decoding="async"
              src={logoStack.url}
              alt={logoStack.alt ?? ""}
              style={{ height: 78, width: "auto", display: "block" }}
            />
            <p
              style={{
                margin: "20px 0 0",
                maxWidth: "38ch",
                fontSize: 14.5,
                lineHeight: 1.6,
                color: "rgba(12,25,47,.62)",
              }}
            >
              {parametres.description}
            </p>
          </div>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 11.5,
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: "rgba(12,25,47,.62)",
              }}
            >
              {navigation.piedTitreServices}
            </p>
            <div
              style={{
                marginTop: 18,
                display: "flex",
                flexDirection: "column",
                gap: 9,
                fontSize: 14.5,
              }}
            >
              {/* Le vérificateur a son propre lien en bas de la page : pas en double sous « Services ». */}
              {navigation.liensMenu.filter((l) => l.lien !== CHEMIN_VERIFICATEUR).map((l) => (
                <Link key={l.lien} href={l.lien} className="nv-lien">
                  {l.libelle}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 11.5,
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: "rgba(12,25,47,.62)",
              }}
            >
              {navigation.piedTitreContact}
            </p>
            <div
              style={{
                marginTop: 18,
                display: "flex",
                flexDirection: "column",
                gap: 9,
                fontSize: 14.5,
              }}
            >
              <a href={`mailto:${parametres.courriel}`} className="nv-lien">
                {parametres.courriel}
              </a>
              {navigation.piedLiensContact.map((l) => (
                <Link key={l.lien} href={l.lien} className="nv-pied-lien">
                  {l.libelle}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="nv-shell"
          style={{
            maxWidth: 1240,
            margin: "44px auto 0",
            paddingTop: 22,
            borderTop: "1px solid rgba(12,25,47,.08)",
            fontSize: 12.5,
            color: "rgba(12,25,47,.62)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 18,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>
              <MentionDroits />
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
              <Link href="/politique-de-confidentialite" className="nv-pied-lien">
                {navigation.piedPolitique}
              </Link>
              <Link href={CHEMIN_VERIFICATEUR} className="nv-pied-lien">
                {lienVerificateur}
              </Link>
              <Link href="/plan-du-site" className="nv-pied-lien">
                {navigation.piedPlanDuSite}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
