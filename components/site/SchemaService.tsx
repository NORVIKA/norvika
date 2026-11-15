import type { Parametres } from "@/lib/types-contenu";

// Schema.org « Service » propre à chaque page de service. Invisible à l'écran, lu par
// Google : chaque page dit quel service elle vend, par qui, et pour quelle zone, au lieu
// de partager le schema générique du layout (veille SEO du 2026-09-16).
// La ville reste dans les couches invisibles, jamais dans le texte (décision William).

// La zone desservie et le nom de l'entreprise viennent de « Infos de l'entreprise » (Studio),
// la même liste que le JSON-LD de app/layout.tsx : déclarée une seule fois.
export default function SchemaService({
  nom,
  type,
  description,
  chemin,
  parametres,
}: {
  nom: string;
  type: string;
  description: string;
  chemin: string;
  parametres: Parametres;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: nom,
          serviceType: type,
          description,
          url: `https://norvika.ca${chemin}`,
          provider: { "@type": "ProfessionalService", name: parametres.nom, url: "https://norvika.ca" },
          areaServed: parametres.zonesDesservies.map((z) => ({ "@type": z.type, name: z.nom })),
          availableLanguage: "fr-CA",
        }),
      }}
    />
  );
}
