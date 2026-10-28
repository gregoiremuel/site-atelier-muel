// Fabrique les démonstrations de public/demos/ avec le moteur « vitrine » du kit (modeles/fromagerie-la-fontaine).
// Chaque démonstration a son contenu dans exemples/*.json (photos dans exemples/photos/, écrites « /photos/nom » dans le contenu).
// Usage : node outils/demos.mjs [dossier du kit]   (par défaut : ../kit-sites-boutiques)
// Le modèle du kit n'est jamais modifié : il est copié dans un dossier temporaire. Rien du modèle ne reste dans le site (pas de contenu de boutique).
import { cpSync, mkdtempSync, rmSync, copyFileSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const racine = fileURLToPath(new URL('..', import.meta.url));
const kit = resolve(process.argv[2] || join(racine, '..', 'kit-sites-boutiques'));
const modele = join(kit, 'modeles', 'fromagerie-la-fontaine');
if (!existsSync(join(modele, 'public', 'assets', 'rendu.js'))) { console.error(`Moteur vitrine introuvable : ${modele}\nUsage : node outils/demos.mjs ../kit-sites-boutiques`); process.exit(1); }

const DEMOS = [['vitrine-atelier', 'atelier-exemple'], ['vitrine-fleuriste', 'fleuriste-exemple'], ['vitrine-plombier', 'plombier-exemple'], ['vitrine-restaurant', 'restaurant-exemple']];
const tmp = mkdtempSync(join(tmpdir(), 'demos-'));
try {
  cpSync(modele, tmp, { recursive: true, filter: (s) => !/node_modules|\.wrangler|demonstration\.html|apercu-site\.html|demo-en-ligne/.test(s) });
  for (const [contenu, sortie] of DEMOS) {
    const r = spawnSync('node', ['outils/apercu.mjs', join(racine, 'exemples', contenu + '.json')], { cwd: tmp, encoding: 'utf8' });
    if (r.status !== 0) { console.error(`${contenu} : échec\n${r.stdout}${r.stderr}`); process.exit(1); }
    const page = readFileSync(join(tmp, 'demonstration.html'), 'utf8');
    if (/fromagerie|la fontaine|tcheskiss|atelier muel/i.test(page)) { console.error(`${sortie} : le fichier cite un nom interdit (Fromagerie, Tcheskiss ou Atelier Muel). Arrêt.`); process.exit(1); }
    copyFileSync(join(tmp, 'demonstration.html'), join(racine, 'public', 'demos', sortie + '.html'));
    console.log(`public/demos/${sortie}.html (${Math.round(page.length / 1024)} Ko)`);
  }
} finally { rmSync(tmp, { recursive: true, force: true }); }
