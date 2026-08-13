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
];
