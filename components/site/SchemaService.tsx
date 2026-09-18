// Schema.org « Service » propre à chaque page de service. Invisible à l'écran, lu par
// Google : chaque page dit quel service elle vend, par qui, et pour quelle zone, au lieu
// de partager le schema générique du layout (veille SEO du 2026-09-16).
// La ville reste dans les couches invisibles, jamais dans le texte (décision William).
const ZONE = [
  { "@type": "City", name: "Québec" },
  { "@type": "Place", name: "Rive-Sud de Montréal" },
  { "@type": "AdministrativeArea", name: "Montérégie" },
  { "@type": "AdministrativeArea", name: "Québec" },
];

export default function SchemaService({
  nom,
  type,
  description,
  chemin,
}: {
  nom: string;
  type: string;
  description: string;
  chemin: string;
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
          provider: { "@type": "ProfessionalService", name: "Norvika", url: "https://norvika.ca" },
          areaServed: ZONE,
          availableLanguage: "fr-CA",
        }),
      }}
    />
  );
}
