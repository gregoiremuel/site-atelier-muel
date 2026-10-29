// Écrit dans public/assets/rendu.js la table des dimensions des images du site (public/assets/**/*.jpg|png), pour que chaque <img> ait width et height (pas de décalage de mise en page).
// Usage : node outils/dimensions.mjs   (demande python3 avec Pillow) ; à relancer après l'ajout d'une photo dans public/assets/.
// Fabrique aussi, pour chaque photo de public/assets/photos, des déclinaisons nom-300w.jpg, nom-600w.jpg, nom-1000w.jpg (sans métadonnées), proposées au navigateur par srcset.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const racine = fileURLToPath(new URL('../', import.meta.url)), base = join(racine, 'public/assets');
/* Déclinaisons légères (300, 600, 1000 px de large) de chaque photo, pour srcset : refaites si la photo source est plus récente */
execFileSync('python3', ['-c', `
import sys, os
from PIL import Image
for f in sys.argv[1:]:
    b, e = os.path.splitext(f)
    im = Image.open(f)
    for w in (300, 600, 1000):
        if w > im.width * 0.85: continue
        sortie = f'{b}-{w}w{e}'
        if os.path.exists(sortie) and os.path.getmtime(sortie) >= os.path.getmtime(f): continue
        h = round(im.height * w / im.width)
        im.convert('RGB').resize((w, h), Image.LANCZOS).save(sortie, 'JPEG', quality=78, optimize=True, progressive=True)
`, ...(function sources(d, l = []) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) sources(p, l); else if (/\.jpe?g$/i.test(f) && !/-\d+w\.jpe?g$/i.test(f)) l.push(p); } return l; })(join(base, 'photos'))]);
const fichiers = []; (function lire(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) lire(p); else if (/\.(jpe?g|png)$/i.test(f)) fichiers.push(p); } })(base);
const sortie = execFileSync('python3', ['-c', 'import sys,json;from PIL import Image;print(json.dumps({f:Image.open(f).size for f in sys.argv[1:]}))', ...fichiers], { encoding: 'utf8' });
const dim = {}; for (const [f, t] of Object.entries(JSON.parse(sortie))) dim['/assets/' + f.slice(base.length + 1)] = t;
const rendu = join(base, 'rendu.js'); let s = readFileSync(rendu, 'utf8');
const bloc = '/*DIM-DEBUT*/const DIM = ' + JSON.stringify(dim) + ';/*DIM-FIN*/';
if (!s.includes('/*DIM-DEBUT*/')) { console.error('Repère /*DIM-DEBUT*/ absent de rendu.js'); process.exit(1); }
s = s.replace(/\/\*DIM-DEBUT\*\/[\s\S]*?\/\*DIM-FIN\*\//, () => bloc); writeFileSync(rendu, s);
console.log(Object.keys(dim).length + ' image(s) mesurée(s) ; table réécrite dans public/assets/rendu.js (git diff pour voir). Demande python3 et Pillow.');
