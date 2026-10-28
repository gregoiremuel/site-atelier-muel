/* Polices du site (fichiers dans public/fonts, licence SIL OFL) :
   titres en Playfair Display (didone, dans l'esprit du logo), texte en Manrope. */
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
};

export function cssPolices(url) {
  const P = POLICES.agence;
  return P.fichiers.map(([fam, w, f, st]) => `@font-face{font-family:"${fam}";font-weight:${w};font-style:${st};font-display:swap;src:url(${url(f)}) format("woff2")}`).join('\n')
    + `\n:root{--titres:${P.titres};--texte:${P.texte}}`;
}
