// eslint 9, configuration « plate ».
//
// Deux changements de Next 16 se croisent ici :
//   - `next lint` a été RETIRÉ, on lance eslint directement ;
//   - eslint-config-next 16 exporte une config plate native, donc pas besoin
//     de FlatCompat ni de l'ancien .eslintrc.json.
import coreWebVitals from "eslint-config-next/core-web-vitals";

export default [
  ...(Array.isArray(coreWebVitals) ? coreWebVitals : [coreWebVitals]),
  { ignores: [".next/**", ".open-next/**", "node_modules/**"] },
  {
    rules: {
      // Les pages viennent de la maquette et sont ecrites en francais : les
      // apostrophes y sont partout. React les rend correctement, la regle ne
      // protege de rien ici et rendrait le texte illisible dans le source.
      "react/no-unescaped-entities": "off",
      // Le design pose ses propres dimensions en style en ligne sur chaque
      // image. next/image reprendrait la main sur le layout et ferait deriver
      // la maquette ; les assets sont deja redimensionnes et en WebP.
      "@next/next/no-img-element": "off",
    },
  },
];
