// Écrit dans public/assets/rendu.js la table des dimensions des images du site (public/assets/**/*.jpg|png), pour que chaque <img> ait width et height (pas de décalage de mise en page).
// Usage : node outils/dimensions.mjs   (demande python3 avec Pillow) ; à relancer après l'ajout d'une photo dans public/assets/.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
const racine = new URL('../', import.meta.url).pathname, base = join(racine, 'public/assets');
const fichiers = []; (function lire(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) lire(p); else if (/\.(jpe?g|png)$/i.test(f)) fichiers.push(p); } })(base);
const sortie = execFileSync('python3', ['-c', 'import sys,json;from PIL import Image;print(json.dumps({f:Image.open(f).size for f in sys.argv[1:]}))', ...fichiers], { encoding: 'utf8' });
const dim = {}; for (const [f, t] of Object.entries(JSON.parse(sortie))) dim['/assets/' + f.slice(base.length + 1)] = t;
const rendu = join(base, 'rendu.js'); let s = readFileSync(rendu, 'utf8');
const bloc = '/*DIM-DEBUT*/const DIM = ' + JSON.stringify(dim) + ';/*DIM-FIN*/';
if (!s.includes('/*DIM-DEBUT*/')) { console.error('Repère /*DIM-DEBUT*/ absent de rendu.js'); process.exit(1); }
s = s.replace(/\/\*DIM-DEBUT\*\/[\s\S]*?\/\*DIM-FIN\*\//, () => bloc); writeFileSync(rendu, s);
console.log(Object.keys(dim).length + ' image(s) mesurée(s).');
