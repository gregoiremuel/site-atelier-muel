/* Polices du site (fichiers dans public/fonts, licence SIL OFL). Gabarit classique : titres en Playfair Display, texte en Manrope. Gabarit studio : Bricolage Grotesque et DM Sans. */
export const POLICES = {
  agence: {
    titres: '"Playfair Display","Didot","Bodoni 72",Georgia,serif',
    texte: '"Manrope","Helvetica Neue",Arial,sans-serif',
    fichiers: [
      ['Playfair Display', 400, 'playfair-display-latin-400-normal.woff2', 'normal'],
      ['Playfair Display', 400, 'playfair-display-latin-400-italic.woff2', 'italic'],
      ['Playfair Display', 500, 'playfair-display-latin-500-normal.woff2', 'normal'],
      ['Manrope', 400, 'manrope-latin-400-normal.woff2', 'normal'],
      ['Manrope', 500, 'manrope-latin-500-normal.woff2', 'normal'],
      ['Manrope', 600, 'manrope-latin-600-normal.woff2', 'normal'],
    ],
  },
  /* Gabarit « studio » : grotesque expressive (Bricolage Grotesque) et texte DM Sans. Pour une activité de création, de conseil ou de service moderne. */
  studio: {
    titres: '"Bricolage Grotesque","Helvetica Neue",Arial,sans-serif',
    texte: '"DM Sans","Helvetica Neue",Arial,sans-serif',
    fichiers: [
      ['Bricolage Grotesque', 500, 'bricolage-grotesque-latin-500-normal.woff2', 'normal'],
      ['Bricolage Grotesque', 700, 'bricolage-grotesque-latin-700-normal.woff2', 'normal'],
      ['DM Sans', 400, 'dm-sans-latin-400-normal.woff2', 'normal'],
      ['DM Sans', 400, 'dm-sans-latin-400-italic.woff2', 'italic'],
      ['DM Sans', 500, 'dm-sans-latin-500-normal.woff2', 'normal'],
      ['DM Sans', 700, 'dm-sans-latin-700-normal.woff2', 'normal'],
    ],
  },
};

/* Tous les fichiers de polices (pour l'aperçu et les tests). */
export const TOUS_FICHIERS_POLICES = [...new Set(Object.values(POLICES).flatMap((P) => P.fichiers.map((x) => x[2])))];

/* jeu : « agence » (gabarit classique) ou « studio ». */
export function cssPolices(url, jeu) {
  const P = POLICES[jeu] || POLICES.agence;
  return P.fichiers.map(([fam, w, f, st]) => `@font-face{font-family:"${fam}";font-weight:${w};font-style:${st};font-display:swap;src:url(${url(f)}) format("woff2")}`).join('\n')
    + `\n:root{--titres:${P.titres};--texte:${P.texte}}`;
}
